import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../data/products';

const ORIGENS = { site: 'Site', whatsapp: 'WhatsApp', instagram: 'Instagram', manual: 'Manual' };
const ORIGEM_COLORS = { site: '#E8A0AB', whatsapp: '#2FA84F', instagram: '#C9A96E', manual: '#888888' };

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-card border border-border-light bg-bg-main p-5">
      <p className="text-[0.82rem] text-text-secondary">{label}</p>
      <p className="mt-1 font-heading text-[1.8rem] font-bold text-text-primary">{value}</p>
      {sub && <p className="text-[0.8rem] text-text-secondary">{sub}</p>}
    </div>
  );
}

function ProximoCard({ pedido }) {
  const dataFmt = new Date(pedido.data_agendada + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
  const cliente = pedido.dados_convidado?.nome ?? pedido.perfis?.nome ?? '—';
  return (
    <li className="flex items-center gap-4 border-b border-border-light py-3 last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="text-[0.9rem] font-semibold text-text-primary">{pedido.numero_pedido}</p>
        <p className="truncate text-[0.8rem] text-text-secondary">{cliente} · {dataFmt}</p>
      </div>
      <span className="text-[0.85rem] font-bold text-text-primary">{formatPrice(pedido.total)}</span>
    </li>
  );
}

export default function AdminStatsTab() {
  const [stats, setStats] = useState({ total: 0, faturamento: 0, porOrigem: {} });
  const [proximos, setProximos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hoje = new Date().toISOString().split('T')[0];
    const em3Dias = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

    const fetchAll = async () => {
      const [{ data: pedidosHoje }, { data: prox }] = await Promise.all([
        supabase.from('pedidos').select('total, origem').eq('data_agendada', hoje),
        supabase.from('pedidos').select('*, perfis(nome)').gte('data_agendada', hoje).lte('data_agendada', em3Dias).not('status', 'eq', 'cancelado').order('data_agendada').limit(10),
      ]);

      const total = pedidosHoje?.length ?? 0;
      const faturamento = pedidosHoje?.reduce((s, p) => s + Number(p.total), 0) ?? 0;
      const porOrigem = {};
      pedidosHoje?.forEach((p) => { porOrigem[p.origem] = (porOrigem[p.origem] ?? 0) + 1; });

      setStats({ total, faturamento, porOrigem });
      setProximos(prox ?? []);
      setLoading(false);
    };

    fetchAll();
  }, []);

  if (loading) return <p className="py-8 text-center text-text-secondary">Carregando…</p>;

  const totalOrigens = Object.values(stats.porOrigem).reduce((s, v) => s + v, 0);

  return (
    <div>
      <h2 className="mb-5 font-heading text-[1.1rem] font-semibold text-text-primary">Dashboard — Hoje</h2>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Pedidos hoje" value={stats.total} />
        <StatCard label="Faturamento hoje" value={formatPrice(stats.faturamento)} />
        <StatCard label="Próximos 3 dias" value={proximos.length} sub="pedidos agendados" />
      </div>

      {/* Canais */}
      {totalOrigens > 0 && (
        <div className="mb-6 rounded-card border border-border-light bg-bg-main p-5">
          <h3 className="mb-3 font-heading text-[0.95rem] font-semibold text-text-primary">Pedidos por canal (hoje)</h3>
          <div className="space-y-2">
            {Object.entries(stats.porOrigem).map(([origem, count]) => (
              <div key={origem} className="flex items-center gap-3">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${(count / totalOrigens) * 100}%`, minWidth: '8px', backgroundColor: ORIGEM_COLORS[origem] ?? '#ccc' }}
                />
                <span className="text-[0.85rem] text-text-secondary whitespace-nowrap">
                  {ORIGENS[origem] ?? origem} ({count})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Próximos pedidos */}
      <div className="rounded-card border border-border-light bg-bg-main px-5">
        <h3 className="pt-4 font-heading text-[0.95rem] font-semibold text-text-primary">Próximos agendamentos (3 dias)</h3>
        {proximos.length === 0 ? (
          <p className="py-4 text-[0.85rem] text-text-secondary">Nenhum pedido nos próximos 3 dias.</p>
        ) : (
          <ul>{proximos.map((p) => <ProximoCard key={p.id} pedido={p} />)}</ul>
        )}
      </div>
    </div>
  );
}
