import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, formatarTelefone, validarTelefone } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';

function EmailRecuperacaoSection({ perfil }) {
  const { solicitarEmailRecuperacao } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    if (!emailInput.trim() || !emailInput.includes('@')) { setErro('Digite um e-mail válido.'); return; }
    setEnviando(true);
    const { error } = await solicitarEmailRecuperacao(emailInput.trim());
    setEnviando(false);
    if (error) {
      setErro(error.message?.includes('already') ? 'Esse e-mail já está em uso por outra conta.' : 'Não consegui enviar a confirmação. Tente novamente.');
      return;
    }
    setEnviado(true);
  };

  return (
    <div className="mt-6 rounded-card border border-border-light bg-bg-main p-6">
      <p className="mb-1 text-[0.95rem] font-semibold text-text-primary">E-mail de recuperação de senha</p>
      <p className="mb-4 text-[0.82rem] text-text-secondary">
        Com um e-mail confirmado, você recupera sua senha sozinho, sem precisar falar com a Ale.
      </p>

      {perfil?.email ? (
        <p className="rounded-card border border-success/30 bg-success/5 px-3 py-2 text-[0.85rem] text-success">
          E-mail confirmado: <strong>{perfil.email}</strong>
        </p>
      ) : enviado ? (
        <p className="rounded-card border border-gold/30 bg-gold/10 px-3 py-2 text-[0.85rem] text-text-primary">
          Enviamos um link de confirmação pra <strong>{emailInput.trim()}</strong>. Clique nele pra ativar a recuperação automática.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-1">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="seuemail@exemplo.com"
              className="w-full rounded-card border border-border-light bg-bg-alt px-4 py-2.5 text-[0.95rem] outline-none focus:border-rose focus:ring-1 focus:ring-rose"
            />
            {erro && <p className="mt-1 text-[0.8rem] text-rose-dark">{erro}</p>}
          </div>
          <button
            type="submit"
            disabled={enviando}
            className="rounded-full bg-rose px-5 py-2.5 text-[0.85rem] font-semibold text-white hover:bg-rose-dark disabled:opacity-60"
          >
            {enviando ? 'Enviando…' : 'Confirmar e-mail'}
          </button>
        </form>
      )}
    </div>
  );
}

function formatarCEP(v) {
  const d = v.replace(/\D/g, '').slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

const ENDERECO_VAZIO = { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', referencia: '' };
const inputClass =
  'w-full rounded-card border border-border-light bg-bg-alt px-4 py-2.5 text-[0.95rem] outline-none focus:border-rose focus:ring-1 focus:ring-rose';
const labelClass = 'mb-1 block text-[0.85rem] font-medium text-text-primary';

export default function PerfilPage() {
  const { user, perfil, loading: authLoading, updatePerfil } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [tel, setTel] = useState('');
  const [end, setEnd] = useState(ENDERECO_VAZIO);
  const [erro, setErro] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (perfil) {
      setNome(perfil.nome ?? '');
      setTel(perfil.telefone ?? '');
      setEnd(perfil.endereco_padrao ?? ENDERECO_VAZIO);
    }
  }, [perfil]);

  const buscarCEP = async (cep) => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return;
    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) setEnd((p) => ({ ...p, rua: data.logradouro, bairro: data.bairro, cidade: data.localidade }));
    } catch {
      // silencioso: usuário pode preencher manualmente
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    if (!nome.trim()) { setErro('Nome obrigatório.'); return; }
    if (!validarTelefone(tel)) { setErro('Telefone inválido. Use DDD + número (ex: 13912345678).'); return; }

    setSaving(true);
    const { error } = await updatePerfil({
      nome: nome.trim(),
      telefone: tel.replace(/\D/g, ''),
      telefone_formatado: formatarTelefone(tel),
      endereco_padrao: end,
    });
    setSaving(false);

    if (error) {
      setErro(error.message?.includes('duplicate') ? 'Esse telefone já está em uso por outra conta.' : 'Não foi possível salvar. Tente novamente.');
      return;
    }
    showToast('Perfil atualizado com sucesso!', 'success');
  };

  if (authLoading || !perfil) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-[60px] md:pt-[70px]">
        <p className="text-text-secondary">Carregando perfil…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-alt pt-[60px] md:pt-[70px]">
      <div className="container-site max-w-lg py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-heading text-[1.5rem] font-bold text-text-primary">Meu perfil</h1>
          <Link to="/" className="text-[0.85rem] text-text-secondary underline hover:text-rose">Ver cardápio</Link>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-card border border-border-light bg-bg-main p-6">
          <div>
            <label htmlFor="perfil-nome" className={labelClass}>Nome completo</label>
            <input id="perfil-nome" value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="perfil-tel" className={labelClass}>Telefone / WhatsApp</label>
            <input
              id="perfil-tel"
              type="tel"
              inputMode="numeric"
              value={formatarTelefone(tel)}
              onChange={(e) => setTel(e.target.value)}
              placeholder="(13) 99999-9999"
              className={inputClass}
            />
            <p className="mt-1 text-[0.78rem] text-text-secondary">
              Esse número é usado para contato. O login continua sendo feito com o número original do cadastro.
            </p>
          </div>

          <div className="border-t border-border-light pt-4">
            <p className="mb-3 text-[0.95rem] font-semibold text-text-primary">Endereço padrão</p>
            <div className="flex flex-col gap-3">
              <div>
                <label htmlFor="perfil-cep" className={labelClass}>CEP</label>
                <input
                  id="perfil-cep"
                  inputMode="numeric"
                  value={formatarCEP(end.cep)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEnd((p) => ({ ...p, cep: v }));
                    if (v.replace(/\D/g, '').length === 8) buscarCEP(v);
                  }}
                  placeholder="00000-000"
                  className={inputClass}
                />
                {loadingCep && <p className="mt-1 text-[0.8rem] text-text-secondary">Buscando endereço…</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={labelClass}>Rua / Avenida</label>
                  <input value={end.rua} onChange={(e) => setEnd((p) => ({ ...p, rua: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Número</label>
                  <input inputMode="numeric" value={end.numero} onChange={(e) => setEnd((p) => ({ ...p, numero: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Complemento</label>
                  <input value={end.complemento} onChange={(e) => setEnd((p) => ({ ...p, complemento: e.target.value }))} placeholder="Apto, bloco…" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Bairro</label>
                  <input value={end.bairro} onChange={(e) => setEnd((p) => ({ ...p, bairro: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Cidade</label>
                  <input value={end.cidade} onChange={(e) => setEnd((p) => ({ ...p, cidade: e.target.value }))} className={inputClass} />
                </div>
                <div className="col-span-2">
                  <label className={labelClass}>Ponto de referência</label>
                  <input value={end.referencia} onChange={(e) => setEnd((p) => ({ ...p, referencia: e.target.value }))} placeholder="Próximo ao…" className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          {erro && <p className="text-[0.8rem] text-rose-dark">{erro}</p>}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-full bg-rose py-3 text-[0.95rem] font-semibold text-white transition-colors hover:bg-rose-dark disabled:opacity-60"
          >
            {saving && <Spinner />}
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </form>

        <EmailRecuperacaoSection perfil={perfil} />
      </div>
    </div>
  );
}
