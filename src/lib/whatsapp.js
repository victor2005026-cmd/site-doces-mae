export const WHATSAPP_NUMBER = '5513991767497';

export function waLink(message = 'Olá! Gostaria de mais informações sobre os doces.') {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
