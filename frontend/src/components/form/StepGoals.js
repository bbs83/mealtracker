import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GOALS } from '@/data/formConstants';

const RadioCards = ({ options, value, onChange, testIdPrefix }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {options.map(opt => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`text-left p-4 rounded-xl border-2 transition-colors duration-200 ${
          value === opt.value
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/30 bg-card'
        }`}
        data-testid={`${testIdPrefix}-${opt.value}`}
      >
        <div className="font-medium text-sm">{opt.label}</div>
        {opt.desc && <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>}
      </button>
    ))}
  </div>
);

export default function StepGoals({ data, update }) {
  return (
    <div className="space-y-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: "'Fraunces', serif" }}>Seu objetivo</h2>
        <p className="text-sm text-muted-foreground">O que voce quer alcancar com o plano nutricional?</p>
      </div>

      <div>
        <label className="text-sm font-medium mb-3 block">Objetivo principal <span className="text-destructive">*</span></label>
        <RadioCards options={GOALS} value={data.primary_goal} onChange={v => update('primary_goal', v)} testIdPrefix="form-goal" />
      </div>

      {data.primary_goal === 'lose_weight' && (
        <div>
          <label className="text-sm font-medium mb-1.5 block">Peso desejado (meta)</label>
          <div className="relative max-w-xs">
            <Input type="number" placeholder="Ex: 62" step="0.1" value={data.target_weight || ''} onChange={e => update('target_weight', parseFloat(e.target.value) || '')} data-testid="form-target-weight-input" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">kg</span>
          </div>
        </div>
      )}

      {data.primary_goal === 'clinical' && (
        <div>
          <label className="text-sm font-medium mb-1.5 block">Qual condicao voce quer controlar?</label>
          <Textarea placeholder="Descreva a condicao clinica que deseja controlar..." value={data.clinical_goal_detail || ''} onChange={e => update('clinical_goal_detail', e.target.value)} rows={3} data-testid="form-clinical-goal-input" />
        </div>
      )}

      <div>
        <label className="text-sm font-medium mb-1.5 block">Algo mais sobre seu objetivo?</label>
        <p className="text-xs text-muted-foreground mb-1.5">Tem algum prazo em mente? Algum evento especifico?</p>
        <Textarea placeholder="Ex: Quero emagrecer para o casamento em 6 meses..." value={data.goal_notes || ''} onChange={e => update('goal_notes', e.target.value)} rows={3} data-testid="form-goal-notes-input" />
      </div>
    </div>
  );
}
