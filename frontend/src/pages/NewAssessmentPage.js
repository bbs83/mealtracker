import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Send, Loader2, Save } from 'lucide-react';
import { STEPS } from '@/data/formConstants';
import StepPersonal from '@/components/form/StepPersonal';
import StepGoals from '@/components/form/StepGoals';
import StepHealth from '@/components/form/StepHealth';
import StepLifestyle from '@/components/form/StepLifestyle';
import StepEating from '@/components/form/StepEating';
import StepDigestion from '@/components/form/StepDigestion';
import StepWomen from '@/components/form/StepWomen';
import StepReview from '@/components/form/StepReview';
import GeneratingScreen from '@/components/form/GeneratingScreen';

// Clean data before submission
const cleanFormData = (data) => {
  const cleaned = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === 'lab_file_base64' || key === 'lab_file_media_type') continue;
    if (key === 'bio_file_base64' || key === 'bio_file_media_type') continue;
    if (value === '' || value === null || value === undefined) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    cleaned[key] = value;
  }
  if (cleaned.wake_time && cleaned.sleep_time) {
    const [wH, wM] = cleaned.wake_time.split(':').map(Number);
    const [sH, sM] = cleaned.sleep_time.split(':').map(Number);
    let diff = (wH * 60 + wM) - (sH * 60 + sM);
    if (diff <= 0) diff += 1440;
    cleaned.sleep_hours_calculated = `${Math.floor(diff / 60)}h${(diff % 60).toString().padStart(2, '0')}`;
  }
  if (data.lab_file_name) cleaned.lab_file_attached = data.lab_file_name;
  if (data.bio_file_name) cleaned.bio_file_attached = data.bio_file_name;
  return cleaned;
};

// Get saveable data (exclude large base64 files from draft to keep it fast)
const getDraftData = (data) => {
  const draft = {};
  for (const [key, value] of Object.entries(data)) {
    // Skip large base64 data from drafts (files stay in browser memory only)
    if (key === 'lab_file_base64' || key === 'bio_file_base64') continue;
    draft[key] = value;
  }
  return draft;
};

export default function NewAssessmentPage() {
  const { getAuthHeaders, API } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftSource, setDraftSource] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved'
  const saveTimeoutRef = useRef(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  // Load draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const res = await axios.get(`${API}/form-draft`, { headers: getAuthHeaders() });
        if (res.data.source !== 'empty' && res.data.data) {
          const formData = res.data.data.form_data || {};
          const step = res.data.data.current_step || 0;
          setData(formData);
          setCurrentStep(step);
          setDraftSource(res.data.source);
          if (res.data.source === 'draft') {
            toast.info('Formulário anterior recuperado automaticamente.');
          } else if (res.data.source === 'last_assessment') {
            toast.info('Dados do último questionário carregados. Edite o que precisar e gere um novo plano.');
          }
        }
      } catch (err) {
        console.error('Error loading draft:', err);
      }
      setDraftLoaded(true);
    };
    loadDraft();
  }, [API, getAuthHeaders]);

  // Auto-save draft (debounced, on data or step change)
  const saveDraft = useCallback(async () => {
    try {
      setSaveStatus('saving');
      await axios.post(`${API}/form-draft`, {
        form_data: getDraftData(dataRef.current),
        current_step: currentStep,
      }, { headers: getAuthHeaders() });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      console.error('Draft save error:', err);
      setSaveStatus(null);
    }
  }, [API, getAuthHeaders, currentStep]);

  // Debounced save on data change
  useEffect(() => {
    if (!draftLoaded) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveDraft();
    }, 2000); // save 2s after last change
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [data, currentStep, draftLoaded, saveDraft]);

  // Filter steps: remove women step if not female
  const activeSteps = STEPS.filter(s => s.id !== 'women' || data.sex === 'female');
  const totalSteps = activeSteps.length;
  const step = activeSteps[currentStep];
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  const update = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const next = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToStep = (stepId) => {
    const idx = activeSteps.findIndex(s => s.id === stepId);
    if (idx >= 0) setCurrentStep(idx);
  };

  const handleStartFresh = () => {
    setData({});
    setCurrentStep(0);
    setDraftSource(null);
    toast.success('Formulário limpo. Comece do zero.');
    // Also clear draft from server
    axios.delete(`${API}/form-draft`, { headers: getAuthHeaders() }).catch(() => {});
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setGenerating(true);
    try {
      const cleanedData = cleanFormData(data);
      const payload = { patient_data: cleanedData };
      if (data.lab_file_base64 && data.lab_file_media_type) {
        payload.lab_file = {
          base64: data.lab_file_base64,
          media_type: data.lab_file_media_type,
          name: data.lab_file_name || 'exames',
        };
      }
      if (data.bio_file_base64 && data.bio_file_media_type) {
        payload.bio_file = {
          base64: data.bio_file_base64,
          media_type: data.bio_file_media_type,
          name: data.bio_file_name || 'bioimpedancia',
        };
      }

      // 1. Create assessment
      const assessmentRes = await axios.post(
        `${API}/assessments`, payload, { headers: getAuthHeaders() }
      );
      const assessmentId = assessmentRes.data.id;

      // 2. Trigger plan generation (returns immediately, runs in background)
      const planRes = await axios.post(
        `${API}/assessments/${assessmentId}/generate-plan`, {},
        { headers: getAuthHeaders(), timeout: 30000 }
      );
      const planId = planRes.data.id;

      // 3. Clear draft
      await axios.delete(`${API}/form-draft`, { headers: getAuthHeaders() }).catch(() => {});

      // 4. If already ready (cached), redirect immediately
      if (planRes.data.status === 'ready') {
        toast.success('Plano nutricional gerado com sucesso!');
        navigate(`/app/plans/${planId}`);
        return;
      }

      // 5. Poll for plan status until ready or error
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await axios.get(`${API}/plans/${planId}`, { headers: getAuthHeaders() });
          if (statusRes.data.status === 'ready') {
            clearInterval(pollInterval);
            toast.success('Plano nutricional gerado com sucesso!');
            navigate(`/app/plans/${planId}`);
          } else if (statusRes.data.status === 'error') {
            clearInterval(pollInterval);
            toast.error('Erro ao gerar o plano: ' + (statusRes.data.error_message || 'Tente novamente.'));
            setGenerating(false);
            setSubmitting(false);
          }
          // else still "generating", keep polling
        } catch (pollErr) {
          // Network error during poll, keep trying
          console.warn('Poll error:', pollErr);
        }
      }, 5000); // Poll every 5 seconds

      // Safety: stop polling after 15 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (generating) {
          toast.error('A geração está demorando mais que o esperado. Verifique o dashboard em alguns minutos.');
          setGenerating(false);
          setSubmitting(false);
        }
      }, 15 * 60 * 1000);

    } catch (err) {
      console.error('Error starting plan generation:', err);
      toast.error('Erro ao iniciar geração do plano. Verifique sua conexão e tente novamente.');
      setGenerating(false);
    }
    setSubmitting(false);
  };

  if (generating) {
    return <GeneratingScreen />;
  }

  const renderStep = () => {
    switch (step?.id) {
      case 'personal': return <StepPersonal data={data} update={update} />;
      case 'goals': return <StepGoals data={data} update={update} />;
      case 'health': return <StepHealth data={data} update={update} />;
      case 'lifestyle': return <StepLifestyle data={data} update={update} />;
      case 'eating': return <StepEating data={data} update={update} />;
      case 'digestion': return <StepDigestion data={data} update={update} />;
      case 'women': return <StepWomen data={data} update={update} />;
      case 'review': return <StepReview data={data} goToStep={goToStep} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      
      {/* Progress bar header */}
      <div className="sticky top-16 z-20 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{step?.label}</span>
            <div className="flex items-center gap-2">
              {saveStatus === 'saving' && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Salvando...
                </span>
              )}
              {saveStatus === 'saved' && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  <Save className="w-3 h-3 mr-1" /> Salvo
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">Passo {currentStep + 1} de {totalSteps}</span>
            </div>
          </div>
          <Progress value={progressPercent} className="h-1.5" data-testid="nutrition-form-progress" />
        </div>
      </div>

      {/* Draft loaded indicator + start fresh option */}
      {draftSource && currentStep === 0 && (
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 pt-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20 text-sm">
            <span className="text-muted-foreground">
              {draftSource === 'draft' 
                ? 'Continuando de onde você parou.' 
                : 'Dados carregados do último questionário.'}
            </span>
            <Button variant="ghost" size="sm" onClick={handleStartFresh} data-testid="form-start-fresh-button">
              Começar do zero
            </Button>
          </div>
        </div>
      )}

      {/* Form content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        {renderStep()}
      </div>

      {/* Navigation footer */}
      <div className="sticky bottom-0 z-20 bg-background/95 backdrop-blur border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={prev}
            disabled={currentStep === 0}
            data-testid="nutrition-form-prev-button"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
          </Button>
          
          {step?.id === 'review' ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="h-11 px-6"
              data-testid="nutrition-form-submit-button"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> Gerar meu plano</>
              )}
            </Button>
          ) : (
            <Button onClick={next} data-testid="nutrition-form-next-button">
              Próximo <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
