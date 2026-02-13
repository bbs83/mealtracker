import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, FileText, Clock, ChevronRight, Camera, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

export default function DashboardPage() {
  const { user, getAuthHeaders, API } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingAssessment, setPendingAssessment] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, assessRes] = await Promise.all([
          axios.get(`${API}/plans`, { headers: getAuthHeaders() }),
          axios.get(`${API}/assessments`, { headers: getAuthHeaders() }),
        ]);
        setPlans(plansRes.data);
        
        // Find assessments without plans (failed generation)
        const planAssessmentIds = new Set(plansRes.data.map(p => p.assessment_id));
        const unplanned = assessRes.data.find(a => !planAssessmentIds.has(a.id));
        if (unplanned) setPendingAssessment(unplanned);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
      setLoading(false);
    };
    fetchData();
  }, [API, getAuthHeaders]);

  const handleRegenerate = async () => {
    if (!pendingAssessment || regenerating) return;
    setRegenerating(true);
    try {
      const res = await axios.post(
        `${API}/assessments/${pendingAssessment.id}/generate-plan`, {},
        { headers: getAuthHeaders(), timeout: 600000 }
      );
      if (res.data.status === 'ready') {
        toast.success('Plano gerado com sucesso!');
        navigate(`/app/plans/${res.data.id}`);
      } else {
        toast.error('Erro ao gerar plano. Tente novamente.');
      }
    } catch (err) {
      toast.error('Erro na geração. Tente novamente.');
    }
    setRegenerating(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const statusBadge = (status) => {
    const map = {
      ready: { label: 'Pronto', className: 'bg-[rgba(127,154,114,0.18)] text-[rgb(58,84,47)] border-[rgba(127,154,114,0.35)]' },
      generating: { label: 'Gerando...', className: 'bg-[rgba(214,161,74,0.18)] text-[rgb(122,82,26)] border-[rgba(214,161,74,0.35)]' },
      error: { label: 'Erro', className: 'bg-[rgba(180,35,24,0.10)] text-[rgb(180,35,24)] border-[rgba(180,35,24,0.25)]' },
    };
    const s = map[status] || map.generating;
    return <Badge variant="outline" className={s.className} data-testid="plan-status-badge">{s.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-1" style={{ fontFamily: "'Fraunces', serif" }} data-testid="dashboard-title">Olá, {user?.name?.split(' ')[0]}</h1>
          <p className="text-muted-foreground">Gerencie seus planos nutricionais</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-8">
          <Card className="md:col-span-7 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow duration-200" data-testid="dashboard-new-assessment-card">
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "'Fraunces', serif" }}>Criar ou atualizar plano</h3>
              <p className="text-sm text-muted-foreground mb-6 leading-6">Preencha o questionário nutricional ou continue de onde parou. Seus dados anteriores são salvos automaticamente.</p>
              <Button size="lg" className="h-11" onClick={() => navigate('/app/new')} data-testid="dashboard-new-assessment-button">
                <Plus className="w-4 h-4 mr-2" /> Abrir questionário
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-5 rounded-2xl border border-border bg-card" data-testid="dashboard-last-plan-card">
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-lg font-semibold mb-3" style={{ fontFamily: "'Fraunces', serif" }}>Último plano</h3>
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-9 w-32 mt-4" />
                </div>
              ) : plans.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    {statusBadge(plans[0].status)}
                    <span className="text-xs text-muted-foreground">{formatDate(plans[0].created_at)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plans[0].status === 'ready' ? 'Seu plano está pronto para visualização.' : plans[0].status === 'generating' ? 'Seu plano está sendo gerado...' : 'Houve um erro ao gerar o plano.'}
                  </p>
                  {plans[0].status === 'ready' && (
                    <Button variant="secondary" size="sm" onClick={() => navigate(`/app/plans/${plans[0].id}`)}>
                      Ver plano <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum plano gerado ainda</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Regenerate pending assessment */}
        {pendingAssessment && (
          <Card className="rounded-2xl border-2 border-yellow-300 bg-yellow-50/50 mb-8" data-testid="dashboard-regenerate-card">
            <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center shrink-0">
                <RefreshCw className="w-6 h-6 text-yellow-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: "'Fraunces', serif" }}>Questionário pendente</h3>
                <p className="text-sm text-muted-foreground">Você tem um questionário preenchido aguardando geração do plano. Revise os dados ou envie novos exames antes de gerar.</p>
              </div>
              <Button onClick={() => navigate('/app/new')} data-testid="dashboard-regenerate-button">
                <RefreshCw className="w-4 h-4 mr-2" /> Revisar e gerar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tracker CTA */}
        <Card className="rounded-2xl border border-border bg-card mb-8 hover:shadow-lg transition-shadow duration-200" data-testid="dashboard-tracker-card">
          <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: "'Fraunces', serif" }}>Acompanhe sua alimentação</h3>
              <p className="text-sm text-muted-foreground">Registre suas refeições por foto ou texto. A IA analisa o que você comeu e compara com seu plano.</p>
            </div>
            <Button onClick={() => navigate('/app/tracker')} data-testid="dashboard-tracker-button">
              Abrir Tracker <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-border" data-testid="dashboard-history-card">
          <CardHeader>
            <CardTitle className="text-lg" style={{ fontFamily: "'Fraunces', serif" }}>Histórico de planos</CardTitle>
            <CardDescription>Todos os planos nutricionais que você gerou</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : plans.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow key={plan.id} data-testid={`plan-row-${plan.id}`}>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            {formatDate(plan.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>{statusBadge(plan.status)}</TableCell>
                        <TableCell className="text-right">
                          {plan.status === 'ready' && (
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/app/plans/${plan.id}`)}>
                              Ver plano <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground mb-1">Nenhum plano gerado ainda</p>
                <p className="text-sm text-muted-foreground/70">Crie seu primeiro questionário para gerar um plano nutricional.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
