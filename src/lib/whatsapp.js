// TODO: substituir pelo número real do WhatsApp da loja (com DDI 55 + DDD + número)
export const WHATSAPP_NUMBER = '5513999999999';

export function waLink(message = 'Olá! Gostaria de mais informações sobre os doces.') {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
