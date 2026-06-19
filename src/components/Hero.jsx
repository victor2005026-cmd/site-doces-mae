import Button from './Button';
import { waLink } from '../lib/whatsapp';

export default function Hero() {
  return (
    <section id="hero" className="relative flex min-h-screen items-center overflow-hidden bg-black">
      <img
        src="/images/hero-trufas.jpg"
        alt="Brigadeiros e trufas artesanais polvilhados com cacau, fotografia gastronômica em fundo escuro"
        fetchpriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-[2] mx-auto w-full max-w-[720px] px-6 text-center">
        <p
          className="mb-4 text-[0.8rem] font-bold uppercase tracking-[3px] text-gold opacity-0 animate-fadeUp"
          style={{ animationDelay: '0.1s' }}
        >
          Confeitaria Artesanal &middot; Santos/SP
        </p>
        <h1
          className="mb-5 font-title text-[clamp(2.2rem,4.5vw,3.4rem)] leading-[1.15] text-white [text-shadow:0_4px_24px_rgba(0,0,0,0.45)] opacity-0 animate-fadeUp"
          style={{ animationDelay: '0.25s' }}
        >
          Doces Artesanais. Feitos com Amor. <span className="text-gold">Sabor Inesquecível.</span>
        </h1>
        <p
          className="mx-auto mb-9 max-w-[440px] text-[1.05rem] text-[#F0E4D3] opacity-0 animate-fadeUp"
          style={{ animationDelay: '0.4s' }}
        >
          Brigadeiros gourmet e doces finos artesanais em Santos e região
        </p>
        <div className="opacity-0 animate-fadeUp" style={{ animationDelay: '0.55s' }}>
          <Button
            href={waLink('Olá! Gostaria de fazer uma encomenda na Doces da Ale 🍫')}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline-gold"
            size="lg"
          >
            Fazer Encomenda
          </Button>
        </div>
      </div>

      <a
        href="#cardapio"
        aria-label="Rolar para a próxima seção"
        className="absolute bottom-8 left-1/2 z-[2] h-[42px] w-[26px] -translate-x-1/2 rounded-2xl border-2 border-white/70"
      >
        <span className="absolute left-1/2 top-2 h-[5px] w-[5px] -ml-[2.5px] animate-scrollHint rounded-full bg-gold" />
      </a>
    </section>
  );
}
