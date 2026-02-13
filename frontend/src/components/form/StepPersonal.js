import React, { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';

const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-5">
    <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: "'Fraunces', serif" }}>{title}</h2>
    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
  </div>
);

export default function StepPersonal({ data, update }) {
  const bioFileRef = useRef(null);

  const handleBioFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB.');
      return;
    }
    // Check for unsupported formats
    const name = file.name.toLowerCase();
    if (name.endsWith('.heic') || name.endsWith('.heif')) {
      toast.error('Formato HEIC não suportado. Por favor, converta para JPG ou PNG antes de enviar.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      const mediaType = file.type || (name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
      update('bio_file_base64', base64);
      update('bio_file_media_type', mediaType);
      update('bio_file_name', file.name);
      toast.success(`Arquivo "${file.name}" anexado com sucesso!`);
    };
    reader.readAsDataURL(file);
  };

  const removeBioFile = () => {
    update('bio_file_base64', null);
    update('bio_file_media_type', null);
    update('bio_file_name', null);
    if (bioFileRef.current) bioFileRef.current.value = '';
  };

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

      {/* Bioimpedance section */}
      <Separator />
      
      <div>
        <h3 className="text-base font-semibold mb-1" style={{ fontFamily: "'Fraunces', serif" }}>Bioimpedância / Composição corporal</h3>
        <p className="text-xs text-muted-foreground mb-4">Se você fez teste de bioimpedância ou DEXA recentemente, anexe o resultado ou preencha os dados abaixo. Isso ajuda muito na personalização do plano.</p>

        <input ref={bioFileRef} type="file" accept="image/*,.pdf" onChange={handleBioFileUpload} className="hidden" data-testid="form-bio-file-input" />

        {data.bio_file_name ? (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5 mb-3" data-testid="form-bio-file-attached">
            <FileText className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{data.bio_file_name}</p>
              <p className="text-xs text-muted-foreground">Arquivo anexado</p>
            </div>
            <Button variant="ghost" size="sm" onClick={removeBioFile} className="shrink-0" data-testid="form-bio-file-remove">
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button type="button" variant="secondary" className="mb-3" onClick={() => bioFileRef.current?.click()} data-testid="form-bio-file-upload-button">
            <Upload className="w-4 h-4 mr-2" /> Anexar bioimpedância (foto ou PDF)
          </Button>
        )}

        <Textarea 
          placeholder="Ou preencha manualmente os dados: % de gordura corporal, massa magra (kg), massa gorda (kg), água corporal (%), taxa metabólica basal do aparelho, gordura visceral..." 
          value={data.bio_results || ''} 
          onChange={e => update('bio_results', e.target.value)} 
          rows={3} 
          data-testid="form-bio-results-input" 
        />
      </div>
    </div>
  );
}
