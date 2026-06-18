import Image from 'next/image';
import FadeIn from './FadeIn';

export default function Sobre() {
  return (
    <section id="sobre" className="bg-bg-main py-[clamp(60px,10vw,120px)]">
      <div className="container-site grid grid-cols-1 items-center gap-10 min-[992px]:grid-cols-[1.1fr_0.9fr] min-[992px]:gap-[70px]">
        <FadeIn className="relative">
          <span aria-hidden="true" className="absolute -left-2.5 -top-[50px] font-title text-[7rem] leading-none text-gold opacity-35">
            &ldquo;
          </span>
          <h2 className="mb-3.5 text-left font-title text-[clamp(2rem,4vw,2.8rem)] text-text-primary">Nossa História</h2>
          <div className="gold-line" />
          <p className="mb-[18px] text-[1.05rem] text-text-secondary">
            Tudo começou em uma cozinha pequena, com uma paixão enorme por transformar ingredientes
            simples em momentos de pura felicidade. Cada brigadeiro, cada doce fino que sai da nossa
            cozinha carrega um pouco do nosso carinho e da nossa dedicação.
          </p>
          <p className="mb-[18px] text-[1.05rem] text-text-secondary">
            Selecionamos cada ingrediente com cuidado, testamos cada receita até chegar à textura e
            ao sabor perfeitos, e tratamos cada encomenda como se fosse para a nossa própria família.
            Porque é exatamente assim que fazemos: artesanal, do começo ao fim.
          </p>
          <p className="mb-[18px] text-[1.05rem] text-text-secondary">
            Hoje, atendemos com o mesmo cuidado de sempre: atendimento personalizado, do primeiro
            contato até a entrega do último docinho, para que seu momento especial seja inesquecível.
          </p>
        </FadeIn>

        <FadeIn className="order-first min-[992px]:order-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-site shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80"
              alt="Confeiteira preparando doces artesanais com carinho"
              fill
              loading="lazy"
              sizes="(min-width: 992px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
