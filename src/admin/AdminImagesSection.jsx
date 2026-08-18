import { useId, useState } from 'react';
import { useAdminProducts } from '../context/AdminProductsContext';
import { uploadImagemSite, deletarImagemProduto } from '../lib/uploadImagem';

const CAMPOS = [
  { campo: 'banner_url', label: 'Banner do topo (foto larga)', fallback: '/images/banner-wide.jpg', maxWidthOrHeight: 1600 },
  { campo: 'logo_url', label: 'Foto redonda ao lado do nome da loja', fallback: '/images/banner-brigadeiro-heart.jpg', maxWidthOrHeight: 600 },
  { campo: 'banner_secundario_url', label: 'Banner secundário (opcional)', fallback: '', maxWidthOrHeight: 1600 },
];

function ImageEditRow({ entry }) {
  const { config, saveImagemSite } = useAdminProducts();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const inputId = useId();

  const urlAtual = config?.[entry.campo] || '';
  const preview = urlAtual || entry.fallback;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setSaving(true);
    try {
      const novaUrl = await uploadImagemSite(file, entry.campo, { maxWidthOrHeight: entry.maxWidthOrHeight });
      const { error: saveError } = await saveImagemSite(entry.campo, novaUrl);
      if (saveError) throw new Error('Não consegui salvar. Tenta de novo.');
      if (urlAtual) deletarImagemProduto(urlAtual);
    } catch (err) {
      setError(err.message || 'Não consegui enviar essa imagem. Tenta outro arquivo.');
    } finally {
      setSaving(false);
    }
  };

  const handleRestaurar = async () => {
    if (!urlAtual) return;
    setSaving(true);
    try {
      await saveImagemSite(entry.campo, null);
      deletarImagemProduto(urlAtual);
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="flex items-center gap-4 border-b border-border-light py-4 last:border-b-0">
      {preview ? (
        <img src={preview} alt={entry.label} className="h-16 w-16 flex-shrink-0 rounded-card object-cover" />
      ) : (
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-card bg-bg-alt text-[0.7rem] text-text-secondary">
          Sem foto
        </div>
      )}
      <div className="flex-1">
        <p className="text-[0.95rem] font-medium text-text-primary">{entry.label}</p>
        {urlAtual && <p className="text-[0.8rem] text-success">Foto personalizada salva no Supabase</p>}
        {saving && <p className="text-[0.8rem] text-text-secondary">Enviando…</p>}
        {error && <p className="text-[0.8rem] text-rose-dark">{error}</p>}
      </div>
      <label
        htmlFor={inputId}
        className="cursor-pointer rounded-full border border-border-light px-4 py-2 text-[0.85rem] font-medium text-text-primary transition-colors hover:border-rose hover:text-rose"
      >
        Trocar foto
      </label>
      <input id={inputId} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" disabled={saving} />
      {urlAtual && (
        <button
          type="button"
          onClick={handleRestaurar}
          disabled={saving}
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
        As fotos trocadas aqui ficam salvas no Supabase e aparecem pra todo mundo, em qualquer computador.
      </p>
      <section className="rounded-card border border-border-light bg-bg-main px-5">
        <h3 className="pt-4 font-heading text-[1rem] font-semibold text-text-primary">Fotos do banner</h3>
        <p className="pb-4 pt-1 text-[0.8rem] text-text-secondary">
          O banner principal sempre mostra a imagem inteira, sem cortar nada — suba uma foto já na proporção que
          quiser ver no site (recomendado: bem larga, tipo 2000×800px).
        </p>
        <ul>
          {CAMPOS.map((entry) => (
            <ImageEditRow key={entry.campo} entry={entry} />
          ))}
        </ul>
      </section>
    </div>
  );
}
