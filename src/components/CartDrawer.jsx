import { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import CartPanel from './CartPanel';

export default function CartDrawer() {
  const { isOpen, setIsOpen } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
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
        className={`fixed right-0 top-0 z-[201] flex h-full w-full max-w-[400px] flex-col bg-bg-main shadow-lg transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-border-light px-5 py-4">
          <h2 className="font-heading text-[1.15rem] font-semibold text-text-primary">Seu carrinho</h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Fechar carrinho"
            className="text-[1.5rem] leading-none text-text-secondary"
          >
            &times;
          </button>
        </div>
        <CartPanel />
      </aside>
    </div>
  );
}
