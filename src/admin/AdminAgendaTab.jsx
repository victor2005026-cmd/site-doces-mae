import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { isoDateLocal as isoDate } from '../lib/dateUtils';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const MOTIVOS_SUGERIDOS = ['Feriado', 'Viagem', 'Agenda cheia'];

function hojeIso() {
  return isoDate(new Date());
}

function formatarDataLabel(iso) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

const ic = 'w-full rounded-card border border-border-light bg-bg-alt px-4 py-2.5 text-[0.95rem] outline-none focus:border-rose focus:ring-1 focus:ring-rose';
const lbl = 'mb-1 block text-[0.85rem] font-medium text-text-primary';

export default function AdminAgendaTab() {
  const [mesAtual, setMesAtual] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [bloqueios, setBloqueios] = useState([]);
  const [contagemPedidos, setContagemPedidos] = useState({});
  const [loading, setLoading] = useState(true);
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [motivoInput, setMotivoInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');

  const [showIntervalo, setShowIntervalo] = useState(false);
  const [intervaloInicio, setIntervaloInicio] = useState('');
  const [intervaloFim, setIntervaloFim] = useState('');
  const [intervaloMotivo, setIntervaloMotivo] = useState('');
  const [savingIntervalo, setSavingIntervalo] = useState(false);
  const [erroIntervalo, setErroIntervalo] = useState('');

  const fetchBloqueios = async () => {
    const { data, error } = await supabase.from('datas_bloqueadas').select('*').order('data', { ascending: true });
    if (error) console.error('Erro ao buscar dias bloqueados:', error);
    setBloqueios(data ?? []);
    setLoading(false);
  };

  const fetchContagemPedidos = async (mes) => {
    const inicio = isoDate(new Date(mes.getFullYear(), mes.getMonth(), 1));
    const fim = isoDate(new Date(mes.getFullYear(), mes.getMonth() + 1, 0));
    const { data, error } = await supabase
      .from('pedidos')
      .select('data_agendada, status')
      .gte('data_agendada', inicio)
      .lte('data_agendada', fim);
    if (error) { console.error('Erro ao buscar pedidos do mês:', error); return; }
    const contagem = {};
    (data ?? []).forEach((p) => {
      if (p.status === 'cancelado') return;
      contagem[p.data_agendada] = (contagem[p.data_agendada] ?? 0) + 1;
    });
    setContagemPedidos(contagem);
  };

  useEffect(() => { fetchBloqueios(); }, []);
  useEffect(() => { fetchContagemPedidos(mesAtual); }, [mesAtual]); // eslint-disable-line

  const bloqueioPorData = useMemo(() => {
    const map = {};
    bloqueios.forEach((b) => { map[b.data] = b; });
    return map;
  }, [bloqueios]);

  const diasGrid = useMemo(() => {
    const primeiroDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
    const ultimoDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
    const offsetInicio = primeiroDia.getDay();
    const dias = [];
    for (let i = 0; i < offsetInicio; i++) dias.push(null);
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      dias.push(new Date(mesAtual.getFullYear(), mesAtual.getMonth(), d));
    }
    return dias;
  }, [mesAtual]);

  const mudarMes = (delta) => {
    setMesAtual((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));
    setDiaSelecionado(null);
  };

  const abrirDia = (d) => {
    const iso = isoDate(d);
    setErro('');
    setDiaSelecionado(iso);
    setMotivoInput(bloqueioPorData[iso]?.motivo ?? '');
  };

  const handleBloquear = async () => {
    if (!diaSelecionado) return;
    setSaving(true);
    setErro('');
    const { error } = await supabase.from('datas_bloqueadas').insert({ data: diaSelecionado, motivo: motivoInput.trim() || null });
    setSaving(false);
    if (error) { setErro('Não consegui bloquear esse dia. Tenta de novo.'); console.error(error); return; }
    await fetchBloqueios();
    setDiaSelecionado(null);
  };

  const handleSalvarMotivo = async () => {
    const bloqueio = bloqueioPorData[diaSelecionado];
    if (!bloqueio) return;
    setSaving(true);
    setErro('');
    const { error } = await supabase.from('datas_bloqueadas').update({ motivo: motivoInput.trim() || null }).eq('id', bloqueio.id);
    setSaving(false);
    if (error) { setErro('Não consegui salvar. Tenta de novo.'); console.error(error); return; }
    await fetchBloqueios();
    setDiaSelecionado(null);
  };

  const handleDesbloquear = async (id) => {
    setSaving(true);
    const { error } = await supabase.from('datas_bloqueadas').delete().eq('id', id);
    setSaving(false);
    if (error) { console.error(error); return; }
    await fetchBloqueios();
    setDiaSelecionado(null);
  };

  const handleBloquearIntervalo = async (e) => {
    e.preventDefault();
    setErroIntervalo('');
    if (!intervaloInicio || !intervaloFim) return;
    if (intervaloFim < intervaloInicio) { setErroIntervalo('A data final precisa ser depois da inicial.'); return; }

    const inicio = new Date(intervaloInicio + 'T12:00:00');
    const fim = new Date(intervaloFim + 'T12:00:00');
    const dias = Math.round((fim - inicio) / 86400000) + 1;
    if (dias > 90) { setErroIntervalo('Intervalo muito grande (máx. 90 dias por vez).'); return; }

    const linhas = [];
    for (let i = 0; i < dias; i++) {
      const d = new Date(inicio);
      d.setDate(d.getDate() + i);
      linhas.push({ data: isoDate(d), motivo: intervaloMotivo.trim() || null });
    }

    setSavingIntervalo(true);
    const { error } = await supabase.from('datas_bloqueadas').upsert(linhas, { onConflict: 'data', ignoreDuplicates: true });
    setSavingIntervalo(false);
    if (error) { setErroIntervalo('Não consegui bloquear o intervalo. Tenta de novo.'); console.error(error); return; }

    setIntervaloInicio('');
    setIntervaloFim('');
    setIntervaloMotivo('');
    setShowIntervalo(false);
    await fetchBloqueios();
  };

  const proximosBloqueios = bloqueios.filter((b) => b.data >= hojeIso());
  const bloqueioSelecionado = diaSelecionado ? bloqueioPorData[diaSelecionado] : null;
  const contagemSelecionado = diaSelecionado ? (contagemPedidos[diaSelecionado] ?? 0) : 0;
  const ehPassado = diaSelecionado && diaSelecionado < hojeIso();

  if (loading) return <p className="py-8 text-center text-text-secondary">Carregando…</p>;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-[1.1rem] font-semibold text-text-primary">Agenda / Dias bloqueados</h2>
        <button
          type="button"
          onClick={() => setShowIntervalo((v) => !v)}
          className="rounded-full border border-border-light px-4 py-2 text-[0.85rem] font-medium text-text-primary hover:border-rose hover:text-rose"
        >
          {showIntervalo ? 'Cancelar' : 'Bloquear um intervalo'}
        </button>
      </div>

      {showIntervalo && (
        <form onSubmit={handleBloquearIntervalo} className="mb-6 rounded-card border border-border-light bg-bg-main p-5">
          <h3 className="mb-3 font-heading text-[0.95rem] font-semibold text-text-primary">Bloquear vários dias de uma vez</h3>
          <p className="mb-3 text-[0.8rem] text-text-secondary">Ex: férias de 25 a 30 de dezembro.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className={lbl}>De</label>
              <input required type="date" min={hojeIso()} value={intervaloInicio} onChange={(e) => setIntervaloInicio(e.target.value)} className={ic} />
            </div>
            <div>
              <label className={lbl}>Até</label>
              <input required type="date" min={intervaloInicio || hojeIso()} value={intervaloFim} onChange={(e) => setIntervaloFim(e.target.value)} className={ic} />
            </div>
            <div>
              <label className={lbl}>Motivo <span className="font-normal text-text-secondary">(opcional)</span></label>
              <input value={intervaloMotivo} onChange={(e) => setIntervaloMotivo(e.target.value)} placeholder="Ex: Viagem, férias…" className={ic} />
            </div>
          </div>
          {erroIntervalo && <p className="mt-3 text-[0.85rem] text-rose-dark">{erroIntervalo}</p>}
          <button type="submit" disabled={savingIntervalo} className="mt-4 rounded-full bg-rose px-6 py-2.5 text-[0.9rem] font-semibold text-white hover:bg-rose-dark disabled:opacity-60">
            {savingIntervalo ? 'Bloqueando…' : 'Bloquear intervalo'}
          </button>
        </form>
      )}

      <div className="rounded-card border border-border-light bg-bg-main p-5">
        <div className="mb-4 flex items-center justify-between">
          <button type="button" onClick={() => mudarMes(-1)} aria-label="Mês anterior" className="flex h-9 w-9 items-center justify-center rounded-full border border-border-light text-text-primary hover:border-rose hover:text-rose">‹</button>
          <p className="font-heading text-[1.05rem] font-semibold capitalize text-text-primary">
            {MESES[mesAtual.getMonth()]} {mesAtual.getFullYear()}
          </p>
          <button type="button" onClick={() => mudarMes(1)} aria-label="Próximo mês" className="flex h-9 w-9 items-center justify-center rounded-full border border-border-light text-text-primary hover:border-rose hover:text-rose">›</button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[0.75rem] font-medium text-text-secondary">
          {DIAS_SEMANA.map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {diasGrid.map((d, i) => {
            if (!d) return <div key={`vazio-${i}`} />;
            const iso = isoDate(d);
            const bloqueado = Boolean(bloqueioPorData[iso]);
            const qtdPedidos = contagemPedidos[iso] ?? 0;
            const passado = iso < hojeIso();
            const hoje = iso === hojeIso();
            const selecionado = iso === diaSelecionado;

            let cls = 'border-border-light text-text-primary hover:border-rose/50';
            if (bloqueado) cls = 'border-red-300 bg-red-100 text-red-700 hover:border-red-400';
            else if (qtdPedidos > 0) cls = 'border-yellow-300 bg-yellow-50 text-yellow-800 hover:border-yellow-400';
            if (passado) cls += ' opacity-40';
            if (selecionado) cls += ' ring-2 ring-rose';

            return (
              <button
                key={iso}
                type="button"
                onClick={() => abrirDia(d)}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-card border text-[0.85rem] font-medium transition-colors ${cls} ${hoje ? 'font-bold' : ''}`}
              >
                {d.getDate()}
                {qtdPedidos > 0 && !bloqueado && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.62rem] font-bold text-white">
                    {qtdPedidos}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-[0.78rem] text-text-secondary">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border border-red-300 bg-red-200" /> Bloqueado</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border border-yellow-300 bg-yellow-100" /> Tem pedidos agendados</span>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 font-heading text-[0.95rem] font-semibold text-text-primary">Próximos dias bloqueados</h3>
        {proximosBloqueios.length === 0 ? (
          <p className="text-[0.85rem] text-text-secondary">Nenhum dia bloqueado a partir de hoje.</p>
        ) : (
          <ul className="divide-y divide-border-light rounded-card border border-border-light bg-bg-main">
            {proximosBloqueios.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <div>
                  <p className="font-medium capitalize text-text-primary">{formatarDataLabel(b.data)}</p>
                  {b.motivo && <p className="text-[0.8rem] text-text-secondary">{b.motivo}</p>}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => abrirDia(new Date(b.data + 'T12:00:00'))} className="rounded-full border border-border-light px-3 py-1 text-[0.78rem] font-medium text-text-secondary hover:border-rose hover:text-rose">
                    Editar
                  </button>
                  <button type="button" onClick={() => handleDesbloquear(b.id)} className="rounded-full border border-rose/30 px-3 py-1 text-[0.78rem] font-medium text-rose-dark hover:border-rose">
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {diaSelecionado && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4" onClick={(e) => { if (e.target === e.currentTarget) setDiaSelecionado(null); }}>
          <div className="w-full max-w-[380px] rounded-card bg-bg-main p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-[1rem] font-semibold capitalize text-text-primary">{formatarDataLabel(diaSelecionado)}</h3>
              <button type="button" onClick={() => setDiaSelecionado(null)} className="text-[1.2rem] text-text-secondary hover:text-rose">×</button>
            </div>

            {ehPassado ? (
              <p className="text-[0.85rem] text-text-secondary">Esse dia já passou.</p>
            ) : bloqueioSelecionado ? (
              <>
                {contagemSelecionado > 0 && (
                  <p className="mb-3 rounded-card border border-gold/30 bg-gold/10 px-3 py-2 text-[0.8rem] text-text-primary">
                    Atenção: já existem {contagemSelecionado} pedido(s) agendado(s) pra esse dia.
                  </p>
                )}
                <label className={lbl}>Motivo</label>
                <input value={motivoInput} onChange={(e) => setMotivoInput(e.target.value)} className={ic} placeholder="Ex: Feriado, viagem…" />
                {erro && <p className="mt-2 text-[0.8rem] text-rose-dark">{erro}</p>}
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={handleSalvarMotivo} disabled={saving} className="flex-1 rounded-full bg-rose py-2.5 text-[0.9rem] font-semibold text-white hover:bg-rose-dark disabled:opacity-60">
                    Salvar
                  </button>
                  <button type="button" onClick={() => handleDesbloquear(bloqueioSelecionado.id)} disabled={saving} className="rounded-full border border-rose/30 px-4 py-2.5 text-[0.9rem] font-medium text-rose-dark hover:border-rose">
                    Desbloquear
                  </button>
                </div>
              </>
            ) : (
              <>
                {contagemSelecionado > 0 && (
                  <p className="mb-3 rounded-card border border-gold/30 bg-gold/10 px-3 py-2 text-[0.8rem] text-text-primary">
                    Já existem {contagemSelecionado} pedido(s) agendado(s) pra esse dia — eles não serão cancelados se você bloquear.
                  </p>
                )}
                <label className={lbl}>Motivo <span className="font-normal text-text-secondary">(opcional)</span></label>
                <input value={motivoInput} onChange={(e) => setMotivoInput(e.target.value)} className={ic} placeholder="Ex: Feriado, viagem, agenda cheia…" />
                <div className="mt-2 flex flex-wrap gap-2">
                  {MOTIVOS_SUGERIDOS.map((m) => (
                    <button key={m} type="button" onClick={() => setMotivoInput(m)} className="rounded-full border border-border-light px-3 py-1 text-[0.78rem] text-text-secondary hover:border-rose hover:text-rose">
                      {m}
                    </button>
                  ))}
                </div>
                {erro && <p className="mt-2 text-[0.8rem] text-rose-dark">{erro}</p>}
                <button type="button" onClick={handleBloquear} disabled={saving} className="mt-4 w-full rounded-full bg-rose py-2.5 text-[0.9rem] font-semibold text-white hover:bg-rose-dark disabled:opacity-60">
                  {saving ? 'Bloqueando…' : 'Bloquear este dia'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
