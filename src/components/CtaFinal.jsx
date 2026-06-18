import FadeIn from './FadeIn';
import Button from './Button';
import { waLink } from '../lib/whatsapp';

export default function CtaFinal() {
  return (
    <section
      id="contato"
      className="relative flex min-h-[60vh] items-center justify-center overflow-hidden py-[clamp(60px,10vw,120px)] text-center"
    >
      <img
        src="https://images.unsplash.com/photo-1607478900766-efe13248b125?auto=format&fit=crop&w=1920&q=80"
        alt="Doces artesanais finos da Doces da Ale"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(60,36,21,0.88)] to-[rgba(176,138,82,0.55)]" />

      <FadeIn className="relative z-[2] max-w-[720px] px-6 text-white">
        <h2 className="mb-[18px] text-[clamp(1.8rem,4vw,2.6rem)]">
          Seu próximo momento especial merece um doce inesquecível
        </h2>
        <p className="mb-8 text-[1.1rem] text-[#F0E4D3]">Faça sua encomenda agora e surpreenda quem você ama</p>
        <Button
          href={waLink('Olá! Gostaria de fazer uma encomenda na Doces da Ale 🍫')}
          target="_blank"
          rel="noopener"
          size="lg"
          pulse
        >
          Encomendar pelo WhatsApp
        </Button>
      </FadeIn>
    </section>
  );
}
