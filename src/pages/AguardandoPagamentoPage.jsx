import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAdminProducts } from '../context/AdminProductsContext';
import { formatPrice } from '../data/products';
import { waLink } from '../lib/whatsapp';
import PixQRCode from '../components/PixQRCode';
import { buscarPedidoComItens } from '../lib/pedidos';

function formatCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(total / 60);
  const seg = total % 60;
  return `${min}:${seg.toString().padStart(2, '0')}`;
}

export default function AguardandoPagamentoPage() {
  const { numeroPedido } = useParams();
  const navigate = useNavigate();
  const { config } = useAdminProducts();

  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agora, setAgora] = useState(Date.now());
  const [enviando, setEnviando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const jaExpirouRef = useRef(false);

  useEffect(() => {
    buscarPedidoComItens(numeroPedido).then(({ pedido: data }) => {
      setPedido(data);
      setLoading(false);
    });
  }, [numeroPedido]);

  // Tempo real: reflete quando a Ale confirma o pagamento no admin, ou quando expira/cancela.
  // Só funciona pra quem está logado (RLS não deixa mais um convidado assinar
  // updates de pedidos de outros convidados) — por isso o polling abaixo cobre
  // o caso de convidado também.
  useEffect(() => {
    if (!pedido?.id) return;
    const channel = supabase
      .channel(`pagamento-${pedido.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos', filter: `id=eq.${pedido.id}` }, (payload) => {
        setPedido((prev) => (prev ? { ...prev, ...payload.new } : prev));
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [pedido?.id]);

  // Fallback pra convidado: confere a cada 5s se o status mudou (cobre o caso
  // do realtime acima não disparar, já que a RLS restringe a assinatura).
  useEffect(() => {
    if (pedido?.status !== 'aguardando_pagamento' && pedido?.status !== 'aguardando_confirmacao_pagamento') return;
    const t = setInterval(() => {
      buscarPedidoComItens(numeroPedido).then(({ pedido: data }) => {
        if (data) setPedido((prev) => (prev ? { ...prev, ...data } : data));
      });
    }, 5000);
    return () => clearInterval(t);
  }, [numeroPedido, pedido?.status]);

  // Assim que o pagamento é confirmado (ou o pedido segue o fluxo normal), manda pra tela de sucesso
  useEffect(() => {
    if (pedido && pedido.status !== 'aguardando_pagamento' && pedido.status !== 'aguardando_confirmacao_pagamento' && pedido.status !== 'cancelado') {
      navigate(`/pedido/${pedido.numero_pedido}`, { replace: true });
    }
  }, [pedido, navigate]);

  useEffect(() => {
    if (pedido?.status !== 'aguardando_pagamento') return;
    const t = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [pedido?.status]);

  const expiraEm = pedido?.data_expiracao_pagamento ? new Date(pedido.data_expiracao_pagamento).getTime() : null;
  const restante = expiraEm ? expiraEm - agora : null;
  const expirado = restante !== null && restante <= 0;

  // Verificação client-side: se ninguém rodou o job automático, cancela ao abrir/atualizar esta tela
  useEffect(() => {
    if (pedido?.status === 'aguardando_pagamento' && expirado && !jaExpirouRef.current) {
      jaExpirouRef.current = true;
      supabase.from('pedidos').update({ status: 'cancelado' }).eq('id', pedido.id).eq('status', 'aguardando_pagamento')
        .then(() => setPedido((prev) => (prev ? { ...prev, status: 'cancelado' } : prev)));
    }
  }, [expirado, pedido]);

  const handleEnviarComprovante = async () => {
    setEnviando(true);
    const valor = Number(pedido.total);
    const { error } = await supabase
      .from('pedidos')
      .update({ status: 'aguardando_confirmacao_pagamento', comprovante_enviado: true })
      .eq('id', pedido.id)
      .eq('status', 'aguardando_pagamento');
    if (!error) {
      setPedido((prev) => ({ ...prev, status: 'aguardando_confirmacao_pagamento', comprovante_enviado: true }));
    }
    setEnviando(false);
    window.open(waLink(`Olá! Segue comprovante do pedido #${pedido.numero_pedido} no valor de ${formatPrice(valor)}`), '_blank');
  };

  const handleCancelar = async () => {
    if (!window.confirm('Cancelar este pedido?')) return;
    setCancelando(true);
    const { error } = await supabase
      .from('pedidos')
      .update({ status: 'cancelado' })
      .eq('id', pedido.id)
      .eq('status', 'aguardando_pagamento');
    if (!error) setPedido((prev) => ({ ...prev, status: 'cancelado' }));
    setCancelando(false);
  };

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

  if (pedido.status === 'cancelado') {
    return (
      <div className="min-h-screen bg-bg-alt pt-[60px] md:pt-[70px]">
        <div className="container-site max-w-lg py-8">
          <div className="rounded-card border border-rose/30 bg-rose/5 p-6 text-center">
            <h1 className="mb-1 font-heading text-[1.3rem] font-bold text-rose-dark">Pedido cancelado por falta de pagamento</h1>
            <p className="mb-4 text-[0.9rem] text-text-secondary">
              O pedido <span className="font-bold text-text-primary">{pedido.numero_pedido}</span> foi cancelado porque o pagamento não foi identificado a tempo.
            </p>
            <Link to="/" className="inline-block rounded-full bg-rose px-6 py-2.5 text-[0.9rem] font-semibold text-white hover:bg-rose-dark">
              Fazer novo pedido
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (pedido.status === 'aguardando_confirmacao_pagamento') {
    return (
      <div className="min-h-screen bg-bg-alt pt-[60px] md:pt-[70px]">
        <div className="container-site max-w-lg py-8">
          <div className="rounded-card border border-gold/30 bg-gold/10 p-6 text-center">
            <h1 className="mb-1 font-heading text-[1.3rem] font-bold text-text-primary">Comprovante enviado!</h1>
            <p className="mb-1 text-[0.9rem] text-text-secondary">
              Pedido <span className="font-bold text-text-primary">{pedido.numero_pedido}</span> · {formatPrice(pedido.total)}
            </p>
            <p className="text-[0.9rem] text-text-secondary">
              Aguardando a Ale confirmar o pagamento. Assim que ela confirmar, seu pedido entra na fila de preparo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // status === 'aguardando_pagamento'
  return (
    <div className="min-h-screen bg-bg-alt pt-[60px] md:pt-[70px]">
      <div className="container-site max-w-lg py-8">
        <div className="rounded-card border border-gold/40 bg-bg-main p-6 text-center">
          <h1 className="mb-1 font-heading text-[1.3rem] font-bold text-text-primary">Aguardando pagamento</h1>
          <p className="mb-1 text-[0.9rem] text-text-secondary">
            Pedido <span className="font-bold text-text-primary">{pedido.numero_pedido}</span>
          </p>
          <p className="mb-4 text-[1rem] font-bold text-text-primary">Valor: {formatPrice(pedido.total)}</p>

          {restante !== null && (
            <div className="mb-4">
              <p className="text-[0.8rem] text-text-secondary">Tempo restante</p>
              <p className={`font-heading text-[2.2rem] font-bold ${restante < 5 * 60 * 1000 ? 'text-rose-dark' : 'text-text-primary'}`}>
                {formatCountdown(restante)}
              </p>
            </div>
          )}

          <PixQRCode chave={config?.pix_chave} nome={config?.pix_nome} cidade={config?.pix_cidade} valor={Number(pedido.total)} txid={pedido.numero_pedido} size={300} />

          <button
            type="button"
            onClick={handleEnviarComprovante}
            disabled={enviando}
            className="mb-3 mt-5 block w-full rounded-full bg-success py-3 text-center text-[0.95rem] font-bold text-white hover:bg-[#268a41] disabled:opacity-60"
          >
            {enviando ? 'Enviando…' : 'Enviar comprovante pelo WhatsApp'}
          </button>

          <button
            type="button"
            onClick={handleCancelar}
            disabled={cancelando}
            className="text-[0.85rem] font-medium text-text-secondary hover:text-rose-dark disabled:opacity-60"
          >
            Cancelar pedido
          </button>
        </div>
      </div>
    </div>
  );
}
