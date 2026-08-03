import { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import CartPanel from './CartPanel';

// Mesmo breakpoint do `lg:hidden` abaixo: acima disso o drawer fica
// oculto por CSS mas continua montado, então o lock de scroll só pode
// ser aplicado quando ele está de fato visível.
const MOBILE_QUERY = '(max-width: 1023px)';

export default function CartDrawer() {
  const { isOpen, setIsOpen } = useCart();

  useEffect(() => {
    if (!isOpen) return;

    const mql = window.matchMedia(MOBILE_QUERY);
    const applyLock = () => {
      document.body.style.overflow = mql.matches ? 'hidden' : '';
    };
    applyLock();
    mql.addEventListener('change', applyLock);

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      mql.removeEventListener('change', applyLock);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, setIsOpen]);

  return (
    <div className="lg:hidden">
      <div
        className={`fixed inset-0 z-[200] bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed right-0 top-0 z-[201] flex h-dvh w-full max-w-[400px] flex-col bg-bg-main shadow-lg transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex shrink-0 flex-col border-b border-border-light">
          <div className="flex items-center justify-between px-5 pt-3">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                document.getElementById('cardapio')?.focus?.();
              }}
              className="flex items-center gap-1 text-[0.82rem] font-medium text-text-secondary transition-colors hover:text-rose"
            >
              ← Continuar comprando
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fechar carrinho"
              className="text-[1.5rem] leading-none text-text-secondary"
            >
              &times;
            </button>
          </div>
          <h2 className="px-5 pb-3 pt-1 font-heading text-[1.15rem] font-semibold text-text-primary">Seu carrinho</h2>
        </div>
        <CartPanel />
      </aside>
    </div>
  );
}
