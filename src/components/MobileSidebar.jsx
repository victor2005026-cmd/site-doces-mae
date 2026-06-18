import { waLink } from '../lib/whatsapp';

export default function MobileSidebar({ isOpen, onClose, links }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-[1100] bg-[rgba(60,36,21,0.55)] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        id="mobile-sidebar"
        aria-label="Menu mobile"
        className={`fixed top-0 right-0 h-full w-[min(320px,80vw)] bg-bg-main z-[1200] px-8 pt-20 pb-8 shadow-lg transition-transform duration-[400ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          onClick={onClose}
          aria-label="Fechar menu"
          className="absolute top-6 right-6 text-[2rem] leading-none text-text-primary"
        >
          &times;
        </button>
        <nav className="flex flex-col gap-[26px]" aria-label="Navegação mobile">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="font-title text-[1.2rem] font-semibold text-text-primary"
            >
              {link.label}
            </a>
          ))}
          <a
            href={waLink('Olá! Gostaria de fazer uma encomenda na Doces da Ale 🍫')}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="inline-block rounded-full bg-gold px-[30px] py-[14px] text-center text-[0.95rem] font-bold tracking-[0.3px] text-text-primary shadow-sm transition-all hover:-translate-y-[3px] hover:bg-gold-dark hover:shadow-md"
          >
            Encomendar
          </a>
        </nav>
      </aside>
    </>
  );
}
