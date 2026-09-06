export const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'gourmet', label: 'Gourmet' },
  { id: 'caixas', label: 'Caixas' },
];

export const PRODUCTS = [
  {
    id: 'tradicional',
    name: 'Tradicional',
    description: 'O brigadeiro clássico de sempre, com granulado de chocolate',
    price: 4.5,
    category: 'gourmet',
    image: '/images/prod-tradicional.jpg',
    alt: 'Brigadeiro tradicional com granulado de chocolate',
  },
  {
    id: 'beijinho',
    name: 'Beijinho',
    description: 'Coco com leite condensado, docinho de carinho',
    price: 4.5,
    category: 'gourmet',
    image: '/images/prod-beijinho.jpg',
    alt: 'Beijinho de coco coberto com coco ralado branco',
  },
  {
    id: 'pacoca',
    name: 'Paçoca',
    description: 'Amendoim torrado moído em textura crocante',
    price: 5.0,
    category: 'gourmet',
    image: '/images/prod-pacoca.jpg',
    alt: 'Brigadeiro de paçoca coberto com amendoim torrado moído',
  },
  {
    id: 'maracuja',
    name: 'Maracujá',
    description: 'Acidez tropical equilibrando o doce do chocolate',
    price: 5.0,
    category: 'gourmet',
    image: '/images/prod-maracuja.jpg',
    alt: 'Brigadeiro sabor maracujá coberto com granulado',
  },
  {
    id: 'romeu-julieta',
    name: 'Romeu e Julieta',
    description: 'Goiabada e queijo, combinação clássica brasileira',
    price: 5.5,
    category: 'gourmet',
    image: '/images/prod-romeu-julieta.jpg',
    alt: 'Brigadeiros sabor romeu e julieta, goiabada e queijo',
  },
  {
    id: 'leite-ninho',
    name: 'Leite Ninho',
    description: 'Cremoso, coberto com leite em pó',
    price: 5.0,
    category: 'gourmet',
    image: '/images/prod-leite-ninho.jpg',
    alt: 'Brigadeiro de leite ninho cremoso coberto com leite em pó',
    badge: 'Mais vendido',
  },
  {
    id: 'churros',
    name: 'Churros',
    description: 'Canela e doce de leite, irresistível',
    price: 5.5,
    category: 'gourmet',
    image: '/images/prod-churros.jpg',
    alt: 'Brigadeiro sabor churros com canela e doce de leite',
  },
  {
    id: 'ferrero',
    name: 'Ferrero',
    description: 'Chocolate intenso com avelã, inspirado no clássico',
    price: 6.0,
    category: 'gourmet',
    image: '/images/prod-ferrero.jpg',
    alt: 'Brigadeiro gourmet de chocolate com avelã',
  },
  {
    id: 'pistache',
    name: 'Pistache',
    description: 'Sabor sofisticado direto da Itália',
    price: 6.5,
    category: 'gourmet',
    image: '/images/prod-pistache.jpg',
    alt: 'Brigadeiro gourmet coberto com pistache verde moído',
    badge: 'Mais vendido',
  },
  {
    id: 'caixa-12',
    name: 'Caixa 12 unidades',
    description: 'Sortimento de sabores tradicionais e gourmet',
    price: 48.0,
    category: 'caixas',
    image: '/images/caixa-12.jpg',
    alt: 'Caixa com 12 brigadeiros sortidos',
  },
  {
    id: 'caixa-24',
    name: 'Caixa 24 unidades',
    description: 'Ideal para festas e comemorações',
    price: 89.0,
    category: 'caixas',
    image: '/images/caixa-24.jpg',
    alt: 'Caixa com 24 brigadeiros sortidos',
  },
  {
    id: 'caixa-50',
    name: 'Caixa 50 unidades',
    description: 'Para grandes celebrações',
    price: 175.0,
    category: 'caixas',
    image: '/images/caixa-50.jpg',
    alt: 'Caixa com 50 brigadeiros sortidos',
  },
];

export function formatPrice(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Texto de "quantas unidades vêm" / peso por unidade / peso total, pro selo
// de destaque no card e no modal de detalhe. null quando o produto não tem
// nem unidades nem gramas cadastradas (campos opcionais no admin).
//
// `completo: true` (modal, mais espaço) soletra "unidades" e inclui o peso
// total entre parênteses. A versão compacta (card, grid de 2 colunas no
// celular) abrevia pra "un." e omite o total — com o total, o texto quebra
// em 2 linhas só nos produtos com mais dígitos e desequilibra a altura dos
// cards na mesma fileira.
export function pesoLabel(product, { completo = false } = {}) {
  const { units, grams } = product;
  if (!(units > 1) && !(grams > 0)) return null;

  const partes = [];
  if (units > 1) partes.push(`${units}${completo ? ' unidades' : ' un.'}`);
  if (grams > 0) partes.push(`${grams}g ${units > 1 ? 'cada' : 'por unidade'}`);

  let texto = partes.join(' · ');
  if (completo && units > 1 && grams > 0) texto += ` (${units * grams}g no total)`;
  return texto;
}
