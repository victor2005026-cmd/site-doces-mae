import { supabase } from './supabase';

// A chave do CallMeBot fica exclusivamente nos Secrets da Edge Function.
// O navegador envia apenas o id do pedido já criado.
export async function notificarPedidoNovoPorWhatsApp(pedidoId) {
  const { data, error } = await supabase.functions.invoke('notificar-pedido-whatsapp', {
    body: { pedido_id: pedidoId },
  });

  if (error) {
    console.error('Erro ao enviar notificação de WhatsApp:', error);
    return { enviado: false, motivo: 'erro', erro: error };
  }
  return data ?? { enviado: false, motivo: 'sem-resposta' };
}

// Segundo aviso por WhatsApp: dispara quando você confirma no admin que o
// Pix caiu no banco ("Confirmar pagamento"), separado do aviso de pedido
// novo. Mesma chave do CallMeBot, edge function separada.
export async function notificarPagamentoConfirmadoPorWhatsApp(pedidoId) {
  const { data, error } = await supabase.functions.invoke('notificar-pagamento-confirmado-whatsapp', {
    body: { pedido_id: pedidoId },
  });

  if (error) {
    console.error('Erro ao enviar notificação de pagamento confirmado por WhatsApp:', error);
    return { enviado: false, motivo: 'erro', erro: error };
  }
  return data ?? { enviado: false, motivo: 'sem-resposta' };
}
