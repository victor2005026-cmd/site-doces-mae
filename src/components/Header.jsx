import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import { waLink } from '../lib/whatsapp';

const NAV_LINKS = [
  { label: 'Início', href: '#topo' },
  { label: 'Promoções', href: '#destaques' },
];

export default function Header() {
  const { totalCount, setIsOpen } = useCart();
  const { user, primeiroNome, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[100] bg-bg-main shadow-sm">
        <div className="container-site flex items-center justify-between gap-4 py-3">
          <a href="/" className="font-script text-[1.8rem] leading-none text-gold">
            Doces da Ale
          </a>

          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[0.9rem] font-medium text-text-primary transition-colors hover:text-rose"
              >
                {link.label}
              </a>
            ))}
            <a
              href={waLink('Olá! Gostaria de verificar o status do meu pedido')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.9rem] font-medium text-text-primary transition-colors hover:text-rose"
            >
              Pedidos
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Auth */}
            {user ? (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setShowDropdown((v) => !v)}
                  className="flex items-center gap-1.5 rounded-full border border-border-light px-4 py-2 text-[0.85rem] font-medium text-text-primary transition-colors hover:border-rose hover:text-rose"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Olá, {primeiroNome}
                </button>
                {showDropdown && (
                  <div
                    className="absolute right-0 top-full z-50 mt-1 w-44 rounded-card border border-border-light bg-bg-main shadow-md"
                    onMouseLeave={() => setShowDropdown(false)}
                  >
                    <a href="/meus-pedidos" className="block px-4 py-2.5 text-[0.85rem] text-text-primary hover:text-rose">Meus pedidos</a>
                    <button
                      type="button"
                      onClick={() => { logout(); setShowDropdown(false); }}
                      className="block w-full px-4 py-2.5 text-left text-[0.85rem] text-text-secondary hover:text-rose"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuth(true)}
                className="hidden items-center gap-1.5 rounded-full border border-border-light px-4 py-2 text-[0.85rem] font-medium text-text-primary transition-colors hover:border-rose hover:text-rose sm:flex"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Entrar
              </button>
            )}

            {/* Carrinho */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              aria-label="Abrir carrinho"
              className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-bg-alt text-text-primary transition-colors hover:bg-rose/20 lg:hidden"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {totalCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose px-1 text-[0.7rem] font-bold text-white">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
