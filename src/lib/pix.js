import { createStaticPix, hasError } from 'pix-utils';

// Gera o payload "Pix Copia e Cola" (BR Code) para o valor do pedido.
export function gerarPixCopiaECola({ chave, nome, cidade, valor, txid }) {
  if (!chave || !valor) return null;

  const pix = createStaticPix({
    merchantName: (nome || 'Doces da Ale').slice(0, 25),
    merchantCity: (cidade || 'Santos').slice(0, 15),
    pixKey: chave,
    infoAdicional: 'Pedido Doces da Ale',
    transactionAmount: Number(valor.toFixed(2)),
    txid: (txid || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || undefined,
  });

  if (hasError(pix)) return null;
  return pix.toBRCode();
}
