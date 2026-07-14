import { useState } from 'react';
import { useAdminProducts } from '../context/AdminProductsContext';

const DAYS = [
  { id: 0, label: 'Dom' },
  { id: 1, label: 'Seg' },
  { id: 2, label: 'Ter' },
  { id: 3, label: 'Qua' },
  { id: 4, label: 'Qui' },
  { id: 5, label: 'Sex' },
  { id: 6, label: 'Sáb' },
];

export default function AdminHoursForm() {
  const { hours, saveHours } = useAdminProducts();
  const [form, setForm] = useState({ ...hours });
  const [saved, setSaved] = useState(false);

  const toggleDay = (id) => {
    setSaved(false);
    setForm((prev) => ({
      ...prev,
      openDays: prev.openDays.includes(id)
        ? prev.openDays.filter((d) => d !== id)
        : [...prev.openDays, id].sort((a, b) => a - b),
    }));
  };

  const setField = (field) => (e) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const setForce = (value) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, forceStatus: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveHours(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputClass =
    'rounded-card border border-border-light bg-bg-alt px-3 py-2 text-[0.95rem] outline-none focus:border-rose focus:ring-1 focus:ring-rose';

  return (
    <div>
      <h2 className="mb-4 font-heading text-[1.1rem] font-semibold text-text-primary">Horário de funcionamento</h2>

      <form onSubmit={handleSubmit} className="rounded-card border border-border-light bg-bg-main p-5">
        {/* Dias abertos */}
        <div className="mb-5">
          <p className="mb-2 text-[0.9rem] font-medium text-text-primary">Dias abertos</p>
          <div className="flex gap-2">
            {DAYS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => toggleDay(d.id)}
                className={`rounded-full border px-4 py-1.5 text-[0.85rem] font-medium transition-colors ${
                  form.openDays.includes(d.id)
                    ? 'border-rose bg-rose text-white'
                    : 'border-border-light text-text-secondary hover:border-rose/50'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Horário */}
        <div className="mb-5 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="open-time" className="mb-1 block text-[0.85rem] font-medium text-text-primary">
              Abre às
            </label>
            <input
              id="open-time"
              type="time"
              value={form.openTime}
              onChange={setField('openTime')}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="close-time" className="mb-1 block text-[0.85rem] font-medium text-text-primary">
              Fecha às
            </label>
            <input
              id="close-time"
              type="time"
              value={form.closeTime}
              onChange={setField('closeTime')}
              className={inputClass}
            />
          </div>
        </div>

        {/* Status forçado */}
        <div className="mb-5">
          <p className="mb-2 text-[0.9rem] font-medium text-text-primary">Forçar status</p>
          <div className="flex flex-wrap gap-2">
            {[
              { value: null, label: 'Automático' },
              { value: 'open', label: 'Sempre aberto' },
              { value: 'closed', label: 'Sempre fechado' },
            ].map(({ value, label }) => (
              <button
                key={String(value)}
                type="button"
                onClick={() => setForce(value)}
                className={`rounded-full border px-4 py-1.5 text-[0.85rem] font-medium transition-colors ${
                  form.forceStatus === value
                    ? 'border-rose bg-rose text-white'
                    : 'border-border-light text-text-secondary hover:border-rose/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {form.forceStatus && (
            <div className="mt-3">
              <label
                htmlFor="force-label"
                className="mb-1 block text-[0.85rem] font-medium text-text-primary"
              >
                Mensagem exibida no site
              </label>
              <input
                id="force-label"
                value={form.forceLabel}
                onChange={setField('forceLabel')}
                placeholder="Ex: Férias até dia 10 de agosto"
                className={`${inputClass} w-full sm:w-80`}
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="rounded-full bg-rose px-6 py-2.5 text-[0.95rem] font-semibold text-white transition-colors hover:bg-rose-dark"
        >
          {saved ? 'Salvo!' : 'Salvar horário'}
        </button>
      </form>
    </div>
  );
}
