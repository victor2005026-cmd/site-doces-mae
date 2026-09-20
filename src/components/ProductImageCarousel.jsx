import { useRef, useState } from 'react';

// Foto do produto: com 1 imagem é uma <img> normal; com 2 vira carrossel
// (deslizar com o dedo/mouse, bolinhas e setas). Ocupa o espaço do pai
// (que precisa ser "relative" com altura definida).
export default function ProductImageCarousel({ images, alt, className = '' }) {
  const lista = (images ?? []).filter(Boolean);
  const trilhoRef = useRef(null);
  const [atual, setAtual] = useState(0);

  if (lista.length <= 1) {
    return (
      <img
        src={lista[0]}
        alt={alt}
        loading="lazy"
        className={`absolute inset-0 h-full w-full object-cover ${className}`}
      />
    );
  }

  const aoRolar = () => {
    const el = trilhoRef.current;
    if (el) setAtual(Math.round(el.scrollLeft / el.clientWidth));
  };

  // stopPropagation: o card inteiro abre o detalhe do produto ao clicar
  const irPara = (indice) => (e) => {
    e.stopPropagation();
    const el = trilhoRef.current;
    if (el) el.scrollTo({ left: indice * el.clientWidth, behavior: 'smooth' });
  };

  const seta = 'absolute top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-bg-main/85 text-[1.1rem] text-text-primary shadow-sm hover:text-rose md:flex';

  return (
    <div className="absolute inset-0">
      <div
        ref={trilhoRef}
        onScroll={aoRolar}
        className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto"
      >
        {lista.map((src, i) => (
          <img key={src} src={src} alt={`${alt} — foto ${i + 1}`} loading="lazy" className="h-full w-full flex-shrink-0 snap-center object-cover" />
        ))}
      </div>

      {atual > 0 && (
        <button type="button" onClick={irPara(atual - 1)} aria-label="Foto anterior" className={`${seta} left-2`}>‹</button>
      )}
      {atual < lista.length - 1 && (
        <button type="button" onClick={irPara(atual + 1)} aria-label="Próxima foto" className={`${seta} right-2`}>›</button>
      )}

      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
        {lista.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={irPara(i)}
            aria-label={`Ver foto ${i + 1}`}
            className={`h-2 w-2 rounded-full shadow-sm transition-colors ${i === atual ? 'bg-white' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
}
