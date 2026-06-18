import { useRef, useState } from 'react';
import FadeIn from './FadeIn';

const FAQS = [
  {
    question: 'Qual o prazo mínimo para encomendas?',
    answer: 'Recomendamos pelo menos 3 dias de antecedência para garantir a qualidade e frescor dos doces.',
  },
  {
    question: 'Vocês fazem entrega?',
    answer: 'Sim! Entregamos em Santos e região. Consulte a taxa pelo WhatsApp.',
  },
  {
    question: 'Posso personalizar os doces?',
    answer: 'Com certeza! Fazemos doces personalizados para festas, casamentos, aniversários e eventos corporativos.',
  },
  {
    question: 'Quais formas de pagamento?',
    answer: 'Aceitamos Pix, cartão e dinheiro.',
  },
  {
    question: 'Os doces contêm glúten/lactose?',
    answer: 'Alguns produtos contêm. Consulte opções especiais pelo WhatsApp.',
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);
  const panelRefs = useRef([]);

  return (
    <section id="faq" className="bg-bg-secondary py-[clamp(60px,10vw,120px)]">
      <div className="container-site container-site--narrow">
        <FadeIn as="h2" className="mb-14 text-center font-title text-[clamp(2rem,4vw,2.8rem)] text-text-primary">
          Perguntas Frequentes
        </FadeIn>

        <div>
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <FadeIn key={faq.question} className="mb-3.5 overflow-hidden rounded-xl bg-white shadow-sm">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between px-[26px] py-5 text-left font-title text-[1.05rem] font-semibold text-text-primary"
                >
                  <span>{faq.question}</span>
                  <span
                    aria-hidden="true"
                    className={`ml-4 flex-shrink-0 text-[1.4rem] text-gold-dark transition-transform duration-300 ${
                      isOpen ? 'rotate-45' : ''
                    }`}
                  >
                    +
                  </span>
                </button>
                <div
                  ref={(el) => (panelRefs.current[index] = el)}
                  className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
                  style={{ maxHeight: isOpen ? `${panelRefs.current[index]?.scrollHeight ?? 0}px` : '0px' }}
                >
                  <p className="px-[26px] pb-[22px] text-text-secondary">{faq.answer}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
