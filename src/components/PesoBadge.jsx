// Selo de destaque com o peso do brigadeiro — usado no card do cardápio e
// no modal de detalhe do produto. O "- Unidade" deixa claro que é o peso de
// CADA peça (não da caixa toda) — importante porque caixa e unidade avulsa
// podem ter pesos diferentes (ex: 15g dentro da caixa, 25g na venda avulsa).
export default function PesoBadge({ product, completo = false, className = '' }) {
  const { grams } = product;
  if (!(grams > 0)) return null;

  return (
    <span
      className={`inline-block w-fit whitespace-nowrap rounded-full bg-gold/15 px-2.5 py-1 font-bold text-gold-dark ${
        completo ? 'text-[0.95rem]' : 'text-[0.8rem]'
      } ${className}`}
    >
      {grams}g - Unidade
    </span>
  );
}
