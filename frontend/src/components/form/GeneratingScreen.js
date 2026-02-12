import React, { useState, useEffect } from 'react';
import { Leaf, Loader2, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

const MESSAGES = [
  'Analisando seus dados pessoais...',
  'Calculando taxa metabolica basal e gasto energetico...',
  'Avaliando suas condicoes de saude e restricoes...',
  'Analisando seu recordatorio alimentar semanal...',
  'Montando o cardapio de 7 dias...',
  'Definindo distribuicao de macronutrientes...',
  'Criando tabela de substituicoes...',
  'Preparando orientacoes personalizadas...',
  'Finalizando seu plano nutricional...',
];

export default function GeneratingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % MESSAGES.length);
    }, 7000);
    const timerInterval = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => {
      clearInterval(msgInterval);
      clearInterval(timerInterval);
    };
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec.toString().padStart(2, '0')}s` : `${sec}s`;
  };

  // Simulate progress (capped at 95% until done)
  const progress = Math.min(95, (elapsed / 120) * 100);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center" data-testid="generating-screen">
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Leaf className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-semibold mb-3" style={{ fontFamily: "'Fraunces', serif" }}>Estamos montando seu plano personalizado</h2>
          <p className="text-muted-foreground mb-4">Isso pode levar ate 2 minutos.</p>
          
          {/* Elapsed timer */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
            <Clock className="w-3.5 h-3.5" />
            <span>Tempo decorrido: {formatTime(elapsed)}</span>
          </div>

          {/* Progress bar */}
          <div className="max-w-xs mx-auto mb-4">
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span key={messageIndex} className="transition-opacity duration-500">{MESSAGES[messageIndex]}</span>
          </div>
        </div>

        {/* Skeleton preview */}
        <div className="bg-card rounded-2xl border border-border p-6 text-left space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
          <div className="pt-2" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <div className="pt-2" />
          <Skeleton className="h-5 w-2/3" />
          <div className="grid grid-cols-4 gap-2">
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
            <Skeleton className="h-8" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </div>
  );
}
