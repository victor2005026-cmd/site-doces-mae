import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MobileMenu({ isOpen, onClose, onOpenAuth, onOpenPromocoes }) {
  const { user, primeiroNome, logout } = useAuth();

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  const handlePedidosClick = () => {
    onClose();
    if (!user) onOpenAuth();
  };

  const linkClass = 'rounded-card px-4 py-3 text-[1rem] font-medium text-text-primary transition-colors hover:bg-bg-alt hover:text-rose';

  return (
    <div className="md:hidden">
      <div
        className={`fixed inset-0 z-[250] bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 z-[251] flex h-dvh w-[80%] max-w-[300px] flex-col bg-bg-main shadow-lg transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border-light px-5 py-4">
          <span className="font-script text-[1.4rem] leading-none text-gold">Doces da Ale</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="text-[1.5rem] leading-none text-text-secondary"
          >
            &times;
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-3">
          <Link to="/#topo" onClick={onClose} className={linkClass}>Início</Link>
          <button type="button" onClick={() => { onClose(); onOpenPromocoes(); }} className={`text-left ${linkClass}`}>Promoções</button>
          {user ? (
            <Link to="/meus-pedidos" onClick={onClose} className={linkClass}>Meus Pedidos</Link>
          ) : (
            <button type="button" onClick={handlePedidosClick} className={`text-left ${linkClass}`}>Meus Pedidos</button>
          )}

          <div className="my-2 border-t border-border-light" />

          {user ? (
            <button
              type="button"
              onClick={() => { logout(); onClose(); }}
              className="rounded-card px-4 py-3 text-left text-[1rem] font-medium text-rose-dark transition-colors hover:bg-bg-alt"
            >
              Sair{primeiroNome ? ` (${primeiroNome})` : ''}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { onClose(); onOpenAuth(); }}
              className="rounded-card px-4 py-3 text-left text-[1rem] font-medium text-rose transition-colors hover:bg-bg-alt"
            >
              Entrar
            </button>
          )}
        </nav>
      </aside>
    </div>
  );
}
