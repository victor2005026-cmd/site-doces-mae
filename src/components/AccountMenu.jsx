import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserIcon = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PackageIcon = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M21 8 12 3 3 8l9 5 9-5Z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
);

const LockIcon = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ExitIcon = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

const itemClass = 'flex items-center gap-2.5 px-4 py-2.5 text-[0.85rem] text-text-primary hover:bg-bg-alt hover:text-rose';

export default function AccountMenu({ compact = false, onOpenAuth, onOpenChangePassword }) {
  const { user, primeiroNome, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  if (!user) {
    return (
      <button
        type="button"
        onClick={onOpenAuth}
        aria-label="Entrar"
        className={
          compact
            ? 'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-text-primary hover:bg-bg-alt'
            : 'hidden items-center gap-1.5 rounded-full border border-border-light px-4 py-2 text-[0.85rem] font-medium text-text-primary transition-colors hover:border-rose hover:text-rose md:flex'
        }
      >
        <UserIcon />
        {!compact && 'Entrar'}
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={compact ? 'Minha conta' : undefined}
        aria-expanded={open}
        className={
          compact
            ? 'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-text-primary hover:bg-bg-alt'
            : 'flex items-center gap-1.5 rounded-full border border-border-light px-4 py-2 text-[0.85rem] font-medium text-text-primary transition-colors hover:border-rose hover:text-rose'
        }
      >
        <UserIcon />
        {!compact && `Olá, ${primeiroNome}`}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-card border border-border-light bg-bg-main py-1 shadow-md">
            <Link to="/perfil" onClick={() => setOpen(false)} className={itemClass}>
              <UserIcon className="flex-shrink-0 text-text-secondary" /> Meu perfil
            </Link>
            <Link to="/meus-pedidos" onClick={() => setOpen(false)} className={itemClass}>
              <PackageIcon className="flex-shrink-0 text-text-secondary" /> Meus pedidos
            </Link>
            <button
              type="button"
              onClick={() => { setOpen(false); onOpenChangePassword(); }}
              className={`w-full text-left ${itemClass}`}
            >
              <LockIcon className="flex-shrink-0 text-text-secondary" /> Trocar senha
            </button>
            <div className="my-1 border-t border-border-light" />
            <button
              type="button"
              onClick={() => { logout(); setOpen(false); }}
              className={`w-full text-left ${itemClass} hover:text-rose-dark`}
            >
              <ExitIcon className="flex-shrink-0 text-text-secondary" /> Sair
            </button>
          </div>
        </>
      )}
    </div>
  );
}
