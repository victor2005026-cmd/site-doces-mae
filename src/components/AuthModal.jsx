import { useRef, useState } from 'react';
import { useAuth, formatarTelefone, validarTelefone } from '../context/AuthContext';
import { waLink } from '../lib/whatsapp';

const inputClass =
  'w-full rounded-card border border-border-light bg-bg-alt px-4 py-2.5 text-[0.95rem] outline-none focus:border-rose focus:ring-1 focus:ring-rose';
const labelClass = 'mb-1 block text-[0.85rem] font-medium text-text-primary';
const errorClass = 'mt-1 text-[0.8rem] text-rose-dark';

function maskEmail(email) {
  const [local, domain] = email.split('@');
  const [domainName, ...domainRest] = domain.split('.');
  const mask = (s) => (s.length <= 2 ? `${s[0]}*` : `${s[0]}${'*'.repeat(Math.max(1, s.length - 2))}${s[s.length - 1]}`);
  return `${mask(local)}@${mask(domainName)}.${domainRest.join('.')}`;
}

function LoginForm({ onSuccess, onForgot }) {
  const { login } = useAuth();
  const [tel, setTel] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    if (!validarTelefone(tel)) {
      setErro('Telefone inválido. Use DDD + número (ex: 13912345678).');
      return;
    }
    setLoading(true);
    try {
      await login(tel.replace(/\D/g, ''), senha);
      onSuccess();
    } catch {
      setErro('Telefone ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="login-tel" className={labelClass}>Telefone / WhatsApp</label>
        <input
          id="login-tel"
          type="tel"
          inputMode="numeric"
          value={formatarTelefone(tel)}
          onChange={(e) => setTel(e.target.value)}
          placeholder="(13) 99999-9999"
          autoComplete="tel"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="login-senha" className={labelClass}>Senha</label>
        <input
          id="login-senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          autoComplete="current-password"
          className={inputClass}
        />
        <button
          type="button"
          onClick={onForgot}
          className="mt-1 text-[0.8rem] text-rose underline"
        >
          Esqueci minha senha
        </button>
      </div>
      {erro && <p className={errorClass}>{erro}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-rose py-2.5 text-[0.95rem] font-semibold text-white transition-colors hover:bg-rose-dark disabled:opacity-60"
      >
        {loading ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}

function CadastroForm({ onSuccess }) {
  const { cadastrar, solicitarEmailRecuperacao } = useAuth();
  const [form, setForm] = useState({ nome: '', tel: '', email: '', senha: '', confirma: '' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [contaCriada, setContaCriada] = useState(false);
  const honeypotRef = useRef(null);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // honeypot anti-bot
    if (honeypotRef.current?.value) return;

    setErro('');
    if (!form.nome.trim()) { setErro('Nome obrigatório.'); return; }
    if (!validarTelefone(form.tel)) { setErro('Telefone inválido. Use DDD + número (ex: 13912345678).'); return; }
    if (form.senha.length < 6) { setErro('Senha deve ter pelo menos 6 caracteres.'); return; }
    if (form.senha !== form.confirma) { setErro('As senhas não coincidem.'); return; }

    setLoading(true);
    try {
      await cadastrar({
        nome: form.nome.trim(),
        telefone: form.tel.replace(/\D/g, ''),
        telefoneFormatado: formatarTelefone(form.tel),
        senha: form.senha,
      });

      if (form.email.trim()) {
        const { error: emailError } = await solicitarEmailRecuperacao(form.email.trim());
        if (emailError) {
          setContaCriada(true);
          setErro('Conta criada! Mas não consegui associar esse e-mail (talvez já esteja em uso por outra conta). Você pode tentar de novo em "Meu perfil".');
          setLoading(false);
          return;
        }
        setContaCriada(true);
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err) {
      if (err.message?.includes('already registered')) {
        setErro('Esse telefone já tem uma conta. Faça login.');
      } else {
        setErro('Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (contaCriada) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-[1.5rem]">✓</p>
        <p className="font-semibold text-text-primary">Conta criada com sucesso!</p>
        {!erro && form.email.trim() && (
          <p className="text-[0.88rem] text-text-secondary">
            Enviamos um link de confirmação pra <strong>{maskEmail(form.email.trim())}</strong>. Clique nele
            pra habilitar a recuperação de senha automática por e-mail.
          </p>
        )}
        {erro && <p className={errorClass}>{erro}</p>}
        <button
          type="button"
          onClick={onSuccess}
          className="rounded-full bg-rose py-2.5 text-[0.95rem] font-semibold text-white hover:bg-rose-dark"
        >
          Continuar
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* honeypot */}
      <input ref={honeypotRef} type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

      <div>
        <label htmlFor="cad-nome" className={labelClass}>Nome completo</label>
        <input id="cad-nome" required value={form.nome} onChange={set('nome')} className={inputClass} />
      </div>
      <div>
        <label htmlFor="cad-tel" className={labelClass}>Telefone / WhatsApp</label>
        <input
          id="cad-tel"
          type="tel"
          inputMode="numeric"
          value={formatarTelefone(form.tel)}
          onChange={(e) => setForm((p) => ({ ...p, tel: e.target.value }))}
          placeholder="(13) 99999-9999"
          autoComplete="tel"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="cad-email" className={labelClass}>
          E-mail <span className="font-normal text-text-secondary">(opcional — pra recuperar senha sozinho)</span>
        </label>
        <input
          id="cad-email"
          type="email"
          value={form.email}
          onChange={set('email')}
          placeholder="seuemail@exemplo.com"
          autoComplete="email"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="cad-senha" className={labelClass}>Senha (mín. 6 caracteres)</label>
        <input
          id="cad-senha"
          type="password"
          value={form.senha}
          onChange={set('senha')}
          autoComplete="new-password"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="cad-confirma" className={labelClass}>Confirmar senha</label>
        <input
          id="cad-confirma"
          type="password"
          value={form.confirma}
          onChange={set('confirma')}
          autoComplete="new-password"
          className={inputClass}
        />
      </div>
      {erro && <p className={errorClass}>{erro}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-rose py-2.5 text-[0.95rem] font-semibold text-white transition-colors hover:bg-rose-dark disabled:opacity-60"
      >
        {loading ? 'Criando conta…' : 'Criar conta'}
      </button>
    </form>
  );
}

function abrirWhatsAppEsqueciSenha() {
  window.open(waLink('Olá! Esqueci minha senha da conta Doces da Ale. Pode me ajudar a resetar?'), '_blank');
}

export default function AuthModal({ isOpen, initialTab = 'login', onClose }) {
  const [tab, setTab] = useState(initialTab);

  if (!isOpen) return null;

  const handleSuccess = () => onClose();

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-[400px] rounded-card bg-bg-main p-6 shadow-lg">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex gap-1 rounded-full border border-border-light p-1">
            {['login', 'cadastro'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1.5 text-[0.85rem] font-medium transition-colors ${
                  tab === t ? 'bg-rose text-white' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {t === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>
          <button type="button" onClick={onClose} className="text-[1.2rem] text-text-secondary hover:text-rose">
            ×
          </button>
        </div>

        {tab === 'login'
          ? <LoginForm onSuccess={handleSuccess} onForgot={abrirWhatsAppEsqueciSenha} />
          : <CadastroForm onSuccess={handleSuccess} />
        }

        {tab === 'login' && (
          <p className="mt-4 text-center text-[0.82rem] text-text-secondary">
            Não tem conta?{' '}
            <button type="button" onClick={() => setTab('cadastro')} className="text-rose underline">
              Criar agora
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
