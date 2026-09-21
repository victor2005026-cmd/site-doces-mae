import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { formatPrice } from '../data/products';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useAdminProducts } from '../context/AdminProductsContext';
import { waLink } from '../lib/whatsapp';
import PesoBadge from './PesoBadge';
import ProductImageCarousel from './ProductImageCarousel';
import BoxFlavorPicker from './BoxFlavorPicker';

// `editItem` (opcional): quando presente, é uma linha do carrinho já
// existente cuja mistura de sabores está sendo editada — em vez de
// adicionar um item novo, salva a nova mistura nessa mesma linha
// (usado pelo "Editar sabores" no carrinho).
export default function ProductDetailModal({ product, editItem, onClose }) {
  const { addItem, updateItemSabores } = useCart();
  const { showToast } = useToast();
  const { activeProducts } = useAdminProducts();
  const [quantidades, setQuantidades] = useState({});
  const modoEdicao = Boolean(editItem);

  // Zera (ou pré-preenche, se for edição) a escolha de sabores sempre que
  // o produto aberto muda — o modal continua montado entre uma abertura e
  // outra, só troca o `product`/`editItem`.
  useEffect(() => {
    if (!editItem?.sabores?.length) {
      setQuantidades({});
      return;
    }
    const sabores = activeProducts.filter((p) => p.category === 'gourmet');
    const iniciais = {};
    editItem.sabores.forEach((s) => {
      const sabor = sabores.find((p) => p.name === s.nome);
      if (sabor) iniciais[sabor.id] = s.quantidade;
    });
    setQuantidades(iniciais);
  }, [product?.id, editItem]); // eslint-disable-line

  if (!product) return null;

  const capacity = Number(product.units) || 0;
  const isCaixaCustomizavel = product.category === 'caixas' && capacity > 0;
  const totalEscolhido = Object.values(quantidades).reduce((soma, qtd) => soma + qtd, 0);
  const podeAdicionar = !isCaixaCustomizavel || totalEscolhido === capacity;

  const handleChangeQuantidade = (produtoId, novaQtd) => {
    setQuantidades((prev) => {
      const proximo = { ...prev, [produtoId]: Math.max(0, novaQtd) };
      if (proximo[produtoId] === 0) delete proximo[produtoId];
      return proximo;
    });
  };

  const montarSabores = () => {
    if (!isCaixaCustomizavel) return undefined;
    const sabores = activeProducts.filter((p) => p.category === 'gourmet');
    return sabores
      .filter((s) => quantidades[s.id] > 0)
      .map((s) => ({ nome: s.name, quantidade: quantidades[s.id] }));
  };

  const handleAdd = () => {
    if (!podeAdicionar) return;
    const sabores = montarSabores();
    if (modoEdicao) {
      updateItemSabores(editItem.cartItemId, sabores);
      showToast('Sabores atualizados!', 'success');
      onClose();
      return;
    }
    addItem(sabores ? { ...product, cartItemId: crypto.randomUUID(), sabores } : product);
    showToast(`${product.name} adicionado à sacola!`, 'success');
    onClose();
  };

  const linkPedidoDireto = waLink(
    `Olá! Gostaria de pedir: 1x ${product.name} — ${formatPrice(product.price)}`
  );

  // Portal pro <body>: sem isso, quando aberto a partir do "Editar sabores"
  // (dentro da barra lateral do carrinho, que é "sticky" + tem overflow
  // escondido), o modal fica preso ali dentro depois que a página rola —
  // aparece por baixo do cabeçalho/barra de categoria em vez de cobrir tudo.
  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex max-h-[90vh] w-full max-w-[420px] flex-col overflow-y-auto overscroll-contain rounded-card bg-bg-main shadow-lg">
        <div className="relative aspect-square max-h-[55vh] w-full flex-shrink-0 overflow-hidden bg-bg-alt">
          <ProductImageCarousel images={[product.image, product.image2]} alt={product.alt} />
          {product.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-rose px-3 py-1 text-[0.7rem] font-semibold text-white shadow-sm">
              {product.badge}
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-bg-main/90 text-[1.2rem] text-text-primary shadow-sm hover:text-rose"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-3 p-5">
          <div>
            <h2 className="font-heading text-[1.2rem] font-semibold text-text-primary">{product.name}</h2>
            <p className="mt-1 text-[0.92rem] text-text-secondary">{product.description}</p>
            <PesoBadge product={product} completo className="mt-2" />
          </div>

          <p className="text-[1.3rem] font-bold text-rose">{formatPrice(product.price)}</p>

          {isCaixaCustomizavel && (
            <BoxFlavorPicker
              capacity={capacity}
              quantidades={quantidades}
              onChangeQuantidade={handleChangeQuantidade}
            />
          )}

          <div className="mt-1 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!podeAdicionar}
              className="rounded-full bg-rose py-3 text-[0.95rem] font-semibold text-white transition-colors hover:bg-rose-dark disabled:opacity-50"
            >
              {isCaixaCustomizavel && !podeAdicionar
                ? `Escolha mais ${capacity - totalEscolhido} sabor${capacity - totalEscolhido > 1 ? 'es' : ''}`
                : modoEdicao ? 'Salvar alterações' : 'Adicionar ao carrinho'}
            </button>
            {!modoEdicao && (
              <a
                href={linkPedidoDireto}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border-2 border-success py-3 text-center text-[0.95rem] font-semibold text-success transition-colors hover:bg-success/10"
              >
                Pedir esse pelo WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
