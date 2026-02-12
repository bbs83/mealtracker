import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Plus, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import axios from 'axios';
import WeeklySummary from '@/components/tracker/WeeklySummary';

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTH_LABELS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const statusColors = {
  green: 'bg-[rgba(127,154,114,0.6)] border-[rgba(127,154,114,0.8)]',
  yellow: 'bg-[rgba(214,161,74,0.5)] border-[rgba(214,161,74,0.7)]',
  red: 'bg-[rgba(180,35,24,0.3)] border-[rgba(180,35,24,0.5)]',
};

export default function TrackerPage() {
  const { getAuthHeaders, API } = useAuth();
  const navigate = useNavigate();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [calendar, setCalendar] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [calRes, planRes] = await Promise.all([
        axios.get(`${API}/meal-logs/calendar?year=${year}&month=${month}`, { headers: getAuthHeaders() }),
        axios.get(`${API}/active-plan`, { headers: getAuthHeaders() }),
      ]);
      setCalendar(calRes.data);
      setActivePlan(planRes.data);
      
      // Auto-parse targets if plan exists but no targets
      if (planRes.data.plan && !planRes.data.targets) {
        try {
          await axios.post(`${API}/plans/${planRes.data.plan.id}/parse-targets`, {}, { headers: getAuthHeaders() });
          const updatedPlan = await axios.get(`${API}/active-plan`, { headers: getAuthHeaders() });
          setActivePlan(updatedPlan.data);
        } catch (e) { console.error('Target parse failed:', e); }
      }
    } catch (err) {
      console.error('Error fetching tracker data:', err);
    }
    setLoading(false);
  }, [API, getAuthHeaders, year, month]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // Build calendar grid
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date().toISOString().split('T')[0];
  const calendarDays = calendar?.days || {};

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>Tracker</h1>
            <p className="text-sm text-muted-foreground">Acompanhe sua alimentação diária</p>
          </div>
          <Button onClick={() => navigate(`/app/tracker/${today}`)} data-testid="tracker-today-button">
            <Plus className="w-4 h-4 mr-2" /> Registrar refeição
          </Button>
        </div>

        {!activePlan?.plan && (
          <Card className="mb-6 border-yellow-300 bg-yellow-50">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
              <div>
                <p className="text-sm font-medium">Nenhum plano nutricional ativo</p>
                <p className="text-xs text-muted-foreground">Gere um plano primeiro para comparar com sua alimentação.</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => navigate('/app/new')} className="shrink-0 ml-auto">Criar plano</Button>
            </CardContent>
          </Card>
        )}

        {/* Targets summary */}
        {activePlan?.targets && (
          <Card className="mb-6 rounded-xl">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">META DIÁRIA DO PLANO</p>
              <div className="flex flex-wrap gap-4">
                {[['Calorias', activePlan.targets.daily_targets.kcal, 'kcal'],
                  ['Proteína', activePlan.targets.daily_targets.protein_g, 'g'],
                  ['Carboidrato', activePlan.targets.daily_targets.carbs_g, 'g'],
                  ['Gordura', activePlan.targets.daily_targets.fat_g, 'g'],
                ].map(([label, val, unit]) => (
                  <div key={label} className="text-center">
                    <div className="text-lg font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>{val}{unit}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calendar */}
        <Card className="rounded-2xl mb-8" data-testid="tracker-calendar">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
              <CardTitle className="text-lg" style={{ fontFamily: "'Fraunces', serif" }}>
                {MONTH_LABELS[month - 1]} {year}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-7 gap-1">
                {Array.from({length: 35}).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {WEEKDAY_LABELS.map(d => (
                    <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {cells.map((day, i) => {
                    if (day === null) return <div key={`e-${i}`} />;
                    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayData = calendarDays[dateStr];
                    const isToday = dateStr === today;
                    
                    return (
                      <button
                        key={day}
                        onClick={() => navigate(`/app/tracker/${dateStr}`)}
                        className={`relative h-12 sm:h-14 rounded-lg border text-sm font-medium transition-colors duration-200 hover:bg-muted/50 ${
                          isToday ? 'ring-2 ring-primary ring-offset-1' : 'border-border/50'
                        } ${dayData ? statusColors[dayData.status] || 'bg-card' : 'bg-card'}`}
                        data-testid={`calendar-day-${dateStr}`}
                      >
                        <span className="text-xs">{day}</span>
                        {dayData && (
                          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2">
                            <div className="flex gap-0.5">
                              {Array.from({length: Math.min(dayData.meals_logged, 4)}).map((_, j) => (
                                <div key={j} className="w-1 h-1 rounded-full bg-foreground/50" />
                              ))}
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 justify-center text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-[rgba(127,154,114,0.6)]" /> Dentro da meta</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-[rgba(214,161,74,0.5)]" /> Parcial</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-[rgba(180,35,24,0.3)]" /> Fora da meta</div>
                  <div className="flex items-center gap-1"><div className="w-3 h-3 rounded border border-border bg-card" /> Sem registro</div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Weekly Summary */}
        <WeeklySummary />
      </div>
    </div>
  );
}
