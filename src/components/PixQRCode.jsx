import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { gerarPixCopiaECola } from '../lib/pix';

// QR Code + botão de copiar código Pix. Reutilizado no checkout (preview,
// antes do pedido existir) e na tela de confirmação (com o número real do pedido).
export default function PixQRCode({ chave, nome, cidade, valor, txid, size = 260 }) {
  const [copiado, setCopiado] = useState(false);
  const brCode = gerarPixCopiaECola({ chave, nome, cidade, valor, txid });

  if (!brCode) {
    return (
      <p className="text-center text-[0.85rem] text-text-secondary">
        Chave Pix ainda não configurada corretamente. Fale com a gente pelo WhatsApp pra combinar o pagamento.
      </p>
    );
  }

  const copiar = () => {
    navigator.clipboard.writeText(brCode).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className="text-center">
      <div className="mb-4 flex justify-center">
        <QRCodeSVG value={brCode} size={size} />
      </div>
      <p className="mb-2 text-[0.85rem] text-text-secondary">OU copie a chave Pix:</p>
      <div className="mb-3 break-all rounded-card border border-border-light bg-bg-alt px-3 py-2 text-left text-[0.75rem] text-text-secondary">
        {brCode}
      </div>
      <button
        type="button"
        onClick={copiar}
        className="w-full rounded-full border border-rose/40 py-2.5 text-[0.9rem] font-medium text-rose-dark hover:border-rose"
      >
        {copiado ? 'Código copiado!' : 'Copiar código Pix'}
      </button>
    </div>
  );
}
