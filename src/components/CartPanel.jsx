import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../data/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { encontrarPromocaoDoProduto } from '../lib/promocoes';

function CartItemRow({ item, promocoesBundle, onIncrement, onDecrement, onRemove }) {
  const promo = encontrarPromocaoDoProduto(item.id, promocoesBundle);
  const promoAtiva = promo && item.quantity >= promo.quantidade;

  return (
    <li className="flex items-center gap-3">
      <img src={item.image} alt={item.alt} className="h-16 w-16 flex-shrink-0 rounded-card object-cover" />
      <div className="flex-1">
        <p className="text-[0.95rem] font-medium text-text-primary">{item.name}</p>
        <p className="text-[0.85rem] text-text-secondary">{formatPrice(item.price)}</p>
        {promoAtiva ? (
          <p className="mt-0.5 text-[0.78rem] font-semibold text-success">
            Promoção aplicada: leve {promo.quantidade} por {formatPrice(promo.preco_promocional)}
          </p>
        ) : promo && (
          <p className="mt-0.5 text-[0.78rem] text-rose">
            Leve {promo.quantidade} por {formatPrice(promo.preco_promocional)} — falta{promo.quantidade - item.quantity > 1 ? 'm' : ''} {promo.quantidade - item.quantity}
          </p>
        )}
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
  const {
    items, incrementItem, decrementItem, removeItem, subtotal, checkoutLink,
    coupon, couponError, applyingCoupon, applyCoupon, removeCoupon,
    promocoesBundle, economiaPromocoes,
  } = useCart();
  const { perfil } = useAuth();
  const { showToast } = useToast();
  const [showDelivery, setShowDelivery] = useState(false);
  const [couponInput, setCouponInput] = useState('');

  const total = subtotal - (coupon?.desconto ?? 0);

  useEffect(() => {
    if (coupon) showToast(`Cupom ${coupon.codigo} aplicado com sucesso!`, 'success');
  }, [coupon]); // eslint-disable-line

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    applyCoupon(couponInput, perfil?.telefone);
  };

  const handleRemove = (item) => {
    removeItem(item.id);
    showToast(`${item.name} removido da sacola.`, 'info');
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <button
        type="button"
        onClick={() => setShowDelivery((v) => !v)}
        className="flex shrink-0 items-center justify-between gap-2 border-b border-border-light px-5 py-3.5 text-left text-[0.9rem] font-medium text-text-primary"
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
        <p className="shrink-0 border-b border-border-light bg-bg-alt px-5 py-3 text-[0.82rem] text-text-secondary">
          Calculamos a taxa e o prazo certinhos direto no WhatsApp, ao confirmar seu pedido.
        </p>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {items.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-2 text-center text-text-secondary">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <p className="font-medium text-text-primary">Seu carrinho está vazio</p>
            <p className="text-[0.85rem]">Adicione produtos do cardápio pra começar seu pedido.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                promocoesBundle={promocoesBundle}
                onIncrement={() => incrementItem(item.id)}
                onDecrement={() => decrementItem(item.id)}
                onRemove={() => handleRemove(item)}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="shrink-0 border-t border-border-light bg-bg-main px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        {coupon ? (
          <div className="mb-4 flex items-center justify-between rounded-card bg-success/10 px-3 py-2">
            <span className="text-[0.85rem] font-medium text-success">
              Cupom {coupon.codigo} aplicado
            </span>
            <button type="button" onClick={removeCoupon} className="text-[0.8rem] font-medium text-text-secondary hover:text-rose">
              Remover
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className="mb-4 flex items-center gap-2">
            <span className="text-text-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.59 13.41 13.41 20.6a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" />
                <circle cx="7" cy="7" r="1" />
              </svg>
            </span>
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Tem um cupom?"
              aria-label="Código do cupom"
              className="flex-1 border-b border-border-light bg-transparent py-1 text-[0.85rem] text-text-primary placeholder:text-text-secondary focus:border-rose focus:outline-none"
            />
            <button type="submit" disabled={applyingCoupon} className="text-[0.85rem] font-medium text-rose disabled:opacity-60">
              {applyingCoupon ? 'Validando…' : 'Aplicar'}
            </button>
          </form>
        )}
        {couponError && <p className="mb-3 text-[0.8rem] text-rose-dark">{couponError}</p>}

        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-[0.95rem] text-text-secondary">Subtotal</span>
            <span className={`text-[1.15rem] font-bold ${coupon ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
              {formatPrice(subtotal)}
            </span>
          </div>
          {economiaPromocoes > 0 && (
            <div className="mt-1 flex items-center justify-between text-[0.85rem] text-success">
              <span>Você economizou com promoções</span>
              <span>-{formatPrice(economiaPromocoes)}</span>
            </div>
          )}
          {coupon && (
            <div className="mt-1 flex items-center justify-between text-[0.9rem] text-success">
              <span>Desconto (cupom {coupon.codigo})</span>
              <span>-{formatPrice(coupon.desconto)}</span>
            </div>
          )}
          {coupon && (
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[0.95rem] text-text-secondary">Total</span>
              <span className="text-[1.15rem] font-bold text-text-primary">{formatPrice(total)}</span>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <span className="flex w-full items-center justify-center rounded-full bg-bg-alt px-6 py-3 text-[0.95rem] font-semibold text-text-secondary">
            Sacola vazia
          </span>
        ) : (
          <div className="flex flex-col gap-2">
            <Link
              to="/checkout"
              className="flex w-full items-center justify-center rounded-full bg-rose px-6 py-3 text-[0.95rem] font-semibold text-white transition-colors hover:bg-rose-dark"
            >
              Fazer pedido
            </Link>
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
