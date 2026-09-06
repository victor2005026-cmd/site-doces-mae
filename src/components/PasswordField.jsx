import { useState } from 'react';

const EyeIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a13.16 13.16 0 0 1-3.11 3.83" />
    <path d="M6.11 6.11A13.16 13.16 0 0 0 1 12s4 7 11 7a10.94 10.94 0 0 0 5.11-1.19" />
    <path d="M1 1l22 22" />
  </svg>
);

// Campo de senha com botão de "olhinho" pra alternar entre oculta e visível,
// no padrão Mercado Livre/Amazon. Recebe as mesmas props de um <input> normal
// (id, value, onChange, autoComplete, required, className com os estilos do
// campo…) e cuida só do type e do botão — o wrapper herda a largura do input.
export default function PasswordField({ className = '', ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`${className} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary transition-colors hover:text-rose"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}
