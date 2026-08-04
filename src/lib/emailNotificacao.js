import emailjs from '@emailjs/browser';
import { formatPrice } from '../data/products';

// Notifica a Ale por e-mail quando um pedido novo é criado, usando EmailJS
// (mandado direto do navegador do cliente — não precisa de backend). Nunca
// deve travar o checkout: qualquer erro aqui é só registrado no console.
export async function notificarPedidoNovoPorEmail(config, pedido, itens) {
  if (!config?.notif_email_ativo) return { enviado: false, motivo: 'desativado' };
  if (!config?.notif_email_destino || !config?.emailjs_service_id || !config?.emailjs_template_id || !config?.emailjs_public_key) {
    console.warn('Notificação por e-mail ativada, mas faltam dados de configuração (EmailJS).');
    return { enviado: false, motivo: 'incompleto' };
  }

  const listaItens = (itens ?? [])
    .map((i) => `${i.quantidade}x ${i.nome_produto} — ${formatPrice(i.preco_unitario * i.quantidade)}`)
    .join('\n');

  const templateParams = {
    // Nomes atuais usados pelo site.
    to_email: config.notif_email_destino,
    numero_pedido: pedido.numero_pedido,
    total: formatPrice(pedido.total),
    cliente: pedido.dados_convidado?.nome ?? 'Cliente com conta',
    telefone: pedido.dados_convidado?.telefone ?? '',
    tipo_entrega: pedido.tipo_entrega === 'entrega' ? 'Entrega' : 'Retirada no local',
    data_agendada: pedido.data_agendada,
    itens: listaItens,
    // Compatibilidade com o modelo EmailJS que já foi criado no painel.
    email_destino: config.notif_email_destino,
    order_id: pedido.numero_pedido,
    nome_cliente: pedido.dados_convidado?.nome ?? 'Cliente com conta',
    telefone_cliente: pedido.dados_convidado?.telefone ?? '',
    endereco: pedido.tipo_entrega === 'entrega' ? 'Entrega em endereço informado no pedido' : 'Retirada no local',
    forma_pagamento: 'Pix',
  };

  try {
    await emailjs.send(config.emailjs_service_id, config.emailjs_template_id, templateParams, {
      publicKey: config.emailjs_public_key,
    });
    return { enviado: true };
  } catch (err) {
    console.error('Erro ao enviar e-mail de notificação de pedido novo:', err);
    return { enviado: false, motivo: 'erro', erro: err };
  }
}

// Usado somente no Admin para conferir Service ID, Template ID, chave pública
// e o destinatário sem precisar criar um pedido real.
export function enviarEmailTeste(config) {
  return notificarPedidoNovoPorEmail(config, {
    numero_pedido: 'TESTE-EMAIL',
    total: 0,
    tipo_entrega: 'retirada',
    data_agendada: new Date().toISOString().slice(0, 10),
    dados_convidado: { nome: 'Teste do Admin', telefone: '' },
  }, [{ quantidade: 1, nome_produto: 'Mensagem de teste', preco_unitario: 0 }]);
}
