import { formatPrice } from '../data/products';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function ProductCard({ product, onOpenDetail }) {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const handleAdd = (e) => {
    e.stopPropagation();
    addItem(product);
    showToast(`${product.name} adicionado à sacola!`, 'success');
  };

  return (
    <article
      onClick={() => onOpenDetail?.(product)}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-card border border-border-light bg-bg-main transition-shadow duration-200 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-bg-alt">
        <img
          src={product.image}
          alt={product.alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-rose px-3 py-1 text-[0.7rem] font-semibold text-white shadow-sm">
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="font-heading text-[0.95rem] font-semibold text-text-primary sm:text-[1.05rem]">{product.name}</h3>
        <p className="mt-1 line-clamp-1 text-[0.8rem] text-text-secondary sm:text-[0.85rem]">{product.description}</p>
        {product.units > 1 && (
          <p className="mt-0.5 text-[0.75rem] font-medium text-gold-dark">Vem {product.units} unidades</p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[0.95rem] font-bold text-text-primary sm:text-[1.05rem]">{formatPrice(product.price)}</span>
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Adicionar ${product.name} ao carrinho`}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-rose text-white shadow-sm transition-transform hover:scale-110 hover:bg-rose-dark sm:h-9 sm:w-9"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
