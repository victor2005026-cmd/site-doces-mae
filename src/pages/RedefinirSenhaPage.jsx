import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

const inputClass =
  'w-full rounded-card border border-border-light bg-bg-alt px-4 py-2.5 text-[0.95rem] outline-none focus:border-rose focus:ring-1 focus:ring-rose';
const labelClass = 'mb-1 block text-[0.85rem] font-medium text-text-primary';

export default function RedefinirSenhaPage() {
  const { recuperandoSenha, definirNovaSenhaRecuperacao } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [expirado, setExpirado] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [saving, setSaving] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const prontoRef = useRef(false);

  useEffect(() => {
    if (recuperandoSenha) prontoRef.current = true;
  }, [recuperandoSenha]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!prontoRef.current) setExpirado(true);
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    if (novaSenha.length < 6) { setErro('A senha deve ter pelo menos 6 caracteres.'); return; }
    if (novaSenha !== confirmar) { setErro('As senhas não coincidem.'); return; }

    setSaving(true);
    const { error } = await definirNovaSenhaRecuperacao(novaSenha);
    setSaving(false);
    if (error) { setErro('Não consegui salvar a nova senha. Tente novamente.'); return; }

    setSucesso(true);
    showToast('Senha redefinida com sucesso!', 'success');
    setTimeout(() => navigate('/'), 2000);
  };

  if (sucesso) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 pt-[60px] text-center md:pt-[70px]">
        <p className="text-[2rem]">✓</p>
        <h1 className="font-heading text-[1.3rem] font-bold text-text-primary">Senha redefinida!</h1>
        <p className="text-[0.9rem] text-text-secondary">Levando você pro cardápio…</p>
      </div>
    );
  }

  if (expirado && !recuperandoSenha) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 pt-[60px] text-center md:pt-[70px]">
        <h1 className="font-heading text-[1.3rem] font-bold text-text-primary">Link inválido ou expirado</h1>
        <p className="max-w-xs text-[0.9rem] text-text-secondary">
          Esse link de redefinição de senha não é mais válido. Solicite a recuperação de senha novamente.
        </p>
        <Link to="/" className="rounded-full bg-rose px-6 py-2.5 text-[0.95rem] font-semibold text-white hover:bg-rose-dark">
          Voltar ao cardápio
        </Link>
      </div>
    );
  }

  if (!recuperandoSenha) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-[60px] md:pt-[70px]">
        <p className="text-text-secondary">Verificando link…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-alt pt-[60px] md:pt-[70px]">
      <div className="container-site max-w-sm py-10">
        <h1 className="mb-6 text-center font-heading text-[1.4rem] font-bold text-text-primary">Defina sua nova senha</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-card border border-border-light bg-bg-main p-6">
          <div>
            <label htmlFor="nova-senha" className={labelClass}>Nova senha (mín. 6 caracteres)</label>
            <input
              id="nova-senha"
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="confirma-senha" className={labelClass}>Confirmar nova senha</label>
            <input
              id="confirma-senha"
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
          {erro && <p className="text-[0.8rem] text-rose-dark">{erro}</p>}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-full bg-rose py-2.5 text-[0.95rem] font-semibold text-white transition-colors hover:bg-rose-dark disabled:opacity-60"
          >
            {saving && <Spinner />}
            {saving ? 'Salvando…' : 'Salvar nova senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
