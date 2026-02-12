import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';
import axios from 'axios';

const WEEKDAY_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

const SimpleMiniBar = ({ value, max, color = 'bg-primary' }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-full w-full flex flex-col items-center justify-end">
      <div className="w-full bg-muted rounded-t-sm overflow-hidden" style={{ height: '80px' }}>
        <div className={`w-full ${color} rounded-t-sm`} style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }} />
      </div>
    </div>
  );
};

export default function WeeklySummary() {
  const { getAuthHeaders, API } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API}/meal-logs/weekly-summary`, { headers: getAuthHeaders() });
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetch();
  }, [API, getAuthHeaders]);

  if (loading) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-6"><Skeleton className="h-40 w-full" /></CardContent>
      </Card>
    );
  }

  if (!data || data.days_tracked === 0) {
    return (
      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="text-lg" style={{ fontFamily: "'Fraunces', serif" }}>Resumo semanal</CardTitle></CardHeader>
        <CardContent className="text-center py-8">
          <TrendingUp className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Sem dados nesta semana. Comece a registrar suas refeições!</p>
        </CardContent>
      </Card>
    );
  }

  const targetKcal = data.targets?.kcal || 1800;
  const dates = data.dates || [];
  const daily = data.daily || {};

  return (
    <Card className="rounded-2xl" data-testid="weekly-summary">
      <CardHeader>
        <CardTitle className="text-lg" style={{ fontFamily: "'Fraunces', serif" }}>Resumo semanal</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Calorie bars chart */}
        <div className="mb-6">
          <p className="text-xs font-medium text-muted-foreground mb-2">CALORIAS DIÁRIAS</p>
          <div className="flex items-end gap-2 h-24">
            {dates.map((d, i) => {
              const kcal = daily[d]?.kcal || 0;
              const pct = targetKcal > 0 ? Math.min((kcal / targetKcal) * 100, 100) : 0;
              const hasData = daily[d]?.meals > 0;
              return (
                <div key={d} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-muted rounded-t overflow-hidden" style={{ height: '80px' }}>
                    <div
                      className={`w-full rounded-t transition-all duration-500 ${
                        !hasData ? 'bg-muted' :
                        pct >= 85 && pct <= 115 ? 'bg-green-400' :
                        pct >= 70 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1">{WEEKDAY_SHORT[i] || d.slice(-2)}</span>
                  {hasData && <span className="text-[10px] font-medium">{Math.round(kcal)}</span>}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center mt-2">
            <div className="h-px border-t border-dashed border-primary/40 flex-1" />
            <span className="text-[10px] text-primary px-2">{targetKcal} kcal/dia (meta)</span>
            <div className="h-px border-t border-dashed border-primary/40 flex-1" />
          </div>
        </div>

        {/* Averages */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">MÉDIA DIÁRIA ({data.days_tracked} dia(s) com registro)</p>
          <div className="grid grid-cols-4 gap-3">
            {[
              ['Calorias', data.averages?.kcal, data.targets?.kcal, 'kcal'],
              ['Proteína', data.averages?.protein_g, data.targets?.protein_g, 'g'],
              ['Carb', data.averages?.carbs_g, data.targets?.carbs_g, 'g'],
              ['Gordura', data.averages?.fat_g, data.targets?.fat_g, 'g'],
            ].map(([label, avg, target, unit]) => (
              <div key={label} className="text-center p-3 rounded-xl bg-muted/50">
                <div className="text-base font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>{Math.round(avg || 0)}{unit}</div>
                <div className="text-[10px] text-muted-foreground">{label}</div>
                {target && <div className="text-[10px] text-muted-foreground">Meta: {target}{unit}</div>}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
