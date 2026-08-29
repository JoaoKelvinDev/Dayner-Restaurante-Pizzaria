import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminAuth } from '@/admin/useAdminAuth';

export default function AdminLogin() {
  const { entrar } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErro(null);

    try {
      await entrar(email.trim(), senha);
    } catch {
      setErro('E-mail ou senha inválidos.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="
          w-full
          max-w-sm
          bg-card
          border
          border-border
          rounded-2xl
          p-6
          space-y-4
        "
      >
        <div className="text-center mb-2">
          <h1 className="font-display text-2xl text-gold-gradient">
            Dayner
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Painel administrativo
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs text-muted-foreground">
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-secondary/40 border-border h-11"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="senha" className="text-xs text-muted-foreground">
            Senha
          </Label>
          <Input
            id="senha"
            type="password"
            autoComplete="current-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="bg-secondary/40 border-border h-11"
          />
        </div>

        {erro && (
          <p className="text-xs text-destructive text-center">{erro}</p>
        )}

        <Button
          type="submit"
          disabled={enviando}
          className="w-full bg-gold-gradient text-primary-foreground font-semibold h-11"
        >
          {enviando ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </div>
  );
}
