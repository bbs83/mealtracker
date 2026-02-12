import React, { useState, useEffect } from 'react';
import { Leaf, Loader2, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

const MESSAGES = [
  'Analisando seus dados pessoais e medidas corporais...',
  'Calculando taxa metabólica basal e gasto energético total...',
  'Avaliando suas condições de saúde e restrições alimentares...',
  'Analisando detalhadamente seu recordatório alimentar semanal...',
  'Estimando calorias e macronutrientes da sua alimentação atual...',
  'Identificando déficits e excessos nutricionais...',
  'Montando o cardápio personalizado — Segunda-feira...',
  'Montando o cardápio personalizado — Terça e Quarta...',
  'Montando o cardápio personalizado — Quinta e Sexta...',
  'Montando o cardápio personalizado — Sábado e Domingo...',
  'Definindo distribuição ideal de macronutrientes...',
  'Criando tabela de substituições equivalentes...',
  'Preparando orientações personalizadas de hidratação...',
  'Elaborando dicas de preparo e organização semanal...',
  'Montando o resumo executivo do seu plano...',
  'Revisando e finalizando seu plano nutricional completo...',
];

export default function GeneratingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex(prev => {
        // Non-looping: stop at last message
        if (prev >= MESSAGES.length - 1) return prev;
        return prev + 1;
      });
    }, 30000); // ~30s per message for 8 min total
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
    return m > 0 ? `${m}min ${sec.toString().padStart(2, '0')}s` : `${sec}s`;
  };

  // Progress capped at 95% until done (based on ~480s = 8min)
  const progress = Math.min(95, (elapsed / 480) * 100);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center" data-testid="generating-screen">
        <div className="mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Leaf className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-semibold mb-3" style={{ fontFamily: "'Fraunces', serif" }}>Estamos montando seu plano personalizado</h2>
          <p className="text-muted-foreground mb-2">Estamos utilizando inteligência artificial avançada para criar um plano completo e detalhado.</p>
          <p className="text-sm text-muted-foreground mb-4">Esse processo pode levar <strong>até 8 minutos</strong>. Por favor, não feche esta página.</p>
          
          {/* Elapsed timer */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
            <Clock className="w-3.5 h-3.5" />
            <span>Tempo decorrido: {formatTime(elapsed)}</span>
          </div>

          {/* Progress bar */}
          <div className="max-w-xs mx-auto mb-4">
            <Progress value={progress} className="h-2" />
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium min-h-[24px]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{MESSAGES[messageIndex]}</span>
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
