import { WhatsAppIcon, InstagramIcon } from './SocialIcons';
import { waLink } from '../lib/whatsapp';

export default function SocialFloatingButtons() {
  return (
    <div className="fixed bottom-5 right-4 z-[90] flex flex-col gap-3 md:bottom-6 md:right-6">
      <a
        href={waLink('Olá! Gostaria de fazer uma encomenda na Doces da Ale')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
      >
        <WhatsAppIcon width="28" height="28" />
      </a>
      <a
        href="https://www.instagram.com/docesale013"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram @docesale013"
        className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105"
        style={{
          background:
            'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
        }}
      >
        <InstagramIcon width="26" height="26" />
      </a>
    </div>
  );
}
