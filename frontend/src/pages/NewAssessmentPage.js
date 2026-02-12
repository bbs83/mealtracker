import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Send, Loader2 } from 'lucide-react';
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

// Clean data before submission - remove empty fields, files, and calculate derived fields
const cleanFormData = (data) => {
  const cleaned = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Skip internal file data (sent separately)
    if (key === 'lab_file_base64' || key === 'lab_file_media_type') continue;
    
    // Skip empty values
    if (value === '' || value === null || value === undefined) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    
    cleaned[key] = value;
  }

  // Auto-calculate sleep hours if we have both times
  if (cleaned.wake_time && cleaned.sleep_time) {
    const [wH, wM] = cleaned.wake_time.split(':').map(Number);
    const [sH, sM] = cleaned.sleep_time.split(':').map(Number);
    let diff = (wH * 60 + wM) - (sH * 60 + sM);
    if (diff <= 0) diff += 1440;
    cleaned.sleep_hours_calculated = `${Math.floor(diff / 60)}h${(diff % 60).toString().padStart(2, '0')}`;
  }

  // If lab file was attached, mark it
  if (data.lab_file_name) {
    cleaned.lab_file_attached = data.lab_file_name;
  }

  return cleaned;
};

export default function NewAssessmentPage() {
  const { getAuthHeaders, API } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);

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

  const handleSubmit = async () => {
    setSubmitting(true);
    setGenerating(true);
    try {
      // Clean data before sending
      const cleanedData = cleanFormData(data);

      // Prepare lab file info for backend
      const payload = {
        patient_data: cleanedData,
      };
      if (data.lab_file_base64 && data.lab_file_media_type) {
        payload.lab_file = {
          base64: data.lab_file_base64,
          media_type: data.lab_file_media_type,
          name: data.lab_file_name || 'exames',
        };
      }

      // Create assessment
      const assessmentRes = await axios.post(
        `${API}/assessments`,
        payload,
        { headers: getAuthHeaders() }
      );
      const assessmentId = assessmentRes.data.id;

      // Generate plan
      const planRes = await axios.post(
        `${API}/assessments/${assessmentId}/generate-plan`,
        {},
        { headers: getAuthHeaders(), timeout: 600000 } // 10 min timeout for opus
      );

      if (planRes.data.status === 'ready') {
        toast.success('Plano nutricional gerado com sucesso!');
        navigate(`/app/plans/${planRes.data.id}`);
      } else if (planRes.data.status === 'error') {
        toast.error('Erro ao gerar o plano. Tente novamente.');
        setGenerating(false);
      }
    } catch (err) {
      console.error('Error generating plan:', err);
      toast.error('Erro ao gerar o plano. Verifique sua conexão e tente novamente.');
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
            <span className="text-xs text-muted-foreground">Passo {currentStep + 1} de {totalSteps}</span>
          </div>
          <Progress value={progressPercent} className="h-1.5" data-testid="nutrition-form-progress" />
        </div>
      </div>

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
              Proximo <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
