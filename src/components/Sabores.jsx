import FadeIn from './FadeIn';

const FLAVORS = [
  'Maracujá',
  'Leite Ninho',
  'Tradicional',
  'Paçoca',
  'Romeu e Julieta',
  'Brigadeiros Personalizados',
];

export default function Sabores() {
  return (
    <section id="sabores" className="overflow-hidden bg-bg-dark py-[clamp(60px,10vw,120px)]">
      <div className="container-site grid grid-cols-1 items-center gap-12 min-[992px]:grid-cols-2 min-[992px]:gap-16">
        <FadeIn>
          <h2 className="mb-3 font-title text-[clamp(2.4rem,5vw,3.6rem)] uppercase tracking-[2px] text-white">
            Doces da Ale
          </h2>
          <span className="mb-8 inline-block rounded-full bg-gold/15 px-5 py-2 text-[0.85rem] font-bold uppercase tracking-[2px] text-gold">
            Doces Gourmet
          </span>
          <ul className="flex flex-col gap-4">
            {FLAVORS.map((flavor) => (
              <li key={flavor} className="flex items-center gap-3 text-[1.15rem] text-cream">
                <span className="text-gold" aria-hidden="true">
                  &#10070;
                </span>
                {flavor}
              </li>
            ))}
          </ul>
        </FadeIn>

        <FadeIn className="relative mx-auto grid w-full max-w-[440px] grid-cols-2 gap-4">
          <img
            src="/images/sabores-1.jpg"
            alt="Brigadeiros variados: tradicional, coco e confete colorido"
            loading="lazy"
            className="col-span-2 h-[220px] w-full rounded-2xl border border-gold/30 object-cover shadow-lg"
          />
          <img
            src="/images/sabores-2.jpg"
            alt="Brigadeiros de paçoca crocante"
            loading="lazy"
            className="h-[160px] w-full rounded-2xl border border-gold/30 object-cover shadow-lg"
          />
          <img
            src="/images/sabores-3.jpg"
            alt="Brigadeiros personalizados em formato de grade"
            loading="lazy"
            className="h-[160px] w-full rounded-2xl border border-gold/30 object-cover shadow-lg"
          />
        </FadeIn>
      </div>
    </section>
  );
}
