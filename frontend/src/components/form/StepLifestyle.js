import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ACTIVITY_LEVELS, STRESS_LEVELS } from '@/data/formConstants';

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

export default function StepLifestyle({ data, update }) {
  return (
    <div className="space-y-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: "'Fraunces', serif" }}>Rotina</h2>
        <p className="text-sm text-muted-foreground">Sua rotina diaria, atividade fisica e habitos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Acorda que horas?</label>
          <Input type="time" value={data.wake_time || ''} onChange={e => update('wake_time', e.target.value)} data-testid="form-wake-time-input" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Dorme que horas?</label>
          <Input type="time" value={data.sleep_time || ''} onChange={e => update('sleep_time', e.target.value)} data-testid="form-sleep-time-input" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Horas de sono/noite</label>
          <div className="relative">
            <Input type="number" placeholder="Ex: 7" min={1} max={16} value={data.sleep_hours || ''} onChange={e => update('sleep_hours', parseInt(e.target.value) || '')} data-testid="form-sleep-hours-input" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">h</span>
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-3 block">Nivel de atividade fisica <span className="text-destructive">*</span></label>
        <RadioCards options={ACTIVITY_LEVELS} value={data.activity_level} onChange={v => update('activity_level', v)} testIdPrefix="form-activity" />
      </div>

      {data.activity_level && data.activity_level !== 'sedentary' && (
        <div>
          <label className="text-sm font-medium mb-1.5 block">Quais exercicios voce pratica?</label>
          <p className="text-xs text-muted-foreground mb-1.5">Tipo, frequencia e duracao de cada um.</p>
          <Textarea placeholder="Ex: Musculacao 3x/semana, corrida 2x/semana 30min" value={data.exercise_detail || ''} onChange={e => update('exercise_detail', e.target.value)} rows={3} data-testid="form-exercise-detail-input" />
        </div>
      )}

      <div>
        <label className="text-sm font-medium mb-3 block">Nivel de estresse no dia a dia <span className="text-destructive">*</span></label>
        <RadioCards options={STRESS_LEVELS} value={data.stress_level} onChange={v => update('stress_level', v)} testIdPrefix="form-stress" />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Profissao / rotina de trabalho</label>
        <p className="text-xs text-muted-foreground mb-1.5">Trabalha sentado? Em pe? Viaja muito?</p>
        <Textarea placeholder="Ex: Trabalho em escritorio, sentada, home office 3x" value={data.occupation || ''} onChange={e => update('occupation', e.target.value)} rows={2} data-testid="form-occupation-input" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
          <div>
            <div className="text-sm font-medium">Consome bebida alcoolica?</div>
          </div>
          <Switch checked={data.alcohol || false} onCheckedChange={v => update('alcohol', v)} data-testid="form-alcohol-switch" />
        </div>

        {data.alcohol && (
          <div className="pl-4">
            <label className="text-sm font-medium mb-1.5 block">Com que frequencia?</label>
            <Input placeholder="Ex: Fins de semana, 2-3 tacas de vinho" value={data.alcohol_frequency || ''} onChange={e => update('alcohol_frequency', e.target.value)} data-testid="form-alcohol-frequency-input" />
          </div>
        )}

        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
          <div>
            <div className="text-sm font-medium">Fuma?</div>
          </div>
          <Switch checked={data.smoking || false} onCheckedChange={v => update('smoking', v)} data-testid="form-smoking-switch" />
        </div>
      </div>
    </div>
  );
}
