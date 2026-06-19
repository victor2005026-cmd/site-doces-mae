import { waLink } from '../lib/whatsapp';

export default function WhatsappFloat() {
  return (
    <a
      href={waLink('Olá! Gostaria de fazer uma encomenda na Doces da Ale 🍫')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-[26px] right-[26px] z-[999] flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#25D366] shadow-md transition-all duration-200 hover:scale-110 hover:shadow-lg"
    >
      <svg viewBox="100 130 244 244" width="30" height="30" aria-hidden="true" focusable="false">
        <path
          fill="#fff"
          d="M325.5 300.3c-5.6-2.8-33-16.3-38.1-18.1-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18.1-17.5 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.9-9.7-1.9-2.8-12.6-30.3-17.3-41.5-4.6-11-9.3-9.5-12.8-9.7-3.3-.2-7.1-.2-10.9-.2-3.7 0-9.8 1.4-15 6.9-5.1 5.6-19.6 19.2-19.6 46.6 0 27.5 20 54 22.8 57.7 2.8 3.7 38.7 59.1 95.8 80.5 47.5 17.9 57.2 14.4 67.6 13.4 10.4-1 33-13.6 37.7-26.7 4.7-13.1 4.7-24.4 3.3-26.7-1.4-2.3-5.1-3.7-10.7-6.5z"
        />
      </svg>
    </a>
  );
}
