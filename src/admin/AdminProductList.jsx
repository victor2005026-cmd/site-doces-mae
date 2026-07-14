import { useState } from 'react';
import { formatPrice } from '../data/products';
import { useAdminProducts } from '../context/AdminProductsContext';
import AdminProductForm from './AdminProductForm';

export default function AdminProductList() {
  const { products, toggleActive } = useAdminProducts();
  const [editing, setEditing] = useState(null); // null | product | 'new'

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-[1.1rem] font-semibold text-text-primary">Produtos</h2>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="rounded-full bg-rose px-5 py-2 text-[0.85rem] font-semibold text-white hover:bg-rose-dark"
        >
          + Novo produto
        </button>
      </div>

      <ul className="rounded-card border border-border-light bg-bg-main">
        {products.map((product) => (
          <li
            key={product.id}
            className="flex items-center gap-4 border-b border-border-light px-5 py-4 last:border-b-0"
          >
            <img
              src={product.image}
              alt={product.alt}
              className={`h-14 w-14 flex-shrink-0 rounded-card object-cover transition-opacity ${
                product.active ? '' : 'opacity-35'
              }`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p
                  className={`text-[0.95rem] font-medium ${
                    product.active ? 'text-text-primary' : 'text-text-secondary line-through'
                  }`}
                >
                  {product.name}
                </p>
                {product.badge && (
                  <span className="rounded-full bg-rose/15 px-2 py-0.5 text-[0.7rem] font-semibold text-rose-dark">
                    {product.badge}
                  </span>
                )}
                {!product.active && (
                  <span className="rounded-full bg-bg-alt px-2 py-0.5 text-[0.7rem] text-text-secondary">
                    Inativo
                  </span>
                )}
              </div>
              <p className="truncate text-[0.82rem] text-text-secondary">
                {product.category} · {formatPrice(product.price)}
              </p>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => toggleActive(product.id)}
                className={`rounded-full border px-3 py-1.5 text-[0.78rem] font-medium transition-colors ${
                  product.active
                    ? 'border-text-secondary/30 text-text-secondary hover:border-rose hover:text-rose'
                    : 'border-success/40 text-success hover:border-success'
                }`}
              >
                {product.active ? 'Desativar' : 'Ativar'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(product)}
                className="rounded-full border border-border-light px-3 py-1.5 text-[0.78rem] font-medium text-text-primary hover:border-rose hover:text-rose"
              >
                Editar
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <AdminProductForm
          product={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
