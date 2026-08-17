import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../data/products';
import { waLink } from '../lib/whatsapp';
import AuthModal from '../components/AuthModal';

const STATUS_LABELS = {
  aguardando_confirmacao_pagamento: { label: 'Aguardando confirmação', color: 'text-gold' },
  recebido: { label: 'Aguardando confirmação', color: 'text-gold' },
  confirmado: { label: 'Confirmado', color: 'text-success' },
  preparando: { label: 'Preparando', color: 'text-success' },
  pronto: { label: 'Pronto para entrega', color: 'text-success' },
  saiu_entrega: { label: 'Saiu para entrega!', color: 'text-success' },
  entregue: { label: 'Entregue', color: 'text-success' },
  cancelado: { label: 'Cancelado', color: 'text-rose-dark' },
};

const PERIODO_LABELS = { manha: 'Manhã (9h – 12h)', tarde: 'Tarde (13h – 17h)', noite: 'Noite (18h – 21h)' };

const FORMA_PAGAMENTO_LABELS = {
  pix: 'Via Pix',
};

export default function OrderConfirmationPage() {
  const { numeroPedido } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pedido, setPedido] = useState(null);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);

  useEffect(() => {
    const fetchPedido = async () => {
      const { data } = await supabase
        .from('pedidos')
        .select('*')
        .eq('numero_pedido', numeroPedido)
        .single();
      if (data) {
        setPedido(data);
        const { data: is } = await supabase.from('itens_pedido').select('*').eq('pedido_id', data.id);
        setItens(is ?? []);
      }
      setLoading(false);
    };
    fetchPedido();
  }, [numeroPedido]);

  // Pedido ainda depende de pagamento: manda pra tela dedicada de aguardando pagamento
  useEffect(() => {
    if (pedido && pedido.status === 'aguardando_pagamento') {
      navigate(`/pagamento/${pedido.numero_pedido}`, { replace: true });
    }
  }, [pedido, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-[60px] md:pt-[70px]">
        <p className="text-text-secondary">Carregando pedido…</p>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 pt-[60px] md:pt-[70px]">
        <p className="text-text-secondary">Pedido não encontrado.</p>
        <Link to="/" className="text-rose underline">Voltar ao cardápio</Link>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[pedido.status] ?? { label: pedido.status, color: 'text-text-primary' };
  const dataFormatada = new Date(pedido.data_agendada + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long',
  });

  return (
    <div className="min-h-screen bg-bg-alt pt-[60px] md:pt-[70px]">
      <div className="container-site max-w-lg py-8">

        {/* Cabeçalho de sucesso */}
        <div className="mb-6 rounded-card border border-success/30 bg-success/5 p-6 text-center">
          <div className="mb-2 text-[2.5rem]">✓</div>
          <h1 className="font-heading text-[1.4rem] font-bold text-success">Pedido recebido!</h1>
          <p className="mt-1 text-[0.9rem] text-text-secondary">
            Número do pedido:{' '}
            <span className="font-bold text-text-primary">{pedido.numero_pedido}</span>
          </p>
        </div>

        {/* Status */}
        <div className="mb-5 rounded-card border border-border-light bg-bg-main p-5">
          <div className="flex items-center justify-between">
            <span className="text-[0.9rem] text-text-secondary">Status</span>
            <span className={`font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
          </div>
        </div>

        {/* Itens */}
        <div className="mb-5 rounded-card border border-border-light bg-bg-main p-5">
          <h2 className="mb-3 font-heading text-[1rem] font-semibold text-text-primary">Itens</h2>
          <ul className="flex flex-col gap-2">
            {itens.map((item) => (
              <li key={item.id} className="flex justify-between text-[0.9rem]">
                <span className="text-text-primary">{item.quantidade}× {item.nome_produto}</span>
                <span className="font-medium">{formatPrice(item.preco_unitario * item.quantidade)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-border-light pt-3 space-y-1 text-[0.85rem]">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal</span><span>{formatPrice(pedido.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Entrega</span>
              <span className={pedido.taxa_entrega > 0 ? 'text-text-secondary' : 'font-semibold text-success'}>
                {pedido.taxa_entrega > 0 ? formatPrice(pedido.taxa_entrega) : 'GRÁTIS'}
              </span>
            </div>
            <div className="flex justify-between text-[1rem] font-bold text-text-primary">
              <span>Total</span><span className="text-rose">{formatPrice(pedido.total)}</span>
            </div>
          </div>
        </div>

        {/* Detalhes */}
        <div className="mb-5 rounded-card border border-border-light bg-bg-main p-5 space-y-3 text-[0.9rem]">
          <div className="flex gap-2">
            <span className="w-24 flex-shrink-0 text-text-secondary">Data</span>
            <span className="capitalize text-text-primary">
              {dataFormatada} · {PERIODO_LABELS[pedido.periodo_agendado] ?? pedido.periodo_agendado}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="w-24 flex-shrink-0 text-text-secondary">Entrega</span>
            <span className="text-text-primary">
              {pedido.tipo_entrega === 'retirada'
                ? 'Retirar no local'
                : pedido.endereco_entrega
                ? `${pedido.endereco_entrega.rua}, ${pedido.endereco_entrega.numero}`
                : '—'}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="w-24 flex-shrink-0 text-text-secondary">Pagamento</span>
            <span className="text-text-primary">
              {FORMA_PAGAMENTO_LABELS[pedido.forma_pagamento] ?? pedido.forma_pagamento}
            </span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-3">
          {user && (
            <Link
              to="/meus-pedidos"
              className="rounded-full border border-border-light py-2.5 text-center text-[0.9rem] font-medium text-text-primary hover:border-rose hover:text-rose"
            >
              Ver meus pedidos
            </Link>
          )}
          <a
            href={waLink(`Olá! Tenho uma dúvida sobre o pedido ${pedido.numero_pedido}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-success py-2.5 text-center text-[0.95rem] font-semibold text-white hover:bg-[#268a41]"
          >
            Falar com a Ale
          </a>
          <Link to="/" className="text-center text-[0.85rem] text-text-secondary underline hover:text-rose">
            Voltar ao cardápio
          </Link>
        </div>

        {/* CTA para convidados criarem conta */}
        {!user && pedido.dados_convidado && (
          <div className="mt-6 rounded-card border border-gold/30 bg-gold/10 p-5">
            <p className="mb-2 font-heading text-[1rem] font-semibold text-text-primary">
              Quer acompanhar seu pedido pelo site?
            </p>
            <p className="mb-3 text-[0.85rem] text-text-secondary">
              Crie uma senha em 10 segundos e acompanhe o status em tempo real.
            </p>
            <button
              type="button"
              onClick={() => setMostrarCadastro(true)}
              className="inline-block rounded-full bg-gold px-5 py-2 text-[0.9rem] font-semibold text-white hover:bg-gold-dark"
            >
              Criar minha conta
            </button>
          </div>
        )}
      </div>

      <AuthModal isOpen={mostrarCadastro} initialTab="cadastro" onClose={() => setMostrarCadastro(false)} />
    </div>
  );
}
