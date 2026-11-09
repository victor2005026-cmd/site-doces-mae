// Enfeites de Natal do site. Tudo é SVG/CSS próprio (nada vem de fora, então a
// CSP não muda) e os estilos ficam em src/natal.css.

const LAMPADAS = Array.from({ length: 64 });

// Pisca-pisca pendurado na borda de baixo do cabeçalho.
export function PiscaPisca() {
  return (
    <div className="natal-pisca" aria-hidden="true">
      {LAMPADAS.map((_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}

// [posição horizontal %, duração s, atraso s, tamanho px]
const FLOCOS = [
  [3, 13, 0, 7], [47, 11, 3, 5], [86, 15, 1, 8], [24, 12, 6, 6], [66, 14, 8, 7],
  [12, 16, 4, 5], [78, 12, 10, 6], [36, 15, 2, 8], [94, 13, 5, 5], [56, 11, 7, 7],
  [18, 14, 11, 8], [41, 16, 9, 5], [72, 13, 12, 7], [8, 11, 14, 6], [52, 15, 13, 8],
  [30, 12, 15, 5], [90, 14, 16, 7], [62, 16, 17, 6],
];

// Neve caindo por cima da loja, sem atrapalhar cliques.
export function Neve() {
  return (
    <div className="natal-neve" aria-hidden="true">
      {FLOCOS.map(([left, duracao, atraso, tamanho]) => (
        <span
          key={left}
          style={{
            left: `${left}%`,
            width: tamanho,
            height: tamanho,
            animationDuration: `${duracao}s`,
            animationDelay: `-${atraso}s`,
          }}
        />
      ))}
    </div>
  );
}

export function Azevinho({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 32 24" aria-hidden="true" focusable="false">
      <path d="M16 14C11 6 5 5 1 8c3 1 3 4 6 4-1 2 1 4 3 4 2 1 4 0 6-2z" fill="#1F7A4A" />
      <path d="M16 14c5-8 11-9 15-6-3 1-3 4-6 4 1 2-1 4-3 4-2 1-4 0-6-2z" fill="#146B3A" />
      <circle cx="13" cy="15" r="3" fill="#C1121F" />
      <circle cx="19" cy="15" r="3" fill="#C1121F" />
      <circle cx="16" cy="19" r="3" fill="#E5484D" />
    </svg>
  );
}

// Laço que "amarra" a moldura do banner.
export function Laco() {
  return (
    <svg className="natal-laco" viewBox="0 0 80 52" aria-hidden="true" focusable="false">
      <path d="M36 24 24 50l9-5 5 5 3-24z" fill="#8E1622" />
      <path d="M44 24l12 26-9-5-5 5-3-24z" fill="#8E1622" />
      <path d="M40 20C28 4 8 2 6 12c-2 9 16 16 34 10z" fill="#C1121F" />
      <path d="M40 20C52 4 72 2 74 12c2 9-16 16-34 10z" fill="#B3202E" />
      <rect x="33" y="14" width="14" height="13" rx="4" fill="#D4A63A" />
    </svg>
  );
}

// Faixa de boas-festas logo abaixo do banner.
export function FaixaNatal() {
  return (
    <div className="natal-faixa">
      <Azevinho className="h-6 w-8 flex-shrink-0 sm:h-8 sm:w-11" />
      <p className="text-center leading-tight">
        <span className="font-script text-[1.7rem] text-[#F6D98B] sm:text-[2.1rem]">Feliz Natal!</span>
        <span className="block text-[0.82rem] font-medium text-white sm:inline sm:pl-3 sm:text-[0.95rem]">
          Adoce as festas de quem você ama
        </span>
      </p>
      <Azevinho className="h-6 w-8 flex-shrink-0 sm:h-8 sm:w-11" />
    </div>
  );
}
