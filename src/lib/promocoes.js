// Promoções do tipo "leve N por R$X" (produto_id + quantidade + preco_promocional
// — preco_promocional é o preço TOTAL pra "quantidade" unidades, não o unitário).
// Aplicadas automaticamente no carrinho, sem precisar de cupom.

// Retorna a promoção ativa vinculada a um produto (ou null, se não houver).
export function encontrarPromocaoDoProduto(produtoId, promocoesBundle) {
  return promocoesBundle.find((p) => p.produto_id === produtoId) ?? null;
}

// Preço de um item do carrinho já considerando a promoção (se a quantidade
// no carrinho bater ou passar da exigida pela promoção).
export function calcularPrecoItem(item, promocoesBundle) {
  const promo = encontrarPromocaoDoProduto(item.id, promocoesBundle);
  if (!promo || item.quantity < promo.quantidade) {
    return item.price * item.quantity;
  }
  const combos = Math.floor(item.quantity / promo.quantidade);
  const resto = item.quantity % promo.quantidade;
  return combos * Number(promo.preco_promocional) + resto * item.price;
}

export function calcularSubtotalComPromocoes(items, promocoesBundle) {
  return items.reduce((total, item) => total + calcularPrecoItem(item, promocoesBundle), 0);
}

// Quanto o cliente economiza no total, comparado ao preço cheio (sem promoção)
export function calcularEconomiaPromocoes(items, promocoesBundle) {
  const precoCheio = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const comPromocao = calcularSubtotalComPromocoes(items, promocoesBundle);
  return Math.max(0, precoCheio - comPromocao);
}
