import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const DIAS = [
  { id: 0, label: 'Dom' }, { id: 1, label: 'Seg' }, { id: 2, label: 'Ter' },
  { id: 3, label: 'Qua' }, { id: 4, label: 'Qui' }, { id: 5, label: 'Sex' },
  { id: 6, label: 'Sáb' },
];

function Salvando({ saved }) {
  if (!saved) return null;
  return <span className="ml-2 text-[0.82rem] text-success">Salvo!</span>;
}

export default function AdminSettingsTab() {
  const [cfg, setCfg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from('configuracoes').select('*').eq('id', 1).single().then(({ data }) => {
      if (data) setCfg(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from('configuracoes').update({
      antecedencia_minima_horas: cfg.antecedencia_minima_horas,
      taxa_entrega_padrao: cfg.taxa_entrega_padrao,
      pedido_minimo: cfg.pedido_minimo,
      endereco_retirada: cfg.endereco_retirada,
      horario_funcionamento: cfg.horario_funcionamento,
      mp_access_token: cfg.mp_access_token,
    }).eq('id', 1);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const setField = (f) => (e) => {
    setSaved(false);
    setCfg((p) => ({ ...p, [f]: e.target.value }));
  };

  const setHorario = (f) => (e) => {
    setSaved(false);
    setCfg((p) => ({ ...p, horario_funcionamento: { ...p.horario_funcionamento, [f]: e.target.value } }));
  };

  const toggleDia = (id) => {
    setSaved(false);
    setCfg((p) => {
      const dias = p.horario_funcionamento?.dias ?? [];
      return {
        ...p,
        horario_funcionamento: {
          ...p.horario_funcionamento,
          dias: dias.includes(id) ? dias.filter((d) => d !== id) : [...dias, id].sort((a, b) => a - b),
        },
      };
    });
  };

  const setEndereco = (f) => (e) => {
    setSaved(false);
    setCfg((p) => ({ ...p, endereco_retirada: { ...p.endereco_retirada, [f]: e.target.value } }));
  };

  if (loading || !cfg) return <p className="py-8 text-center text-text-secondary">Carregando…</p>;

  const ic = 'w-full rounded-card border border-border-light bg-bg-alt px-4 py-2.5 text-[0.95rem] outline-none focus:border-rose focus:ring-1 focus:ring-rose';
  const lbl = 'mb-1 block text-[0.85rem] font-medium text-text-primary';

  return (
    <div>
      <div className="mb-4 flex items-center">
        <h2 className="font-heading text-[1.1rem] font-semibold text-text-primary">Configurações</h2>
        <Salvando saved={saved} />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Pedidos */}
        <div className="rounded-card border border-border-light bg-bg-main p-5">
          <h3 className="mb-4 font-heading text-[0.95rem] font-semibold text-text-primary">Pedidos</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={lbl}>Antecedência mínima (horas)</label>
              <input type="number" min="1" value={cfg.antecedencia_minima_horas} onChange={setField('antecedencia_minima_horas')} className={ic} />
            </div>
            <div>
              <label className={lbl}>Taxa de entrega (R$)</label>
              <input type="number" step="0.5" min="0" value={cfg.taxa_entrega_padrao} onChange={setField('taxa_entrega_padrao')} className={ic} />
            </div>
            <div>
              <label className={lbl}>Pedido mínimo (R$)</label>
              <input type="number" step="0.5" min="0" value={cfg.pedido_minimo} onChange={setField('pedido_minimo')} className={ic} />
            </div>
          </div>
        </div>

        {/* Horário */}
        <div className="rounded-card border border-border-light bg-bg-main p-5">
          <h3 className="mb-4 font-heading text-[0.95rem] font-semibold text-text-primary">Horário de funcionamento</h3>
          <div className="mb-4 flex flex-wrap gap-2">
            {DIAS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => toggleDia(d.id)}
                className={`rounded-full border px-4 py-1.5 text-[0.85rem] font-medium transition-colors ${
                  (cfg.horario_funcionamento?.dias ?? []).includes(d.id)
                    ? 'border-rose bg-rose text-white'
                    : 'border-border-light text-text-secondary hover:border-rose/50'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Abre às</label>
              <input type="time" value={cfg.horario_funcionamento?.abre ?? '09:00'} onChange={setHorario('abre')} className={ic} />
            </div>
            <div>
              <label className={lbl}>Fecha às</label>
              <input type="time" value={cfg.horario_funcionamento?.fecha ?? '18:00'} onChange={setHorario('fecha')} className={ic} />
            </div>
          </div>
        </div>

        {/* Endereço de retirada */}
        <div className="rounded-card border border-border-light bg-bg-main p-5">
          <h3 className="mb-4 font-heading text-[0.95rem] font-semibold text-text-primary">Endereço de retirada</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={lbl}>Rua / Avenida</label>
              <input value={cfg.endereco_retirada?.rua ?? ''} onChange={setEndereco('rua')} className={ic} />
            </div>
            <div>
              <label className={lbl}>Bairro</label>
              <input value={cfg.endereco_retirada?.bairro ?? ''} onChange={setEndereco('bairro')} className={ic} />
            </div>
            <div>
              <label className={lbl}>Cidade / UF</label>
              <input value={cfg.endereco_retirada?.cidade ?? ''} onChange={setEndereco('cidade')} placeholder="Santos/SP" className={ic} />
            </div>
          </div>
        </div>

        {/* Mercado Pago */}
        <div className="rounded-card border border-border-light bg-bg-main p-5">
          <h3 className="mb-2 font-heading text-[0.95rem] font-semibold text-text-primary">Mercado Pago</h3>
          <p className="mb-3 text-[0.82rem] text-text-secondary">
            Cole aqui o Access Token do Mercado Pago (começa com APP_USR ou TEST). Gere em
            <a href="https://www.mercadopago.com.br/developers" target="_blank" rel="noopener noreferrer" className="ml-1 text-rose underline">mercadopago.com.br/developers</a>.
          </p>
          <input
            type="password"
            value={cfg.mp_access_token ?? ''}
            onChange={setField('mp_access_token')}
            placeholder="APP_USR-…"
            className={ic}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-rose px-8 py-2.5 text-[0.95rem] font-semibold text-white hover:bg-rose-dark disabled:opacity-60"
        >
          {saving ? 'Salvando…' : 'Salvar configurações'}
        </button>
      </form>
    </div>
  );
}
