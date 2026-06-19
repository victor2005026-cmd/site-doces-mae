import FadeIn from './FadeIn';

const FLAVORS = ['Nesquik', 'Leite Ninho', 'Tradicional', 'Paçoca', 'Romeu e Julieta', 'Brigadeiros Personalizados'];

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
                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-gold" aria-hidden="true" />
                {flavor}
              </li>
            ))}
          </ul>
        </FadeIn>

        <FadeIn className="relative mx-auto w-full max-w-[420px] pb-12">
          <span className="absolute -top-3 right-10 text-xl text-gold opacity-70" aria-hidden="true">
            &#10022;
          </span>
          <span className="absolute top-10 left-4 text-sm text-gold opacity-40" aria-hidden="true">
            &#10022;
          </span>
          <span className="absolute bottom-16 left-2 text-base text-gold opacity-50" aria-hidden="true">
            &#10022;
          </span>
          <span className="absolute bottom-28 right-4 text-xs text-gold opacity-40" aria-hidden="true">
            &#10022;
          </span>
          <img
            src="/images/sabores-1.jpg"
            alt="Brigadeiros decorados com confete verde e amarelo"
            loading="lazy"
            className="mx-auto h-[230px] w-[230px] rounded-full border-4 border-gold/40 object-cover shadow-lg sm:h-[260px] sm:w-[260px]"
          />
          <img
            src="/images/sabores-2.jpg"
            alt="Brigadeiros de leite ninho personalizados com desenho dourado"
            loading="lazy"
            className="absolute -bottom-2 left-0 h-[130px] w-[130px] rounded-full border-4 border-gold/40 object-cover shadow-lg sm:h-[150px] sm:w-[150px]"
          />
          <img
            src="/images/sabores-3.jpg"
            alt="Brigadeiros personalizados em tons rosa e azul"
            loading="lazy"
            className="absolute -bottom-2 right-0 h-[130px] w-[130px] rounded-full border-4 border-gold/40 object-cover shadow-lg sm:h-[150px] sm:w-[150px]"
          />
        </FadeIn>
      </div>
    </section>
  );
}
