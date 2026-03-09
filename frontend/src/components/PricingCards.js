import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

export default function PricingCards({ onClose }) {
  const { getAuthHeaders, API } = useAuth();
  const [loading, setLoading] = useState(null);

  const handleCheckout = async (packageId) => {
    setLoading(packageId);
    try {
      const res = await axios.post(`${API}/payments/create-checkout`, {
        package_id: packageId,
        origin_url: window.location.origin,
      }, { headers: getAuthHeaders() });
      window.location.href = res.data.url;
    } catch (err) {
      toast.error('Erro ao iniciar pagamento. Tente novamente.');
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
      {/* Single Plan */}
      <Card className="rounded-2xl border-2 border-border hover:border-primary/30 transition-colors duration-200">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-lg" style={{ fontFamily: "'Fraunces', serif" }}>Plano Único</CardTitle>
          <div className="mt-2">
            <span className="text-4xl font-bold" style={{ fontFamily: "'Fraunces', serif" }}>R$ 49</span>
            <span className="text-muted-foreground ml-1">/ plano</span>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <ul className="space-y-2 text-sm text-left mb-6">
            <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Geração de 1 plano nutricional completo</li>
            <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Cardápio de 7 dias personalizado</li>
            <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Tabela de substituições</li>
            <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Orientações e resumo executivo</li>
          </ul>
          <Button variant="secondary" className="w-full h-11" onClick={() => handleCheckout('single_plan')} disabled={loading === 'single_plan'}>
            {loading === 'single_plan' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Comprar plano único'}
          </Button>
        </CardContent>
      </Card>

      {/* Monthly Subscription */}
      <Card className="rounded-2xl border-2 border-primary relative overflow-hidden">
        <div className="absolute top-0 right-0">
          <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground text-xs px-3 py-1">Recomendado</Badge>
        </div>
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-lg" style={{ fontFamily: "'Fraunces', serif" }}>Assinatura Mensal</CardTitle>
          <div className="mt-2">
            <span className="text-4xl font-bold" style={{ fontFamily: "'Fraunces', serif" }}>R$ 29</span>
            <span className="text-muted-foreground ml-1">/ mês</span>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <ul className="space-y-2 text-sm text-left mb-6">
            <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> 1 novo plano nutricional por mês</li>
            <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Tracker de alimentação diário</li>
            <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Análise de refeições por foto com IA</li>
            <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Comparativo diário com o plano</li>
            <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Resumo semanal de aderência</li>
          </ul>
          <Button className="w-full h-11" onClick={() => handleCheckout('monthly_subscription')} disabled={loading === 'monthly_subscription'}>
            {loading === 'monthly_subscription' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Assinar agora'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
