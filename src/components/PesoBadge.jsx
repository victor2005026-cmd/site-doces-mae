// Selo de destaque com o peso do brigadeiro — usado no card do cardápio e
// no modal de detalhe do produto. Só mostra as gramas (nada de "un."/"cada"
// ao lado): tentamos com mais texto junto antes e ficou desproporcional ter
// só o número das gramas maior que o resto — assim o selo inteiro já chama
// atenção (fundo + negrito), sem precisar de hierarquia de tamanho dentro dele.
export default function PesoBadge({ product, completo = false, className = '' }) {
  const { grams } = product;
  if (!(grams > 0)) return null;

  return (
    <span
      className={`inline-block w-fit whitespace-nowrap rounded-full bg-gold/15 px-2.5 py-1 font-bold text-gold-dark ${
        completo ? 'text-[0.95rem]' : 'text-[0.8rem]'
      } ${className}`}
    >
      {grams}g
    </span>
  );
}
