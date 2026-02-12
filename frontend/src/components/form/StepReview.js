import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { REVIEW_SECTIONS, FIELD_LABELS, WEEKDAYS, MEAL_DEFS } from '@/data/formConstants';
import { Pencil } from 'lucide-react';

const VALUE_MAP = {
  male: 'Masculino', female: 'Feminino',
  lose_weight: 'Emagrecer', gain_muscle: 'Ganhar massa', maintain: 'Manter peso',
  performance: 'Performance', health: 'Saúde geral', clinical: 'Controle clínico',
  sedentary: 'Sedentário', light: 'Levemente ativo', moderate: 'Moderado',
  very_active: 'Muito ativo', athlete: 'Atleta',
  low: 'Baixo', high: 'Alto', very_high: 'Muito alto',
  home_mostly: 'Em casa', restaurant: 'Restaurante', mixed: 'Misto', delivery: 'Delivery',
  daily: 'Todo dia', alternate: 'Dia sim, dia não', infrequent: 'Menos de 3x/semana', frequent: 'Mais de 3x/dia',
  normal: 'Normal', hard: 'Ressecada', loose: 'Amolecida', variable: 'Variável',
  tight: 'Econômico', flexible: 'Flexível',
  regular: 'Regular', irregular: 'Irregular', absent: 'Ausente', menopause: 'Menopausa', perimenopause: 'Perimenopausa',
  fasted: 'Em jejum', after_meal: 'Após refeição', varies: 'Varia',
};

const formatValue = (value) => {
  if (value === true) return 'Sim';
  if (value === false) return 'Não';
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : null;
  if (value === '' || value === null || value === undefined) return null;
  return VALUE_MAP[value] || String(value);
};

const countRecallDays = (data) => {
  let count = 0;
  WEEKDAYS.forEach(day => {
    const hasData = MEAL_DEFS.some(meal => data[`recall_${day.key}_${meal.key}`]) || data[`recall_${day.key}_extras`];
    if (hasData) count++;
  });
  return count;
};

export default function StepReview({ data, goToStep }) {
  const recallDays = countRecallDays(data);

  return (
    <div className="space-y-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: "'Fraunces', serif" }}>Resumo</h2>
        <p className="text-sm text-muted-foreground">Revise suas informações antes de gerar o plano. Clique em "Editar" para corrigir.</p>
      </div>

      {REVIEW_SECTIONS.map(section => {
        if (section.id === 'women' && data.sex !== 'female') return null;
        const filledFields = section.fields.filter(f => formatValue(data[f]) !== null);
        if (filledFields.length === 0 && section.id !== 'eating') return null;

        return (
          <Card key={section.id} className="rounded-xl" data-testid={`review-section-${section.id}`}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base" style={{ fontFamily: "'Fraunces', serif" }}>{section.label}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => goToStep(section.id)} data-testid={`review-edit-${section.id}`}>
                <Pencil className="w-3 h-3 mr-1" /> Editar
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {filledFields.map(field => (
                  <div key={field} className="flex justify-between items-start py-1.5 border-b border-border/50 last:border-0">
                    <span className="text-xs text-muted-foreground shrink-0 mr-4">{FIELD_LABELS[field] || field}</span>
                    <span className="text-sm text-right">{formatValue(data[field])}</span>
                  </div>
                ))}
                {section.id === 'eating' && recallDays > 0 && (
                  <div className="flex justify-between items-start py-1.5 border-b border-border/50 last:border-0">
                    <span className="text-xs text-muted-foreground shrink-0 mr-4">Recordatório semanal</span>
                    <span className="text-sm text-right text-primary font-medium">{recallDays} dia(s) preenchido(s)</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
