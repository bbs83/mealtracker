import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-5">
    <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: "'Fraunces', serif" }}>{title}</h2>
    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
  </div>
);

export default function StepPersonal({ data, update }) {
  return (
    <div className="space-y-6">
      <SectionTitle title="Sobre você" subtitle="Informações básicas para calcular suas necessidades nutricionais" />
      
      <div>
        <label className="text-sm font-medium mb-1.5 block">Nome completo <span className="text-destructive">*</span></label>
        <Input placeholder="Seu nome completo" value={data.name || ''} onChange={e => update('name', e.target.value)} data-testid="form-name-input" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Idade <span className="text-destructive">*</span></label>
          <div className="relative">
            <Input type="number" placeholder="Ex: 32" min={1} max={120} value={data.age || ''} onChange={e => update('age', parseInt(e.target.value) || '')} data-testid="form-age-input" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">anos</span>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Sexo biológico <span className="text-destructive">*</span></label>
          <Select value={data.sex || ''} onValueChange={v => update('sex', v)}>
            <SelectTrigger data-testid="form-sex-select">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Masculino</SelectItem>
              <SelectItem value="female">Feminino</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Peso atual <span className="text-destructive">*</span></label>
          <div className="relative">
            <Input type="number" placeholder="Ex: 72" step="0.1" value={data.weight || ''} onChange={e => update('weight', parseFloat(e.target.value) || '')} data-testid="form-weight-input" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">kg</span>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Altura <span className="text-destructive">*</span></label>
          <div className="relative">
            <Input type="number" placeholder="Ex: 165" value={data.height || ''} onChange={e => update('height', parseInt(e.target.value) || '')} data-testid="form-height-input" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">cm</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Circunferência da cintura <span className="text-xs text-muted-foreground">(Opcional)</span></label>
          <div className="relative">
            <Input type="number" placeholder="Ex: 82" value={data.waist || ''} onChange={e => update('waist', parseInt(e.target.value) || '')} data-testid="form-waist-input" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">cm</span>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Circunferência do quadril <span className="text-xs text-muted-foreground">(Opcional)</span></label>
          <div className="relative">
            <Input type="number" placeholder="Ex: 98" value={data.hip || ''} onChange={e => update('hip', parseInt(e.target.value) || '')} data-testid="form-hip-input" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">cm</span>
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Histórico de peso</label>
        <p className="text-xs text-muted-foreground mb-1.5">Seu peso mudou bastante nos últimos anos? Já fez dietas antes?</p>
        <Textarea placeholder="Ex: Engordei 10kg nos últimos 2 anos. Já fiz low carb por 3 meses..." value={data.weight_history || ''} onChange={e => update('weight_history', e.target.value)} rows={3} data-testid="form-weight-history-input" />
      </div>
    </div>
  );
}
