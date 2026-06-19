import FadeIn from './FadeIn';

const TESTIMONIALS = [
  {
    name: 'Camila R.',
    avatar: 'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?auto=format&fit=crop&w=120&q=80',
    text: 'Os brigadeiros da Ale salvaram o aniversário da minha filha! Chegaram lindos, embalados com tanto carinho, e o sabor é simplesmente surreal. Já virei cliente fiel.',
  },
  {
    name: 'Rodrigo M.',
    avatar: 'https://images.unsplash.com/photo-1517427294546-5aa121f68e8a?auto=format&fit=crop&w=120&q=80',
    text: 'Encomendei um kit para presentear minha esposa e o resultado foi além do que eu esperava. Atendimento rápido pelo WhatsApp e entrega no horário certinho.',
  },
  {
    name: 'Fernanda S.',
    avatar: 'https://images.unsplash.com/photo-1488477304112-4944851de03d?auto=format&fit=crop&w=120&q=80',
    text: 'Doces finos impecáveis para o casamento da minha irmã. Todos os convidados elogiaram, e o cuidado na decoração de cada docinho fez toda a diferença.',
  },
];

export default function Depoimentos() {
  return (
    <section id="depoimentos" className="bg-bg-dark-alt py-[clamp(60px,10vw,120px)]">
      <div className="container-site">
        <FadeIn as="h2" className="mb-14 text-center font-title text-[clamp(2rem,4vw,2.8rem)] text-white">
          O que dizem nossos clientes
        </FadeIn>

        <div className="grid grid-cols-1 gap-8 min-[992px]:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <FadeIn
              key={t.name}
              as="article"
              className="rounded-site border border-gold/15 bg-bg-dark px-7 py-9 text-center shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-md"
            >
              <div className="relative mx-auto mb-4 h-[72px] w-[72px] overflow-hidden rounded-full border-[3px] border-gold">
                <img
                  src={t.avatar}
                  alt={`Foto de ${t.name}`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="mb-3.5 tracking-[2px] text-gold" aria-label="Avaliação 5 de 5 estrelas">
                ★★★★★
              </div>
              <p className="mb-4 italic text-cream">&ldquo;{t.text}&rdquo;</p>
              <p className="font-bold text-white">{t.name}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
