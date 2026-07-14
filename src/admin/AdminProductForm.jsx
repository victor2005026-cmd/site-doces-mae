import { useId, useState } from 'react';
import { CATEGORIES } from '../data/products';
import { resizeImageFile } from '../lib/resizeImage';
import { useAdminProducts } from '../context/AdminProductsContext';

const PRODUCT_CATEGORIES = CATEGORIES.filter((c) => c.id !== 'todos');

const EMPTY = {
  name: '',
  description: '',
  price: '',
  category: 'tradicionais',
  badge: '',
  image: '',
  alt: '',
};

export default function AdminProductForm({ product, onClose }) {
  const { addProduct, updateProduct } = useAdminProducts();
  const isEdit = Boolean(product);

  const [form, setForm] = useState(() =>
    product
      ? { ...product, price: String(product.price), badge: product.badge ?? '' }
      : { ...EMPTY }
  );
  const [imgError, setImgError] = useState('');
  const imgInputId = useId();

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgError('');
    try {
      const dataUrl = await resizeImageFile(file);
      setForm((prev) => ({ ...prev, image: dataUrl, alt: prev.alt || prev.name || 'Foto do produto' }));
    } catch {
      setImgError('Não consegui carregar essa imagem. Tente outro arquivo.');
    } finally {
      e.target.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      category: form.category,
      image: form.image || '/images/prod-tradicional.jpg',
      alt: form.alt.trim() || form.name.trim(),
      ...(form.badge.trim() ? { badge: form.badge.trim() } : { badge: undefined }),
      active: product ? product.active : true,
    };
    if (isEdit) {
      updateProduct(product.id, data);
    } else {
      addProduct(data);
    }
    onClose();
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
              {form.image && (
                <img
                  src={form.image}
                  alt="preview"
                  className="h-16 w-16 flex-shrink-0 rounded-card object-cover"
                />
              )}
              <label
                htmlFor={imgInputId}
                className="cursor-pointer rounded-full border border-border-light px-4 py-2 text-[0.85rem] font-medium text-text-primary hover:border-rose hover:text-rose"
              >
                {form.image ? 'Trocar foto' : 'Escolher foto'}
              </label>
              <input id={imgInputId} type="file" accept="image/*" onChange={handleFile} className="hidden" />
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
              <span className="font-normal text-text-secondary">(opcional — ex: "Mais vendido", "Novidade")</span>
            </label>
            <input id="prod-badge" value={form.badge} onChange={set('badge')} className={inputClass} />
          </div>

          <div className="mt-2 flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded-full bg-rose py-2.5 text-[0.95rem] font-semibold text-white hover:bg-rose-dark"
            >
              {isEdit ? 'Salvar alterações' : 'Adicionar produto'}
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
