import { useId, useState } from 'react';
import { SITE_IMAGES, PRODUCT_IMAGES } from '../data/editableImages';
import { useImageOverrides } from '../context/ImageOverridesContext';
import { resizeImageFile } from '../lib/resizeImage';

function ImageEditRow({ entry }) {
  const { overrides, getSrc, setOverride, clearOverride } = useImageOverrides();
  const [error, setError] = useState('');
  const inputId = useId();
  const hasOverride = Boolean(overrides[entry.key]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const dataUrl = await resizeImageFile(file);
      setOverride(entry.key, dataUrl);
    } catch {
      setError('Não consegui ler essa imagem. Tenta outro arquivo.');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <li className="flex items-center gap-4 border-b border-border-light py-4 last:border-b-0">
      <img
        src={getSrc(entry.key, entry.fallback)}
        alt={entry.label}
        className="h-16 w-16 flex-shrink-0 rounded-card object-cover"
      />
      <div className="flex-1">
        <p className="text-[0.95rem] font-medium text-text-primary">{entry.label}</p>
        {hasOverride && <p className="text-[0.8rem] text-success">Foto personalizada salva neste navegador</p>}
        {error && <p className="text-[0.8rem] text-rose-dark">{error}</p>}
      </div>
      <label
        htmlFor={inputId}
        className="cursor-pointer rounded-full border border-border-light px-4 py-2 text-[0.85rem] font-medium text-text-primary transition-colors hover:border-rose hover:text-rose"
      >
        Trocar foto
      </label>
      <input id={inputId} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {hasOverride && (
        <button
          type="button"
          onClick={() => clearOverride(entry.key)}
          className="text-[0.85rem] font-medium text-text-secondary hover:text-rose"
        >
          Restaurar
        </button>
      )}
    </li>
  );
}

export default function AdminImagesSection() {
  return (
    <div>
      <h2 className="mb-4 font-heading text-[1.1rem] font-semibold text-text-primary">Imagens do site</h2>
      <p className="mb-5 rounded-card border border-gold/30 bg-gold/10 px-4 py-3 text-[0.85rem] text-text-primary">
        As fotos trocadas aqui ficam salvas só neste navegador. Para tornar a mudança permanente para todo
        mundo, avise no chat depois que escolher.
      </p>
      <section className="mb-6 rounded-card border border-border-light bg-bg-main px-5">
        <h3 className="pt-4 font-heading text-[1rem] font-semibold text-text-primary">Fotos do banner</h3>
        <ul>
          {SITE_IMAGES.map((entry) => (
            <ImageEditRow key={entry.key} entry={entry} />
          ))}
        </ul>
      </section>
      <section className="rounded-card border border-border-light bg-bg-main px-5">
        <h3 className="pt-4 font-heading text-[1rem] font-semibold text-text-primary">Fotos dos produtos padrão</h3>
        <ul>
          {PRODUCT_IMAGES.map((entry) => (
            <ImageEditRow key={entry.key} entry={entry} />
          ))}
        </ul>
      </section>
    </div>
  );
}
