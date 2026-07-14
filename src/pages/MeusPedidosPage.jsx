import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../data/products';

const STATUS_BADGES = {
  recebido:     { label: 'Recebido', cls: 'bg-gold/20 text-gold' },
  confirmado:   { label: 'Confirmado', cls: 'bg-blue-100 text-blue-700' },
  preparando:   { label: 'Preparando', cls: 'bg-blue-100 text-blue-700' },
  pronto:       { label: 'Pronto', cls: 'bg-success/20 text-success' },
  saiu_entrega: { label: 'A caminho!', cls: 'bg-success/20 text-success' },
  entregue:     { label: 'Entregue', cls: 'bg-bg-alt text-text-secondary' },
  cancelado:    { label: 'Cancelado', cls: 'bg-rose/20 text-rose-dark' },
};

const FILTROS = ['Todos', 'Em andamento', 'Entregues', 'Cancelados'];
const EM_ANDAMENTO = ['recebido', 'confirmado', 'preparando', 'pronto', 'saiu_entrega'];

export default function MeusPedidosPage() {
  const { user, loading: authLoading, primeiroNome } = useAuth();
  const navigate = useNavigate();

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('Todos');
  const [detalhe, setDetalhe] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchPedidos = async () => {
      const { data } = await supabase
        .from('pedidos')
        .select('*, itens_pedido(*)')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });
      setPedidos(data ?? []);
      setLoading(false);
    };
    fetchPedidos();

    // Realtime
    const channel = supabase
      .channel('meus-pedidos')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos', filter: `usuario_id=eq.${user.id}` }, () => {
        fetchPedidos();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  const pedidosFiltrados = pedidos.filter((p) => {
    if (filtro === 'Em andamento') return EM_ANDAMENTO.includes(p.status);
    if (filtro === 'Entregues') return p.status === 'entregue';
    if (filtro === 'Cancelados') return p.status === 'cancelado';
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-[70px]">
        <p className="text-text-secondary">Carregando seus pedidos…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-alt pt-[70px]">
      <div className="container-site max-w-2xl py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-[1.5rem] font-bold text-text-primary">Meus pedidos</h1>
            {primeiroNome && <p className="text-[0.85rem] text-text-secondary">Olá, {primeiroNome}!</p>}
          </div>
          <a href="/" className="text-[0.85rem] text-text-secondary underline hover:text-rose">
            Ver cardápio
          </a>
        </div>

        {/* Filtros */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {FILTROS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltro(f)}
              className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-[0.85rem] font-medium transition-colors ${
                filtro === f ? 'border-rose bg-rose text-white' : 'border-border-light text-text-secondary hover:border-rose/50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {pedidosFiltrados.length === 0 ? (
          <div className="py-12 text-center text-text-secondary">
            <p className="text-[1.5rem]">📦</p>
            <p className="mt-2">Nenhum pedido encontrado.</p>
            <a href="/" className="mt-3 inline-block text-rose underline">Fazer um pedido</a>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {pedidosFiltrados.map((pedido) => {
              const badge = STATUS_BADGES[pedido.status] ?? { label: pedido.status, cls: 'bg-bg-alt' };
              const resumoItens = (pedido.itens_pedido ?? [])
                .slice(0, 3)
                .map((i) => `${i.quantidade}× ${i.nome_produto}`)
                .join(', ');
              const dataFmt = new Date(pedido.data_agendada + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

              return (
                <li key={pedido.id} className="rounded-card border border-border-light bg-bg-main p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-heading text-[1rem] font-bold text-text-primary">{pedido.numero_pedido}</p>
                      <p className="text-[0.82rem] text-text-secondary">{dataFmt}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[0.75rem] font-semibold ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="mb-3 text-[0.85rem] text-text-secondary line-clamp-1">{resumoItens}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary">{formatPrice(pedido.total)}</span>
                    <button
                      type="button"
                      onClick={() => setDetalhe(pedido)}
                      className="text-[0.85rem] font-medium text-rose underline"
                    >
                      Ver detalhes
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Modal de detalhes */}
      {detalhe && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 sm:items-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setDetalhe(null); }}
        >
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-card bg-bg-main p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-[1.1rem] font-bold text-text-primary">{detalhe.numero_pedido}</h2>
              <button type="button" onClick={() => setDetalhe(null)} className="text-[1.2rem] text-text-secondary hover:text-rose">×</button>
            </div>
            <ul className="mb-4 space-y-2">
              {(detalhe.itens_pedido ?? []).map((i) => (
                <li key={i.id} className="flex justify-between text-[0.9rem]">
                  <span>{i.quantidade}× {i.nome_produto}</span>
                  <span className="font-medium">{formatPrice(i.preco_unitario * i.quantidade)}</span>
                </li>
              ))}
            </ul>
            <div className="space-y-1 border-t border-border-light pt-3 text-[0.85rem] text-text-secondary">
              <div className="flex justify-between font-bold text-text-primary text-[0.95rem]">
                <span>Total</span><span>{formatPrice(detalhe.total)}</span>
              </div>
              {detalhe.observacoes && <p className="mt-2 italic">"{detalhe.observacoes}"</p>}
            </div>
            <a
              href={`/pedido/${detalhe.numero_pedido}`}
              className="mt-5 block rounded-full border border-border-light py-2 text-center text-[0.9rem] font-medium text-text-primary hover:border-rose hover:text-rose"
            >
              Ver página do pedido
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
