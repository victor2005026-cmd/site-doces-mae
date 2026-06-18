import BrigadeiroIcon from './icons/BrigadeiroIcon';
import { waLink } from '../lib/whatsapp';

export default function Footer() {
  return (
    <footer className="bg-text-primary pt-[70px] text-[#E8D9C5]">
      <div className="container-site grid grid-cols-1 gap-8 border-b border-white/10 pb-[50px] min-[601px]:grid-cols-2 min-[992px]:grid-cols-[1.4fr_1fr_1fr_1fr] min-[992px]:gap-10">
        <div className="flex flex-col items-start gap-2.5">
          <span className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-gold">
            <BrigadeiroIcon className="h-full w-full" />
          </span>
          <span className="font-title text-[1.3rem] text-white">Doces da Ale</span>
          <p className="font-script text-[1.3rem] text-gold">Doces artesanais feitos com amor</p>
        </div>

        <div>
          <h4 className="mb-3.5 text-[1rem] tracking-[0.5px] text-white">Contato</h4>
          <a
            href={waLink('Olá! Gostaria de fazer uma encomenda na Doces da Ale')}
            target="_blank"
            rel="noopener"
            className="mb-2 block text-[0.95rem] text-[#C9B79F] hover:text-gold"
          >
            WhatsApp
          </a>
          <a
            href="https://www.instagram.com/docesdaale"
            target="_blank"
            rel="noopener"
            className="mb-2 block text-[0.95rem] text-[#C9B79F] hover:text-gold"
          >
            Instagram @docesdaale
          </a>
        </div>

        <div>
          <h4 className="mb-3.5 text-[1rem] tracking-[0.5px] text-white">Localização</h4>
          <p className="mb-2 text-[0.95rem] text-[#C9B79F]">Santos, SP</p>
          <p className="mb-2 text-[0.95rem] text-[#C9B79F]">Atendemos toda a região da Baixada Santista</p>
        </div>

        <div>
          <h4 className="mb-3.5 text-[1rem] tracking-[0.5px] text-white">Horário</h4>
          <p className="mb-2 text-[0.95rem] text-[#C9B79F]">Seg a Sáb, 9h às 18h</p>
        </div>
      </div>

      <div className="mx-auto flex max-w-site flex-wrap justify-between gap-2.5 px-6 py-6 text-[0.85rem] text-[#B09D85]">
        <p>&copy; 2026 Doces da Ale. Todos os direitos reservados.</p>
        <p>Feito com 🤎</p>
      </div>
    </footer>
  );
}
