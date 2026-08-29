import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAdminAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCarregando(false);
    });

    const { data: assinatura } = supabase.auth.onAuthStateChange(
      (_evento, novaSession) => {
        setSession(novaSession);
      }
    );

    return () => {
      assinatura.subscription.unsubscribe();
    };
  }, []);

  const entrar = async (email: string, senha: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) throw error;
  };

  const sair = async () => {
    await supabase.auth.signOut();
  };

  return {
    session,
    autenticado: !!session,
    carregando,
    entrar,
    sair,
  };
}
