import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../data/products';
import AuthModal from '../components/AuthModal';

// ── Helpers ─────────────────────────────────────────────────

function formatarTelefone(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function formatarCEP(v) {
  const d = v.replace(/\D/g, '').slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

function addDias(date, dias) {
  const d = new Date(date);
  d.setDate(d.getDate() + dias);
  return d;
}

function isoDate(d) {
  return d.toISOString().split('T')[0];
}

const STATUS_PERIODOS = [
  { id: 'manha', label: 'Manhã', sub: '9h – 12h' },
  { id: 'tarde', label: 'Tarde', sub: '13h – 17h' },
  { id: 'noite', label: 'Noite', sub: '18h – 21h' },
];

// ── Stepper ──────────────────────────────────────────────────

const STEPS = ['Identificação', 'Entrega', 'Agendamento', 'Pagamento', 'Revisão'];

function Stepper({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 overflow-x-auto py-4">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-[0.8rem] font-bold transition-colors ${
                i < current
                  ? 'border-rose bg-rose text-white'
                  : i === current
                  ? 'border-rose text-rose'
                  : 'border-border-light text-text-secondary'
              }`}
            >
              {i < current ? '✓' : i + 1}
            </div>
            <span
              className={`mt-1 hidden text-[0.72rem] sm:block ${
                i === current ? 'font-semibold text-rose' : 'text-text-secondary'
              }`}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`mx-1 h-0.5 w-8 sm:w-12 ${i < current ? 'bg-rose' : 'bg-border-light'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Etapa 1 — Identificação ──────────────────────────────────

function StepIdentificacao({ onNext, setGuest }) {
  const { user, primeiroNome } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [guestForm, setGuestForm] = useState({ nome: '', tel: '', email: '' });
  const [modo, setModo] = useState(null); // 'login' | 'convidado'

  useEffect(() => {
    if (user) onNext();
  }, [user]); // eslint-disable-line

  const handleGuest = (e) => {
    e.preventDefault();
    if (!guestForm.nome.trim() || guestForm.tel.replace(/\D/g, '').length < 10) return;
    setGuest({ nome: guestForm.nome.trim(), telefone: guestForm.tel.replace(/\D/g, ''), email: guestForm.email });
    onNext();
  };

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="mb-6 font-heading text-[1.3rem] font-semibold text-text-primary">Como deseja continuar?</h2>

      {!modo && (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setShowAuth(true)}
            className="rounded-card border-2 border-rose p-5 text-left transition-colors hover:bg-rose/5"
          >
            <p className="font-semibold text-text-primary">Fazer login</p>
            <p className="text-[0.85rem] text-text-secondary">Acompanhe seu pedido e veja o histórico</p>
          </button>
          <button
            type="button"
            onClick={() => setModo('convidado')}
            className="rounded-card border border-border-light p-5 text-left transition-colors hover:border-rose/50"
          >
            <p className="font-semibold text-text-primary">Continuar como convidado</p>
            <p className="text-[0.85rem] text-text-secondary">Rápido, sem precisar criar conta</p>
          </button>
        </div>
      )}

      {modo === 'convidado' && (
        <form onSubmit={handleGuest} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-[0.85rem] font-medium text-text-primary">Seu nome *</label>
            <input
              required
              value={guestForm.nome}
              onChange={(e) => setGuestForm((p) => ({ ...p, nome: e.target.value }))}
              className="w-full rounded-card border border-border-light bg-bg-alt px-4 py-2.5 text-[0.95rem] outline-none focus:border-rose focus:ring-1 focus:ring-rose"
            />
          </div>
          <div>
            <label className="mb-1 block text-[0.85rem] font-medium text-text-primary">WhatsApp *</label>
            <input
              required
              type="tel"
              value={formatarTelefone(guestForm.tel)}
              onChange={(e) => setGuestForm((p) => ({ ...p, tel: e.target.value }))}
              placeholder="(13) 99999-9999"
              className="w-full rounded-card border border-border-light bg-bg-alt px-4 py-2.5 text-[0.95rem] outline-none focus:border-rose focus:ring-1 focus:ring-rose"
            />
          </div>
          <div>
            <label className="mb-1 block text-[0.85rem] font-medium text-text-primary">E-mail <span className="font-normal text-text-secondary">(opcional)</span></label>
            <input
              type="email"
              value={guestForm.email}
              onChange={(e) => setGuestForm((p) => ({ ...p, email: e.target.value }))}
              className="w-full rounded-card border border-border-light bg-bg-alt px-4 py-2.5 text-[0.95rem] outline-none focus:border-rose focus:ring-1 focus:ring-rose"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="flex-1 rounded-full bg-rose py-2.5 text-[0.95rem] font-semibold text-white hover:bg-rose-dark">
              Continuar
            </button>
            <button type="button" onClick={() => setModo(null)} className="rounded-full border border-border-light px-5 py-2.5 text-[0.9rem] text-text-secondary hover:border-rose hover:text-rose">
              Voltar
            </button>
          </div>
        </form>
      )}

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} initialTab="login" />
    </div>
  );
}

// ── Etapa 2 — Entrega ────────────────────────────────────────

function StepEntrega({ config, onNext, onBack, setEntrega, entrega }) {
  const [tipo, setTipo] = useState(entrega?.tipo ?? null);
  const [end, setEnd] = useState(entrega?.endereco ?? { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', referencia: '' });
  const [loadingCep, setLoadingCep] = useState(false);

  const buscarCEP = async (cep) => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return;
    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setEnd((p) => ({ ...p, rua: data.logradouro, bairro: data.bairro, cidade: data.localidade }));
      }
    } catch {} finally {
      setLoadingCep(false);
    }
  };

  const endRecuado = config?.endereco_retirada;
  const endStr = endRecuado
    ? `${endRecuado.rua}, ${endRecuado.bairro} – ${endRecuado.cidade}/${endRecuado.uf ?? 'SP'}`
    : 'Consultar no WhatsApp';

  const handleNext = () => {
    if (!tipo) return;
    setEntrega({ tipo, endereco: tipo === 'entrega' ? end : null });
    onNext();
  };

  const ic = 'w-full rounded-card border border-border-light bg-bg-alt px-4 py-2.5 text-[0.95rem] outline-none focus:border-rose focus:ring-1 focus:ring-rose';

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="mb-6 font-heading text-[1.3rem] font-semibold text-text-primary">Como quer receber?</h2>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        {[
          { id: 'entrega', title: 'Entrega', sub: `Taxa: ${formatPrice(config?.taxa_entrega_padrao ?? 5)}` },
          { id: 'retirada', title: 'Retirar no local', sub: 'Grátis · ' + endStr },
        ].map(({ id, title, sub }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTipo(id)}
            className={`flex-1 rounded-card border-2 p-4 text-left transition-colors ${
              tipo === id ? 'border-rose bg-rose/5' : 'border-border-light hover:border-rose/40'
            }`}
          >
            <p className="font-semibold text-text-primary">{title}</p>
            <p className="text-[0.82rem] text-text-secondary">{sub}</p>
          </button>
        ))}
      </div>

      {tipo === 'entrega' && (
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-[0.85rem] font-medium text-text-primary">CEP</label>
            <input
              value={formatarCEP(end.cep)}
              onChange={(e) => {
                const v = e.target.value;
                setEnd((p) => ({ ...p, cep: v }));
                if (v.replace(/\D/g, '').length === 8) buscarCEP(v);
              }}
              placeholder="00000-000"
              className={ic}
            />
            {loadingCep && <p className="mt-1 text-[0.8rem] text-text-secondary">Buscando endereço…</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-[0.85rem] font-medium text-text-primary">Rua / Avenida</label>
              <input value={end.rua} onChange={(e) => setEnd((p) => ({ ...p, rua: e.target.value }))} className={ic} />
            </div>
            <div>
              <label className="mb-1 block text-[0.85rem] font-medium text-text-primary">Número</label>
              <input value={end.numero} onChange={(e) => setEnd((p) => ({ ...p, numero: e.target.value }))} className={ic} />
            </div>
            <div>
              <label className="mb-1 block text-[0.85rem] font-medium text-text-primary">Complemento</label>
              <input value={end.complemento} onChange={(e) => setEnd((p) => ({ ...p, complemento: e.target.value }))} placeholder="Apto, bloco…" className={ic} />
            </div>
            <div>
              <label className="mb-1 block text-[0.85rem] font-medium text-text-primary">Bairro</label>
              <input value={end.bairro} onChange={(e) => setEnd((p) => ({ ...p, bairro: e.target.value }))} className={ic} />
            </div>
            <div>
              <label className="mb-1 block text-[0.85rem] font-medium text-text-primary">Cidade</label>
              <input value={end.cidade} onChange={(e) => setEnd((p) => ({ ...p, cidade: e.target.value }))} className={ic} />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-[0.85rem] font-medium text-text-primary">Ponto de referência</label>
              <input value={end.referencia} onChange={(e) => setEnd((p) => ({ ...p, referencia: e.target.value }))} placeholder="Próximo ao…" className={ic} />
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button onClick={handleNext} disabled={!tipo} className="flex-1 rounded-full bg-rose py-2.5 text-[0.95rem] font-semibold text-white hover:bg-rose-dark disabled:opacity-50">
          Continuar
        </button>
        <button onClick={onBack} className="rounded-full border border-border-light px-5 py-2.5 text-[0.9rem] text-text-secondary hover:border-rose hover:text-rose">
          Voltar
        </button>
      </div>
    </div>
  );
}

// ── Etapa 3 — Agendamento ────────────────────────────────────

function StepAgendamento({ config, onNext, onBack, setAgendamento, agendamento, datasBloqueadas }) {
  const [tipo, setTipo] = useState(agendamento?.tipo ?? null);
  const [dataSel, setDataSel] = useState(agendamento?.data ?? '');
  const [periodo, setPeriodo] = useState(agendamento?.periodo ?? '');

  const antecedencia = config?.antecedencia_minima_horas ?? 48;
  const minDate = addDias(new Date(), Math.ceil(antecedencia / 24));

  const dias = Array.from({ length: 30 }, (_, i) => addDias(minDate, i));
  const diasConfig = config?.horario_funcionamento?.dias ?? [1, 2, 3, 4, 5, 6];
  const diasDisponiveis = dias.filter((d) => {
    const iso = isoDate(d);
    return diasConfig.includes(d.getDay()) && !datasBloqueadas.includes(iso);
  });

  const handleNext = () => {
    if (!tipo) return;
    if (tipo === 'agendado' && (!dataSel || !periodo)) return;
    setAgendamento({ tipo, data: tipo === 'rapido' ? isoDate(diasDisponiveis[0]) : dataSel, periodo: tipo === 'rapido' ? 'manha' : periodo });
    onNext();
  };

  const labelDia = (d) => {
    const dias2 = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return `${dias2[d.getDay()]} ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="mb-6 font-heading text-[1.3rem] font-semibold text-text-primary">Quando quer receber?</h2>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => setTipo('rapido')}
          className={`flex-1 rounded-card border-2 p-4 text-left transition-colors ${tipo === 'rapido' ? 'border-rose bg-rose/5' : 'border-border-light hover:border-rose/40'}`}
        >
          <p className="font-semibold text-text-primary">O mais rápido possível</p>
          <p className="text-[0.82rem] text-text-secondary">Prazo mínimo: {antecedencia}h</p>
        </button>
        <button
          type="button"
          onClick={() => setTipo('agendado')}
          className={`flex-1 rounded-card border-2 p-4 text-left transition-colors ${tipo === 'agendado' ? 'border-rose bg-rose/5' : 'border-border-light hover:border-rose/40'}`}
        >
          <p className="font-semibold text-text-primary">Agendar data</p>
          <p className="text-[0.82rem] text-text-secondary">Escolha um dia nos próximos 30 dias</p>
        </button>
      </div>

      {tipo === 'agendado' && (
        <div className="mb-6">
          <p className="mb-2 text-[0.85rem] font-medium text-text-primary">Selecione a data</p>
          <div className="flex flex-wrap gap-2">
            {diasDisponiveis.slice(0, 20).map((d) => {
              const iso = isoDate(d);
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setDataSel(iso)}
                  className={`rounded-full border px-3 py-1.5 text-[0.82rem] font-medium transition-colors ${
                    dataSel === iso ? 'border-rose bg-rose text-white' : 'border-border-light hover:border-rose/50'
                  }`}
                >
                  {labelDia(d)}
                </button>
              );
            })}
          </div>

          {dataSel && (
            <div className="mt-4">
              <p className="mb-2 text-[0.85rem] font-medium text-text-primary">Período de preferência</p>
              <div className="flex gap-2">
                {STATUS_PERIODOS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPeriodo(p.id)}
                    className={`flex-1 rounded-card border-2 p-3 text-center transition-colors ${
                      periodo === p.id ? 'border-rose bg-rose/5' : 'border-border-light hover:border-rose/40'
                    }`}
                  >
                    <p className="text-[0.85rem] font-semibold text-text-primary">{p.label}</p>
                    <p className="text-[0.75rem] text-text-secondary">{p.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleNext}
          disabled={!tipo || (tipo === 'agendado' && (!dataSel || !periodo))}
          className="flex-1 rounded-full bg-rose py-2.5 text-[0.95rem] font-semibold text-white hover:bg-rose-dark disabled:opacity-50"
        >
          Continuar
        </button>
        <button onClick={onBack} className="rounded-full border border-border-light px-5 py-2.5 text-[0.9rem] text-text-secondary hover:border-rose hover:text-rose">
          Voltar
        </button>
      </div>
    </div>
  );
}

// ── Etapa 4 — Pagamento ──────────────────────────────────────

function StepPagamento({ onNext, onBack, setPagamento, pagamento }) {
  const [forma, setForma] = useState(pagamento?.forma ?? null);
  const [troco, setTroco] = useState(pagamento?.troco ?? '');
  const [obs, setObs] = useState(pagamento?.obs ?? '');

  const handleNext = () => {
    if (!forma) return;
    setPagamento({ forma, troco: forma === 'dinheiro' && troco ? parseFloat(troco) : null, obs });
    onNext();
  };

  const ic = 'w-full rounded-card border border-border-light bg-bg-alt px-4 py-2.5 text-[0.95rem] outline-none focus:border-rose focus:ring-1 focus:ring-rose';

  const formas = [
    { id: 'pix', label: 'Pix na entrega', sub: 'Mais popular · sem taxas', badge: true },
    { id: 'dinheiro', label: 'Dinheiro na entrega', sub: 'Troco disponível' },
    { id: 'cartao', label: 'Cartão na entrega', sub: 'Maquininha na hora' },
  ];

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="mb-6 font-heading text-[1.3rem] font-semibold text-text-primary">Como vai pagar?</h2>

      <div className="mb-6 flex flex-col gap-3">
        {formas.map(({ id, label, sub, badge }) => (
          <button
            key={id}
            type="button"
            onClick={() => setForma(id)}
            className={`relative rounded-card border-2 p-4 text-left transition-colors ${
              forma === id ? 'border-rose bg-rose/5' : 'border-border-light hover:border-rose/40'
            }`}
          >
            {badge && (
              <span className="absolute right-3 top-3 rounded-full bg-rose px-2 py-0.5 text-[0.68rem] font-semibold text-white">
                Mais popular
              </span>
            )}
            <p className="font-semibold text-text-primary">{label}</p>
            <p className="text-[0.82rem] text-text-secondary">{sub}</p>
          </button>
        ))}
      </div>

      {forma === 'dinheiro' && (
        <div className="mb-4">
          <label className="mb-1 block text-[0.85rem] font-medium text-text-primary">Troco para quanto? <span className="font-normal text-text-secondary">(opcional)</span></label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={troco}
            onChange={(e) => setTroco(e.target.value)}
            placeholder="R$ 0,00"
            className={ic}
          />
        </div>
      )}

      <div className="mb-6">
        <label className="mb-1 block text-[0.85rem] font-medium text-text-primary">Observações <span className="font-normal text-text-secondary">(opcional)</span></label>
        <textarea
          value={obs}
          onChange={(e) => setObs(e.target.value)}
          rows={3}
          placeholder="Ex: Sem granulado, aniversário da Maria, embalagem especial…"
          className={`${ic} resize-none`}
        />
      </div>

      <div className="flex gap-3">
        <button onClick={handleNext} disabled={!forma} className="flex-1 rounded-full bg-rose py-2.5 text-[0.95rem] font-semibold text-white hover:bg-rose-dark disabled:opacity-50">
          Continuar
        </button>
        <button onClick={onBack} className="rounded-full border border-border-light px-5 py-2.5 text-[0.9rem] text-text-secondary hover:border-rose hover:text-rose">
          Voltar
        </button>
      </div>
    </div>
  );
}

// ── Etapa 5 — Revisão ────────────────────────────────────────

function StepRevisao({ items, config, entrega, agendamento, pagamento, guest, onBack, onConfirm, loading }) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const taxa = entrega?.tipo === 'entrega' ? (config?.taxa_entrega_padrao ?? 5) : 0;
  const total = subtotal + taxa;

  const dataLabel = agendamento?.data
    ? new Date(agendamento.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
    : '';
  const periodoLabel = STATUS_PERIODOS.find((p) => p.id === agendamento?.periodo)?.label ?? '';

  const formaLabel = { pix: 'Pix na entrega', dinheiro: 'Dinheiro na entrega', cartao: 'Cartão na entrega' };
  const endStr = entrega?.tipo === 'entrega' && entrega?.endereco
    ? `${entrega.endereco.rua}, ${entrega.endereco.numero} – ${entrega.endereco.bairro}, ${entrega.endereco.cidade}`
    : 'Retirar no local';

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="mb-6 font-heading text-[1.3rem] font-semibold text-text-primary">Revisão do pedido</h2>

      <div className="mb-5 rounded-card border border-border-light bg-bg-main p-5">
        <h3 className="mb-3 font-heading text-[1rem] font-semibold text-text-primary">Itens</h3>
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between text-[0.9rem]">
              <span className="text-text-primary">{item.quantity}× {item.name}</span>
              <span className="font-medium text-text-primary">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 border-t border-border-light pt-3 space-y-1">
          <div className="flex justify-between text-[0.85rem] text-text-secondary">
            <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-[0.85rem] text-text-secondary">
            <span>Taxa de entrega</span><span>{taxa > 0 ? formatPrice(taxa) : 'Grátis'}</span>
          </div>
          <div className="flex justify-between text-[1.1rem] font-bold text-text-primary">
            <span>Total</span><span className="text-rose">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-card border border-border-light bg-bg-main p-5 space-y-3 text-[0.9rem]">
        <div className="flex gap-2">
          <span className="w-24 flex-shrink-0 text-text-secondary">Entrega</span>
          <span className="text-text-primary">{endStr}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-24 flex-shrink-0 text-text-secondary">Data</span>
          <span className="capitalize text-text-primary">{dataLabel} · {periodoLabel}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-24 flex-shrink-0 text-text-secondary">Pagamento</span>
          <span className="text-text-primary">{formaLabel[pagamento?.forma]}{pagamento?.troco ? ` · Troco p/ ${formatPrice(pagamento.troco)}` : ''}</span>
        </div>
        {pagamento?.obs && (
          <div className="flex gap-2">
            <span className="w-24 flex-shrink-0 text-text-secondary">Obs.</span>
            <span className="text-text-primary">{pagamento.obs}</span>
          </div>
        )}
        {guest && (
          <div className="flex gap-2">
            <span className="w-24 flex-shrink-0 text-text-secondary">Cliente</span>
            <span className="text-text-primary">{guest.nome}</span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 rounded-full bg-gold py-3 text-[1rem] font-bold text-white transition-colors hover:bg-gold-dark disabled:opacity-60"
        >
          {loading ? 'Enviando pedido…' : 'Confirmar pedido'}
        </button>
        <button onClick={onBack} className="rounded-full border border-border-light px-5 py-2.5 text-[0.9rem] text-text-secondary hover:border-rose hover:text-rose">
          Voltar
        </button>
      </div>
    </div>
  );
}

// ── CheckoutPage (orquestrador) ──────────────────────────────

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [guest, setGuest] = useState(null);
  const [entrega, setEntrega] = useState(null);
  const [agendamento, setAgendamento] = useState(null);
  const [pagamento, setPagamento] = useState(null);
  const [config, setConfig] = useState(null);
  const [datasBlq, setDatasBlq] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (items.length === 0) navigate('/');
    supabase.from('configuracoes').select('*').eq('id', 1).single().then(({ data }) => {
      if (data) setConfig(data);
    });
    supabase.from('datas_bloqueadas').select('data').then(({ data }) => {
      if (data) setDatasBlq(data.map((d) => d.data));
    });
  }, []); // eslint-disable-line

  // Pula etapa 1 se já logado
  useEffect(() => {
    if (user && step === 0) setStep(1);
  }, [user, step]);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
      const taxa = entrega?.tipo === 'entrega' ? (config?.taxa_entrega_padrao ?? 5) : 0;

      const pedidoPayload = {
        usuario_id: user?.id ?? null,
        dados_convidado: !user && guest ? guest : null,
        origem: 'site',
        status: 'recebido',
        tipo_entrega: entrega.tipo,
        endereco_entrega: entrega.tipo === 'entrega' ? entrega.endereco : null,
        data_agendada: agendamento.data,
        periodo_agendado: agendamento.periodo,
        forma_pagamento: pagamento.forma,
        troco_para: pagamento.troco,
        observacoes: pagamento.obs || null,
        subtotal,
        taxa_entrega: taxa,
        total: subtotal + taxa,
      };

      const { data: pedido, error } = await supabase
        .from('pedidos')
        .insert(pedidoPayload)
        .select()
        .single();

      if (error) throw error;

      const itensPayload = items.map((item) => ({
        pedido_id: pedido.id,
        nome_produto: item.name,
        quantidade: item.quantity,
        preco_unitario: item.price,
      }));

      await supabase.from('itens_pedido').insert(itensPayload);

      if (clearCart) clearCart();
      navigate(`/pedido/${pedido.numero_pedido}`);
    } catch (err) {
      alert('Erro ao confirmar pedido. Tente novamente.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-bg-alt pt-[70px]">
      <div className="container-site max-w-2xl py-6">
        <a href="/" className="mb-4 inline-block text-[0.85rem] font-medium text-text-secondary hover:text-rose">
          ← Voltar ao cardápio
        </a>
        <Stepper current={step} />
        <div className="mt-6 rounded-card border border-border-light bg-bg-main p-6">
          {step === 0 && <StepIdentificacao onNext={() => setStep(1)} setGuest={setGuest} />}
          {step === 1 && <StepEntrega config={config} onNext={() => setStep(2)} onBack={() => setStep(0)} setEntrega={setEntrega} entrega={entrega} />}
          {step === 2 && <StepAgendamento config={config} onNext={() => setStep(3)} onBack={() => setStep(1)} setAgendamento={setAgendamento} agendamento={agendamento} datasBloqueadas={datasBlq} />}
          {step === 3 && <StepPagamento onNext={() => setStep(4)} onBack={() => setStep(2)} setPagamento={setPagamento} pagamento={pagamento} />}
          {step === 4 && (
            <StepRevisao
              items={items}
              config={config}
              entrega={entrega}
              agendamento={agendamento}
              pagamento={pagamento}
              guest={guest}
              onBack={() => setStep(3)}
              onConfirm={handleConfirm}
              loading={saving}
            />
          )}
        </div>
      </div>
    </div>
  );
}
