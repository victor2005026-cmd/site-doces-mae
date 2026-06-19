import { useEffect, useState } from 'react';
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
          scrolled ? 'bg-[rgba(31,17,9,0.92)] backdrop-blur-md shadow-sm py-[10px]' : 'py-4'
        }`}
      >
        <div className="max-w-site mx-auto flex items-center justify-between gap-5 px-6">
          <a
            href="#hero"
            className="flex items-center gap-2.5 transition-colors duration-300"
            aria-label="Doces da Ale - Início"
          >
            <span className="relative h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 overflow-hidden rounded-full">
              <img src="/images/logo-icon.png" alt="Doces da Ale" className="h-full w-full object-cover" />
            </span>
            <span className="font-script text-[1.9rem] leading-none text-gold">Doces da Ale</span>
          </a>

          <nav className="hidden min-[992px]:flex items-center gap-5" aria-label="Navegação principal">
            {NAV_LINKS.map((link, index) => (
              <span key={link.href} className="flex items-center gap-5">
                <a
                  href={link.href}
                  className="group relative py-1.5 text-[0.95rem] font-bold text-white transition-colors duration-300 hover:text-gold"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gold transition-all duration-300 group-hover:w-full" />
                </a>
                {index < NAV_LINKS.length - 1 && <span aria-hidden="true" className="h-4 w-px bg-white/40" />}
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
            <span className="block h-[2px] w-full bg-white" />
            <span className="block h-[2px] w-full bg-white" />
            <span className="block h-[2px] w-full bg-white" />
          </button>
        </div>
      </header>

      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} links={NAV_LINKS} />
    </>
  );
}
