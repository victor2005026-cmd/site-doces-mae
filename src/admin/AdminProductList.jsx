import { useState } from 'react';
import { formatPrice, CATEGORIES } from '../data/products';
import { useAdminProducts } from '../context/AdminProductsContext';
import { deletarImagemProduto } from '../lib/uploadImagem';
import AdminProductForm from './AdminProductForm';

const GRUPOS_CATEGORIA = CATEGORIES.filter((c) => c.id !== 'todos');

const GripIcon = (props) => (
  <svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor" {...props}>
    <circle cx="4" cy="4" r="1.6" /><circle cx="10" cy="4" r="1.6" />
    <circle cx="4" cy="10" r="1.6" /><circle cx="10" cy="10" r="1.6" />
    <circle cx="4" cy="16" r="1.6" /><circle cx="10" cy="16" r="1.6" />
  </svg>
);

export default function AdminProductList() {
  const { products, loading, toggleActive, toggleMostSold, deleteProduct, reordenarProdutos } = useAdminProducts();
  const [editing, setEditing] = useState(null); // null | product | 'new'
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [arrastando, setArrastando] = useState(null); // { categoria, index } | null

  const handleDelete = async (product) => {
    if (!window.confirm(`Excluir "${product.name}"? Essa ação não pode ser desfeita.`)) return;
    setDeletingId(product.id);
    const { error } = await deleteProduct(product.id);
    if (!error) {
      await deletarImagemProduto(product.image);
      setFeedback(`"${product.name}" excluído.`);
      setTimeout(() => setFeedback(''), 2500);
    }
    setDeletingId(null);
  };

  // Reordena dentro da mesma categoria (é o que decide a ordem que aparece
  // no cardápio do site), soltando um item na posição de outro.
  const handleDrop = (produtosCategoria, categoriaId, indexAlvo) => {
    if (!arrastando || arrastando.categoria !== categoriaId || arrastando.index === indexAlvo) {
      setArrastando(null);
      return;
    }
    const nova = [...produtosCategoria];
    const [item] = nova.splice(arrastando.index, 1);
    nova.splice(indexAlvo, 0, item);
    setArrastando(null);
    reordenarProdutos(nova);
  };

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

      {loading && (
        <p className="mb-3 text-[0.85rem] text-text-secondary">Carregando produtos...</p>
      )}
      {feedback && <p className="mb-3 text-[0.85rem] text-success">{feedback}</p>}

      {!loading && (
        <p className="mb-4 text-[0.8rem] text-text-secondary">
          Arraste pela alça (⠿) pra decidir a ordem que os doces aparecem pro cliente, categoria por categoria.
        </p>
      )}

      {GRUPOS_CATEGORIA.map((cat) => {
        const produtosCategoria = products.filter((p) => p.category === cat.id);
        if (produtosCategoria.length === 0) return null;

        return (
          <div key={cat.id} className="mb-6">
            <h3 className="mb-2 font-heading text-[0.9rem] font-semibold text-text-secondary">{cat.label}</h3>
            <ul className="rounded-card border border-border-light bg-bg-main">
              {produtosCategoria.map((product, index) => (
                <li
                  key={product.id}
                  draggable
                  onDragStart={() => setArrastando({ categoria: cat.id, index })}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(produtosCategoria, cat.id, index)}
                  onDragEnd={() => setArrastando(null)}
                  className={`flex items-center gap-3 border-b border-border-light px-5 py-4 last:border-b-0 ${
                    arrastando?.categoria === cat.id && arrastando?.index === index ? 'opacity-40' : ''
                  }`}
                >
                  <div className="flex h-14 flex-shrink-0 cursor-grab items-center justify-center text-text-secondary/60 hover:text-text-secondary active:cursor-grabbing">
                    <GripIcon />
                  </div>

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
                    <p className="truncate text-[0.82rem] text-text-secondary">{formatPrice(product.price)}</p>
                  </div>
                  <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => toggleMostSold(product.id)}
                      className={`rounded-full border px-3 py-1.5 text-[0.78rem] font-medium transition-colors ${
                        product.mostSold
                          ? 'border-rose bg-rose/15 text-rose-dark'
                          : 'border-border-light text-text-secondary hover:border-rose hover:text-rose'
                      }`}
                    >
                      {product.mostSold ? '★ Mais vendido' : 'Marcar + vendido'}
                    </button>
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
                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      disabled={deletingId === product.id}
                      className="rounded-full border border-border-light px-3 py-1.5 text-[0.78rem] font-medium text-rose-dark hover:border-rose-dark disabled:opacity-60"
                    >
                      {deletingId === product.id ? 'Excluindo...' : 'Excluir'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {editing && (
        <AdminProductForm
          product={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
