import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// Converte telefone (11 dígitos) em email interno para o Supabase Auth
export function phoneToEmail(phone) {
  return `${phone.replace(/\D/g, '')}@doces-da-ale.email`;
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

// O e-mail de auth é sempre "{telefone}@doces-da-ale.email" (interno, não existe de verdade).
// Quando vira outra coisa, é porque o cliente confirmou um e-mail real via updateUser({ email }).
function emailReal(email) {
  return email && !email.endsWith('@doces-da-ale.email') ? email : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  // true quando o cliente chega no site através do link de redefinição de
  // senha (evento PASSWORD_RECOVERY do Supabase). Precisa ser capturado aqui,
  // no listener central, e não numa página isolada — senão corre o risco de
  // o evento já ter disparado antes da página específica se inscrever.
  const [recuperandoSenha, setRecuperandoSenha] = useState(false);

  // authEmail: e-mail atual da sessão (session.user.email) — usado só pra
  // sincronizar perfis.email quando o cliente confirma um e-mail real.
  const fetchPerfil = async (userId, authEmail) => {
    const { data } = await supabase.from('perfis').select('*').eq('id', userId).single();
    const emailConfirmado = emailReal(authEmail);
    if (emailConfirmado && data && data.email !== emailConfirmado) {
      const { data: atualizado } = await supabase
        .from('perfis')
        .update({ email: emailConfirmado })
        .eq('id', userId)
        .select()
        .single();
      setPerfil(atualizado ?? data);
      return;
    }
    setPerfil(data);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchPerfil(session.user.id, session.user.email);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'PASSWORD_RECOVERY') setRecuperandoSenha(true);
      if (session?.user) {
        fetchPerfil(session.user.id, session.user.email);
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
    if (!error) return data;

    // Se a conta já confirmou um e-mail de recuperação, o e-mail de login
    // (auth.users.email) deixou de ser o "{telefone}@doces-da-ale.email" e
    // virou o e-mail real — sem isso, o Supabase nunca acha a conta pelo
    // padrão antigo. Tenta de novo com o e-mail real antes de desistir.
    const { data: recData } = await supabase.rpc('buscar_recuperacao_senha', { p_telefone: telefone.replace(/\D/g, '') });
    const emailReal = recData?.[0]?.email;
    if (emailReal) {
      const { data: data2, error: error2 } = await supabase.auth.signInWithPassword({
        email: emailReal,
        password: senha,
      });
      if (!error2) return data2;
    }

    throw error;
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

  // Reautentica com a senha atual (Supabase não expõe verificação direta) antes de trocar
  const changePassword = async (senhaAtual, novaSenha) => {
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: senhaAtual,
    });
    if (reauthError) throw new Error('Senha atual incorreta.');
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (error) throw error;
  };

  const updatePerfil = async (data) => {
    const { error } = await supabase.from('perfis').update(data).eq('id', user.id);
    if (!error) await fetchPerfil(user.id, user.email);
    return { error };
  };

  // Inicia a confirmação de um e-mail real de recuperação (precisa estar logado).
  // O perfis.email só é atualizado depois que o cliente clica no link de confirmação
  // (ver fetchPerfil acima) — nunca direto, pra não guardar um e-mail não confirmado.
  const solicitarEmailRecuperacao = async (email) => {
    const { error } = await supabase.auth.updateUser(
      { email },
      { emailRedirectTo: `${window.location.origin}/perfil` }
    );
    return { error };
  };

  // Consulta pública (não precisa estar logado) — usada na tela "Esqueci minha senha".
  // Retorna null se o telefone não existe, ou o e-mail confirmado (pode ser null) se existir.
  const buscarRecuperacaoSenha = async (telefone) => {
    const { data, error } = await supabase.rpc('buscar_recuperacao_senha', { p_telefone: telefone.replace(/\D/g, '') });
    if (error) return { encontrado: false, email: null, error };
    if (!data || data.length === 0) return { encontrado: false, email: null, error: null };
    return { encontrado: true, email: data[0].email, error: null };
  };

  const enviarLinkResetSenha = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    return { error };
  };

  // Usado só na tela /redefinir-senha, dentro de uma sessão de recuperação (PASSWORD_RECOVERY)
  const definirNovaSenhaRecuperacao = async (novaSenha) => {
    const { error } = await supabase.auth.updateUser({ password: novaSenha });
    if (!error) setRecuperandoSenha(false);
    return { error };
  };

  const isAdmin = perfil?.eh_admin === true;
  const primeiroNome = perfil?.nome?.split(' ')[0] ?? '';

  return (
    <AuthContext.Provider
      value={{
        user, perfil, loading, isAdmin, primeiroNome, recuperandoSenha,
        login, cadastrar, logout, changePassword, updatePerfil,
        solicitarEmailRecuperacao, buscarRecuperacaoSenha, enviarLinkResetSenha, definirNovaSenhaRecuperacao,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
