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
