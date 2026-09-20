// Título da seção de eventos, configurável no admin (Configurações > Seção de
// eventos). Ex: título "Dia dos Professores" + destaque "Professores" + emoji
// "🍎": a palavra em destaque ganha um brilho colorido passando pelas letras e
// o emoji fica balançando. Sem configuração, cai no texto "Eventos" normal.
//
// compacto: usado na aba da barra de categorias — sem o brilho (o texto
// transparente some no fundo rosa da aba ativa), só o emoji balança.
export default function EventoTitulo({ config, compacto = false }) {
  const titulo = (config?.evento_titulo ?? '').trim() || 'Eventos';
  const destaque = (config?.evento_destaque ?? '').trim();
  const emoji = (config?.evento_emoji ?? '').trim();

  let conteudo = titulo;
  if (!compacto && destaque) {
    const idx = titulo.toLowerCase().indexOf(destaque.toLowerCase());
    if (idx !== -1) {
      conteudo = (
        <>
          {titulo.slice(0, idx)}
          <span className="evento-shimmer font-bold">{titulo.slice(idx, idx + destaque.length)}</span>
          {titulo.slice(idx + destaque.length)}
        </>
      );
    }
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{conteudo}</span>
      {emoji && <span className="evento-wiggle" aria-hidden="true">{emoji}</span>}
    </span>
  );
}
