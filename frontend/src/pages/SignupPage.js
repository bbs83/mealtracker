import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf } from 'lucide-react';
import { toast } from 'sonner';

export default function SignupPage() {
  const { signup, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (user) navigate('/app', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) { toast.error('Preencha todos os campos'); return; }
    if (password.length < 6) { toast.error('A senha deve ter pelo menos 6 caracteres'); return; }
    if (password !== confirmPassword) { toast.error('As senhas não coincidem'); return; }
    setLoading(true);
    try {
      await signup(name, email, password);
      toast.success('Conta criada com sucesso!');
      navigate('/app');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao criar conta');
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
            <h2 className="text-3xl font-semibold mb-4" style={{ fontFamily: "'Fraunces', serif" }}>Comece sua jornada nutricional</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-primary mt-0.5">&#10003;</span> Questionário completo de saúde e hábitos</li>
              <li className="flex items-start gap-2"><span className="text-primary mt-0.5">&#10003;</span> Plano alimentar de 7 dias com IA</li>
              <li className="flex items-start gap-2"><span className="text-primary mt-0.5">&#10003;</span> Tabela de substituições flexível</li>
              <li className="flex items-start gap-2"><span className="text-primary mt-0.5">&#10003;</span> Orientações personalizadas</li>
            </ul>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl" style={{ fontFamily: "'Fraunces', serif" }}>Criar conta</CardTitle>
              <CardDescription>Cadastre-se para criar seu plano nutricional</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Nome completo</label>
                  <Input placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} data-testid="signup-form-name-input" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email</label>
                  <Input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="signup-form-email-input" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Senha</label>
                  <Input type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="signup-form-password-input" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Confirmar senha</label>
                  <Input type="password" placeholder="Repita sua senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} data-testid="signup-form-confirm-password-input" />
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading} data-testid="signup-form-submit-button">
                  {loading ? 'Criando conta...' : 'Criar conta'}
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Já tem conta? <Link to="/login" className="text-primary font-medium hover:underline" data-testid="signup-login-link">Entrar</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
