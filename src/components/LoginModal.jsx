const COPY = {
  login: {
    title: 'Entrar ou criar conta',
    text: 'Login de cliente chegando em breve! Por enquanto, finalize seus pedidos direto pelo WhatsApp — é rápido e ninguém precisa criar senha.',
  },
  pedidos: {
    title: 'Meus pedidos',
    text: 'O histórico de pedidos chegará junto com o login de cliente. Por enquanto, guarde a conversa do WhatsApp — é por lá que confirmamos tudo.',
  },
};

export default function LoginModal({ mode, onClose }) {
  if (!mode) return null;
  const { title, text } = COPY[mode];

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[360px] rounded-card bg-bg-main p-6 shadow-lg">
        <h2 className="mb-2 font-heading text-[1.1rem] font-semibold text-text-primary">{title}</h2>
        <p className="text-[0.9rem] text-text-secondary">{text}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-rose px-5 py-2.5 text-[0.9rem] font-semibold text-white transition-colors hover:bg-rose-dark"
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
