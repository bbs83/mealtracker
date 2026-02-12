import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Leaf, Menu, X } from 'lucide-react';

export const AppHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to={user ? '/app' : '/'} className="flex items-center gap-2 no-underline" data-testid="header-logo">
          <Leaf className="w-6 h-6 text-primary" />
          <span className="text-xl font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>MealTrack</span>
        </Link>
        
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-muted-foreground">{user.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="logout-button">
              <LogOut className="w-4 h-4 mr-1" /> Sair
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden sm:flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')} data-testid="header-login-button">Entrar</Button>
              <Button size="sm" onClick={() => navigate('/signup')} data-testid="header-signup-button">Criar conta</Button>
            </div>
            <button className="sm:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </>
        )}
      </div>
      {menuOpen && !user && (
        <div className="sm:hidden border-t border-border bg-background px-4 py-3 space-y-2">
          <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/login'); setMenuOpen(false); }}>Entrar</Button>
          <Button className="w-full" onClick={() => { navigate('/signup'); setMenuOpen(false); }}>Criar conta</Button>
        </div>
      )}
    </header>
  );
};
