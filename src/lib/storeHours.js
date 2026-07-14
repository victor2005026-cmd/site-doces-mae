const HOURS_KEY = 'docesdaale:admin-hours';

function loadConfig() {
  try {
    const raw = localStorage.getItem(HOURS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function getStoreStatus(now = new Date()) {
  const config = loadConfig();

  if (config?.forceStatus === 'open') {
    return { isOpen: true, label: config.forceLabel || 'Aberto agora' };
  }
  if (config?.forceStatus === 'closed') {
    return { isOpen: false, label: config.forceLabel || 'Temporariamente fechado' };
  }

  const openDays = config?.openDays ?? [1, 2, 3, 4, 5, 6];
  const [openH, openM] = (config?.openTime ?? '09:00').split(':').map(Number);
  const [closeH, closeM] = (config?.closeTime ?? '18:00').split(':').map(Number);

  const day = now.getDay();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const openMin = openH * 60 + openM;
  const closeMin = closeH * 60 + closeM;
  const isOpen = openDays.includes(day) && currentMin >= openMin && currentMin < closeMin;

  const openLabel = config?.openTime ?? '09:00';
  const closeLabel = config?.closeTime ?? '18:00';

  if (isOpen) return { isOpen: true, label: `Aberto · Fecha às ${closeLabel}` };

  const tomorrow = (day + 1) % 7;
  if (openDays.includes(tomorrow)) {
    return { isOpen: false, label: `Fechado · Abre amanhã às ${openLabel}` };
  }
  return { isOpen: false, label: `Fechado · Consulte os horários` };
}
