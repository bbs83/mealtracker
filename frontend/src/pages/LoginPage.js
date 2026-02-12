import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (user) navigate('/app', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Preencha todos os campos'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Bem-vindo de volta!');
      navigate('/app');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao fazer login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="flex min-h-[calc(100vh-64px)]">
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12" style={{ background: 'radial-gradient(800px 400px at 30% 30%, rgba(201,123,99,0.12), transparent 55%), radial-gradient(600px 400px at 70% 70%, rgba(127,154,114,0.12), transparent 55%)' }}>
          <div className="max-w-md">
            <Leaf className="w-12 h-12 text-primary mb-6" />
            <h2 className="text-3xl font-semibold mb-4" style={{ fontFamily: "'Fraunces', serif" }}>Seu plano nutricional personalizado</h2>
            <p className="text-muted-foreground leading-7">Preencha o questionário completo e receba um plano alimentar de 7 dias, criado por inteligência artificial com base nas suas necessidades únicas.</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl" style={{ fontFamily: "'Fraunces', serif" }}>Entrar</CardTitle>
              <CardDescription>Acesse sua conta para ver seus planos</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email</label>
                  <Input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="login-form-email-input" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Senha</label>
                  <Input type="password" placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="login-form-password-input" />
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading} data-testid="login-form-submit-button">
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Não tem conta? <Link to="/signup" className="text-primary font-medium hover:underline" data-testid="login-signup-link">Criar conta</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
