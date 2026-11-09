import { Link } from 'react-router-dom';
import { waLink } from '../lib/whatsapp';
import { WhatsAppIcon, InstagramIcon } from './SocialIcons';
import SocialFloatingButtons from './SocialFloatingButtons';
import { Azevinho } from './DecoracaoNatal';

export default function Footer() {
  return (
    <footer className="bg-bg-alt pb-[150px] md:pb-10">
      <div className="natal-listra mb-10" aria-hidden="true" />
      <SocialFloatingButtons />
      <div className="container-site flex flex-col items-center gap-4 text-center">
        <span className="font-script text-[1.8rem] text-gold">Doces da Ale</span>

        <p className="natal-rodape flex items-center gap-2 text-[0.85rem] font-medium text-rose-dark sm:text-[1rem]">
          <Azevinho className="h-4 w-5 flex-shrink-0 sm:h-5 sm:w-7" />
          Boas festas e um ano novo bem doce!
          <Azevinho className="h-4 w-5 flex-shrink-0 sm:h-5 sm:w-7" />
        </p>

        <p className="text-[0.9rem] text-text-secondary">Seg a Sáb, 9h às 18h · Entrega em Santos e região</p>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <a
            href={waLink('Olá! Gostaria de fazer uma encomenda na Doces da Ale')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[0.9rem] font-medium text-text-primary hover:text-rose"
          >
            <WhatsAppIcon width="18" height="18" />
            WhatsApp
          </a>
          <a
            href="https://www.instagram.com/docesale013"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 whitespace-nowrap text-[0.9rem] font-medium text-text-primary hover:text-rose"
          >
            <InstagramIcon width="18" height="18" />
            Instagram @docesale013
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[0.8rem]">
          <Link to="/politica-privacidade" className="text-text-secondary underline hover:text-rose">
            Política de Privacidade
          </Link>
          <Link to="/termos-uso" className="text-text-secondary underline hover:text-rose">
            Termos de Uso
          </Link>
        </div>

        <p className="text-[0.8rem] text-text-secondary">&copy; 2026 Doces da Ale. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
