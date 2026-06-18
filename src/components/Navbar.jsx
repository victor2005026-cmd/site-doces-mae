import { useEffect, useState } from 'react';
import BrigadeiroIcon from './icons/BrigadeiroIcon';
import MobileSidebar from './MobileSidebar';
import Button from './Button';
import { waLink } from '../lib/whatsapp';

const NAV_LINKS = [
  { href: '#hero', label: 'Início' },
  { href: '#cardapio', label: 'Cardápio' },
  { href: '#depoimentos', label: 'Depoimentos' },
  { href: '#contato', label: 'Contato' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
  }, [sidebarOpen]);

  return (
    <>
      <header
        id="navbar"
        className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
          scrolled ? 'bg-[rgba(253,248,240,0.85)] backdrop-blur-md shadow-sm py-[10px]' : 'py-4'
        }`}
      >
        <div className="max-w-site mx-auto flex items-center justify-between gap-5 px-6">
          <a
            href="#hero"
            className="flex items-center gap-2.5 transition-colors duration-300"
            aria-label="Doces da Ale - Início"
          >
            <span className="relative h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 overflow-hidden rounded-full shadow-sm">
              <BrigadeiroIcon className="h-full w-full" />
            </span>
            <span
              className={`font-script text-[1.9rem] leading-none transition-colors duration-300 ${
                scrolled ? 'text-gold-dark' : 'text-white'
              }`}
            >
              Doces da Ale
            </span>
          </a>

          <nav className="hidden min-[992px]:flex items-center gap-5" aria-label="Navegação principal">
            {NAV_LINKS.map((link, index) => (
              <span key={link.href} className="flex items-center gap-5">
                <a
                  href={link.href}
                  className={`group relative py-1.5 text-[0.95rem] font-bold transition-colors duration-300 hover:text-gold ${
                    scrolled ? 'text-text-secondary' : 'text-white'
                  }`}
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gold transition-all duration-300 group-hover:w-full" />
                </a>
                {index < NAV_LINKS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className={`h-4 w-px ${scrolled ? 'bg-text-secondary/30' : 'bg-white/40'}`}
                  />
                )}
              </span>
            ))}
          </nav>

          <Button
            href={waLink('Olá! Gostaria de fazer uma encomenda na Doces da Ale 🍫')}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden min-[992px]:inline-block whitespace-nowrap"
          >
            Encomendar
          </Button>

          <button
            id="hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={sidebarOpen}
            aria-controls="mobile-sidebar"
            className="flex min-[992px]:hidden h-6 w-[30px] flex-col justify-center gap-1.5"
          >
            <span className={`block h-[2px] w-full transition-colors duration-300 ${scrolled ? 'bg-text-primary' : 'bg-white'}`} />
            <span className={`block h-[2px] w-full transition-colors duration-300 ${scrolled ? 'bg-text-primary' : 'bg-white'}`} />
            <span className={`block h-[2px] w-full transition-colors duration-300 ${scrolled ? 'bg-text-primary' : 'bg-white'}`} />
          </button>
        </div>
      </header>

      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} links={NAV_LINKS} />
    </>
  );
}
