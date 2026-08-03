import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../data/products';

const EMPTY_FORM = {
  codigo: '', tipo: 'percentual', valor: '', valor_minimo_pedido: '',
  data_fim: '', usos_maximos: '', telefone_cliente: '', descricao: '', ativo: true,
};

function statusCupom(c) {
  if (!c.ativo) return { label: 'Inativo', cls: 'bg-bg-alt text-text-secondary' };
  if (c.data_fim && new Date(c.data_fim) < new Date()) return { label: 'Expirado', cls: 'bg-rose/20 text-rose-dark' };
  if (c.usos_maximos != null && c.usos_atuais >= c.usos_maximos) return { label: 'Esgotado', cls: 'bg-gold/20 text-gold' };
  return { label: 'Ativo', cls: 'bg-success/20 text-success' };
}

// datetime-local <-> timestamptz (mantém o valor local, sem conversão de fuso)
function toDatetimeLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminCuponsTab() {
  const [cupons, setCupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');

  const fetchCupons = async () => {
    const { data, error } = await supabase.from('cupons').select('*').order('created_at', { ascending: false });
    if (error) console.error('Erro ao buscar cupons:', error);
    setCupons(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchCupons(); }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setErro('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.codigo.trim() || form.valor === '') return;
    setSaving(true);
    setErro('');

    const payload = {
      codigo: form.codigo.trim().toUpperCase(),
      tipo: form.tipo,
      valor: Number(form.valor),
      valor_minimo_pedido: form.valor_minimo_pedido === '' ? 0 : Number(form.valor_minimo_pedido),
      data_fim: form.data_fim ? new Date(form.data_fim).toISOString() : null,
      usos_maximos: form.usos_maximos === '' ? null : Number(form.usos_maximos),
      telefone_cliente: form.telefone_cliente.replace(/\D/g, '') || null,
      descricao: form.descricao.trim() || null,
      ativo: form.ativo,
    };

    const { error } = editingId
      ? await supabase.from('cupons').update(payload).eq('id', editingId)
      : await supabase.from('cupons').insert(payload);

    if (error) {
      console.error('Erro ao salvar cupom:', error);
      setErro(error.code === '23505' ? 'Já existe um cupom com esse código.' : 'Não consegui salvar o cupom.');
    } else {
      resetForm();
      fetchCupons();
    }
    setSaving(false);
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setErro('');
    setForm({
      codigo: c.codigo,
      tipo: c.tipo,
      valor: c.valor,
      valor_minimo_pedido: c.valor_minimo_pedido ?? '',
      data_fim: toDatetimeLocal(c.data_fim),
      usos_maximos: c.usos_maximos ?? '',
      telefone_cliente: c.telefone_cliente ?? '',
      descricao: c.descricao ?? '',
      ativo: c.ativo,
    });
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Excluir o cupom "${c.codigo}"?`)) return;
    const { error } = await supabase.from('cupons').delete().eq('id', c.id);
    if (error) console.error('Erro ao excluir cupom:', error);
    else fetchCupons();
  };

  const toggleAtivo = async (c) => {
    const { error } = await supabase.from('cupons').update({ ativo: !c.ativo }).eq('id', c.id);
    if (error) console.error('Erro ao atualizar cupom:', error);
    else fetchCupons();
  };

  const ic = 'w-full rounded-card border border-border-light bg-bg-alt px-4 py-2.5 text-[0.95rem] outline-none focus:border-rose focus:ring-1 focus:ring-rose';
  const lbl = 'mb-1 block text-[0.85rem] font-medium text-text-primary';

  if (loading) return <p className="py-8 text-center text-text-secondary">Carregando…</p>;

  return (
    <div>
      <h2 className="mb-4 font-heading text-[1.1rem] font-semibold text-text-primary">Cupons de desconto</h2>

      <form onSubmit={handleSubmit} className="mb-6 rounded-card border border-border-light bg-bg-main p-5">
        <h3 className="mb-3 font-heading text-[0.95rem] font-semibold text-text-primary">
          {editingId ? 'Editar cupom' : 'Novo cupom'}
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className={lbl}>Código</label>
            <input required value={form.codigo} onChange={(e) => setForm((p) => ({ ...p, codigo: e.target.value }))} className={`${ic} uppercase`} />
          </div>
          <div>
            <label className={lbl}>Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm((p) => ({ ...p, tipo: e.target.value }))} className={ic}>
              <option value="percentual">Percentual (%)</option>
              <option value="fixo">Valor fixo (R$)</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Valor {form.tipo === 'percentual' ? '(%)' : '(R$)'}</label>
            <input required type="number" step="0.5" min="0" value={form.valor} onChange={(e) => setForm((p) => ({ ...p, valor: e.target.value }))} className={ic} />
          </div>
          <div>
            <label className={lbl}>Pedido mínimo (R$)</label>
            <input type="number" step="0.5" min="0" value={form.valor_minimo_pedido} onChange={(e) => setForm((p) => ({ ...p, valor_minimo_pedido: e.target.value }))} className={ic} />
          </div>
          <div>
            <label className={lbl}>Validade até <span className="font-normal text-text-secondary">(opcional)</span></label>
            <input type="datetime-local" value={form.data_fim} onChange={(e) => setForm((p) => ({ ...p, data_fim: e.target.value }))} className={ic} />
          </div>
          <div>
            <label className={lbl}>Usos máximos <span className="font-normal text-text-secondary">(vazio = ilimitado)</span></label>
            <input type="number" min="1" value={form.usos_maximos} onChange={(e) => setForm((p) => ({ ...p, usos_maximos: e.target.value }))} className={ic} />
          </div>
          <div>
            <label className={lbl}>Telefone específico <span className="font-normal text-text-secondary">(opcional)</span></label>
            <input value={form.telefone_cliente} onChange={(e) => setForm((p) => ({ ...p, telefone_cliente: e.target.value }))} placeholder="13991234567" className={ic} />
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Descrição</label>
            <input value={form.descricao} onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))} className={ic} />
          </div>
          {editingId && (
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, ativo: !p.ativo }))}
                className={`w-full rounded-full border px-4 py-2.5 text-[0.85rem] font-medium ${
                  form.ativo ? 'border-success/40 text-success' : 'border-border-light text-text-secondary'
                }`}
              >
                {form.ativo ? 'Ativo' : 'Inativo'}
              </button>
            </div>
          )}
        </div>

        {erro && <p className="mt-3 text-[0.85rem] text-rose-dark">{erro}</p>}

        <div className="mt-4 flex gap-3">
          <button type="submit" disabled={saving} className="rounded-full bg-rose px-6 py-2.5 text-[0.9rem] font-semibold text-white hover:bg-rose-dark disabled:opacity-60">
            {saving ? 'Salvando…' : editingId ? 'Salvar' : 'Adicionar cupom'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-full border border-border-light px-5 py-2.5 text-[0.9rem] text-text-secondary hover:border-rose hover:text-rose">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {cupons.length === 0 ? (
        <p className="py-8 text-center text-text-secondary">Nenhum cupom cadastrado ainda.</p>
      ) : (
        <ul className="divide-y divide-border-light rounded-card border border-border-light bg-bg-main">
          {cupons.map((c) => {
            const status = statusCupom(c);
            return (
              <li key={c.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <div className="min-w-[160px] flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-heading font-bold text-text-primary">{c.codigo}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${status.cls}`}>{status.label}</span>
                  </div>
                  {c.descricao && <p className="text-[0.8rem] text-text-secondary">{c.descricao}</p>}
                  <p className="text-[0.78rem] text-text-secondary">
                    Usado {c.usos_atuais}{c.usos_maximos != null ? ` / ${c.usos_maximos}` : ''} vez(es)
                    {c.telefone_cliente ? ` · exclusivo p/ ${c.telefone_cliente}` : ''}
                  </p>
                </div>
                <span className="font-bold text-text-primary">
                  {c.tipo === 'percentual' ? `${c.valor}%` : formatPrice(c.valor)}
                </span>
                {c.valor_minimo_pedido > 0 && (
                  <span className="text-[0.78rem] text-text-secondary">min. {formatPrice(c.valor_minimo_pedido)}</span>
                )}
                <button
                  type="button"
                  onClick={() => toggleAtivo(c)}
                  className={`rounded-full border px-3 py-1 text-[0.78rem] font-medium ${
                    c.ativo ? 'border-success/40 text-success' : 'border-border-light text-text-secondary'
                  }`}
                >
                  {c.ativo ? 'Ativo' : 'Inativo'}
                </button>
                <button type="button" onClick={() => handleEdit(c)} className="rounded-full border border-border-light px-3 py-1 text-[0.78rem] font-medium text-text-secondary hover:border-rose hover:text-rose">
                  Editar
                </button>
                <button type="button" onClick={() => handleDelete(c)} className="rounded-full border border-rose/30 px-3 py-1 text-[0.78rem] font-medium text-rose-dark hover:border-rose">
                  Excluir
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
