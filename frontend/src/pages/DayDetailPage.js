import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Camera, Type, Loader2, Trash2, ChevronLeft, ChevronRight, ChevronDown, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';
import { MEAL_DEFS } from '@/data/formConstants';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MEAL_TYPE_LABELS = {
  meal_breakfast: 'Café da manhã',
  meal_morning_snack: 'Lanche da manhã',
  meal_lunch: 'Almoço',
  meal_afternoon_snack: 'Lanche da tarde',
  meal_dinner: 'Jantar',
  meal_supper: 'Ceia',
};

const WEEKDAY_NAMES_PT = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// Extract a specific day's meal plan section from the full plan markdown
function extractDayPlan(markdown, date) {
  if (!markdown || !date) return null;
  
  const d = new Date(date + 'T12:00:00');
  const dayIndex = d.getDay(); // 0=Sun, 1=Mon, ...
  const dayName = WEEKDAY_NAMES_PT[dayIndex];
  
  // Common patterns in the plan: "### Segunda-feira", "## Segunda", "**Segunda-feira**", "Segunda-feira" as heading
  const patterns = [
    dayName + '-feira',
    dayName,
  ];
  
  const lines = markdown.split('\n');
  let startIdx = -1;
  let endIdx = lines.length;
  
  // Find the start of this day's section
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    const match = patterns.some(p => line.includes(p.toLowerCase()));
    if (match && (line.startsWith('#') || line.startsWith('**') || line.includes('dia '))) {
      startIdx = i;
      break;
    }
  }
  
  if (startIdx === -1) return null;
  
  // Find the end: next day header or next ETAPA/section
  const nextDays = WEEKDAY_NAMES_PT.filter(n => n !== dayName).map(n => n.toLowerCase());
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    // Stop at next day header
    const isNextDay = nextDays.some(nd => {
      return (line.includes(nd) || line.includes(nd + '-feira')) && 
             (line.startsWith('#') || line.startsWith('**') || line.includes('dia '));
    });
    // Stop at next ETAPA
    const isNextSection = line.startsWith('## etapa') || line.startsWith('## ') && line.includes('substituiç');
    
    if (isNextDay || isNextSection) {
      endIdx = i;
      break;
    }
  }
  
  const section = lines.slice(startIdx, endIdx).join('\n').trim();
  return section.length > 20 ? section : null;
}

const MacroBar = ({ label, value, target, unit = 'g' }) => {
  const pct = target > 0 ? Math.min((value / target) * 100, 150) : 0;
  const over = value > target * 1.15;
  const under = value < target * 0.85;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className={`${over ? 'text-red-600 font-semibold' : under ? 'text-yellow-600' : 'text-green-700'}`}>
          {Math.round(value)}{unit} / {Math.round(target)}{unit}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-red-400' : under ? 'bg-yellow-400' : 'bg-green-500'}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default function DayDetailPage() {
  const { date } = useParams();
  const { getAuthHeaders, API } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [targets, setTargets] = useState(null);
  const [dayPlanMarkdown, setDayPlanMarkdown] = useState(null);
  const [planOpen, setPlanOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [logMealType, setLogMealType] = useState('meal_lunch');
  const [logDescription, setLogDescription] = useState('');
  const [logPhoto, setLogPhoto] = useState(null);
  const [logPhotoType, setLogPhotoType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [logsRes, planRes] = await Promise.all([
        axios.get(`${API}/meal-logs?date=${date}`, { headers: getAuthHeaders() }),
        axios.get(`${API}/active-plan?include_markdown=true`, { headers: getAuthHeaders() }),
      ]);
      setLogs(logsRes.data);
      if (planRes.data.targets) {
        setTargets(planRes.data.targets.daily_targets);
      }
      // Extract day's plan from markdown
      if (planRes.data.plan?.plan_markdown) {
        const daySection = extractDayPlan(planRes.data.plan.plan_markdown, date);
        setDayPlanMarkdown(daySection);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [API, getAuthHeaders, date]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Calculate daily totals
  const dailyTotals = logs.reduce((acc, log) => {
    const t = log.ai_analysis?.totals || {};
    return {
      kcal: acc.kcal + (t.kcal || 0),
      protein_g: acc.protein_g + (t.protein_g || 0),
      carbs_g: acc.carbs_g + (t.carbs_g || 0),
      fat_g: acc.fat_g + (t.fat_g || 0),
      fiber_g: acc.fiber_g + (t.fiber_g || 0),
    };
  }, { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 });

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('Arquivo muito grande. Máximo 10MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setLogPhoto(reader.result.split(',')[1]);
      setLogPhotoType(file.type || 'image/jpeg');
      toast.success('Foto selecionada!');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitLog = async () => {
    if (!logPhoto && !logDescription.trim()) {
      toast.error('Envie uma foto ou descreva a refeição');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`${API}/meal-logs`, {
        date,
        meal_type: logMealType,
        description: logDescription || null,
        photo_base64: logPhoto || null,
        photo_media_type: logPhotoType || null,
      }, { headers: getAuthHeaders(), timeout: 60000 });
      toast.success('Refeição registrada e analisada!');
      setDialogOpen(false);
      setLogDescription('');
      setLogPhoto(null);
      setLogPhotoType(null);
      fetchData();
    } catch (err) {
      toast.error('Erro ao registrar refeição. Tente novamente.');
    }
    setSubmitting(false);
  };

  const handleDeleteLog = async (logId) => {
    try {
      await axios.delete(`${API}/meal-logs/${logId}`, { headers: getAuthHeaders() });
      toast.success('Registro removido');
      fetchData();
    } catch (err) {
      toast.error('Erro ao remover');
    }
  };

  const formatDate = (d) => {
    const dt = new Date(d + 'T12:00:00');
    return dt.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  };

  const prevDay = () => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    navigate(`/app/tracker/${d.toISOString().split('T')[0]}`);
  };
  const nextDay = () => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    navigate(`/app/tracker/${d.toISOString().split('T')[0]}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/tracker')} data-testid="day-back-button">
            <ArrowLeft className="w-4 h-4 mr-1" /> Calendário
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={prevDay}><ChevronLeft className="w-4 h-4" /></Button>
            <span className="text-sm font-medium capitalize">{formatDate(date)}</span>
            <Button variant="ghost" size="icon" onClick={nextDay}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* Suggested meal plan for this day */}
        {dayPlanMarkdown && (
          <Collapsible open={planOpen} onOpenChange={setPlanOpen}>
            <Card className="mb-6 rounded-xl border-primary/20 bg-primary/[0.02]" data-testid="day-plan-card">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-2 flex flex-row items-center justify-between cursor-pointer hover:bg-muted/30 rounded-t-xl transition-colors">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>
                      Cardápio sugerido para hoje
                    </CardTitle>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${planOpen ? 'rotate-180' : ''}`} />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4">
                  <div className="plan-content text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {dayPlanMarkdown}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        {/* Daily macro summary */}
        {targets && (
          <Card className="mb-6 rounded-xl" data-testid="daily-macros-card">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>Resumo do dia</h3>
                <Badge variant="outline" className={`${
                  dailyTotals.kcal === 0 ? 'bg-muted text-muted-foreground' :
                  dailyTotals.kcal >= targets.kcal * 0.85 && dailyTotals.kcal <= targets.kcal * 1.15 ? 'bg-green-100 text-green-800 border-green-300' :
                  dailyTotals.kcal >= targets.kcal * 0.7 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                  'bg-red-100 text-red-800 border-red-300'
                }`}>
                  {dailyTotals.kcal === 0 ? 'Sem registros' :
                   Math.round((dailyTotals.kcal / targets.kcal) * 100) + '% da meta'}
                </Badge>
              </div>
              <MacroBar label="Calorias" value={dailyTotals.kcal} target={targets.kcal} unit="kcal" />
              <MacroBar label="Proteína" value={dailyTotals.protein_g} target={targets.protein_g} />
              <MacroBar label="Carboidrato" value={dailyTotals.carbs_g} target={targets.carbs_g} />
              <MacroBar label="Gordura" value={dailyTotals.fat_g} target={targets.fat_g} />
            </CardContent>
          </Card>
        )}

        {/* Add meal button */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full mb-6 h-12" data-testid="add-meal-button">
              <Plus className="w-4 h-4 mr-2" /> Registrar refeição
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "'Fraunces', serif" }}>Registrar refeição</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Tipo de refeição</label>
                <Select value={logMealType} onValueChange={setLogMealType}>
                  <SelectTrigger data-testid="meal-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_DEFS.map(m => (
                      <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Tabs defaultValue="photo">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="photo"><Camera className="w-4 h-4 mr-1" /> Foto</TabsTrigger>
                  <TabsTrigger value="text"><Type className="w-4 h-4 mr-1" /> Texto</TabsTrigger>
                </TabsList>
                <TabsContent value="photo" className="mt-3">
                  <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} className="hidden" />
                  <Button variant="secondary" className="w-full h-24 border-dashed border-2" onClick={() => fileRef.current?.click()} data-testid="meal-photo-button">
                    {logPhoto ? (
                      <span className="text-primary font-medium">Foto selecionada ✔</span>
                    ) : (
                      <div className="text-center">
                        <Camera className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Tirar foto ou escolher da galeria</span>
                      </div>
                    )}
                  </Button>
                </TabsContent>
                <TabsContent value="text" className="mt-3">
                  <Textarea
                    placeholder={"Descreva o que comeu com detalhes e quantidades...\nEx: 4 col. sopa de arroz, 1 concha de feijão, 150g de frango grelhado, salada"}
                    value={logDescription}
                    onChange={e => setLogDescription(e.target.value)}
                    rows={4}
                    data-testid="meal-description-input"
                  />
                </TabsContent>
              </Tabs>

              <Button className="w-full h-11" onClick={handleSubmitLog} disabled={submitting} data-testid="meal-submit-button">
                {submitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analisando com IA...</>
                ) : (
                  'Registrar e analisar'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Meal logs */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
        ) : logs.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Refeições registradas</h3>
            {logs.map(log => (
              <Card key={log.id} className="rounded-xl" data-testid={`meal-log-${log.id}`}>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">{MEAL_TYPE_LABELS[log.meal_type] || log.meal_type}</CardTitle>
                    {log.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{log.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {log.has_photo && <Badge variant="outline" className="text-xs">Foto</Badge>}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteLog(log.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {log.ai_analysis?.foods?.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Alimentos identificados:</div>
                      <div className="flex flex-wrap gap-1">
                        {log.ai_analysis.foods.map((f, i) => (
                          <span key={i} className="inline-block px-2 py-0.5 rounded-md bg-muted text-xs">
                            {f.name} ({f.portion || f.grams + 'g'})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {log.ai_analysis?.totals && (
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {[['kcal', 'kcal'], ['protein_g', 'P'], ['carbs_g', 'C'], ['fat_g', 'G']].map(([key, label]) => (
                        <div key={key} className="text-center p-2 rounded-lg bg-muted/50">
                          <div className="text-sm font-semibold">{Math.round(log.ai_analysis.totals[key] || 0)}</div>
                          <div className="text-xs text-muted-foreground">{label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {log.ai_analysis?.feedback && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-xs font-medium text-primary">{log.ai_analysis.feedback}</p>
                      {log.ai_analysis.suggestions && (
                        <p className="text-xs text-muted-foreground mt-1">{log.ai_analysis.suggestions}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Camera className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground mb-1">Nenhuma refeição registrada</p>
            <p className="text-sm text-muted-foreground/70">Registre o que você comeu para acompanhar sua alimentação.</p>
          </div>
        )}
      </div>
    </div>
  );
}
