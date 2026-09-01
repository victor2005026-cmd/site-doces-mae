import { formatPrice } from '../data/products';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { waLink } from '../lib/whatsapp';

export default function ProductDetailModal({ product, onClose }) {
  const { addItem } = useCart();
  const { showToast } = useToast();

  if (!product) return null;

  const handleAdd = () => {
    addItem(product);
    showToast(`${product.name} adicionado à sacola!`, 'success');
    onClose();
  };

  const linkPedidoDireto = waLink(
    `Olá! Gostaria de pedir: 1x ${product.name} — ${formatPrice(product.price)}`
  );

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex max-h-[90vh] w-full max-w-[420px] flex-col overflow-y-auto overscroll-contain rounded-card bg-bg-main shadow-lg">
        <div className="relative h-64 w-full flex-shrink-0 overflow-hidden bg-bg-alt sm:h-72">
          <img src={product.image} alt={product.alt} className="absolute inset-0 h-full w-full object-cover" />
          {product.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-rose px-3 py-1 text-[0.7rem] font-semibold text-white shadow-sm">
              {product.badge}
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-bg-main/90 text-[1.2rem] text-text-primary shadow-sm hover:text-rose"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div>
            <h2 className="font-heading text-[1.2rem] font-semibold text-text-primary">{product.name}</h2>
            <p className="mt-1 text-[0.92rem] text-text-secondary">{product.description}</p>
            {(product.units > 1 || product.grams > 0) && (
              <p className="mt-1 text-[0.85rem] font-semibold text-gold-dark">
                {product.units > 1 ? `Vem ${product.units} unidades` : ''}
                {product.units > 1 && product.grams > 0 ? ' · ' : ''}
                {product.grams > 0 ? `${product.grams}g ${product.units > 1 ? 'cada' : 'por unidade'}` : ''}
              </p>
            )}
          </div>

          <p className="text-[1.3rem] font-bold text-rose">{formatPrice(product.price)}</p>

          <div className="mt-1 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-full bg-rose py-3 text-[0.95rem] font-semibold text-white transition-colors hover:bg-rose-dark"
            >
              Adicionar ao carrinho
            </button>
            <a
              href={linkPedidoDireto}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-success py-3 text-center text-[0.95rem] font-semibold text-success transition-colors hover:bg-success/10"
            >
              Pedir esse pelo WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
