import FadeIn from './FadeIn';
import Button from './Button';
import { waLink } from '../lib/whatsapp';

export default function CtaFinal() {
  return (
    <section
      id="contato"
      className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-bg-dark py-[clamp(60px,10vw,120px)] text-center"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-bg-dark via-bg-dark-alt to-bg-dark" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(201,169,110,0.18),transparent_60%)]" />

      <div className="absolute inset-0 flex -rotate-1 scale-110 flex-col justify-between overflow-hidden opacity-[0.06]" aria-hidden="true">
        {Array.from({ length: 7 }).map((_, row) => (
          <div key={row} className="whitespace-nowrap font-title text-[3.5rem] font-bold uppercase tracking-wider text-gold">
            {'Doce '.repeat(20)}
          </div>
        ))}
      </div>

      <FadeIn className="relative z-[2] mx-auto max-w-[640px] px-6">
        <span className="mb-7 inline-block rounded-full border border-gold/40 bg-bg-dark-alt px-6 py-2 text-[0.85rem] font-bold uppercase tracking-[2px] text-gold">
          Que tal um brigadeiro?
        </span>

        <div className="relative mx-auto mb-7 h-[170px] w-[170px]">
          <img
            src="/images/cardapio-brigadeiros.jpg"
            alt="Brigadeiro artesanal Doces da Ale"
            loading="lazy"
            className="h-full w-full rounded-full border-4 border-gold object-cover shadow-lg"
          />
        </div>

        <span className="mb-7 inline-block rounded-full border border-gold/40 bg-bg-dark-alt px-6 py-2 text-[0.85rem] font-bold uppercase tracking-[2px] text-gold">
          Pra matar a vontade de comer um docinho?
        </span>

        <h2 className="mb-[18px] text-[clamp(1.8rem,4vw,2.6rem)] text-white">Peça já o seu!</h2>
        <p className="mb-8 text-[1.1rem] text-cream">Faça sua encomenda agora e surpreenda quem você ama</p>
        <Button
          href={waLink('Olá! Gostaria de fazer uma encomenda na Doces da Ale 🍫')}
          target="_blank"
          rel="noopener noreferrer"
          size="lg"
          pulse
        >
          Encomendar pelo WhatsApp
        </Button>
      </FadeIn>
    </section>
  );
}
