import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { COMMON_CONDITIONS, COMMON_ALLERGIES } from '@/data/formConstants';

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
          data-testid={`${testIdPrefix}-${opt.replace(/\s/g, '-').toLowerCase()}`}
        >
          {opt}
        </button>
      );
    })}
  </div>
);

export default function StepHealth({ data, update }) {
  return (
    <div className="space-y-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: "'Fraunces', serif" }}>Saude</h2>
        <p className="text-sm text-muted-foreground">Informacoes sobre sua saude para um plano seguro e adequado</p>
      </div>

      <div>
        <label className="text-sm font-medium mb-3 block">Condicoes de saude diagnosticadas</label>
        <CheckboxGroup options={COMMON_CONDITIONS} selected={data.conditions || []} onChange={v => update('conditions', v)} testIdPrefix="form-condition" />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Outras condicoes nao listadas acima</label>
        <Textarea placeholder="Outras condicoes de saude..." value={data.other_conditions || ''} onChange={e => update('other_conditions', e.target.value)} rows={2} data-testid="form-other-conditions-input" />
      </div>

      <div>
        <label className="text-sm font-medium mb-3 block">Alergias e intolerancias alimentares</label>
        <CheckboxGroup options={COMMON_ALLERGIES} selected={data.allergies || []} onChange={v => update('allergies', v)} testIdPrefix="form-allergy" />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Outras alergias</label>
        <Input placeholder="Ex: Camarao, kiwi..." value={data.other_allergies || ''} onChange={e => update('other_allergies', e.target.value)} data-testid="form-other-allergies-input" />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Medicamentos em uso</label>
        <p className="text-xs text-muted-foreground mb-1.5">Liste todos os medicamentos e suplementos que toma atualmente.</p>
        <Textarea placeholder="Ex: Levotiroxina 75mcg (manha em jejum)" value={data.medications || ''} onChange={e => update('medications', e.target.value)} rows={3} data-testid="form-medications-input" />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Exames recentes</label>
        <p className="text-xs text-muted-foreground mb-1.5">Se tiver resultados de exames de sangue recentes, compartilhe aqui os valores mais relevantes.</p>
        <Textarea placeholder="Ex: TSH: 3.2, Glicemia: 92, Colesterol: 210..." value={data.lab_results || ''} onChange={e => update('lab_results', e.target.value)} rows={3} data-testid="form-lab-results-input" />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Historico familiar</label>
        <p className="text-xs text-muted-foreground mb-1.5">Doencas comuns na familia (pais, avos, irmaos).</p>
        <Textarea placeholder="Ex: Mae com diabetes tipo 2, pai com hipertensao" value={data.family_history || ''} onChange={e => update('family_history', e.target.value)} rows={2} data-testid="form-family-history-input" />
      </div>
    </div>
  );
}
