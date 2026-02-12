import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BOWEL_FREQUENCY, BOWEL_CONSISTENCY, GI_SYMPTOMS } from '@/data/formConstants';

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

const CheckboxGroup = ({ options, selected = [], onChange, testIdPrefix }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(opt => {
      const isSelected = selected.includes(opt);
      return (
        <button
          key={opt}
          type="button"
          onClick={() => {
            if (isSelected) onChange(selected.filter(s => s !== opt));
            else onChange([...selected, opt]);
          }}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-200 border ${
            isSelected
              ? 'border-primary bg-primary/10 text-primary font-medium'
              : 'border-border bg-card text-foreground hover:border-primary/30'
          }`}
          data-testid={`${testIdPrefix}-${opt.replace(/[\s/]/g, '-').toLowerCase()}`}
        >
          {opt}
        </button>
      );
    })}
  </div>
);

export default function StepDigestion({ data, update }) {
  return (
    <div className="space-y-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: "'Fraunces', serif" }}>Digestão</h2>
        <p className="text-sm text-muted-foreground">Saúde intestinal e hidratação</p>
      </div>

      <div>
        <label className="text-sm font-medium mb-3 block">Frequência intestinal <span className="text-destructive">*</span></label>
        <p className="text-xs text-muted-foreground mb-2">Com que frequência você vai ao banheiro?</p>
        <RadioCards options={BOWEL_FREQUENCY} value={data.bowel_frequency} onChange={v => update('bowel_frequency', v)} testIdPrefix="form-bowel-freq" />
      </div>

      <div>
        <label className="text-sm font-medium mb-3 block">Consistência das fezes <span className="text-destructive">*</span></label>
        <RadioCards options={BOWEL_CONSISTENCY} value={data.bowel_consistency} onChange={v => update('bowel_consistency', v)} testIdPrefix="form-bowel-cons" />
      </div>

      <div>
        <label className="text-sm font-medium mb-3 block">Sintomas digestivos frequentes</label>
        <p className="text-xs text-muted-foreground mb-2">Selecione os que ocorrem com frequência.</p>
        <CheckboxGroup options={GI_SYMPTOMS} selected={data.gi_symptoms || []} onChange={v => update('gi_symptoms', v)} testIdPrefix="form-gi" />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Consumo de água por dia</label>
        <div className="relative max-w-xs">
          <Input type="number" placeholder="Ex: 1.5" step="0.5" value={data.water_intake || ''} onChange={e => update('water_intake', parseFloat(e.target.value) || '')} data-testid="form-water-intake-input" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">litros</span>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Outros líquidos consumidos <strong>além</strong> das refeições</label>
        <p className="text-xs text-muted-foreground mb-1.5">Informe aqui os líquidos que você consome <strong>fora das refeições</strong> já descritas na página anterior (ex: cafés extras, chás, sucos, refrigerantes ao longo do dia).</p>
        <Textarea placeholder="Ex: 3 cafés ao longo do dia, 1 chá à noite, 1 refrigerante no final de semana" value={data.other_drinks || ''} onChange={e => update('other_drinks', e.target.value)} rows={2} data-testid="form-other-drinks-input" />
      </div>
    </div>
  );
}
