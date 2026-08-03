const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Formata uma lista de dias (0=Dom..6=Sáb) como "Seg a Sáb" ou, se não for
// um intervalo contínuo, como a lista separada por vírgula.
export function formatDiasLabel(dias) {
  if (!dias?.length) return '';
  const sorted = [...dias].sort((a, b) => a - b);
  const isConsecutive = sorted.every((d, i) => i === 0 || d === sorted[i - 1] + 1);
  if (isConsecutive && sorted.length > 1) {
    return `${DAY_NAMES[sorted[0]]} a ${DAY_NAMES[sorted[sorted.length - 1]]}`;
  }
  return sorted.map((d) => DAY_NAMES[d]).join(', ');
}

// Calcula aberto/fechado a partir do horario_funcionamento salvo em public.configuracoes.
export function getStoreStatus(horarioFuncionamento, now = new Date()) {
  const config = horarioFuncionamento ?? {};

  if (config.forceStatus === 'open') {
    return { isOpen: true, label: config.forceLabel || 'Aberto agora' };
  }
  if (config.forceStatus === 'closed') {
    return { isOpen: false, label: config.forceLabel || 'Temporariamente fechado' };
  }

  const openDays = config.dias ?? [1, 2, 3, 4, 5, 6];
  const [openH, openM] = (config.abre ?? '09:00').split(':').map(Number);
  const [closeH, closeM] = (config.fecha ?? '18:00').split(':').map(Number);

  const day = now.getDay();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const openMin = openH * 60 + openM;
  const closeMin = closeH * 60 + closeM;
  const isOpen = openDays.includes(day) && currentMin >= openMin && currentMin < closeMin;

  const openLabel = config.abre ?? '09:00';
  const closeLabel = config.fecha ?? '18:00';

  if (isOpen) return { isOpen: true, label: `Aberto · Fecha às ${closeLabel}` };

  const tomorrow = (day + 1) % 7;
  if (openDays.includes(tomorrow)) {
    return { isOpen: false, label: `Fechado · Abre amanhã às ${openLabel}` };
  }
  return { isOpen: false, label: `Fechado · Consulte os horários` };
}
