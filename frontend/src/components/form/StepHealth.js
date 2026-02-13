import React, { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { COMMON_CONDITIONS, COMMON_ALLERGIES } from '@/data/formConstants';
import { Upload, X, FileText } from 'lucide-react';
import { toast } from 'sonner';

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
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      const name = file.name.toLowerCase();
      const mediaType = file.type || (name.endsWith('.pdf') ? 'application/pdf' : name.endsWith('.heic') || name.endsWith('.heif') ? 'image/heic' : 'image/jpeg');
      update('lab_file_base64', base64);
      update('lab_file_media_type', mediaType);
      update('lab_file_name', file.name);
      toast.success(`Arquivo "${file.name}" anexado com sucesso!`);
    };
    reader.readAsDataURL(file);
  };
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      const mediaType = file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
      update('lab_file_base64', base64);
      update('lab_file_media_type', mediaType);
      update('lab_file_name', file.name);
      toast.success(`Arquivo "${file.name}" anexado com sucesso!`);
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    update('lab_file_base64', null);
    update('lab_file_media_type', null);
    update('lab_file_name', null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: "'Fraunces', serif" }}>Saúde</h2>
        <p className="text-sm text-muted-foreground">Informações sobre sua saúde para um plano seguro e adequado</p>
      </div>

      <div>
        <label className="text-sm font-medium mb-3 block">Condições de saúde diagnosticadas</label>
        <CheckboxGroup options={COMMON_CONDITIONS} selected={data.conditions || []} onChange={v => update('conditions', v)} testIdPrefix="form-condition" />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Outras condições não listadas acima</label>
        <Textarea placeholder="Outras condições de saúde..." value={data.other_conditions || ''} onChange={e => update('other_conditions', e.target.value)} rows={2} data-testid="form-other-conditions-input" />
      </div>

      <div>
        <label className="text-sm font-medium mb-3 block">Alergias e intolerâncias alimentares</label>
        <CheckboxGroup options={COMMON_ALLERGIES} selected={data.allergies || []} onChange={v => update('allergies', v)} testIdPrefix="form-allergy" />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Outras alergias</label>
        <Input placeholder="Ex: Camarão, kiwi..." value={data.other_allergies || ''} onChange={e => update('other_allergies', e.target.value)} data-testid="form-other-allergies-input" />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Medicamentos em uso</label>
        <p className="text-xs text-muted-foreground mb-1.5">Liste todos os medicamentos e suplementos que toma atualmente.</p>
        <Textarea placeholder="Ex: Levotiroxina 75mcg (manhã em jejum)" value={data.medications || ''} onChange={e => update('medications', e.target.value)} rows={3} data-testid="form-medications-input" />
      </div>

      {/* Lab file upload */}
      <div>
        <label className="text-sm font-medium mb-1.5 block">Exames recentes</label>
        <p className="text-xs text-muted-foreground mb-3">Anexe uma foto ou PDF dos seus exames, ou descreva os valores manualmente abaixo.</p>
        
        <input ref={fileInputRef} type="file" accept="image/*,.pdf,.heic,.heif" onChange={handleFileUpload} className="hidden" data-testid="form-lab-file-input" />

        {data.lab_file_name ? (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5 mb-3" data-testid="form-lab-file-attached">
            <FileText className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{data.lab_file_name}</p>
              <p className="text-xs text-muted-foreground">Arquivo anexado</p>
            </div>
            <Button variant="ghost" size="sm" onClick={removeFile} className="shrink-0" data-testid="form-lab-file-remove">
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button type="button" variant="secondary" className="mb-3" onClick={() => fileInputRef.current?.click()} data-testid="form-lab-file-upload-button">
            <Upload className="w-4 h-4 mr-2" /> Anexar exames (foto ou PDF)
          </Button>
        )}

        <Textarea placeholder="Ou descreva aqui: TSH: 3.2, Glicemia: 92, Colesterol: 210..." value={data.lab_results || ''} onChange={e => update('lab_results', e.target.value)} rows={3} data-testid="form-lab-results-input" />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Histórico familiar</label>
        <p className="text-xs text-muted-foreground mb-1.5">Doenças comuns na família (pais, avós, irmãos).</p>
        <Textarea placeholder="Ex: Mãe com diabetes tipo 2, pai com hipertensão" value={data.family_history || ''} onChange={e => update('family_history', e.target.value)} rows={2} data-testid="form-family-history-input" />
      </div>
    </div>
  );
}
