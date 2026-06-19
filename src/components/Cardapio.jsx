import FadeIn from './FadeIn';
import ImageWithFallback from './ImageWithFallback';
import Button from './Button';
import { waLink } from '../lib/whatsapp';

const ITEMS = [
  {
    title: 'Brigadeiros Gourmet',
    description: 'Receita exclusiva em mais de 15 sabores irresistíveis',
    price: 'A partir de R$ 4,50/un',
    image: '/images/cardapio-brigadeiros.jpg',
    placeholder: '🍬',
    alt: 'Brigadeiros gourmet decorados à mão em diversos sabores',
    local: true,
    waMessage: 'Olá! Tenho interesse nos Brigadeiros Gourmet',
  },
  {
    title: 'Doces Finos',
    description: 'Sofisticação e sabor para eventos inesquecíveis',
    price: 'A partir de R$ 5,00/un',
    image: '/images/cardapio-doces-finos.jpg',
    placeholder: '🍮',
    alt: 'Doces finos artesanais decorados para eventos especiais',
    local: true,
    waMessage: 'Olá! Tenho interesse nos Doces Finos',
  },
  {
    title: 'Bolos Personalizados',
    description: 'Feitos sob medida para seu momento especial',
    price: 'Sob consulta',
    image: 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=600&q=80',
    alt: 'Bolo personalizado decorado para festas',
    local: false,
    waMessage: 'Olá! Tenho interesse em Bolos Personalizados',
  },
  {
    title: 'Copos da Felicidade',
    description: 'Camadas de sabor em cada colherada',
    price: 'A partir de R$ 15,00',
    image: 'https://images.unsplash.com/photo-1610450949065-1f2841536c88?auto=format&fit=crop&w=600&q=80',
    alt: 'Copo da felicidade em camadas de sabores',
    local: false,
    waMessage: 'Olá! Tenho interesse nos Copos da Felicidade',
  },
  {
    title: 'Trufas Artesanais',
    description: 'Puro chocolate em formato de presente',
    price: 'A partir de R$ 6,00/un',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    alt: 'Trufas artesanais de chocolate fino',
    local: false,
    waMessage: 'Olá! Tenho interesse nas Trufas Artesanais',
  },
  {
    title: 'Kits para Presentear',
    description: 'Surpreenda quem você ama com doçura',
    price: 'A partir de R$ 49,90',
    image: '/images/cardapio-kits.jpg',
    placeholder: '🎁',
    alt: 'Kit de doces decorados para presentear em caixa especial',
    local: true,
    waMessage: 'Olá! Tenho interesse nos Kits para Presentear',
  },
];

export default function Cardapio() {
  return (
    <section id="cardapio" className="bg-bg-dark-alt py-[clamp(60px,10vw,120px)]">
      <div className="container-site">
        <FadeIn as="h2" className="text-center font-title text-[clamp(2rem,4vw,2.8rem)] text-white mb-3.5">
          Nossos Doces
        </FadeIn>
        <FadeIn as="p" className="mb-14 text-center text-[1.1rem] text-cream">
          Cada sabor é uma experiência única
        </FadeIn>

        <div className="grid grid-cols-1 gap-9 min-[601px]:grid-cols-2 min-[992px]:grid-cols-3">
          {ITEMS.map((item) => (
            <FadeIn
              key={item.title}
              as="article"
              className="group overflow-hidden rounded-site border border-gold/15 bg-bg-dark shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-gold/50 hover:shadow-[0_20px_45px_rgba(201,169,110,0.18)]"
            >
              <div className="relative aspect-square overflow-hidden">
                {item.local ? (
                  <ImageWithFallback
                    src={item.image}
                    alt={item.alt}
                    fill
                    placeholder={item.placeholder}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
                    wrapperClassName="h-full w-full"
                  />
                ) : (
                  <img
                    src={item.image}
                    alt={item.alt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.08]"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg-dark to-transparent" />
              </div>
              <div className="px-[26px] pb-[30px] pt-[26px]">
                <h3 className="mb-2 text-[1.3rem] text-white">{item.title}</h3>
                <p className="mb-3.5 text-[0.95rem] text-cream">{item.description}</p>
                <span className="mb-4 inline-block rounded-full bg-gold/15 px-4 py-1 text-[0.9rem] font-bold text-gold">
                  {item.price}
                </span>
                <Button
                  href={waLink(item.waMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="gold-outline"
                  className="w-full text-center"
                >
                  Quero esse!
                </Button>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
