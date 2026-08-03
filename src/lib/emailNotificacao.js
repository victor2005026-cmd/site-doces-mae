import emailjs from '@emailjs/browser';
import { formatPrice } from '../data/products';

// Notifica a Ale por e-mail quando um pedido novo é criado, usando EmailJS
// (mandado direto do navegador do cliente — não precisa de backend). Nunca
// deve travar o checkout: qualquer erro aqui é só registrado no console.
export async function notificarPedidoNovoPorEmail(config, pedido, itens) {
  if (!config?.notif_email_ativo) return;
  if (!config?.notif_email_destino || !config?.emailjs_service_id || !config?.emailjs_template_id || !config?.emailjs_public_key) {
    console.warn('Notificação por e-mail ativada, mas faltam dados de configuração (EmailJS).');
    return;
  }

  const listaItens = (itens ?? [])
    .map((i) => `${i.quantidade}x ${i.nome_produto} — ${formatPrice(i.preco_unitario * i.quantidade)}`)
    .join('\n');

  const templateParams = {
    to_email: config.notif_email_destino,
    numero_pedido: pedido.numero_pedido,
    total: formatPrice(pedido.total),
    cliente: pedido.dados_convidado?.nome ?? 'Cliente com conta',
    telefone: pedido.dados_convidado?.telefone ?? '',
    tipo_entrega: pedido.tipo_entrega === 'entrega' ? 'Entrega' : 'Retirada no local',
    data_agendada: pedido.data_agendada,
    itens: listaItens,
  };

  try {
    await emailjs.send(config.emailjs_service_id, config.emailjs_template_id, templateParams, {
      publicKey: config.emailjs_public_key,
    });
  } catch (err) {
    console.error('Erro ao enviar e-mail de notificação de pedido novo:', err);
  }
}
