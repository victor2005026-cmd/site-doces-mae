import { useState } from 'react';
import { getStoreStatus } from '../lib/storeHours';
import { useImageSrc } from '../context/ImageOverridesContext';
import { SITE_IMAGES } from '../data/editableImages';

const [WIDE, LOGO] = SITE_IMAGES;

export default function Banner() {
  const [showInfo, setShowInfo] = useState(false);
  const status = getStoreStatus();
  const wideSrc = useImageSrc(WIDE.key, WIDE.fallback);
  const logoSrc = useImageSrc(LOGO.key, LOGO.fallback);

  return (
    <section className="container-site pt-6">
      <div className="relative h-[180px] overflow-hidden rounded-card sm:h-[260px]">
        <img src={wideSrc} alt="Brigadeiros artesanais Doces da Ale" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
      </div>

      <div className="relative z-[1] -mt-10 flex flex-col gap-3 sm:-mt-12 sm:flex-row sm:items-end">
        <img
          src={logoSrc}
          alt="Doces da Ale"
          className="h-20 w-20 flex-shrink-0 rounded-2xl border-4 border-bg-main object-cover shadow-md sm:h-24 sm:w-24"
        />
        <div className="rounded-card bg-bg-main px-4 py-3 shadow-sm">
          <h1 className="font-heading text-[1.3rem] font-semibold text-text-primary sm:text-[1.5rem]">
            Doces da Ale
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[0.85rem]">
            <span className={`font-medium ${status.isOpen ? 'text-success' : 'text-rose-dark'}`}>
              {status.label}
            </span>
            <span className="text-text-secondary">· Santos - SP</span>
            <button
              type="button"
              onClick={() => setShowInfo((v) => !v)}
              className="font-medium text-text-primary hover:text-rose"
            >
              Mais informações
            </button>
          </div>
          {showInfo && (
            <div className="mt-2 text-[0.85rem] text-text-secondary">
              <p>Seg a Sáb, 9h às 18h · Fechado aos domingos</p>
              <p>Entrega em Santos e região · Pedido mínimo R$ 20,00</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
