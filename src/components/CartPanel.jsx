import { useState } from 'react';
import { formatPrice } from '../data/products';
import { useCart } from '../context/CartContext';
import { useImageSrc } from '../context/ImageOverridesContext';

function CartItemRow({ item, onIncrement, onDecrement, onRemove }) {
  const imageSrc = useImageSrc(item.id, item.image);

  return (
    <li className="flex items-center gap-3">
      <img src={imageSrc} alt={item.alt} className="h-16 w-16 flex-shrink-0 rounded-card object-cover" />
      <div className="flex-1">
        <p className="text-[0.95rem] font-medium text-text-primary">{item.name}</p>
        <p className="text-[0.85rem] text-text-secondary">{formatPrice(item.price)}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDecrement}
          aria-label={`Remover uma unidade de ${item.name}`}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border-light text-text-primary"
        >
          −
        </button>
        <span className="w-5 text-center text-[0.9rem]">{item.quantity}</span>
        <button
          type="button"
          onClick={onIncrement}
          aria-label={`Adicionar uma unidade de ${item.name}`}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-border-light text-text-primary"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remover ${item.name} do carrinho`}
        className="ml-1 text-text-secondary hover:text-rose"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
        </svg>
      </button>
    </li>
  );
}

export default function CartPanel() {
  const { items, incrementItem, decrementItem, removeItem, subtotal, checkoutLink } = useCart();
  const [showDelivery, setShowDelivery] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [couponMessage, setCouponMessage] = useState('');

  const applyCoupon = (e) => {
    e.preventDefault();
    if (!coupon.trim()) return;
    setCouponMessage('Cupons chegam em breve! Por enquanto, todo desconto é combinado direto no WhatsApp.');
  };

  return (
    <div className="flex h-full flex-col">
      <button
        type="button"
        onClick={() => setShowDelivery((v) => !v)}
        className="flex items-center justify-between gap-2 border-b border-border-light px-5 py-3.5 text-left text-[0.9rem] font-medium text-text-primary"
      >
        <span className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 1 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Calcular taxa e tempo de entrega
        </span>
        <span>{showDelivery ? '−' : '›'}</span>
      </button>
      {showDelivery && (
        <p className="border-b border-border-light bg-bg-alt px-5 py-3 text-[0.82rem] text-text-secondary">
          Calculamos a taxa e o prazo certinhos direto no WhatsApp, ao confirmar seu pedido.
        </p>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {items.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-2 text-center text-text-secondary">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <p>Sacola vazia</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onIncrement={() => incrementItem(item.id)}
                onDecrement={() => decrementItem(item.id)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-border-light px-5 py-4">
        <form onSubmit={applyCoupon} className="mb-4 flex items-center gap-2">
          <span className="text-text-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41 13.41 20.6a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" />
              <circle cx="7" cy="7" r="1" />
            </svg>
          </span>
          <input
            type="text"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="Tem um cupom?"
            aria-label="Código do cupom"
            className="flex-1 border-b border-border-light bg-transparent py-1 text-[0.85rem] text-text-primary placeholder:text-text-secondary focus:border-rose focus:outline-none"
          />
          <button type="submit" className="text-[0.85rem] font-medium text-rose">
            Aplicar
          </button>
        </form>
        {couponMessage && <p className="mb-3 text-[0.8rem] text-text-secondary">{couponMessage}</p>}

        <div className="mb-4 flex items-center justify-between">
          <span className="text-[0.95rem] text-text-secondary">Subtotal</span>
          <span className="text-[1.15rem] font-bold text-text-primary">{formatPrice(subtotal)}</span>
        </div>

        {items.length === 0 ? (
          <span className="flex w-full items-center justify-center rounded-full bg-bg-alt px-6 py-3 text-[0.95rem] font-semibold text-text-secondary">
            Sacola vazia
          </span>
        ) : (
          <div className="flex flex-col gap-2">
            <a
              href="/checkout"
              className="flex w-full items-center justify-center rounded-full bg-rose px-6 py-3 text-[0.95rem] font-semibold text-white transition-colors hover:bg-rose-dark"
            >
              Fazer pedido
            </a>
            <a
              href={checkoutLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-1.5 rounded-full border border-success/40 px-6 py-2.5 text-[0.85rem] font-medium text-success transition-colors hover:border-success"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.4-.1-.6.1-.2.3-.6 1-.8 1.2-.1.2-.3.2-.5.1-1.3-.6-2.2-1.1-3.1-2.6-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5-.1-.1-.5-1.3-.7-1.7-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1 0 1.3 1 2.5 1.1 2.7.1.2 1.8 2.8 4.4 3.8 2.2.9 2.6.7 3.1.6.5 0 1.6-.6 1.8-1.3.2-.6.2-1.2.1-1.3-.1-.1-.3-.1-.6-.2z" />
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l4.9-1.3A10 10 0 1 0 12 2z" fillRule="evenodd" />
              </svg>
              Enviar pelo WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
