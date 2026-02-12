import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ACTIVITY_LEVELS, STRESS_LEVELS, EXERCISE_MEAL_TIMING } from '@/data/formConstants';
import { Clock } from 'lucide-react';

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

// Auto-calculate sleep duration
const calcSleepHours = (wake, sleep) => {
  if (!wake || !sleep) return null;
  const [wH, wM] = wake.split(':').map(Number);
  const [sH, sM] = sleep.split(':').map(Number);
  let diff = (wH * 60 + wM) - (sH * 60 + sM);
  if (diff <= 0) diff += 1440;
  const h = Math.floor(diff / 60);
  const m = (diff % 60).toString().padStart(2, '0');
  return `${h}h${m}`;
};

export default function StepLifestyle({ data, update }) {
  const sleepDuration = calcSleepHours(data.wake_time, data.sleep_time);

  // Auto-update the calculated field
  React.useEffect(() => {
    if (sleepDuration && data.sleep_hours_calculated !== sleepDuration) {
      update('sleep_hours_calculated', sleepDuration);
    }
  }, [sleepDuration]);

  return (
    <div className="space-y-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: "'Fraunces', serif" }}>Rotina</h2>
        <p className="text-sm text-muted-foreground">Sua rotina diaria, atividade fisica e habitos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Acorda que horas?</label>
          <Input type="time" value={data.wake_time || ''} onChange={e => update('wake_time', e.target.value)} data-testid="form-wake-time-input" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Dorme que horas?</label>
          <Input type="time" value={data.sleep_time || ''} onChange={e => update('sleep_time', e.target.value)} data-testid="form-sleep-time-input" />
        </div>
      </div>

      {/* Auto-calculated sleep duration info card */}
      {sleepDuration && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20" data-testid="form-sleep-duration-card">
          <Clock className="w-5 h-5 text-primary shrink-0" />
          <div>
            <div className="text-sm font-medium">Duracao estimada do sono</div>
            <div className="text-lg font-semibold text-primary" style={{ fontFamily: "'Fraunces', serif" }}>{sleepDuration}</div>
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-medium mb-3 block">Nivel de atividade fisica <span className="text-destructive">*</span></label>
        <RadioCards options={ACTIVITY_LEVELS} value={data.activity_level} onChange={v => update('activity_level', v)} testIdPrefix="form-activity" />
      </div>

      {data.activity_level && data.activity_level !== 'sedentary' && (
        <>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Quais exercicios voce pratica?</label>
            <p className="text-xs text-muted-foreground mb-1.5">Tipo, frequencia e duracao de cada um.</p>
            <Textarea placeholder="Ex: Musculacao 3x/semana, corrida 2x/semana 30min" value={data.exercise_detail || ''} onChange={e => update('exercise_detail', e.target.value)} rows={3} data-testid="form-exercise-detail-input" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Horario do treino</label>
              <Input type="time" value={data.exercise_time || ''} onChange={e => update('exercise_time', e.target.value)} data-testid="form-exercise-time-input" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Treina em jejum ou apos refeicao?</label>
              <RadioCards options={EXERCISE_MEAL_TIMING} value={data.exercise_meal_timing} onChange={v => update('exercise_meal_timing', v)} testIdPrefix="form-exercise-timing" />
            </div>
          </div>
        </>
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
