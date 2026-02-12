import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MEAL_LOCATIONS, DIETARY_RESTRICTIONS } from '@/data/formConstants';

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
          data-testid={`${testIdPrefix}-${opt.replace(/[\s()]/g, '-').toLowerCase()}`}
        >
          {opt}
        </button>
      );
    })}
  </div>
);

export default function StepEating({ data, update }) {
  return (
    <div className="space-y-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: "'Fraunces', serif" }}>Alimentacao</h2>
        <p className="text-sm text-muted-foreground">Seus habitos alimentares atuais e preferencias</p>
      </div>

      <div>
        <label className="text-sm font-medium mb-3 block">Onde voce costuma fazer suas refeicoes? <span className="text-destructive">*</span></label>
        <RadioCards options={MEAL_LOCATIONS} value={data.meal_location} onChange={v => update('meal_location', v)} testIdPrefix="form-meal-location" />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Quantas refeicoes faz por dia? <span className="text-destructive">*</span></label>
        <Select value={data.meals_per_day || ''} onValueChange={v => update('meals_per_day', v)}>
          <SelectTrigger className="max-w-xs" data-testid="form-meals-per-day-select">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-2">1-2 refeicoes</SelectItem>
            <SelectItem value="3">3 refeicoes</SelectItem>
            <SelectItem value="4-5">4-5 refeicoes</SelectItem>
            <SelectItem value="6+">6 ou mais</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Recordatorio alimentar — dia tipico <span className="text-destructive">*</span></label>
        <p className="text-xs text-muted-foreground mb-1.5">Descreva tudo que voce come e bebe num dia normal, com horarios aproximados.</p>
        <Textarea placeholder="Ex: Cafe 7h: cafe com leite + pao integral. Almoco 12h30: arroz, feijao, frango, salada..." value={data.food_diary || ''} onChange={e => update('food_diary', e.target.value)} rows={5} data-testid="form-food-diary-input" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Alimentos que voce adora</label>
          <p className="text-xs text-muted-foreground mb-1.5">O que nao pode faltar?</p>
          <Textarea placeholder="Ex: Frutas, arroz, frango, chocolate" value={data.food_loves || ''} onChange={e => update('food_loves', e.target.value)} rows={3} data-testid="form-food-loves-input" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Alimentos que voce detesta</label>
          <p className="text-xs text-muted-foreground mb-1.5">O que nao come de jeito nenhum?</p>
          <Textarea placeholder="Ex: Berinjela, jilo, figado" value={data.food_hates || ''} onChange={e => update('food_hates', e.target.value)} rows={3} data-testid="form-food-hates-input" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-3 block">Restricoes alimentares</label>
        <p className="text-xs text-muted-foreground mb-2">Segue alguma dieta especifica?</p>
        <CheckboxGroup options={DIETARY_RESTRICTIONS} selected={data.dietary_restrictions || []} onChange={v => update('dietary_restrictions', v)} testIdPrefix="form-restriction" />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Orcamento mensal para alimentacao</label>
        <p className="text-xs text-muted-foreground mb-1.5">Para adequarmos as sugestoes a sua realidade.</p>
        <Select value={data.budget || ''} onValueChange={v => update('budget', v)}>
          <SelectTrigger className="max-w-xs" data-testid="form-budget-select">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tight">Economico</SelectItem>
            <SelectItem value="moderate">Moderado</SelectItem>
            <SelectItem value="flexible">Flexivel</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
