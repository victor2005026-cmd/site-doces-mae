import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFoundPage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-alt px-4 pt-[60px] text-center md:pt-[70px]">
      <span className="text-[4rem] leading-none" role="img" aria-label="Brigadeiro triste">🍫😢</span>
      <h1 className="font-heading text-[1.5rem] font-bold text-text-primary">Ops! Página não encontrada</h1>
      <p className="max-w-xs text-[0.9rem] text-text-secondary">Parece que este doce não existe no cardápio.</p>

      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/"
          className="rounded-full bg-rose px-6 py-2.5 text-[0.95rem] font-semibold text-white transition-colors hover:bg-rose-dark"
        >
          Voltar ao cardápio
        </Link>
        {user && (
          <Link
            to="/meus-pedidos"
            className="rounded-full border border-border-light px-6 py-2.5 text-[0.95rem] font-medium text-text-primary transition-colors hover:border-rose hover:text-rose"
          >
            Ver meus pedidos
          </Link>
        )}
      </div>
    </div>
  );
}
