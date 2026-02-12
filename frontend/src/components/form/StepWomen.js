import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StepWomen({ data, update }) {
  if (data.sex !== 'female') {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Esta seção é apenas para pacientes do sexo feminino.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: "'Fraunces', serif" }}>Saúde Feminina</h2>
        <p className="text-sm text-muted-foreground">Informações hormonais e reprodutivas para personalizar melhor seu plano</p>
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Ciclo menstrual</label>
        <Select value={data.menstrual_cycle || ''} onValueChange={v => update('menstrual_cycle', v)}>
          <SelectTrigger className="max-w-xs" data-testid="form-menstrual-cycle-select">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="regular">Regular</SelectItem>
            <SelectItem value="irregular">Irregular</SelectItem>
            <SelectItem value="absent">Ausente</SelectItem>
            <SelectItem value="menopause">Menopausa</SelectItem>
            <SelectItem value="perimenopause">Perimenopausa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
          <div className="text-sm font-medium">Está grávida?</div>
          <Switch checked={data.pregnant || false} onCheckedChange={v => update('pregnant', v)} data-testid="form-pregnant-switch" />
        </div>
        {data.pregnant && (
          <div className="pl-4">
            <label className="text-sm font-medium mb-1.5 block">Semanas de gestação</label>
            <div className="relative max-w-xs">
              <Input type="number" placeholder="Ex: 16" value={data.pregnancy_weeks || ''} onChange={e => update('pregnancy_weeks', parseInt(e.target.value) || '')} data-testid="form-pregnancy-weeks-input" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">semanas</span>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
          <div className="text-sm font-medium">Está amamentando?</div>
          <Switch checked={data.breastfeeding || false} onCheckedChange={v => update('breastfeeding', v)} data-testid="form-breastfeeding-switch" />
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
          <div className="text-sm font-medium">Usa anticoncepcional?</div>
          <Switch checked={data.contraceptive || false} onCheckedChange={v => update('contraceptive', v)} data-testid="form-contraceptive-switch" />
        </div>
        {data.contraceptive && (
          <div className="pl-4">
            <label className="text-sm font-medium mb-1.5 block">Qual?</label>
            <Input placeholder="Ex: Pílula, DIU, implante..." value={data.contraceptive_type || ''} onChange={e => update('contraceptive_type', e.target.value)} data-testid="form-contraceptive-type-input" />
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Sintomas hormonais relevantes</label>
        <p className="text-xs text-muted-foreground mb-1.5">TPM intensa, retenção de líquido, compulsão alimentar em alguma fase do ciclo...</p>
        <Textarea placeholder="Descreva sintomas hormonais que você percebe..." value={data.hormonal_symptoms || ''} onChange={e => update('hormonal_symptoms', e.target.value)} rows={3} data-testid="form-hormonal-symptoms-input" />
      </div>
    </div>
  );
}
