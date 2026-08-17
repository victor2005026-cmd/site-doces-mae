import { supabase } from './supabase';

// Busca um pedido pelo número, funcionando tanto pra quem está logado (select
// direto, protegido pela RLS via usuario_id) quanto pra convidado (a RLS não
// deixa mais listar pedidos de convidado direto da tabela — passa pela RPC
// obter_pedido_convidado, que só devolve o pedido exato pedido por número).
export async function buscarPedidoComItens(numeroPedido) {
  const { data: pedido } = await supabase.from('pedidos').select('*').eq('numero_pedido', numeroPedido).maybeSingle();
  if (pedido) {
    const { data: itens } = await supabase.from('itens_pedido').select('*').eq('pedido_id', pedido.id);
    return { pedido, itens: itens ?? [] };
  }

  const { data: viaConvidado } = await supabase.rpc('obter_pedido_convidado', { p_numero_pedido: numeroPedido });
  if (viaConvidado?.pedido) {
    return { pedido: viaConvidado.pedido, itens: viaConvidado.itens ?? [] };
  }

  return { pedido: null, itens: [] };
}
