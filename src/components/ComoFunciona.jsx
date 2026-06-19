import FadeIn from './FadeIn';

const STEPS = [
  { icon: '🍫', title: 'Escolha seus doces', text: 'Veja o cardápio e escolha seus favoritos' },
  { icon: '📱', title: 'Fale no WhatsApp', text: 'Envie seu pedido de forma rápida e simples' },
  { icon: '🎁', title: 'Receba ou retire', text: 'Entrega em Santos e região, ou retirada no local' },
];

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="bg-bg-dark py-12">
      <div className="container-site">
        <FadeIn as="h2" className="mb-8 text-center font-title text-[clamp(1.5rem,3vw,2rem)] text-white">
          Pedir é simples
        </FadeIn>

        <div className="grid grid-cols-1 gap-8 min-[992px]:grid-cols-3">
          {STEPS.map((step) => (
            <FadeIn
              key={step.title}
              className="flex items-center gap-4 min-[992px]:flex-col min-[992px]:text-center"
            >
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 border-gold bg-bg-dark-alt text-[1.5rem] shadow-sm">
                <span aria-hidden="true">{step.icon}</span>
              </div>
              <div>
                <h3 className="text-[1.05rem] text-white">{step.title}</h3>
                <p className="text-[0.9rem] text-cream">{step.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
