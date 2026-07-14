import { useState } from 'react';
import { useAuth, formatarTelefone } from '../context/AuthContext';

export default function AdminLogin({ onLogin }) {
  const { login } = useAuth();
  const [tel, setTel] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      await login(tel.replace(/\D/g, ''), senha);
      onLogin();
    } catch {
      setErro('Telefone ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  const ic = 'w-full rounded-card border border-border-light bg-bg-alt px-4 py-2.5 text-[0.95rem] outline-none focus:border-rose focus:ring-1 focus:ring-rose';

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-alt">
      <div className="w-full max-w-sm rounded-card border border-border-light bg-bg-main p-8 shadow-md">
        <div className="mb-6 text-center">
          <span className="font-script text-[2rem] text-gold">Doces da Ale</span>
          <p className="mt-1 text-[0.9rem] text-text-secondary">Painel Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="admin-tel" className="mb-1 block text-[0.85rem] font-medium text-text-primary">
              Telefone
            </label>
            <input
              id="admin-tel"
              type="tel"
              value={formatarTelefone(tel)}
              onChange={(e) => setTel(e.target.value)}
              placeholder="(13) 99999-9999"
              autoComplete="tel"
              className={ic}
            />
          </div>
          <div>
            <label htmlFor="admin-senha" className="mb-1 block text-[0.85rem] font-medium text-text-primary">
              Senha
            </label>
            <input
              id="admin-senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete="current-password"
              className={ic}
            />
          </div>
          {erro && <p className="text-[0.85rem] text-rose-dark">{erro}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-rose py-2.5 text-[0.95rem] font-semibold text-white transition-colors hover:bg-rose-dark disabled:opacity-60"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 text-center text-[0.75rem] text-text-secondary">
          Acesso restrito · <a href="/" className="underline hover:text-rose">Voltar ao site</a>
        </p>
      </div>
    </div>
  );
}
