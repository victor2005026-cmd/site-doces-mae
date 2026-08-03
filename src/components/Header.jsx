import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import MobileMenu from './MobileMenu';
import ChangePasswordModal from './ChangePasswordModal';
import AccountMenu from './AccountMenu';
import PromocoesModal from './PromocoesModal';

const CartIcon = (props) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const MenuIcon = (props) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const navLinkClass =
  'rounded-full px-4 py-2 text-[0.9rem] font-medium text-[#4B5563] transition-colors hover:bg-rose/10 hover:text-rose';

export default function Header() {
  const { totalCount, setIsOpen } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [showPromocoes, setShowPromocoes] = useState(false);
  const [bump, setBump] = useState(false);
  const prevCount = useRef(totalCount);

  useEffect(() => {
    if (totalCount > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 400);
      prevCount.current = totalCount;
      return () => clearTimeout(t);
    }
    prevCount.current = totalCount;
  }, [totalCount]);

  const handlePedidosClick = () => {
    if (user) navigate('/meus-pedidos');
    else setShowAuth(true);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[100] h-[60px] bg-white shadow md:h-[70px]">
        <div className="container-site flex h-full items-center justify-between gap-2 px-4 md:px-6">
          <button
            type="button"
            onClick={() => setShowMobileMenu(true)}
            aria-label="Abrir menu"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center text-text-primary md:hidden"
          >
            <MenuIcon />
          </button>

          <Link
            to="/"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-script text-[1.5rem] leading-none text-gold md:static md:left-auto md:top-auto md:translate-x-0 md:translate-y-0 md:text-[1.8rem]"
          >
            Doces da Ale
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-border-light bg-bg-alt/60 p-1 md:flex">
            <Link to="/#topo" className={navLinkClass}>Início</Link>
            <button type="button" onClick={() => setShowPromocoes(true)} className={navLinkClass}>Promoções</button>
            <button type="button" onClick={handlePedidosClick} className={navLinkClass}>Pedidos</button>
          </nav>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="md:hidden">
              <AccountMenu compact onOpenAuth={() => setShowAuth(true)} onOpenChangePassword={() => setShowChangePw(true)} />
            </div>
            <div className="hidden md:block">
              <AccountMenu onOpenAuth={() => setShowAuth(true)} onOpenChangePassword={() => setShowChangePw(true)} />
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Abrir carrinho"
              className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-bg-alt text-text-primary transition-colors hover:bg-rose/20 lg:hidden"
            >
              <CartIcon width="24" height="24" />
              {totalCount > 0 && (
                <span
                  className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose px-1 text-[0.7rem] font-bold text-white ${bump ? 'animate-bump' : ''}`}
                >
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
        onOpenAuth={() => setShowAuth(true)}
        onOpenPromocoes={() => setShowPromocoes(true)}
      />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
      <ChangePasswordModal isOpen={showChangePw} onClose={() => setShowChangePw(false)} />
      <PromocoesModal isOpen={showPromocoes} onClose={() => setShowPromocoes(false)} />
    </>
  );
}
