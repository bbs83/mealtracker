import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MEAL_LOCATIONS, DIETARY_RESTRICTIONS, MEAL_DEFS, WEEKDAYS } from '@/data/formConstants';
import { ChevronDown } from 'lucide-react';

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

// Weekly food recall component
const WeeklyRecall = ({ data, update }) => {
  const [openDays, setOpenDays] = useState({ mon: true });
  const activeMeals = MEAL_DEFS.filter(m => data[m.key] !== false);

  const toggleDay = (dayKey) => {
    setOpenDays(prev => ({ ...prev, [dayKey]: !prev[dayKey] }));
  };

  return (
    <div className="space-y-3">
      <div className="mb-3">
        <label className="text-sm font-medium block">Recordatório alimentar semanal</label>
        <p className="text-xs text-muted-foreground">Descreva o que você comeu em cada refeição nos últimos 7 dias. Quanto mais detalhado, melhor o plano.</p>
      </div>

      {WEEKDAYS.map(day => (
        <Collapsible key={day.key} open={openDays[day.key]} onOpenChange={() => toggleDay(day.key)}>
          <CollapsibleTrigger className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors duration-200" data-testid={`recall-day-${day.key}`}>
            <span className="text-sm font-medium">{day.label}</span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${openDays[day.key] ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 space-y-3 pl-2 border-l-2 border-primary/10 ml-3">
            {activeMeals.map(meal => (
              <div key={`${day.key}_${meal.key}`} className="pl-3">
                <label className="text-xs font-medium text-muted-foreground block mb-1">{meal.label}</label>
                <Textarea
                  placeholder={meal.placeholder}
                  value={data[`recall_${day.key}_${meal.key}`] || ''}
                  onChange={e => update(`recall_${day.key}_${meal.key}`, e.target.value)}
                  rows={2}
                  className="text-sm"
                  data-testid={`recall-${day.key}-${meal.key}`}
                />
              </div>
            ))}
            <div className="pl-3">
              <label className="text-xs font-medium text-muted-foreground block mb-1">Outros (fora das refeições)</label>
              <Textarea
                placeholder="Beliscou algo? Comeu fora do horário? Descreva aqui."
                value={data[`recall_${day.key}_extras`] || ''}
                onChange={e => update(`recall_${day.key}_extras`, e.target.value)}
                rows={2}
                className="text-sm"
                data-testid={`recall-${day.key}-extras`}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};

export default function StepEating({ data, update }) {
  return (
    <div className="space-y-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: "'Fraunces', serif" }}>Alimentação</h2>
        <p className="text-sm text-muted-foreground">Seus hábitos alimentares atuais e preferências</p>
      </div>

      {/* Meal availability toggles */}
      <div>
        <label className="text-sm font-medium mb-3 block">Quais refeições você consegue fazer no dia a dia?</label>
        <p className="text-xs text-muted-foreground mb-3">Ative as refeições que são viáveis para sua rotina. Desative as que não consegue fazer.</p>
        <div className="space-y-2">
          {MEAL_DEFS.map(meal => (
            <div key={meal.key} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
              <span className="text-sm font-medium">{meal.label}</span>
              <Switch
                checked={data[meal.key] !== false}
                onCheckedChange={v => update(meal.key, v)}
                data-testid={`form-toggle-${meal.key}`}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-3 block">Onde você costuma fazer suas refeições? <span className="text-destructive">*</span></label>
        <RadioCards options={MEAL_LOCATIONS} value={data.meal_location} onChange={v => update('meal_location', v)} testIdPrefix="form-meal-location" />
      </div>

      {/* Weekly food recall */}
      <WeeklyRecall data={data} update={update} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Alimentos que você adora</label>
          <p className="text-xs text-muted-foreground mb-1.5">O que não pode faltar?</p>
          <Textarea placeholder="Ex: Frutas, arroz, frango, chocolate" value={data.food_loves || ''} onChange={e => update('food_loves', e.target.value)} rows={3} data-testid="form-food-loves-input" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Alimentos que você detesta</label>
          <p className="text-xs text-muted-foreground mb-1.5">O que não come de jeito nenhum?</p>
          <Textarea placeholder="Ex: Berinjela, jiló, fígado" value={data.food_hates || ''} onChange={e => update('food_hates', e.target.value)} rows={3} data-testid="form-food-hates-input" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-3 block">Restrições alimentares</label>
        <p className="text-xs text-muted-foreground mb-2">Segue alguma dieta específica?</p>
        <CheckboxGroup options={DIETARY_RESTRICTIONS} selected={data.dietary_restrictions || []} onChange={v => update('dietary_restrictions', v)} testIdPrefix="form-restriction" />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Orçamento mensal para alimentação</label>
        <p className="text-xs text-muted-foreground mb-1.5">Para adequarmos as sugestões à sua realidade.</p>
        <Select value={data.budget || ''} onValueChange={v => update('budget', v)}>
          <SelectTrigger className="max-w-xs" data-testid="form-budget-select">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tight">Econômico</SelectItem>
            <SelectItem value="moderate">Moderado</SelectItem>
            <SelectItem value="flexible">Flexivel</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
