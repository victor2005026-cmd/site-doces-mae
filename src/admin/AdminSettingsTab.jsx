import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { gerarLinkGoogleMaps } from '../lib/mapsLink';

const DIAS = [
  { id: 0, label: 'Dom' }, { id: 1, label: 'Seg' }, { id: 2, label: 'Ter' },
  { id: 3, label: 'Qua' }, { id: 4, label: 'Qui' }, { id: 5, label: 'Sex' },
  { id: 6, label: 'Sáb' },
];

function Salvando({ saved }) {
  if (!saved) return null;
  return <span className="ml-2 text-[0.82rem] text-success">Salvo!</span>;
}

// Máscara (13) 99174-9391 enquanto digita
function formatarTelefone(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// "+5513991749391" -> "13991749391" (só os dígitos, sem o +55) pra exibir no input mascarado
function pixChaveParaTelefone(chave) {
  const digits = (chave ?? '').replace(/\D/g, '');
  return digits.startsWith('55') && digits.length === 13 ? digits.slice(2) : digits;
}

export default function AdminSettingsTab() {
  const [cfg, setCfg] = useState(null);
  const [telefonePix, setTelefonePix] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pixErro, setPixErro] = useState('');

  useEffect(() => {
    supabase.from('configuracoes').select('*').eq('id', 1).single().then(({ data }) => {
      if (data) {
        setCfg(data);
        setTelefonePix(pixChaveParaTelefone(data.pix_chave));
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();

    const telefoneDigits = telefonePix.replace(/\D/g, '');
    const nomeFavorecido = (cfg.pix_nome ?? '').trim();

    if (telefoneDigits && telefoneDigits.length !== 11) {
      setPixErro('O número precisa ter DDD + 9 dígitos (11 números ao todo).');
      return;
    }
    if (nomeFavorecido && (nomeFavorecido.length < 2 || nomeFavorecido.length > 25)) {
      setPixErro('O nome do favorecido precisa ter entre 2 e 25 caracteres.');
      return;
    }
    setPixErro('');

    setSaving(true);

    const linkMaps = cfg.link_google_maps || gerarLinkGoogleMaps(cfg.endereco_retirada);
    const pixChave = telefoneDigits ? `+55${telefoneDigits}` : null;

    await supabase.from('configuracoes').update({
      antecedencia_minima_horas: cfg.antecedencia_minima_horas,
      taxa_entrega_padrao: cfg.taxa_entrega_padrao,
      endereco_retirada: cfg.endereco_retirada,
      horario_funcionamento: cfg.horario_funcionamento,
      horario_retirada: cfg.horario_retirada,
      link_google_maps: linkMaps,
      pix_chave: pixChave,
      pix_tipo: pixChave ? 'celular' : null,
      pix_nome: nomeFavorecido || null,
      pix_cidade: pixChave ? 'SANTOS' : null,
      notif_email_ativo: cfg.notif_email_ativo ?? false,
      notif_email_destino: cfg.notif_email_destino || null,
      emailjs_service_id: cfg.emailjs_service_id || null,
      emailjs_template_id: cfg.emailjs_template_id || null,
      emailjs_public_key: cfg.emailjs_public_key || null,
    }).eq('id', 1);

    setCfg((p) => ({ ...p, link_google_maps: linkMaps, pix_chave: pixChave, pix_tipo: pixChave ? 'celular' : null, pix_cidade: pixChave ? 'SANTOS' : null }));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const setField = (f) => (e) => {
    setSaved(false);
    setCfg((p) => ({ ...p, [f]: e.target.value }));
  };

  const setHorario = (campo, f) => (e) => {
    setSaved(false);
    setCfg((p) => ({ ...p, [campo]: { ...p[campo], [f]: e.target.value } }));
  };

  const toggleDia = (campo, id) => {
    setSaved(false);
    setCfg((p) => {
      const dias = p[campo]?.dias ?? [];
      return {
        ...p,
        [campo]: {
          ...p[campo],
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

  const HorarioFields = ({ campo }) => (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {DIAS.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => toggleDia(campo, d.id)}
            className={`rounded-full border px-4 py-1.5 text-[0.85rem] font-medium transition-colors ${
              (cfg[campo]?.dias ?? []).includes(d.id)
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
          <input type="time" value={cfg[campo]?.abre ?? '09:00'} onChange={setHorario(campo, 'abre')} className={ic} />
        </div>
        <div>
          <label className={lbl}>Fecha às</label>
          <input type="time" value={cfg[campo]?.fecha ?? '18:00'} onChange={setHorario(campo, 'fecha')} className={ic} />
        </div>
      </div>
    </>
  );

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={lbl}>Antecedência mínima (horas)</label>
              <input type="number" min="1" value={cfg.antecedencia_minima_horas} onChange={setField('antecedencia_minima_horas')} className={ic} />
            </div>
            <div>
              <label className={lbl}>Taxa de entrega padrão (R$)</label>
              <input type="number" step="0.5" min="0" value={cfg.taxa_entrega_padrao} onChange={setField('taxa_entrega_padrao')} className={ic} />
            </div>
          </div>
          <p className="mt-2 text-[0.78rem] text-text-secondary">
            A taxa padrão só é usada como reserva — bairros cadastrados na aba "Taxas de entrega" têm prioridade.
          </p>
        </div>

        {/* Endereço de retirada */}
        <div className="rounded-card border border-border-light bg-bg-main p-5">
          <h3 className="mb-4 font-heading text-[0.95rem] font-semibold text-text-primary">Endereço de retirada</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={lbl}>Rua / Avenida</label>
              <input value={cfg.endereco_retirada?.rua ?? ''} onChange={setEndereco('rua')} className={ic} />
            </div>
            <div>
              <label className={lbl}>Número</label>
              <input value={cfg.endereco_retirada?.numero ?? ''} onChange={setEndereco('numero')} className={ic} />
            </div>
            <div>
              <label className={lbl}>Complemento</label>
              <input value={cfg.endereco_retirada?.complemento ?? ''} onChange={setEndereco('complemento')} className={ic} />
            </div>
            <div>
              <label className={lbl}>Bairro</label>
              <input value={cfg.endereco_retirada?.bairro ?? ''} onChange={setEndereco('bairro')} className={ic} />
            </div>
            <div>
              <label className={lbl}>Cidade</label>
              <input value={cfg.endereco_retirada?.cidade ?? ''} onChange={setEndereco('cidade')} placeholder="Santos" className={ic} />
            </div>
            <div>
              <label className={lbl}>CEP</label>
              <input value={cfg.endereco_retirada?.cep ?? ''} onChange={setEndereco('cep')} className={ic} />
            </div>
            <div className="sm:col-span-2">
              <label className={lbl}>Ponto de referência</label>
              <input value={cfg.endereco_retirada?.referencia ?? ''} onChange={setEndereco('referencia')} className={ic} />
            </div>
            <div className="sm:col-span-2">
              <label className={lbl}>Link do Google Maps <span className="font-normal text-text-secondary">(opcional — se deixar vazio, é gerado automaticamente ao salvar)</span></label>
              <input value={cfg.link_google_maps ?? ''} onChange={setField('link_google_maps')} placeholder="https://www.google.com/maps/…" className={ic} />
            </div>
          </div>

          <h4 className="mb-2 mt-5 text-[0.9rem] font-medium text-text-primary">Horário de retirada</h4>
          <p className="mb-3 text-[0.78rem] text-text-secondary">Se for diferente do horário geral de funcionamento.</p>
          <HorarioFields campo="horario_retirada" />
        </div>

        {/* Horário de funcionamento */}
        <div className="rounded-card border border-border-light bg-bg-main p-5">
          <h3 className="mb-4 font-heading text-[0.95rem] font-semibold text-text-primary">Horário de funcionamento</h3>
          <HorarioFields campo="horario_funcionamento" />
        </div>

        {/* Pix */}
        <div className="rounded-card border border-border-light bg-bg-main p-5">
          <h3 className="mb-4 font-heading text-[0.95rem] font-semibold text-text-primary">Pagamentos Pix</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={lbl}>Número do WhatsApp para Pix</label>
              <input
                value={formatarTelefone(telefonePix)}
                onChange={(e) => { setSaved(false); setTelefonePix(e.target.value); }}
                placeholder="(13) 99174-9391"
                className={ic}
              />
            </div>
            <div>
              <label className={lbl}>Nome do favorecido <span className="font-normal text-text-secondary">(como aparece na chave Pix, máx. 25 caracteres)</span></label>
              <input
                value={cfg.pix_nome ?? ''}
                onChange={(e) => { setSaved(false); setCfg((p) => ({ ...p, pix_nome: e.target.value.slice(0, 25) })); }}
                placeholder="ALESSANDRA SILVA"
                maxLength={25}
                className={ic}
              />
            </div>
          </div>
          <p className="mt-2 text-[0.78rem] text-text-secondary">Cidade do favorecido: Santos (fixo).</p>
          {pixErro && <p className="mt-2 text-[0.82rem] text-rose-dark">{pixErro}</p>}
        </div>

        {/* Notificação de pedido novo por e-mail */}
        <div className="rounded-card border border-border-light bg-bg-main p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-heading text-[0.95rem] font-semibold text-text-primary">Notificação de pedido novo por e-mail</h3>
            <button
              type="button"
              onClick={() => { setSaved(false); setCfg((p) => ({ ...p, notif_email_ativo: !p.notif_email_ativo })); }}
              className={`rounded-full border px-4 py-1.5 text-[0.82rem] font-medium transition-colors ${
                cfg.notif_email_ativo ? 'border-success/40 bg-success/10 text-success' : 'border-border-light text-text-secondary'
              }`}
            >
              {cfg.notif_email_ativo ? 'Ativada' : 'Desativada'}
            </button>
          </div>

          <p className="mb-4 text-[0.8rem] text-text-secondary">
            Usa o <a href="https://www.emailjs.com" target="_blank" rel="noopener noreferrer" className="text-rose underline">EmailJS</a> (grátis até 200 e-mails/mês).
            Crie uma conta lá, conecte seu e-mail em "Email Services" e crie um modelo em "Email Templates" usando as
            variáveis <code className="rounded bg-bg-alt px-1">numero_pedido</code>, <code className="rounded bg-bg-alt px-1">total</code>,{' '}
            <code className="rounded bg-bg-alt px-1">cliente</code>, <code className="rounded bg-bg-alt px-1">telefone</code>,{' '}
            <code className="rounded bg-bg-alt px-1">tipo_entrega</code>, <code className="rounded bg-bg-alt px-1">data_agendada</code> e{' '}
            <code className="rounded bg-bg-alt px-1">itens</code> — e o destinatário <code className="rounded bg-bg-alt px-1">to_email</code>.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={lbl}>E-mail que recebe o aviso</label>
              <input
                type="email"
                value={cfg.notif_email_destino ?? ''}
                onChange={setField('notif_email_destino')}
                placeholder="ale@exemplo.com"
                className={ic}
              />
            </div>
            <div>
              <label className={lbl}>Service ID</label>
              <input value={cfg.emailjs_service_id ?? ''} onChange={setField('emailjs_service_id')} placeholder="service_xxxxxxx" className={ic} />
            </div>
            <div>
              <label className={lbl}>Template ID</label>
              <input value={cfg.emailjs_template_id ?? ''} onChange={setField('emailjs_template_id')} placeholder="template_xxxxxxx" className={ic} />
            </div>
            <div>
              <label className={lbl}>Public Key</label>
              <input value={cfg.emailjs_public_key ?? ''} onChange={setField('emailjs_public_key')} placeholder="xXxXxXxXxXxXxXxXx" className={ic} />
            </div>
          </div>
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
