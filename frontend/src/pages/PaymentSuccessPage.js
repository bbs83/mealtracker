import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { getAuthHeaders, API } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking'); // checking, success, failed
  const [packageId, setPackageId] = useState(null);

  useEffect(() => {
    if (!sessionId) { setStatus('failed'); return; }
    let attempts = 0;
    const poll = async () => {
      try {
        const res = await axios.get(`${API}/payments/checkout-status/${sessionId}`, { headers: getAuthHeaders() });
        if (res.data.payment_status === 'paid') {
          setStatus('success');
          setPackageId(res.data.package_id);
          return;
        }
        if (res.data.status === 'expired') {
          setStatus('failed');
          return;
        }
        attempts++;
        if (attempts < 10) setTimeout(poll, 2000);
        else setStatus('failed');
      } catch {
        attempts++;
        if (attempts < 10) setTimeout(poll, 2000);
        else setStatus('failed');
      }
    };
    poll();
  }, [sessionId, API, getAuthHeaders]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        {status === 'checking' && (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2" style={{ fontFamily: "'Fraunces', serif" }}>Confirmando pagamento...</h2>
            <p className="text-muted-foreground">Aguarde enquanto verificamos seu pagamento.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: "'Fraunces', serif" }}>Pagamento confirmado!</h2>
            <p className="text-muted-foreground mb-6">
              {packageId === 'monthly_subscription'
                ? 'Sua assinatura mensal está ativa. Você tem acesso ao Tracker e pode gerar 1 plano por mês.'
                : 'Seu plano único está disponível. Agora você pode gerar seu plano nutricional personalizado.'}
            </p>
            <Button size="lg" onClick={() => navigate('/app')}>
              Ir para o Dashboard
            </Button>
          </>
        )}
        {status === 'failed' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: "'Fraunces', serif" }}>Pagamento não confirmado</h2>
            <p className="text-muted-foreground mb-6">Houve um problema ao confirmar seu pagamento. Tente novamente.</p>
            <Button variant="secondary" onClick={() => navigate('/app')}>Voltar ao Dashboard</Button>
          </>
        )}
      </div>
    </div>
  );
}
