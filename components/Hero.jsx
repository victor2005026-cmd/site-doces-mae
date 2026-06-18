import Image from 'next/image';
import Button from './Button';
import { waLink } from '@/lib/whatsapp';

export default function Hero() {
  return (
    <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <Image
        src="/images/hero-brigadeiros.webp"
        alt="Brigadeiros gourmet artesanais da Doces da Ale"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(20,12,8,0.8)] via-[rgba(20,12,8,0.55)] via-50% to-[rgba(20,12,8,0.88)]" />

      <div className="relative z-[2] max-w-[800px] px-6 text-center text-white">
        <p
          className="mb-4 text-[0.8rem] font-bold uppercase tracking-[3px] text-gold opacity-0 animate-fadeUp"
          style={{ animationDelay: '0.1s' }}
        >
          Confeitaria Artesanal &middot; Santos/SP
        </p>
        <h1
          className="mb-[18px] font-title text-[clamp(2.8rem,8vw,5.5rem)] [text-shadow:0_4px_24px_rgba(0,0,0,0.35)] opacity-0 animate-fadeUp"
          style={{ animationDelay: '0.25s' }}
        >
          Doces da Ale
        </h1>
        <p
          className="mx-auto mb-3 max-w-[640px] font-title text-[clamp(1.2rem,2.6vw,1.7rem)] italic opacity-0 animate-fadeUp"
          style={{ animationDelay: '0.4s' }}
        >
          Doces feitos com amor para transformar momentos em lembranças inesquecíveis
        </p>
        <p
          className="mb-9 text-[1.05rem] text-[#F0E4D3] opacity-0 animate-fadeUp"
          style={{ animationDelay: '0.55s' }}
        >
          Brigadeiros gourmet e doces finos artesanais em Santos e região
        </p>
        <div
          className="flex flex-wrap justify-center gap-[18px] opacity-0 animate-fadeUp max-[600px]:flex-col max-[600px]:w-full"
          style={{ animationDelay: '0.7s' }}
        >
          <Button
            href={waLink('Olá! Gostaria de fazer uma encomenda na Doces da Ale 🍫')}
            target="_blank"
            rel="noopener"
            size="lg"
            className="max-[600px]:w-full"
          >
            Fazer Encomenda pelo WhatsApp
          </Button>
          <Button href="#cardapio" variant="outline" size="lg" className="max-[600px]:w-full">
            Ver Cardápio
          </Button>
        </div>
      </div>

      <a
        href="#sobre"
        aria-label="Rolar para a próxima seção"
        className="absolute bottom-8 left-1/2 z-[2] h-[42px] w-[26px] -translate-x-1/2 rounded-2xl border-2 border-white/70"
      >
        <span className="absolute left-1/2 top-2 h-[5px] w-[5px] -ml-[2.5px] animate-scrollHint rounded-full bg-gold" />
      </a>
    </section>
  );
}
