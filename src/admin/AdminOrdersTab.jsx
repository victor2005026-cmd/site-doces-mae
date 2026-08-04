import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../data/products';
import { waLink } from '../lib/whatsapp';
import { isoDateLocal } from '../lib/dateUtils';
import { useAdminProducts } from '../context/AdminProductsContext';
import { ULTIMA_VISTA_KEY } from './AdminDashboard';

const UMA_HORA_MS = 60 * 60 * 1000;

// "Novo": chegou na última hora E depois da última vez que ela abriu a aba Pedidos
function ehPedidoNovo(pedido) {
  const criadoEm = new Date(pedido.created_at).getTime();
  if (Date.now() - criadoEm > UMA_HORA_MS) return false;
  try {
    const vistoEm = localStorage.getItem(ULTIMA_VISTA_KEY);
    return !vistoEm || criadoEm > new Date(vistoEm).getTime();
  } catch {
    return true;
  }
}

const STATUS_FLOW = {
  aguardando_pagamento:             { label: 'Aguardando pagamento',  next: null, nextLabel: null, color: 'bg-gold/20 text-gold' },
  aguardando_confirmacao_pagamento: { label: 'Aguardando confirmação',next: null, nextLabel: null, color: 'bg-gold/30 text-gold' },
  recebido:     { label: 'Recebido',      next: 'confirmado',  nextLabel: 'Confirmar',       color: 'bg-gold/20 text-gold' },
  confirmado:   { label: 'Confirmado',    next: 'preparando',  nextLabel: 'Preparando',      color: 'bg-blue-100 text-blue-700' },
  preparando:   { label: 'Preparando',    next: 'pronto',      nextLabel: 'Pronto',          color: 'bg-blue-100 text-blue-700' },
  pronto:       { label: 'Pronto',        next: 'saiu_entrega',nextLabel: 'Saiu pra entrega',color: 'bg-success/20 text-success' },
  saiu_entrega: { label: 'A caminho',     next: 'entregue',    nextLabel: 'Entregue',        color: 'bg-success/20 text-success' },
  entregue:     { label: 'Entregue',      next: null,          nextLabel: null,              color: 'bg-bg-alt text-text-secondary' },
  cancelado:    { label: 'Cancelado',     next: null,          nextLabel: null,              color: 'bg-rose/20 text-rose-dark' },
};

const FILTROS_DATA = ['Hoje', 'Amanhã', 'Esta semana', 'Todos'];
const ORIGENS = { site: 'Site', whatsapp: 'WA', instagram: 'IG', manual: 'Manual' };
const ORIGEM_COLORS = { site: 'bg-rose/20 text-rose-dark', whatsapp: 'bg-success/20 text-success', instagram: 'bg-gold/20 text-gold', manual: 'bg-bg-alt text-text-secondary' };

const PERIODO_LABELS = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' };

function gerarTextoWA(pedido, itens) {
  const linhas = itens.map((i) => `• ${i.quantidade}× ${i.nome_produto}`).join('\n');
  return `Olá ${pedido.dados_convidado?.nome ?? 'cliente'}! Seu pedido ${pedido.numero_pedido} foi ${STATUS_FLOW[pedido.status]?.label?.toLowerCase() ?? pedido.status}. 🍫\n\nItens:\n${linhas}\nTotal: ${formatPrice(pedido.total)}`;
}

function NovoManualModal({ produtos, onClose, onSaved }) {
  const [form, setForm] = useState({ nome: '', tel: '', data: '', periodo: 'tarde', tipo: 'retirada', pagamento: 'pix', obs: '' });
  const [linhas, setLinhas] = useState([{ produtoId: '', nome: '', qtd: 1, preco: 0 }]);
  const [saving, setSaving] = useState(false);

  const addLinha = () => setLinhas((p) => [...p, { produtoId: '', nome: '', qtd: 1, preco: 0 }]);
  const setLinha = (i, f, v) => setLinhas((prev) => prev.map((l, idx) => idx === i ? { ...l, [f]: v } : l));
  const selectProd = (i, prodId) => {
    const p = produtos.find((x) => x.id === prodId);
    if (p) setLinhas((prev) => prev.map((l, idx) => idx === i ? { ...l, produtoId: prodId, nome: p.nome, preco: p.preco } : l));
  };

  const subtotal = linhas.reduce((s, l) => s + Number(l.preco) * Number(l.qtd), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { data: pedido, error } = await supabase.from('pedidos').insert({
      dados_convidado: { nome: form.nome, telefone: form.tel.replace(/\D/g, '') },
      origem: 'manual',
      status: 'confirmado',
      tipo_entrega: form.tipo,
      data_agendada: form.data,
      periodo_agendado: form.periodo,
      forma_pagamento: form.pagamento,
      observacoes: form.obs || null,
      subtotal,
      taxa_entrega: 0,
      total: subtotal,
    }).select().single();

    if (!error) {
      await supabase.from('itens_pedido').insert(
        linhas.filter((l) => l.nome).map((l) => ({
          pedido_id: pedido.id,
          produto_id: l.produtoId || null,
          nome_produto: l.nome,
          quantidade: Number(l.qtd),
          preco_unitario: Number(l.preco),
        }))
      );
      onSaved();
    }
    setSaving(false);
    onClose();
  };

  const ic = 'w-full rounded-card border border-border-light bg-bg-alt px-3 py-2 text-[0.9rem] outline-none focus:border-rose';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card bg-bg-main p-6 shadow-lg">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-heading text-[1.1rem] font-semibold">Novo pedido manual</h2>
          <button type="button" onClick={onClose} className="text-[1.2rem] text-text-secondary hover:text-rose">×</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[0.82rem] font-medium">Nome do cliente</label>
              <input required value={form.nome} onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))} className={ic} />
            </div>
            <div>
              <label className="mb-1 block text-[0.82rem] font-medium">Telefone</label>
              <input required value={form.tel} onChange={(e) => setForm((p) => ({ ...p, tel: e.target.value }))} placeholder="(13) 99999-9999" className={ic} />
            </div>
            <div>
              <label className="mb-1 block text-[0.82rem] font-medium">Data</label>
              <input required type="date" value={form.data} onChange={(e) => setForm((p) => ({ ...p, data: e.target.value }))} className={ic} />
            </div>
            <div>
              <label className="mb-1 block text-[0.82rem] font-medium">Período</label>
              <select value={form.periodo} onChange={(e) => setForm((p) => ({ ...p, periodo: e.target.value }))} className={ic}>
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[0.82rem] font-medium">Entrega</label>
              <select value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))} className={ic}>
                <option value="retirada">Retirada</option>
                <option value="entrega">Entrega</option>
              </select>
            </div>
          </div>

          {/* Itens */}
          <div>
            <p className="mb-2 text-[0.82rem] font-medium">Itens</p>
            {linhas.map((l, i) => (
              <div key={i} className="mb-2 grid grid-cols-[1fr_60px_80px] gap-2">
                <select value={l.produtoId} onChange={(e) => selectProd(i, e.target.value)} className={ic}>
                  <option value="">Escolher produto…</option>
                  {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome} – {formatPrice(p.preco)}</option>)}
                </select>
                <input type="number" min="1" value={l.qtd} onChange={(e) => setLinha(i, 'qtd', e.target.value)} className={ic} placeholder="Qtd" />
                <input type="number" step="0.5" value={l.preco} onChange={(e) => setLinha(i, 'preco', e.target.value)} className={ic} placeholder="R$" />
              </div>
            ))}
            <button type="button" onClick={addLinha} className="text-[0.82rem] text-rose underline">+ Adicionar item</button>
          </div>

          <div>
            <label className="mb-1 block text-[0.82rem] font-medium">Observações</label>
            <textarea value={form.obs} onChange={(e) => setForm((p) => ({ ...p, obs: e.target.value }))} rows={2} className={`${ic} resize-none`} />
          </div>

          <p className="text-right text-[0.9rem] font-bold">Total: {formatPrice(subtotal)}</p>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="flex-1 rounded-full bg-rose py-2.5 text-[0.9rem] font-semibold text-white hover:bg-rose-dark disabled:opacity-60">
              {saving ? 'Salvando…' : 'Salvar pedido'}
            </button>
            <button type="button" onClick={onClose} className="rounded-full border border-border-light px-5 py-2.5 text-[0.9rem] text-text-secondary hover:border-rose hover:text-rose">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminOrdersTab() {
  const { products: produtosLocal } = useAdminProducts();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroData, setFiltroData] = useState('Hoje');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [produtosDB, setProdutosDB] = useState([]);
  const [aguardandoCount, setAguardandoCount] = useState(0);
  const [aguardandoPagamentoCount, setAguardandoPagamentoCount] = useState(0);

  // Verificação client-side do "job": se ninguém rodou um cron pra cancelar
  // pedidos com Pix expirado, isso cancela ao carregar a lista do admin.
  const cancelarExpirados = async () => {
    await supabase
      .from('pedidos')
      .update({ status: 'cancelado' })
      .eq('status', 'aguardando_pagamento')
      .lt('data_expiracao_pagamento', new Date().toISOString());
  };

  const fetchPedidos = async () => {
    const hoje = isoDateLocal(new Date());
    const amanha = isoDateLocal(new Date(Date.now() + 86400000));
    const semanaFim = isoDateLocal(new Date(Date.now() + 7 * 86400000));

    await cancelarExpirados();

    let query = supabase.from('pedidos').select('*, itens_pedido(*), perfis(nome, telefone_formatado)').order('data_agendada').order('created_at', { ascending: false });

    if (filtroData === 'Hoje') query = query.eq('data_agendada', hoje);
    else if (filtroData === 'Amanhã') query = query.eq('data_agendada', amanha);
    else if (filtroData === 'Esta semana') query = query.lte('data_agendada', semanaFim).gte('data_agendada', hoje);

    if (filtroStatus) query = query.eq('status', filtroStatus);

    const { data, error } = await query.limit(50);
    if (error) console.error('Erro ao buscar pedidos:', error);
    setPedidos(data ?? []);
    setLoading(false);
  };

  // Contagens independentes de filtroData/filtroStatus: pedidos aguardando
  // pagamento/confirmação podem ter data de entrega futura e não aparecer
  // no filtro "Hoje" por padrão.
  const fetchAguardandoCount = async () => {
    const { count, error } = await supabase
      .from('pedidos')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'aguardando_confirmacao_pagamento');
    if (!error) setAguardandoCount(count ?? 0);

    const { count: countPagamento, error: errPagamento } = await supabase
      .from('pedidos')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'aguardando_pagamento');
    if (!errPagamento) setAguardandoPagamentoCount(countPagamento ?? 0);
  };

  useEffect(() => { fetchPedidos(); }, [filtroData, filtroStatus]); // eslint-disable-line

  useEffect(() => {
    fetchAguardandoCount();
    const channel = supabase
      .channel('pedidos-aguardando-pagamento')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
        fetchAguardandoCount();
        fetchPedidos();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []); // eslint-disable-line

  useEffect(() => {
    supabase.from('produtos').select('id, nome, preco').eq('ativo', true).then(({ data }) => {
      if (data?.length) setProdutosDB(data);
      else setProdutosDB(produtosLocal.filter((p) => p.active).map((p) => ({ id: p.id, nome: p.name, preco: p.price })));
    });
  }, []); // eslint-disable-line

  const verAguardandoConfirmacao = () => {
    setFiltroData('Todos');
    setFiltroStatus('aguardando_confirmacao_pagamento');
  };

  const verAguardandoPagamento = () => {
    setFiltroData('Todos');
    setFiltroStatus('aguardando_pagamento');
  };

  const avancarStatus = async (pedido) => {
    const info = STATUS_FLOW[pedido.status];
    if (!info?.next) return;
    await supabase.from('pedidos').update({ status: info.next, ...(info.next === 'confirmado' ? { confirmado_em: new Date().toISOString() } : {}) }).eq('id', pedido.id);
    fetchPedidos();
  };

  const confirmarPagamento = async (pedido) => {
    await supabase.from('pedidos').update({ status: 'recebido', pago: true, pago_em: new Date().toISOString() }).eq('id', pedido.id);
    fetchPedidos();
    fetchAguardandoCount();
  };

  const rejeitarPagamento = async (pedido) => {
    if (!window.confirm(`Rejeitar o pagamento do pedido ${pedido.numero_pedido}? O pedido será cancelado.`)) return;
    await supabase.from('pedidos').update({ status: 'cancelado' }).eq('id', pedido.id);
    fetchPedidos();
    fetchAguardandoCount();
  };

  const cancelar = async (pedido) => {
    if (!window.confirm(`Cancelar o pedido ${pedido.numero_pedido}?`)) return;
    await supabase.from('pedidos').update({ status: 'cancelado' }).eq('id', pedido.id);
    fetchPedidos();
  };

  const copiarResumo = (pedido) => {
    const texto = gerarTextoWA(pedido, pedido.itens_pedido ?? []);
    navigator.clipboard.writeText(texto).catch(() => {});
  };

  const notificarWA = (pedido) => {
    const texto = gerarTextoWA(pedido, pedido.itens_pedido ?? []);
    const tel = pedido.dados_convidado?.telefone ?? pedido.perfis?.telefone_formatado ?? '';
    window.open(waLink(texto, tel), '_blank');
  };

  if (loading) return <p className="py-8 text-center text-text-secondary">Carregando pedidos…</p>;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h2 className="font-heading text-[1.1rem] font-semibold text-text-primary">Pedidos</h2>
        <button
          type="button"
          onClick={() => setShowManual(true)}
          className="ml-auto rounded-full bg-rose px-4 py-1.5 text-[0.85rem] font-semibold text-white hover:bg-rose-dark"
        >
          + Novo pedido manual
        </button>
      </div>

      {aguardandoCount > 0 && (
        <button
          type="button"
          onClick={verAguardandoConfirmacao}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-card border-2 border-gold bg-gold/10 px-4 py-3 text-[0.9rem] font-semibold text-gold-dark hover:bg-gold/20"
        >
          {aguardandoCount} pedido{aguardandoCount > 1 ? 's' : ''} aguardando confirmação de pagamento
        </button>
      )}

      {aguardandoPagamentoCount > 0 && (
        <button
          type="button"
          onClick={verAguardandoPagamento}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-card border border-gold/40 bg-bg-alt px-4 py-2.5 text-[0.85rem] font-medium text-text-secondary hover:bg-gold/10"
        >
          {aguardandoPagamentoCount} pedido{aguardandoPagamentoCount > 1 ? 's' : ''} aguardando pagamento
        </button>
      )}

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTROS_DATA.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltroData(f)}
            className={`rounded-full border px-4 py-1.5 text-[0.82rem] font-medium transition-colors ${
              filtroData === f ? 'border-rose bg-rose text-white' : 'border-border-light text-text-secondary hover:border-rose/50'
            }`}
          >
            {f}
          </button>
        ))}
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="rounded-full border border-border-light bg-bg-main px-3 py-1.5 text-[0.82rem] text-text-secondary outline-none focus:border-rose"
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_FLOW).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {pedidos.length === 0 ? (
        <p className="py-10 text-center text-text-secondary">Nenhum pedido neste período.</p>
      ) : (
        <ul className="space-y-4">
          {pedidos.map((pedido) => {
            const info = STATUS_FLOW[pedido.status] ?? { label: pedido.status, color: 'bg-bg-alt' };
            const cliente = pedido.dados_convidado?.nome ?? pedido.perfis?.nome ?? '—';
            const dataFmt = new Date(pedido.data_agendada + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            const origemInfo = ORIGEM_COLORS[pedido.origem] ?? 'bg-bg-alt';

            return (
              <li key={pedido.id} className="rounded-card border border-border-light bg-bg-main p-5">
                <div className="mb-3 flex flex-wrap items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-heading font-bold text-text-primary">{pedido.numero_pedido}</p>
                      {ehPedidoNovo(pedido) && (
                        <span className="flex items-center gap-1 rounded-full bg-rose px-2 py-0.5 text-[0.7rem] font-bold text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-white" /> Novo
                        </span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${info.color}`}>{info.label}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${origemInfo}`}>{ORIGENS[pedido.origem] ?? pedido.origem}</span>
                    </div>
                    <p className="text-[0.85rem] text-text-secondary">{cliente} · {dataFmt} {PERIODO_LABELS[pedido.periodo_agendado] ?? ''} · {pedido.tipo_entrega}</p>
                  </div>
                  <span className="font-bold text-text-primary">{formatPrice(pedido.total)}</span>
                </div>

                {/* Itens */}
                <ul className="mb-3 space-y-0.5">
                  {(pedido.itens_pedido ?? []).map((item) => (
                    <li key={item.id} className="text-[0.82rem] text-text-secondary">
                      {item.quantidade}× {item.nome_produto}
                    </li>
                  ))}
                </ul>
                {pedido.observacoes && <p className="mb-3 text-[0.82rem] italic text-text-secondary">"{pedido.observacoes}"</p>}

                {/* Ações */}
                {pedido.status === 'aguardando_confirmacao_pagamento' && (
                  <div className="mb-3 flex flex-wrap gap-2 rounded-card bg-gold/10 p-3">
                    <button
                      type="button"
                      onClick={() => confirmarPagamento(pedido)}
                      className="flex-1 rounded-full bg-success px-4 py-2.5 text-[0.9rem] font-bold text-white hover:bg-[#268a41]"
                    >
                      Confirmar pagamento
                    </button>
                    <button
                      type="button"
                      onClick={() => rejeitarPagamento(pedido)}
                      className="flex-1 rounded-full border border-rose/40 px-4 py-2.5 text-[0.9rem] font-bold text-rose-dark hover:border-rose"
                    >
                      Rejeitar (pagamento não caiu)
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {info.nextLabel && (
                    <button
                      type="button"
                      onClick={() => avancarStatus(pedido)}
                      className="rounded-full bg-rose px-4 py-1.5 text-[0.82rem] font-semibold text-white hover:bg-rose-dark"
                    >
                      {info.nextLabel}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => notificarWA(pedido)}
                    className="rounded-full border border-success/40 px-3 py-1.5 text-[0.78rem] font-medium text-success hover:border-success"
                  >
                    Notificar cliente
                  </button>
                  <button
                    type="button"
                    onClick={() => copiarResumo(pedido)}
                    className="rounded-full border border-border-light px-3 py-1.5 text-[0.78rem] font-medium text-text-secondary hover:border-rose hover:text-rose"
                  >
                    Copiar resumo
                  </button>
                  {pedido.status !== 'cancelado' && pedido.status !== 'entregue' && (
                    <button
                      type="button"
                      onClick={() => cancelar(pedido)}
                      className="rounded-full border border-rose/30 px-3 py-1.5 text-[0.78rem] font-medium text-rose-dark hover:border-rose"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {showManual && (
        <NovoManualModal
          produtos={produtosDB}
          onClose={() => setShowManual(false)}
          onSaved={fetchPedidos}
        />
      )}
    </div>
  );
}
