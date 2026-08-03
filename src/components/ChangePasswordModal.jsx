import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from './Spinner';

const inputClass =
  'w-full rounded-card border border-border-light bg-bg-alt px-4 py-2.5 text-[0.95rem] outline-none focus:border-rose focus:ring-1 focus:ring-rose';
const labelClass = 'mb-1 block text-[0.85rem] font-medium text-text-primary';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { changePassword } = useAuth();
  const { showToast } = useToast();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const reset = () => {
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmar('');
    setErro('');
  };

  const handleClose = () => {
    if (loading) return;
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    if (!senhaAtual) { setErro('Informe a senha atual.'); return; }
    if (novaSenha.length < 6) { setErro('A nova senha deve ter pelo menos 6 caracteres.'); return; }
    if (novaSenha !== confirmar) { setErro('As senhas não coincidem.'); return; }

    setLoading(true);
    try {
      await changePassword(senhaAtual, novaSenha);
      showToast('Senha alterada com sucesso!', 'success');
      reset();
      onClose();
    } catch (err) {
      setErro(err.message?.includes('incorreta') ? 'Senha atual incorreta.' : 'Não foi possível trocar a senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="w-full max-w-[380px] rounded-card bg-bg-main p-6 shadow-lg">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-heading text-[1.1rem] font-semibold text-text-primary">Trocar senha</h2>
          <button type="button" onClick={handleClose} className="text-[1.2rem] text-text-secondary hover:text-rose">×</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="pw-atual" className={labelClass}>Senha atual</label>
            <input
              id="pw-atual"
              type="password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
              autoComplete="current-password"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="pw-nova" className={labelClass}>Nova senha (mín. 6 caracteres)</label>
            <input
              id="pw-nova"
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="pw-confirma" className={labelClass}>Confirmar nova senha</label>
            <input
              id="pw-confirma"
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
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-full bg-rose py-2.5 text-[0.95rem] font-semibold text-white transition-colors hover:bg-rose-dark disabled:opacity-60"
          >
            {loading && <Spinner />}
            {loading ? 'Trocando…' : 'Trocar senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
