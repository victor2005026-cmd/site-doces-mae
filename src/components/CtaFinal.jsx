import FadeIn from './FadeIn';
import Button from './Button';
import { waLink } from '../lib/whatsapp';

export default function CtaFinal() {
  return (
    <section
      id="contato"
      className="relative flex min-h-[50vh] items-center justify-center overflow-hidden bg-bg-dark py-[clamp(60px,10vw,120px)] text-center"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-bg-dark via-bg-dark-alt to-bg-dark" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(201,169,110,0.18),transparent_60%)]" />

      <FadeIn className="relative z-[2] max-w-[720px] px-6 text-white">
        <h2 className="mb-[18px] text-[clamp(1.8rem,4vw,2.6rem)]">
          Seu próximo momento especial merece um doce inesquecível
        </h2>
        <p className="mb-8 text-[1.1rem] text-cream">Faça sua encomenda agora e surpreenda quem você ama</p>
        <Button
          href={waLink('Olá! Gostaria de fazer uma encomenda na Doces da Ale 🍫')}
          target="_blank"
          rel="noopener noreferrer"
          size="lg"
          pulse
        >
          Encomendar pelo WhatsApp
        </Button>
      </FadeIn>
    </section>
  );
}
