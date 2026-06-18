import { useEffect, useState } from 'react';
import FadeIn from './FadeIn';
import ImageWithFallback from './ImageWithFallback';

const ITEMS = [
  {
    src: '/images/brigadeiro-1.jpg',
    full: '/images/brigadeiro-1.jpg',
    alt: 'Kit de doces brancos decorados com desenhos dourados',
    caption: 'Kit especial de presente',
    placeholder: '🍫',
    local: true,
    tall: true,
  },
  {
    src: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80',
    full: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=900&q=80',
    alt: 'Bandeja de doces artesanais finos',
    caption: 'Confeitaria artesanal',
    local: false,
    tall: false,
  },
  {
    src: '/images/brigadeiro-2.jpg',
    full: '/images/brigadeiro-2.jpg',
    alt: 'Doces finos em formatos temáticos decorados à mão',
    caption: 'Doces temáticos personalizados',
    placeholder: '🌽',
    local: true,
    tall: false,
  },
  {
    src: 'https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&w=600&q=80',
    full: 'https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&w=600&q=90',
    alt: 'Sobremesa gourmet com chocolate',
    caption: 'Sobremesa gourmet',
    local: false,
    tall: true,
  },
  {
    src: '/images/brigadeiro-3.jpg',
    full: '/images/brigadeiro-3.jpg',
    alt: 'Brigadeiros decorados com tema esportivo em azul e dourado',
    caption: 'Brigadeiros temáticos',
    placeholder: '⚽',
    local: true,
    tall: false,
  },
  {
    src: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80',
    full: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=90',
    alt: 'Close de chocolate artesanal sendo preparado',
    caption: 'Chocolate artesanal',
    local: false,
    tall: false,
  },
  {
    src: 'https://images.unsplash.com/photo-1599629954294-14df9ec8bc05?auto=format&fit=crop&w=600&q=80',
    full: 'https://images.unsplash.com/photo-1599629954294-14df9ec8bc05?auto=format&fit=crop&w=600&q=90',
    alt: 'Trufas finas de chocolate em exposição',
    caption: 'Trufas finas',
    local: false,
    tall: true,
  },
  {
    src: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=80',
    full: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=600&q=90',
    alt: 'Variedade de doces artesanais finos',
    caption: 'Doces variados',
    local: false,
    tall: false,
  },
  {
    src: 'https://images.unsplash.com/photo-1565299543923-37dd37887442?auto=format&fit=crop&w=600&q=80',
    full: 'https://images.unsplash.com/photo-1565299543923-37dd37887442?auto=format&fit=crop&w=600&q=90',
    alt: 'Fatia de doce especial decorada',
    caption: 'Fatia especial',
    local: false,
    tall: false,
  },
];

export default function Galeria() {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!selected) return;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setSelected(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [selected]);

  return (
    <section id="galeria" className="bg-bg-main py-[clamp(60px,10vw,120px)]">
      <div className="container-site">
        <FadeIn as="h2" className="mb-3.5 text-center font-title text-[clamp(2rem,4vw,2.8rem)] text-text-primary">
          Momentos Doces
        </FadeIn>
        <FadeIn as="p" className="mb-14 text-center text-[1.1rem] text-text-secondary">
          Um pouco do nosso carinho em cada detalhe
        </FadeIn>

        <div className="grid grid-cols-2 auto-rows-[160px] gap-[18px] min-[601px]:auto-rows-[200px] min-[992px]:grid-cols-4">
          {ITEMS.map((item) => (
            <FadeIn key={item.alt} className={item.tall ? 'row-span-2' : ''}>
              <button
                onClick={() => setSelected(item)}
                className="group relative block h-full w-full overflow-hidden rounded-2xl"
              >
                {item.local ? (
                  <ImageWithFallback
                    src={item.src}
                    alt={item.alt}
                    fill
                    placeholder={item.placeholder}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
                    wrapperClassName="h-full w-full"
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.08]"
                  />
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-[rgba(60,36,21,0)] text-[1.8rem] text-white opacity-0 transition-opacity duration-300 group-hover:bg-[rgba(60,36,21,0.4)] group-hover:opacity-100">
                  ✦
                </span>
              </button>
            </FadeIn>
          ))}
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[2000] flex items-center justify-center bg-[rgba(20,12,7,0.92)] p-6 transition-opacity duration-300 ${
          selected ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelected(null);
        }}
      >
        <button
          onClick={() => setSelected(null)}
          aria-label="Fechar imagem"
          className="absolute right-8 top-6 text-[2.4rem] leading-none text-white"
        >
          &times;
        </button>
        {selected && (
          <figure>
            <img
              src={selected.full}
              alt={selected.alt}
              className="max-h-[85vh] max-w-[min(900px,92vw)] rounded-[10px] shadow-lg"
            />
            <figcaption className="mt-3.5 text-center font-title italic text-white">
              {selected.caption}
            </figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
