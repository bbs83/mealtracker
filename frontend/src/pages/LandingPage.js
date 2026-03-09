import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ClipboardList, Sparkles, UtensilsCrossed, ArrowRight, Leaf, Heart, Scale, Apple, Check } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) navigate('/app', { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(1200px 600px at 15% 10%, rgba(201,123,99,0.18), transparent 55%), radial-gradient(900px 520px at 85% 0%, rgba(127,154,114,0.18), transparent 55%), radial-gradient(800px 500px at 50% 110%, rgba(214,161,74,0.12), transparent 55%)' }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16 sm:pb-20 relative">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                <Sparkles className="w-3 h-3" /> Powered by AI
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-6" style={{ fontFamily: "'Fraunces', serif" }} data-testid="landing-hero-title">
              Seu plano nutricional personalizado em minutos
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-8 mb-8 max-w-2xl">
              Preencha um questionário completo sobre sua saúde, rotina e objetivos. Nossa inteligência artificial cria um plano alimentar de 7 dias totalmente adaptado a você.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="h-13 px-8 text-base" onClick={() => navigate('/signup')} data-testid="landing-primary-cta-button">
                Começar agora <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="secondary" size="lg" className="h-13 px-8 text-base" onClick={() => navigate('/login')} data-testid="landing-secondary-cta-button">
                Já tenho conta
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-4" style={{ fontFamily: "'Fraunces', serif" }}>Como funciona</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">Três passos simples para ter seu plano nutricional pronto</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: ClipboardList, title: 'Preencha o questionário', desc: 'Responda perguntas sobre sua saúde, rotina, preferências alimentares e objetivos. Leva cerca de 8-10 minutos.', step: '1' },
              { icon: Sparkles, title: 'IA gera seu plano', desc: 'Nossa inteligência artificial analisa seus dados e cria um plano nutricional completo e personalizado.', step: '2' },
              { icon: UtensilsCrossed, title: 'Receba seu cardápio', desc: 'Acesse seu plano de 7 dias com substituições, orientações e resumo executivo. Tudo na sua área logada.', step: '3' },
            ].map((item) => (
              <Card key={item.step} className="rounded-2xl border border-border bg-card hover:shadow-lg hover:-translate-y-0.5 transition-shadow duration-200 transition-transform duration-200" data-testid={`landing-step-${item.step}-card`}>
                <CardContent className="p-6 sm:p-8">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">PASSO {item.step}</div>
                  <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "'Fraunces', serif" }}>{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-6">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-16 sm:py-20 bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-4" style={{ fontFamily: "'Fraunces', serif" }}>O que você recebe</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">Um plano nutricional completo com 5 seções detalhadas</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Scale, title: 'Avaliação Inicial', desc: 'Cálculo de TMB, gasto energético, distribuição de macros e análise clínica completa.' },
              { icon: UtensilsCrossed, title: 'Cardápio de 7 dias', desc: 'Plano alimentar detalhado com horários, quantidades, calorias e macros por refeição.' },
              { icon: Apple, title: 'Tabela de Substituições', desc: 'Flexibilidade para trocar alimentos mantendo o equilíbrio nutricional.' },
              { icon: Heart, title: 'Orientações Gerais', desc: 'Hidratação, saúde digestiva, dicas de preparo e orientações para comer fora.' },
              { icon: Leaf, title: 'Resumo Executivo', desc: 'Meta calórica, principais mudanças recomendadas e alertas importantes.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-xl border border-border/50 bg-background">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground leading-5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 sm:py-20" id="pricing">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-4" style={{ fontFamily: "'Fraunces', serif" }}>Planos e preços</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">Escolha o plano ideal para seus objetivos</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card className="rounded-2xl border-2 border-border">
              <CardContent className="p-6 sm:p-8 text-center">
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "'Fraunces', serif" }}>Plano Único</h3>
                <div className="mb-4"><span className="text-4xl font-bold" style={{ fontFamily: "'Fraunces', serif" }}>R$ 49</span><span className="text-muted-foreground ml-1">/ plano</span></div>
                <ul className="space-y-2 text-sm text-left mb-6">
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> 1 plano nutricional completo de 7 dias</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Tabela de substituições</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Orientações personalizadas</li>
                </ul>
                <Button variant="secondary" className="w-full" onClick={() => navigate('/signup')}>Começar</Button>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-2 border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0"><span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">Recomendado</span></div>
              <CardContent className="p-6 sm:p-8 text-center">
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "'Fraunces', serif" }}>Assinatura Mensal</h3>
                <div className="mb-4"><span className="text-4xl font-bold" style={{ fontFamily: "'Fraunces', serif" }}>R$ 29</span><span className="text-muted-foreground ml-1">/ mês</span></div>
                <ul className="space-y-2 text-sm text-left mb-6">
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> 1 novo plano por mês</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Tracker de alimentação diário</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Análise de refeições por foto com IA</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Comparativo diário com o plano</li>
                  <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary mt-0.5 shrink-0" /> Resumo semanal de aderência</li>
                </ul>
                <Button className="w-full" onClick={() => navigate('/signup')}>Assinar agora</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-12" style={{ fontFamily: "'Fraunces', serif" }}>Perguntas frequentes</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {[
              { q: 'O plano substitui um nutricionista?', a: 'Não. O MealTrack é uma ferramenta de apoio que gera sugestões baseadas em IA. Recomendamos sempre o acompanhamento presencial com um nutricionista registrado.' },
              { q: 'Quanto tempo leva para gerar o plano?', a: 'A geração do plano leva entre 3 e 8 minutos, dependendo da complexidade. O questionário em si leva cerca de 8-10 minutos para ser preenchido.' },
              { q: 'Posso gerar mais de um plano?', a: 'Sim! Você pode preencher o questionário quantas vezes quiser e ter um histórico de todos os seus planos na área logada.' },
              { q: 'O plano considera minhas restrições alimentares?', a: 'Sim. O questionário coleta informações detalhadas sobre alergias, intolerâncias, preferências e restrições. O plano respeita todas elas.' },
              { q: 'Preciso pagar para usar?', a: 'O MealTrack está em fase beta. Crie sua conta e experimente gratuitamente.' },
            ].map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border rounded-xl px-4" data-testid={`landing-faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium py-4">{item.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-4" style={{ fontFamily: "'Fraunces', serif" }}>Pronto para começar?</h2>
          <p className="text-muted-foreground mb-8">Crie sua conta gratuitamente e receba seu plano nutricional personalizado hoje.</p>
          <Button size="lg" className="h-13 px-8 text-base" onClick={() => navigate('/signup')}>
            Criar minha conta <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium" style={{ fontFamily: "'Fraunces', serif" }}>MealTrack</span>
          </div>
          <p className="text-xs text-muted-foreground">MealTrack — Plano nutricional inteligente. Não substitui acompanhamento profissional.</p>
        </div>
      </footer>
    </div>
  );
}
