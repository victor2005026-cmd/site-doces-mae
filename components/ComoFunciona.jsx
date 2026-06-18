import FadeIn from './FadeIn';
import Button from './Button';
import { waLink } from '@/lib/whatsapp';

const STEPS = [
  { icon: '🍫', title: 'Escolha seus doces', text: 'Navegue pelo nosso cardápio e escolha seus favoritos' },
  { icon: '📱', title: 'Fale conosco', text: 'Envie seu pedido pelo WhatsApp de forma simples e rápida' },
  { icon: '🎁', title: 'Receba ou retire', text: 'Entregamos em Santos e região ou retire no local' },
];

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="bg-bg-main py-[clamp(60px,10vw,120px)]">
      <div className="container-site">
        <FadeIn as="h2" className="mb-14 text-center font-title text-[clamp(2rem,4vw,2.8rem)] text-text-primary">
          Como fazer seu pedido
        </FadeIn>

        <div className="relative mb-[50px] grid grid-cols-1 gap-[50px] min-[992px]:grid-cols-3 min-[992px]:gap-10">
          <div
            aria-hidden="true"
            className="absolute left-[16%] right-[16%] top-[38px] z-0 hidden h-[2px] bg-[repeating-linear-gradient(to_right,#C9A96E_0_10px,transparent_10px_18px)] min-[992px]:block"
          />
          {STEPS.map((step) => (
            <FadeIn key={step.title} className="relative z-[1] text-center">
              <div className="mx-auto mb-5 flex h-[78px] w-[78px] items-center justify-center rounded-full border-2 border-gold bg-white text-[2rem] shadow-sm">
                <span aria-hidden="true">{step.icon}</span>
              </div>
              <h3 className="mb-2 text-[1.25rem]">{step.title}</h3>
              <p className="mx-auto max-w-[260px] text-text-secondary">{step.text}</p>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="text-center">
          <Button href={waLink('Olá! Gostaria de fazer um pedido na Doces da Ale')} target="_blank" rel="noopener" size="lg">
            Fazer meu pedido agora
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
