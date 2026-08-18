import { useState } from 'react';
import { getStoreStatus, formatDiasLabel } from '../lib/storeHours';
import { useAdminProducts } from '../context/AdminProductsContext';
import { formatPrice } from '../data/products';

export default function Banner() {
  const [showInfo, setShowInfo] = useState(false);
  const { config } = useAdminProducts();
  const configLoaded = config !== null;
  const horario = config?.horario_funcionamento;
  const status = getStoreStatus(horario);
  const wideSrc = config?.banner_url || '/images/banner-wide.jpg';
  const logoSrc = config?.logo_url || '/images/banner-brigadeiro-heart.jpg';

  return (
    <section className="container-site pt-6">
      <div className="relative overflow-hidden rounded-card bg-bg-alt">
        {configLoaded ? (
          <img
            src={wideSrc}
            alt="Brigadeiros artesanais Doces da Ale"
            className="h-[260px] w-full object-cover object-center sm:h-[420px]"
          />
        ) : (
          <div className="aspect-[21/6] w-full animate-pulse bg-bg-alt" />
        )}
      </div>

      <div className="relative z-[1] -mt-10 flex flex-col gap-3 sm:-mt-12 sm:flex-row sm:items-end">
        {configLoaded ? (
          <img
            src={logoSrc}
            alt="Doces da Ale"
            className="h-20 w-20 flex-shrink-0 rounded-2xl border-4 border-bg-main object-cover shadow-md sm:h-24 sm:w-24"
          />
        ) : (
          <div className="h-20 w-20 flex-shrink-0 animate-pulse rounded-2xl border-4 border-bg-main bg-bg-alt shadow-md sm:h-24 sm:w-24" />
        )}
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
              <p>{formatDiasLabel(horario?.dias)}, {horario?.abre ?? '09:00'} às {horario?.fecha ?? '18:00'}</p>
              <p>Entrega em Santos e região</p>
            </div>
          )}
        </div>
      </div>

      {config?.frete_ativo && config?.modo_chuva_ativo && (
        <div className="relative z-[1] mt-3 rounded-card border border-gold/40 bg-gold/10 px-4 py-2.5 text-[0.85rem] font-medium text-gold-dark">
          Sobretaxa de chuva de {formatPrice(config?.sobretaxa_chuva ?? 3)} aplicada às entregas hoje
        </div>
      )}

      {config?.banner_secundario_url && (
        <div className="relative z-[1] mt-3 h-[100px] overflow-hidden rounded-card sm:h-[140px]">
          <img src={config.banner_secundario_url} alt="Promoção Doces da Ale" className="h-full w-full object-cover" />
        </div>
      )}
    </section>
  );
}
