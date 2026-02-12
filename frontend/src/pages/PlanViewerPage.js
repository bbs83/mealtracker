import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Copy, Check, Download } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function PlanViewerPage() {
  const { planId } = useParams();
  const { getAuthHeaders, API } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await axios.get(`${API}/plans/${planId}`, { headers: getAuthHeaders() });
        setPlan(res.data);
      } catch (err) {
        toast.error('Erro ao carregar o plano');
        navigate('/app');
      }
      setLoading(false);
    };
    fetchPlan();
  }, [planId, API, getAuthHeaders, navigate]);

  const handleCopy = async () => {
    if (plan?.plan_markdown) {
      await navigator.clipboard.writeText(plan.plan_markdown);
      setCopied(true);
      toast.success('Plano copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!plan?.plan_markdown) return;
    const blob = new Blob([plan.plan_markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plano-nutricional-${new Date(plan.created_at).toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Plano baixado!');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Back button and header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/app')} data-testid="plan-back-button">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao dashboard
          </Button>
          {plan?.status === 'ready' && (
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={handleDownload} data-testid="plan-download-button">
                <Download className="w-4 h-4 mr-1" /> Baixar .md
              </Button>
              <Button variant="secondary" size="sm" onClick={handleCopy} data-testid="plan-copy-button">
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="mt-8 space-y-3">
              {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
          </div>
        ) : plan?.status === 'ready' ? (
          <div>
            {/* Plan metadata */}
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="outline" className="bg-[rgba(127,154,114,0.18)] text-[rgb(58,84,47)] border-[rgba(127,154,114,0.35)]" data-testid="plan-status-badge">Pronto</Badge>
              <span className="text-sm text-muted-foreground">Gerado em {formatDate(plan.created_at)}</span>
              {plan.input_tokens && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  ({plan.output_tokens?.toLocaleString()} tokens)
                </span>
              )}
            </div>

            {/* Markdown content */}
            <div className="bg-white rounded-2xl border border-border p-6 sm:p-10 shadow-sm" data-testid="plan-markdown-container">
              <div className="plan-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {plan.plan_markdown}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ) : plan?.status === 'error' ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">Houve um erro ao gerar seu plano.</p>
            <p className="text-sm text-muted-foreground mb-4">{plan.error_message}</p>
            <Button onClick={() => navigate('/app')}>Voltar ao dashboard</Button>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Plano nao encontrado ou ainda sendo gerado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
