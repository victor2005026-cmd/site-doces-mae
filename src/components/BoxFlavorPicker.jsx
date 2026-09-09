import { useAdminProducts } from '../context/AdminProductsContext';

// Seletor de sabores pra montar uma Caixa: lista os sabores "gourmet" ativos
// com um contador +/- cada, travado em "capacity" unidades no total (nem a
// mais, nem a menos). Controlado pelo pai (ProductDetailModal), que guarda
// `quantidades` (produtoId -> qtd) e decide o que fazer quando o total bate.
export default function BoxFlavorPicker({ capacity, quantidades, onChangeQuantidade }) {
  const { activeProducts } = useAdminProducts();
  const sabores = activeProducts.filter((p) => p.category === 'gourmet');
  const total = Object.values(quantidades).reduce((soma, qtd) => soma + qtd, 0);
  const completo = total === capacity;

  return (
    <div className="rounded-card border border-border-light bg-bg-alt p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-semibold text-text-primary">Escolha os sabores</p>
        <span className={`rounded-full px-2.5 py-1 text-[0.78rem] font-bold ${completo ? 'bg-success/15 text-success' : 'bg-gold/15 text-gold-dark'}`}>
          {total} de {capacity} escolhidos
        </span>
      </div>

      {sabores.length === 0 ? (
        <p className="text-[0.85rem] text-text-secondary">Nenhum sabor gourmet disponível no momento.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border-light">
          {sabores.map((sabor) => {
            const qtd = quantidades[sabor.id] ?? 0;
            return (
              <li key={sabor.id} className="flex items-center justify-between gap-3 py-2">
                <span className="text-[0.9rem] text-text-primary">{sabor.name}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onChangeQuantidade(sabor.id, qtd - 1)}
                    disabled={qtd === 0}
                    aria-label={`Diminuir ${sabor.name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border-light text-text-primary disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-[0.9rem]">{qtd}</span>
                  <button
                    type="button"
                    onClick={() => onChangeQuantidade(sabor.id, qtd + 1)}
                    disabled={total >= capacity}
                    aria-label={`Aumentar ${sabor.name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border-light text-text-primary disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
