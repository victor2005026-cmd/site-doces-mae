import FadeIn from './FadeIn';
import Button from './Button';
import { waLink } from '../lib/whatsapp';

export default function CtaFinal() {
  return (
    <section
      id="contato"
      className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-rose py-[clamp(60px,10vw,120px)] text-center"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-rose via-rose-dark to-rose" />

      <div
        className="absolute inset-0 flex -rotate-1 scale-110 flex-col justify-between overflow-hidden opacity-[0.12]"
        aria-hidden="true"
      >
        {Array.from({ length: 7 }).map((_, row) => (
          <div key={row} className="whitespace-nowrap font-title text-[3.5rem] font-bold uppercase tracking-wider text-text-primary">
            {'Doce '.repeat(20)}
          </div>
        ))}
      </div>

      <img
        src="/images/cta-corner-tl.jpg"
        alt=""
        aria-hidden="true"
        className="absolute left-[6%] top-[10%] hidden h-[92px] w-[92px] -rotate-6 rounded-full border-2 border-gold object-cover shadow-lg min-[992px]:block"
      />
      <img
        src="/images/cta-corner-tr.jpg"
        alt=""
        aria-hidden="true"
        className="absolute right-[8%] top-[14%] hidden h-[80px] w-[80px] rotate-6 rounded-full border-2 border-gold object-cover shadow-lg min-[992px]:block"
      />
      <img
        src="/images/cta-corner-bl.jpg"
        alt=""
        aria-hidden="true"
        className="absolute bottom-[16%] left-[10%] hidden h-[80px] w-[80px] rotate-6 rounded-full border-2 border-gold object-cover shadow-lg min-[992px]:block"
      />
      <img
        src="/images/cta-corner-br.jpg"
        alt=""
        aria-hidden="true"
        className="absolute bottom-[12%] right-[6%] hidden h-[92px] w-[92px] -rotate-6 rounded-full border-2 border-gold object-cover shadow-lg min-[992px]:block"
      />

      <FadeIn className="relative z-[2] mx-auto max-w-[640px] px-6">
        <span className="mb-7 inline-block rounded-full bg-bg-main px-6 py-2 text-[0.85rem] font-bold uppercase tracking-[2px] text-text-primary shadow-sm">
          Que tal um brigadeiro?
        </span>

        <div className="relative mx-auto mb-7 h-[170px] w-[170px]">
          <img
            src="/images/cta-brigadeiro.jpg"
            alt="Brigadeiro artesanal Doces da Ale decorado com coração"
            loading="lazy"
            className="h-full w-full rounded-full border-4 border-gold object-cover shadow-lg"
          />
        </div>

        <span className="mb-7 inline-block rounded-full bg-bg-main px-6 py-2 text-[0.85rem] font-bold uppercase tracking-[2px] text-text-primary shadow-sm">
          Pra matar a vontade de comer um docinho?
        </span>

        <h2 className="mb-[18px] text-[clamp(1.8rem,4vw,2.6rem)] text-text-primary">Peça já o seu!</h2>

        <div className="mx-auto flex max-w-[420px] flex-col items-center gap-5 rounded-2xl bg-text-primary px-6 py-6 shadow-lg">
          <p className="text-[1.1rem] text-cream">Faça sua encomenda agora e surpreenda quem você ama</p>
          <Button
            href={waLink('Olá! Gostaria de fazer uma encomenda na Doces da Ale 🍫')}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            pulse
          >
            Encomendar pelo WhatsApp
          </Button>
        </div>
      </FadeIn>
    </section>
  );
}
