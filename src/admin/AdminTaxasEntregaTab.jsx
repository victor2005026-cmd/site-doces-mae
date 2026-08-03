import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../data/products';
import { useAdminProducts } from '../context/AdminProductsContext';

const EMPTY_FORM = { bairro: '', taxa: '', ordem: 0 };

export default function AdminTaxasEntregaTab() {
  const { config } = useAdminProducts();
  const freteAtivo = Boolean(config?.frete_ativo);
  const [taxas, setTaxas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchTaxas = async () => {
    const { data, error } = await supabase.from('taxas_entrega').select('*').order('ordem', { ascending: true });
    if (error) console.error('Erro ao buscar taxas de entrega:', error);
    setTaxas(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchTaxas(); }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bairro.trim()) return;
    setSaving(true);

    const payload = {
      bairro: form.bairro.trim(),
      taxa: form.taxa === '' ? 0 : Number(form.taxa),
      ordem: Number(form.ordem) || 0,
    };

    const { error } = editingId
      ? await supabase.from('taxas_entrega').update(payload).eq('id', editingId)
      : await supabase.from('taxas_entrega').insert(payload);

    if (error) {
      console.error('Erro ao salvar taxa de entrega:', error);
      alert('Erro ao salvar. Verifique se o bairro já não está cadastrado.');
    } else {
      resetForm();
      fetchTaxas();
    }
    setSaving(false);
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setForm({ bairro: t.bairro, taxa: t.taxa, ordem: t.ordem ?? 0 });
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Remover a taxa de entrega de "${t.bairro}"?`)) return;
    const { error } = await supabase.from('taxas_entrega').delete().eq('id', t.id);
    if (error) console.error('Erro ao remover taxa de entrega:', error);
    else fetchTaxas();
  };

  const toggleAtiva = async (t) => {
    const { error } = await supabase.from('taxas_entrega').update({ ativa: !t.ativa }).eq('id', t.id);
    if (error) console.error('Erro ao atualizar taxa de entrega:', error);
    else fetchTaxas();
  };

  const ic = 'w-full rounded-card border border-border-light bg-bg-alt px-4 py-2.5 text-[0.95rem] outline-none focus:border-rose focus:ring-1 focus:ring-rose';
  const lbl = 'mb-1 block text-[0.85rem] font-medium text-text-primary';

  if (loading) return <p className="py-8 text-center text-text-secondary">Carregando…</p>;

  return (
    <div>
      <h2 className="mb-4 font-heading text-[1.1rem] font-semibold text-text-primary">Bairros atendidos</h2>
      <p className="mb-2 text-[0.82rem] text-text-secondary">
        Só bairros cadastrados aqui (e ativos) recebem entrega. Fora dessa lista, o cliente vê a mensagem de "não entregamos nessa região".
      </p>
      {!freteAtivo && (
        <p className="mb-4 rounded-card border border-success/30 bg-success/5 px-3 py-2 text-[0.82rem] text-success">
          O frete está grátis agora — o valor da taxa abaixo não é cobrado do cliente, mas fica guardado pra quando você reativar a cobrança.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mb-6 rounded-card border border-border-light bg-bg-main p-5">
        <h3 className="mb-3 font-heading text-[0.95rem] font-semibold text-text-primary">
          {editingId ? 'Editar bairro' : 'Adicionar bairro'}
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
          <div>
            <label className={lbl}>Bairro</label>
            <input required value={form.bairro} onChange={(e) => setForm((p) => ({ ...p, bairro: e.target.value }))} className={ic} />
          </div>
          <div>
            <label className={lbl}>Taxa (R$) {!freteAtivo && <span className="font-normal text-text-secondary">(não cobrada agora)</span>}</label>
            <input type="number" step="0.5" min="0" placeholder="0,00" value={form.taxa} onChange={(e) => setForm((p) => ({ ...p, taxa: e.target.value }))} className={ic} />
          </div>
          <div>
            <label className={lbl}>Ordem</label>
            <input type="number" value={form.ordem} onChange={(e) => setForm((p) => ({ ...p, ordem: e.target.value }))} className={ic} />
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" disabled={saving} className="rounded-full bg-rose px-5 py-2.5 text-[0.9rem] font-semibold text-white hover:bg-rose-dark disabled:opacity-60">
              {saving ? 'Salvando…' : editingId ? 'Salvar' : 'Adicionar'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="rounded-full border border-border-light px-4 py-2.5 text-[0.9rem] text-text-secondary hover:border-rose hover:text-rose">
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      {taxas.length === 0 ? (
        <p className="py-8 text-center text-text-secondary">Nenhum bairro cadastrado ainda.</p>
      ) : (
        <ul className="divide-y divide-border-light rounded-card border border-border-light bg-bg-main">
          {taxas.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <div className="flex-1 min-w-[140px]">
                <p className={`font-medium ${t.ativa ? 'text-text-primary' : 'text-text-secondary line-through'}`}>{t.bairro}</p>
                <p className="text-[0.8rem] text-text-secondary">Ordem {t.ordem ?? 0}</p>
              </div>
              <span className={freteAtivo ? 'font-bold text-text-primary' : 'text-[0.82rem] text-text-secondary'}>
                {freteAtivo ? formatPrice(t.taxa) : `Grátis (taxa: ${formatPrice(t.taxa)})`}
              </span>
              <button
                type="button"
                onClick={() => toggleAtiva(t)}
                className={`rounded-full border px-3 py-1 text-[0.78rem] font-medium ${
                  t.ativa ? 'border-success/40 text-success' : 'border-border-light text-text-secondary'
                }`}
              >
                {t.ativa ? 'Ativa' : 'Inativa'}
              </button>
              <button type="button" onClick={() => handleEdit(t)} className="rounded-full border border-border-light px-3 py-1 text-[0.78rem] font-medium text-text-secondary hover:border-rose hover:text-rose">
                Editar
              </button>
              <button type="button" onClick={() => handleDelete(t)} className="rounded-full border border-rose/30 px-3 py-1 text-[0.78rem] font-medium text-rose-dark hover:border-rose">
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
