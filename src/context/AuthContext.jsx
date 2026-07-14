import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// Converte telefone (11 dígitos) em email interno para o Supabase Auth
export function phoneToEmail(phone) {
  return `${phone.replace(/\D/g, '')}@docesdaale.local`;
}

// Valida telefone brasileiro: DDD (11-99) + 9 dígitos
export function validarTelefone(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  const ddd = parseInt(digits.slice(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  // Bloqueia sequências óbvias
  if (/^(\d)\1{10}$/.test(digits)) return false;
  return true;
}

export function formatarTelefone(digits) {
  const d = digits.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPerfil = async (userId) => {
    const { data } = await supabase.from('perfis').select('*').eq('id', userId).single();
    setPerfil(data);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchPerfil(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchPerfil(session.user.id);
      } else {
        setPerfil(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (telefone, senha) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: phoneToEmail(telefone),
      password: senha,
    });
    if (error) throw error;
    return data;
  };

  const cadastrar = async ({ nome, telefone, telefoneFormatado, senha }) => {
    const { data, error } = await supabase.auth.signUp({
      email: phoneToEmail(telefone),
      password: senha,
      options: {
        data: {
          nome,
          telefone: telefone.replace(/\D/g, ''),
          telefone_formatado: telefoneFormatado,
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const logout = () => supabase.auth.signOut();

  const isAdmin = perfil?.eh_admin === true;
  const primeiroNome = perfil?.nome?.split(' ')[0] ?? '';

  return (
    <AuthContext.Provider value={{ user, perfil, loading, isAdmin, primeiroNome, login, cadastrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
