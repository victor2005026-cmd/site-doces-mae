// Formata uma data como YYYY-MM-DD usando o fuso horário LOCAL do navegador.
// Nunca use `.toISOString()` pra isso: ela converte pra UTC, e como o Brasil
// está atrás de UTC, num horário perto da meia-noite local (~21h-23h59) ela
// "pula" pro dia seguinte — fazendo o pedido ser salvo com uma data diferente
// da que aparece escrita na tela.
export function isoDateLocal(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
