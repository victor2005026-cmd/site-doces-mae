import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useAdminProducts } from '../context/AdminProductsContext';
import { formatPrice } from '../data/products';
import { formatDiasLabel } from '../lib/storeHours';
import { gerarLinkGoogleMaps } from '../lib/mapsLink';
import { waLink } from '../lib/whatsapp';
import { isoDateLocal as isoDate } from '../lib/dateUtils';
import { notificarPedidoNovoPorEmail } from '../lib/emailNotificacao';
import { notificarPedidoNovoPorWhatsApp } from '../lib/whatsappNotificacao';
import AuthModal from '../components/AuthModal';
import Spinner from '../components/Spinner';
import EnderecoAutocomplete from '../components/EnderecoAutocomplete';

const ArrowLeftIcon = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" {...props}>
    <path d="M19 12H5" />
    <path d="M11 18l-6-6 6-6" />
  </svg>
);

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

function normalizar(str) {
  return (str ?? '').toString().trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Taxa final de entrega: base do bairro (resolvida em StepEntrega) + sobretaxa de chuva, se ativa.
// Enquanto config.frete_ativo for false, a entrega em Santos é sempre grátis
// (não busca taxa por bairro nem soma sobretaxa de chuva).
function calcularTaxaEntrega(entrega, config) {
  if (entrega?.tipo !== 'entrega') return 0;
  if (!config?.frete_ativo) return 0;
  const base = Number(entrega?.taxaBase ?? 0);
  const chuva = config?.modo_chuva_ativo ? Number(config?.sobretaxa_chuva ?? 0) : 0;
  return base + chuva;
}

const STATUS_PERIODOS = [
  { id: 'manha', label: 'Manhã', sub: '9h – 12h' },
  { id: 'tarde', label: 'Tarde', sub: '13h – 17h' },
  { id: 'noite', label: 'Noite', sub: '18h – 21h' },
];

// ── Stepper ──────────────────────────────────────────────────

const STEPS = ['Entrega', 'Agendamento', 'Revisão'];

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
  const { user } = useAuth();
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
              inputMode="numeric"
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

function CardRetirada({ config }) {
  const end = config?.endereco_retirada;
  const horario = config?.horario_retirada?.abre ? config.horario_retirada : config?.horario_funcionamento;
  const linkMaps = config?.link_google_maps || gerarLinkGoogleMaps(end);

  const endLinhas = end
    ? [
        [end.rua, end.numero].filter(Boolean).join(', '),
        end.complemento,
        [end.bairro, end.cidade].filter(Boolean).join(' – '),
        end.cep,
        end.referencia ? `Referência: ${end.referencia}` : null,
      ].filter(Boolean)
    : [];

  return (
    <div className="rounded-card border border-border-light bg-bg-alt p-4">
      <p className="mb-2 font-semibold text-text-primary">Endereço para retirada</p>
      {endLinhas.length > 0 ? (
        <div className="mb-3 text-[0.88rem] text-text-secondary">
          {endLinhas.map((linha, i) => <p key={i}>{linha}</p>)}
        </div>
      ) : (
        <p className="mb-3 text-[0.88rem] text-text-secondary">Consultar no WhatsApp</p>
      )}

      {horario?.abre && (
        <p className="mb-3 text-[0.88rem] font-medium text-text-primary">
          Retirada: {formatDiasLabel(horario.dias)}, {horario.abre} às {horario.fecha}
        </p>
      )}

      {linkMaps && (
        <a
          href={linkMaps}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-rose/40 px-4 py-2 text-[0.85rem] font-medium text-rose-dark hover:border-rose"
        >
          Como chegar
        </a>
      )}
    </div>
  );
}

const ENDERECO_VAZIO = { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', referencia: '' };

function StepEntrega({ config, taxasEntrega, onNext, onBack, setEntrega, entrega }) {
  const freteAtivo = Boolean(config?.frete_ativo);
  const [tipo, setTipo] = useState(entrega?.tipo ?? null);
  const [end, setEnd] = useState(entrega?.endereco ?? ENDERECO_VAZIO);
  const [loadingCep, setLoadingCep] = useState(false);
  const [areaStatus, setAreaStatus] = useState(null); // null (não verificado) | 'ok' | 'fora'
  const [taxaResolvida, setTaxaResolvida] = useState(null);

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

  useEffect(() => {
    if (tipo !== 'entrega') return;
    if (!end.cidade && !end.bairro) { setAreaStatus(null); setTaxaResolvida(null); return; }

    const cidadeOk = normalizar(end.cidade) === normalizar('Santos');
    if (!cidadeOk) { setAreaStatus('fora'); setTaxaResolvida(null); return; }

    // Só bairros cadastrados (e ativos) em taxas_entrega recebem entrega —
    // isso não muda com frete_ativo. O que muda é só o valor cobrado:
    // com frete_ativo desligado (padrão atual), a entrega sai grátis mesmo
    // pros bairros cadastrados; a taxa da tabela só volta a valer quando
    // frete_ativo for religado.
    const match = taxasEntrega.find((t) => normalizar(t.bairro) === normalizar(end.bairro));
    if (!match) { setAreaStatus('fora'); setTaxaResolvida(null); return; }

    setAreaStatus('ok');
    setTaxaResolvida(freteAtivo ? Number(match.taxa) : 0);
  }, [tipo, end.cidade, end.bairro, taxasEntrega, freteAtivo]);

  const handleSelecionarEndereco = (sel) => {
    setEnd((p) => ({ ...p, ...sel }));
  };

  const enderecoIncompleto = tipo === 'entrega' && (!end.rua.trim() || !end.numero.trim());

  const handleNext = () => {
    if (!tipo) return;
    if (tipo === 'entrega' && (areaStatus !== 'ok' || enderecoIncompleto)) return;
    setEntrega({
      tipo,
      endereco: tipo === 'entrega' ? end : null,
      taxaBase: tipo === 'entrega' ? taxaResolvida : 0,
    });
    onNext();
  };

  const ic = 'w-full rounded-card border border-border-light bg-bg-alt px-4 py-2.5 text-[0.95rem] outline-none focus:border-rose focus:ring-1 focus:ring-rose';

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="mb-6 font-heading text-[1.3rem] font-semibold text-text-primary">Como quer receber?</h2>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        {[
          { id: 'entrega', title: 'Entrega', sub: freteAtivo ? 'Taxa varia por bairro (só Santos)' : null },
          { id: 'retirada', title: 'Retirar no local', sub: 'Grátis' },
        ].map(({ id, title, sub }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTipo(id)}
            className={`flex-1 rounded-card border-2 p-4 text-left transition-colors ${
              tipo === id ? 'border-rose bg-rose/5' : 'border-border-light hover:border-rose/40'
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-text-primary">{title}</p>
              {id === 'entrega' && !freteAtivo && (
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[0.7rem] font-bold text-success">
                  GRÁTIS EM SANTOS
                </span>
              )}
            </div>
            {sub && <p className="text-[0.82rem] text-text-secondary">{sub}</p>}
          </button>
        ))}
      </div>

      {tipo === 'entrega' && (
        <div className="flex flex-col gap-3">
          {taxasEntrega.length > 0 && (
            <details className="rounded-card border border-border-light bg-bg-alt px-4 py-3 text-[0.85rem]">
              <summary className="cursor-pointer font-medium text-text-primary">Consultar bairros atendidos</summary>
              <p className="mt-2 text-text-secondary">
                {taxasEntrega.map((t) => t.bairro).join(', ')}
              </p>
            </details>
          )}

          <div>
            <EnderecoAutocomplete onSelect={handleSelecionarEndereco} />
            <p className="mt-1 text-[0.78rem] text-text-secondary">
              Atalho opcional — se preferir, é só preencher os campos abaixo direto, sem precisar buscar.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-[0.85rem] font-medium text-text-primary">CEP</label>
            <input
              inputMode="numeric"
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
              <label className="mb-1 block text-[0.85rem] font-medium text-text-primary">Rua / Avenida *</label>
              <input required value={end.rua} onChange={(e) => setEnd((p) => ({ ...p, rua: e.target.value }))} className={ic} />
            </div>
            <div>
              <label className="mb-1 block text-[0.85rem] font-medium text-text-primary">Número *</label>
              <input required inputMode="numeric" value={end.numero} onChange={(e) => setEnd((p) => ({ ...p, numero: e.target.value }))} className={ic} />
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

          {areaStatus === 'ok' && (
            <div className="rounded-card border border-success/30 bg-success/5 p-3 text-[0.85rem] text-success">
              {freteAtivo ? (
                <>
                  Entregamos em {end.bairro}! Taxa: {formatPrice(taxaResolvida)}
                  {config?.modo_chuva_ativo && ` + ${formatPrice(config?.sobretaxa_chuva ?? 0)} de sobretaxa de chuva`}
                </>
              ) : (
                <>Frete GRÁTIS em Santos!</>
              )}
            </div>
          )}

          {areaStatus === 'ok' && enderecoIncompleto && (
            <p className="text-[0.82rem] text-rose-dark">Preencha a rua e o número pra continuar.</p>
          )}

          {areaStatus === 'fora' && (
            <div className="rounded-card border border-rose/30 bg-rose/5 p-4">
              <p className="mb-3 text-[0.88rem] text-rose-dark">
                Ainda não entregamos nesta região. Você pode retirar no local ou entrar em contato para verificar disponibilidade.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTipo('retirada')}
                  className="rounded-full bg-rose px-4 py-2 text-[0.82rem] font-semibold text-white hover:bg-rose-dark"
                >
                  Escolher retirada no local
                </button>
                <a
                  href={waLink('Olá! Gostaria de saber se vocês entregam na minha região.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-success/40 px-4 py-2 text-[0.82rem] font-medium text-success hover:border-success"
                >
                  Falar no WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      {tipo === 'retirada' && <CardRetirada config={config} />}

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleNext}
          disabled={!tipo || (tipo === 'entrega' && (areaStatus !== 'ok' || enderecoIncompleto))}
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

// ── Etapa 3 — Agendamento ────────────────────────────────────

function StepAgendamento({ config, onNext, onBack, setAgendamento, agendamento, datasBloqueadas }) {
  const [dataSel, setDataSel] = useState(agendamento?.data ?? '');
  const [periodo, setPeriodo] = useState(agendamento?.periodo ?? '');
  const [outraData, setOutraData] = useState(false);
  const [erroOutraData, setErroOutraData] = useState('');
  // Só usado pra forçar o campo de data manual a refletir uma seleção feita
  // por fora (clique numa pílula) — não muda quando o próprio campo termina
  // de ser digitado, senão ele se remonta e perde o foco bem nessa hora.
  const [syncToken, setSyncToken] = useState(0);

  const antecedencia = config?.antecedencia_minima_horas ?? 48;
  const minDate = addDias(new Date(), Math.ceil(antecedencia / 24));

  const dias = Array.from({ length: 30 }, (_, i) => addDias(minDate, i));
  const diasConfig = config?.horario_funcionamento?.dias ?? [1, 2, 3, 4, 5, 6];
  const diasDisponiveis = dias.filter((d) => {
    const iso = isoDate(d);
    return diasConfig.includes(d.getDay()) && !datasBloqueadas.includes(iso);
  });

  const labelDia = (d) => {
    const dias2 = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return `${dias2[d.getDay()]} ${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const handleOutraData = (valor) => {
    setErroOutraData('');
    // Um <input type="date"> reporta valor "" enquanto o cliente ainda está
    // digitando (dia/mês preenchidos, ano incompleto) — não só quando ele
    // realmente limpa o campo. Por isso, não mexe em dataSel aqui: se
    // resetássemos o estado a cada tecla, o campo controlado forçaria os
    // dígitos já digitados de volta pro vazio, "expulsando" o cliente bem na
    // hora de digitar o ano.
    if (!valor) return;
    const d = new Date(valor + 'T12:00:00');
    if (d < minDate) {
      setErroOutraData(`Escolha uma data a partir de ${labelDia(minDate)} (prazo mínimo de ${antecedencia}h).`);
      return;
    }
    if (!diasConfig.includes(d.getDay())) {
      setErroOutraData('Não atendemos pedidos nesse dia da semana.');
      return;
    }
    if (datasBloqueadas.includes(valor)) {
      setErroOutraData('Essa data está indisponível. Escolha outra.');
      return;
    }
    setDataSel(valor);
  };

  const handleSelecionarPill = (iso) => {
    setErroOutraData('');
    setDataSel(iso);
    setSyncToken((t) => t + 1);
  };

  const handleNext = () => {
    if (!dataSel || !periodo) return;
    setAgendamento({ data: dataSel, periodo });
    onNext();
  };

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="mb-2 font-heading text-[1.3rem] font-semibold text-text-primary">Quando quer receber?</h2>
      <p className="mb-6 text-[0.85rem] text-text-secondary">Prazo mínimo de {antecedencia}h de antecedência.</p>

      <div className="mb-6">
        <p className="mb-2 text-[0.85rem] font-medium text-text-primary">Selecione a data</p>
        <div className="flex flex-wrap gap-2">
          {diasDisponiveis.slice(0, 30).map((d) => {
            const iso = isoDate(d);
            return (
              <button
                key={iso}
                type="button"
                onClick={() => handleSelecionarPill(iso)}
                className={`rounded-full border px-3 py-1.5 text-[0.82rem] font-medium transition-colors ${
                  dataSel === iso ? 'border-rose bg-rose text-white' : 'border-border-light hover:border-rose/50'
                }`}
              >
                {labelDia(d)}
              </button>
            );
          })}
        </div>

        <div className="mt-3">
          <button
            type="button"
            onClick={() => { setOutraData((v) => !v); setErroOutraData(''); }}
            className="text-[0.82rem] font-medium text-rose underline"
          >
            {outraData ? 'Ver datas sugeridas' : 'Precisa agendar mais pra frente? Escolher outra data'}
          </button>
          {outraData && (
            <div className="mt-2">
              <input
                key={syncToken}
                type="date"
                min={isoDate(minDate)}
                defaultValue={dataSel}
                onChange={(e) => handleOutraData(e.target.value)}
                className="w-full rounded-card border border-border-light bg-bg-alt px-4 py-2.5 text-[0.95rem] outline-none focus:border-rose focus:ring-1 focus:ring-rose"
              />
              {erroOutraData && <p className="mt-1 text-[0.8rem] text-rose-dark">{erroOutraData}</p>}
              {!erroOutraData && dataSel && !diasDisponiveis.some((d) => isoDate(d) === dataSel) && (
                <p className="mt-1 text-[0.8rem] text-success">Data selecionada: {labelDia(new Date(dataSel + 'T12:00:00'))}</p>
              )}
            </div>
          )}
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

      <div className="flex gap-3">
        <button
          onClick={handleNext}
          disabled={!dataSel || !periodo}
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

function StepPagamento({ config, total, onNext, onBack, setPagamento, pagamento }) {
  const [obs, setObs] = useState(pagamento?.obs ?? '');
  const pixOk = Boolean(config?.pix_chave && config?.pix_nome);

  const handleNext = () => {
    if (!pixOk) return;
    setPagamento({ forma: 'pix', obs });
    onNext(obs);
  };

  const ic = 'w-full rounded-card border border-border-light bg-bg-alt px-4 py-2.5 text-[0.95rem] outline-none focus:border-rose focus:ring-1 focus:ring-rose';

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="mb-6 font-heading text-[1.3rem] font-semibold text-text-primary">Pagamento</h2>

      {pixOk ? (
        <div className="mb-6 rounded-card border-2 border-rose bg-rose/5 p-5 text-center">
          <p className="font-heading text-[1.1rem] font-bold text-text-primary">Pagamento via Pix</p>
          <p className="mt-1 text-[0.85rem] text-text-secondary">O QR Code será gerado após confirmar o pedido</p>
          <p className="mt-3 text-[1.2rem] font-bold text-rose">{formatPrice(total)}</p>
        </div>
      ) : (
        <div className="mb-6 rounded-card border-2 border-rose bg-rose/10 p-5 text-center">
          <p className="font-heading text-[1.1rem] font-bold text-rose-dark">Configuração de Pix pendente</p>
          <p className="mt-1 text-[0.85rem] text-text-secondary">
            Entre em contato pelo WhatsApp para finalizar o pedido
          </p>
          <a
            href={waLink('Olá! Quero fazer um pedido mas o pagamento por Pix não está disponível no site no momento.')}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full bg-success px-6 py-2.5 text-[0.9rem] font-semibold text-white hover:bg-[#268a41]"
          >
            Falar no WhatsApp
          </a>
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
        <button onClick={handleNext} disabled={!pixOk} className="flex-1 rounded-full bg-rose py-2.5 text-[0.95rem] font-semibold text-white hover:bg-rose-dark disabled:opacity-50">
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

function ResumoPedido({ items, subtotal, config, entrega, agendamento, coupon }) {
  const taxa = calcularTaxaEntrega(entrega, config);
  const desconto = coupon?.desconto ?? 0;
  const total = subtotal - desconto + taxa;

  const dataLabel = agendamento?.data
    ? new Date(agendamento.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
    : '';
  const periodoLabel = STATUS_PERIODOS.find((p) => p.id === agendamento?.periodo)?.label ?? '';

  const endStr = entrega?.tipo === 'entrega' && entrega?.endereco
    ? `${entrega.endereco.rua}, ${entrega.endereco.numero} – ${entrega.endereco.bairro}, ${entrega.endereco.cidade}`
    : 'Retirar no local';

  return (
    <>
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
          {coupon && (
            <div className="flex justify-between text-[0.85rem] text-success">
              <span>Desconto (cupom {coupon.codigo})</span><span>-{formatPrice(desconto)}</span>
            </div>
          )}
          <div className="flex justify-between text-[0.85rem]">
            <span className="text-text-secondary">Entrega{config?.modo_chuva_ativo && entrega?.tipo === 'entrega' && taxa > 0 ? ' (com chuva)' : ''}</span>
            <span className={taxa > 0 ? 'text-text-secondary' : 'font-semibold text-success'}>
              {taxa > 0 ? formatPrice(taxa) : 'GRÁTIS'}
            </span>
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
      </div>
    </>
  );
}

function StepRevisao({
  items, subtotal, config, entrega, agendamento, coupon, user,
  guest, setGuest, pagamento, setPagamento,
  onBack, onConfirmPix, onConfirmWhatsApp, loading,
}) {
  const [metodo, setMetodo] = useState(null); // null | 'pix' | 'whatsapp'
  const pixOk = Boolean(config?.pix_chave && config?.pix_nome);
  const precisaIdentificar = metodo === 'pix' && !user && !guest;

  if (precisaIdentificar) {
    return (
      <div>
        <StepIdentificacao onNext={() => {}} setGuest={setGuest} />
        <button
          type="button"
          onClick={() => setMetodo(null)}
          className="mx-auto mt-5 block text-[0.85rem] text-text-secondary underline hover:text-rose"
        >
          ← Voltar
        </button>
      </div>
    );
  }

  if (metodo === 'pix') {
    return (
      <StepPagamento
        config={config}
        total={subtotal - (coupon?.desconto ?? 0) + calcularTaxaEntrega(entrega, config)}
        onNext={onConfirmPix}
        onBack={() => setMetodo(null)}
        setPagamento={setPagamento}
        pagamento={pagamento}
      />
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h2 className="mb-6 font-heading text-[1.3rem] font-semibold text-text-primary">Revisão do pedido</h2>

      <ResumoPedido items={items} subtotal={subtotal} config={config} entrega={entrega} agendamento={agendamento} coupon={coupon} />

      <p className="mb-3 text-[0.9rem] font-medium text-text-primary">Como você prefere finalizar?</p>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setMetodo('pix')}
          disabled={loading || !pixOk}
          className="rounded-card border-2 border-rose p-4 text-left transition-colors hover:bg-rose/5 disabled:opacity-60"
        >
          <p className="font-semibold text-text-primary">Pagar por Pix pelo site</p>
          <p className="text-[0.85rem] text-text-secondary">Gera o QR Code na hora, acompanha tudo por aqui</p>
        </button>
        <button
          type="button"
          onClick={onConfirmWhatsApp}
          disabled={loading}
          className="flex items-center justify-between rounded-card border-2 border-success p-4 text-left transition-colors hover:bg-success/5 disabled:opacity-60"
        >
          <span>
            <p className="font-semibold text-text-primary">Enviar pedido pelo WhatsApp</p>
            <p className="text-[0.85rem] text-text-secondary">Combina o pagamento direto com a Ale, sem precisar se identificar aqui</p>
          </span>
          {loading && <Spinner />}
        </button>
      </div>

      {!pixOk && (
        <p className="mt-3 text-center text-[0.82rem] text-rose-dark">
          Pix ainda não configurado — use "Enviar pelo WhatsApp" por enquanto.
        </p>
      )}

      <button onClick={onBack} className="mt-5 w-full rounded-full border border-border-light px-5 py-2.5 text-[0.9rem] text-text-secondary hover:border-rose hover:text-rose">
        Voltar
      </button>
    </div>
  );
}

// ── CheckoutPage (orquestrador) ──────────────────────────────

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart, coupon } = useCart();
  const { user, perfil } = useAuth();
  const { config } = useAdminProducts();

  const [step, setStep] = useState(0);
  const [guest, setGuest] = useState(null);
  const [entrega, setEntrega] = useState(null);
  const [agendamento, setAgendamento] = useState(null);
  const [pagamento, setPagamento] = useState(null);
  const [datasBlq, setDatasBlq] = useState([]);
  const [taxasEntrega, setTaxasEntrega] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (items.length === 0) navigate('/');
    supabase.from('datas_bloqueadas').select('data').then(({ data }) => {
      if (data) setDatasBlq(data.map((d) => d.data));
    });
    supabase.from('taxas_entrega').select('*').eq('ativa', true).then(({ data, error }) => {
      if (error) console.error('Erro ao buscar taxas de entrega:', error);
      setTaxasEntrega(data ?? []);
    });
  }, []); // eslint-disable-line

  const taxaEntrega = calcularTaxaEntrega(entrega, config);

  // Cria o pedido (+ itens, cupom, notificações) e devolve a linha criada.
  // camposExtras decide o que muda entre o fluxo Pix e o fluxo WhatsApp
  // (status, origem, expiração, observações).
  const criarPedido = async (camposExtras) => {
    const telefoneCliente = user ? perfil?.telefone : guest?.telefone;

    // revalida o cupom com o telefone real (só conhecido a partir daqui) antes de cobrar
    let cupomFinal = coupon;
    if (coupon) {
      const { data, error: rpcError } = await supabase.rpc('aplicar_cupom', {
        p_codigo: coupon.codigo,
        p_telefone: telefoneCliente || '',
        p_valor_pedido: subtotal,
      });
      const resultado = !rpcError && Array.isArray(data) ? data[0] : null;
      if (rpcError || !resultado || resultado.erro) {
        alert(`O cupom ${coupon.codigo} não é mais válido (${resultado?.erro || 'erro ao validar'}). Remova-o e tente novamente.`);
        return null;
      }
      cupomFinal = { cupomId: resultado.cupom_id, codigo: resultado.codigo, desconto: Number(resultado.desconto) };
    }

    const descontoFinal = cupomFinal?.desconto ?? 0;

    const pedidoPayload = {
      usuario_id: user?.id ?? null,
      dados_convidado: !user && guest ? guest : null,
      origem: 'site',
      tipo_entrega: entrega.tipo,
      endereco_entrega: entrega.tipo === 'entrega' ? entrega.endereco : null,
      data_agendada: agendamento.data,
      periodo_agendado: agendamento.periodo,
      forma_pagamento: 'pix',
      subtotal,
      taxa_entrega: taxaEntrega,
      cupom_id: cupomFinal?.cupomId ?? null,
      desconto_aplicado: descontoFinal,
      total: subtotal - descontoFinal + taxaEntrega,
      ...camposExtras,
    };

    let pedido;
    let itensPayload;

    if (user) {
      const { data, error } = await supabase.from('pedidos').insert(pedidoPayload).select().single();
      if (error) throw error;
      pedido = data;

      itensPayload = items.map((item) => ({
        pedido_id: pedido.id,
        nome_produto: item.name,
        quantidade: item.quantity,
        preco_unitario: item.price,
      }));
      await supabase.from('itens_pedido').insert(itensPayload);
    } else {
      // Convidado não tem policy de SELECT direta em "pedidos" (ver schema.sql),
      // então o insert precisa passar por uma função SECURITY DEFINER — do
      // contrário o Postgres falha ao tentar devolver a linha criada.
      itensPayload = items.map((item) => ({
        nome_produto: item.name,
        quantidade: item.quantity,
        preco_unitario: item.price,
      }));
      const { data, error } = await supabase.rpc('criar_pedido_convidado', {
        p_pedido: pedidoPayload,
        p_itens: itensPayload,
      });
      if (error) throw error;
      pedido = data;
    }

    if (cupomFinal?.cupomId) {
      supabase.rpc('consumir_cupom', { p_cupom_id: cupomFinal.cupomId }).then(({ error: consumoError }) => {
        if (consumoError) console.error('Erro ao registrar uso do cupom:', consumoError);
      });
    }

    // Não bloqueia nem falha o checkout se o e-mail não sair.
    notificarPedidoNovoPorEmail(config, pedido, itensPayload).catch(() => {});
    // Também não bloqueia o checkout se o aviso no WhatsApp falhar.
    notificarPedidoNovoPorWhatsApp(pedido.id).catch(() => {});

    if (clearCart) clearCart();
    return pedido;
  };

  const handleConfirmPix = async (obs) => {
    setSaving(true);
    try {
      const pedido = await criarPedido({
        status: 'aguardando_pagamento',
        data_expiracao_pagamento: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        observacoes: obs || null,
      });
      if (pedido) navigate(`/pagamento/${pedido.numero_pedido}`);
    } catch (err) {
      alert('Erro ao confirmar pedido. Tente novamente.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmWhatsApp = async () => {
    setSaving(true);
    try {
      const pedido = await criarPedido({ status: 'recebido', origem: 'whatsapp', observacoes: null });
      if (pedido) {
        const itensTexto = items.map((i) => `• ${i.quantity}× ${i.name}`).join('\n');
        const enderecoTexto = entrega.tipo === 'entrega'
          ? `Entrega: ${entrega.endereco.rua}, ${entrega.endereco.numero} – ${entrega.endereco.bairro}, ${entrega.endereco.cidade}`
          : 'Retirada no local';
        const dataTexto = new Date(agendamento.data + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const periodoTexto = STATUS_PERIODOS.find((p) => p.id === agendamento.periodo)?.label ?? '';
        const mensagem = `Olá! Quero confirmar meu pedido ${pedido.numero_pedido} 🍫\n\n${itensTexto}\n\nTotal: ${formatPrice(pedido.total)}\n${enderecoTexto}\nData: ${dataTexto} (${periodoTexto})`;
        window.open(waLink(mensagem), '_blank');
        navigate(`/pedido/${pedido.numero_pedido}`);
      }
    } catch (err) {
      alert('Erro ao confirmar pedido. Tente novamente.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-bg-alt pt-[60px] md:pt-[70px]">
      <div className="container-site max-w-2xl py-6">
        <div className="mb-6 flex flex-col items-start gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-full border border-border-light bg-bg-main px-4 py-2 text-[0.85rem] font-semibold text-text-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-rose hover:text-rose hover:shadow-md"
          >
            <ArrowLeftIcon className="h-4 w-4 flex-shrink-0" />
            Voltar à loja
          </Link>
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1.5 pl-1 text-[0.8rem] font-medium text-text-secondary transition-colors hover:text-rose"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5 flex-shrink-0" />
              Etapa anterior
            </button>
          )}
        </div>
        <Stepper current={step} />
        <div className="mt-6 rounded-card border border-border-light bg-bg-main p-6">
          {step === 0 && (
            <StepEntrega
              config={config}
              taxasEntrega={taxasEntrega}
              onNext={() => setStep(1)}
              onBack={() => navigate('/')}
              setEntrega={setEntrega}
              entrega={entrega}
            />
          )}
          {step === 1 && <StepAgendamento config={config} onNext={() => setStep(2)} onBack={() => setStep(0)} setAgendamento={setAgendamento} agendamento={agendamento} datasBloqueadas={datasBlq} />}
          {step === 2 && (
            <StepRevisao
              items={items}
              subtotal={subtotal}
              config={config}
              entrega={entrega}
              agendamento={agendamento}
              coupon={coupon}
              user={user}
              guest={guest}
              setGuest={setGuest}
              pagamento={pagamento}
              setPagamento={setPagamento}
              onBack={() => setStep(1)}
              onConfirmPix={handleConfirmPix}
              onConfirmWhatsApp={handleConfirmWhatsApp}
              loading={saving}
            />
          )}
        </div>
      </div>
    </div>
  );
}
