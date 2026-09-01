import { useId, useState } from 'react';
import { CATEGORIES } from '../data/products';
import {
  comprimirImagemProduto,
  deletarImagemProduto,
  enviarImagemComprimida,
  validarImagemProduto,
} from '../lib/uploadImagem';
import { useAdminProducts } from '../context/AdminProductsContext';

const PRODUCT_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'todos');

const EMPTY = {
  name: '',
  description: '',
  price: '',
  category: 'gourmet',
  badge: '',
  units: '',
  grams: '',
};

function formatKB(bytes) {
  return Math.max(1, Math.round(bytes / 1024));
}

export default function AdminProductForm({ product, onClose }) {
  const { addProduct, updateProduct } = useAdminProducts();
  const isEdit = Boolean(product);
  const originalImageUrl = product?.image || '';

  const [form, setForm] = useState(() =>
    product
      ? {
          name: product.name,
          description: product.description,
          price: String(product.price),
          category: product.category,
          badge: product.badge ?? '',
          units: product.units != null ? String(product.units) : '',
          grams: product.grams != null ? String(product.grams) : '',
        }
      : { ...EMPTY }
  );
  const [previewUrl, setPreviewUrl] = useState(originalImageUrl);
  const [compressedBlob, setCompressedBlob] = useState(null);
  const [originalSizeKB, setOriginalSizeKB] = useState(null);
  const [compressedSizeKB, setCompressedSizeKB] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [imgError, setImgError] = useState('');
  const [saving, setSaving] = useState(false);
  const imgInputId = useId();

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setImgError('');
    const erro = validarImagemProduto(file);
    if (erro) {
      setImgError(erro);
      return;
    }

    setCompressedBlob(null);
    setCompressedSizeKB(null);
    setOriginalSizeKB(formatKB(file.size));
    setPreviewUrl(URL.createObjectURL(file));
    setCompressing(true);
    try {
      const blob = await comprimirImagemProduto(file);
      setCompressedBlob(blob);
      setCompressedSizeKB(formatKB(blob.size));
    } catch (err) {
      setImgError(err.message);
      setPreviewUrl(originalImageUrl);
      setOriginalSizeKB(null);
    } finally {
      setCompressing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (compressing) return;

    setSaving(true);
    setImgError('');

    try {
      const produtoId = isEdit ? product.id : crypto.randomUUID();
      let imageUrl = originalImageUrl;

      if (compressedBlob) {
        imageUrl = await enviarImagemComprimida(compressedBlob, produtoId);
      }

      const data = {
        ...(isEdit ? {} : { id: produtoId }),
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        category: form.category,
        image: imageUrl || '/images/prod-tradicional.jpg',
        badge: form.badge.trim() || undefined,
        active: product ? product.active : true,
        units: form.units.trim() ? parseInt(form.units, 10) : null,
        grams: form.grams.trim() ? parseInt(form.grams, 10) : null,
      };

      const { error } = isEdit ? await updateProduct(product.id, data) : await addProduct(data);
      if (error) throw new Error('Não consegui salvar o produto. Tenta de novo.');

      if (compressedBlob && originalImageUrl && originalImageUrl !== imageUrl) {
        deletarImagemProduto(originalImageUrl);
      }

      onClose();
    } catch (err) {
      setImgError(err.message || 'Não consegui salvar o produto. Tenta de novo.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full rounded-card border border-border-light bg-bg-alt px-4 py-2.5 text-[0.95rem] outline-none focus:border-rose focus:ring-1 focus:ring-rose';
  const labelClass = 'mb-1 block text-[0.85rem] font-medium text-text-primary';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-card border border-border-light bg-bg-main p-6 shadow-lg">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-heading text-[1.1rem] font-semibold text-text-primary">
            {isEdit ? 'Editar produto' : 'Novo produto'}
          </h2>
          <button type="button" onClick={onClose} className="text-[1.2rem] text-text-secondary hover:text-rose">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Foto */}
          <div>
            <p className={labelClass}>Foto</p>
            <div className="flex items-center gap-4">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="preview"
                  className="h-16 w-16 flex-shrink-0 rounded-card object-cover"
                />
              )}
              <div>
                <label
                  htmlFor={imgInputId}
                  className="cursor-pointer rounded-full border border-border-light px-4 py-2 text-[0.85rem] font-medium text-text-primary hover:border-rose hover:text-rose"
                >
                  {previewUrl ? 'Trocar foto' : 'Escolher foto'}
                </label>
                <input
                  id={imgInputId}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFile}
                  className="hidden"
                />
                {originalSizeKB != null && (
                  <p className="mt-1 text-[0.78rem] text-text-secondary">
                    {compressing
                      ? `Comprimindo... (original ${originalSizeKB} KB)`
                      : compressedSizeKB != null
                        ? `${originalSizeKB} KB → ${compressedSizeKB} KB`
                        : `${originalSizeKB} KB`}
                  </p>
                )}
              </div>
            </div>
            {imgError && <p className="mt-1 text-[0.8rem] text-rose-dark">{imgError}</p>}
          </div>

          {/* Nome */}
          <div>
            <label htmlFor="prod-name" className={labelClass}>
              Nome *
            </label>
            <input id="prod-name" required value={form.name} onChange={set('name')} className={inputClass} />
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="prod-desc" className={labelClass}>
              Descrição *
            </label>
            <input
              id="prod-desc"
              required
              value={form.description}
              onChange={set('description')}
              className={inputClass}
            />
          </div>

          {/* Preço + Categoria */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="prod-price" className={labelClass}>
                Preço (R$) *
              </label>
              <input
                id="prod-price"
                type="number"
                step="0.5"
                min="0"
                required
                value={form.price}
                onChange={set('price')}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="prod-cat" className={labelClass}>
                Categoria *
              </label>
              <select id="prod-cat" value={form.category} onChange={set('category')} className={inputClass}>
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Badge */}
          <div>
            <label htmlFor="prod-badge" className={labelClass}>
              Badge{' '}
              <span className="font-normal text-text-secondary">(opcional)</span>
            </label>
            <input id="prod-badge" value={form.badge} onChange={set('badge')} placeholder='Ex: "Novidade"' className={inputClass} />
          </div>

          {/* Unidades + Gramas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="prod-units" className={labelClass}>
                Quantas unidades vêm{' '}
                <span className="font-normal text-text-secondary">(opcional)</span>
              </label>
              <input
                id="prod-units"
                type="number"
                min="1"
                step="1"
                value={form.units}
                onChange={set('units')}
                placeholder="Ex: 4"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="prod-grams" className={labelClass}>
                Gramas por unidade{' '}
                <span className="font-normal text-text-secondary">(opcional)</span>
              </label>
              <input
                id="prod-grams"
                type="number"
                min="1"
                step="1"
                value={form.grams}
                onChange={set('grams')}
                placeholder="Ex: 18"
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-2 flex gap-3">
            <button
              type="submit"
              disabled={saving || compressing}
              className="flex-1 rounded-full bg-rose py-2.5 text-[0.95rem] font-semibold text-white hover:bg-rose-dark disabled:opacity-60"
            >
              {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Adicionar produto'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border-light px-5 py-2.5 text-[0.95rem] font-medium text-text-primary hover:border-rose hover:text-rose"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
