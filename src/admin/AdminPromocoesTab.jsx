import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAdminProducts } from '../context/AdminProductsContext';
import { formatPrice } from '../data/products';

const EMPTY_FORM = { titulo: '', descricao: '', ativa: true, produtoId: '', quantidade: 2, precoPromocional: '' };

const TagIcon = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M20.59 13.41 13.41 20.6a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" />
    <circle cx="7" cy="7" r="1" />
  </svg>
);

export default function AdminPromocoesTab() {
  const { products } = useAdminProducts();
  const [promocoes, setPromocoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');

  const fetchPromocoes = async () => {
    const { data, error } = await supabase
      .from('promocoes')
      .select('*, produtos(id, nome, preco, imagem_url)')
      .order('created_at', { ascending: false });
    if (error) console.error('Erro ao buscar promoções:', error);
    setPromocoes(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPromocoes(); }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setErro('');
  };

  const produtoSelecionado = products.find((prod) => prod.id === form.produtoId);
  const quantidadeNum = Number(form.quantidade) || 1;
  const precoNum = form.precoPromocional === '' ? null : Number(form.precoPromocional);
  const precoCheioTotal = produtoSelecionado ? produtoSelecionado.price * quantidadeNum : null;
  const precoUnitarioPromo = produtoSelecionado && precoNum ? precoNum / quantidadeNum : null;
  const economia = produtoSelecionado && precoNum ? precoCheioTotal - precoNum : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo.trim()) return;
    if (form.produtoId && (form.precoPromocional === '' || quantidadeNum < 1)) {
      setErro('Defina a quantidade e o preço promocional do produto escolhido.');
      return;
    }
    setSaving(true);
    setErro('');

    const payload = {
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim() || null,
      ativa: form.ativa,
      produto_id: form.produtoId || null,
      quantidade: form.produtoId ? quantidadeNum : 1,
      preco_promocional: form.produtoId ? precoNum : null,
    };

    const { error } = editingId
      ? await supabase.from('promocoes').update(payload).eq('id', editingId)
      : await supabase.from('promocoes').insert(payload);

    if (error) {
      console.error('Erro ao salvar promoção:', error);
      setErro('Não consegui salvar a promoção. Tente de novo.');
    } else {
      resetForm();
      fetchPromocoes();
    }
    setSaving(false);
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setErro('');
    setForm({
      titulo: p.titulo,
      descricao: p.descricao ?? '',
      ativa: p.ativa,
      produtoId: p.produto_id ?? '',
      quantidade: p.quantidade ?? 2,
      precoPromocional: p.preco_promocional ?? '',
    });
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Excluir a promoção "${p.titulo}"?`)) return;
    const { error } = await supabase.from('promocoes').delete().eq('id', p.id);
    if (error) console.error('Erro ao excluir promoção:', error);
    else fetchPromocoes();
  };

  const toggleAtiva = async (p) => {
    const { error } = await supabase.from('promocoes').update({ ativa: !p.ativa }).eq('id', p.id);
    if (error) console.error('Erro ao atualizar promoção:', error);
    else fetchPromocoes();
  };

  const ic = 'w-full rounded-card border border-border-light bg-bg-alt px-4 py-2.5 text-[0.95rem] outline-none focus:border-rose focus:ring-1 focus:ring-rose';
  const lbl = 'mb-1 block text-[0.85rem] font-medium text-text-primary';

  if (loading) return <p className="py-8 text-center text-text-secondary">Carregando…</p>;

  return (
    <div>
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-rose/15 text-rose">
          <TagIcon />
        </span>
        <div>
          <h2 className="font-heading text-[1.15rem] font-semibold text-text-primary">Promoções</h2>
          <p className="text-[0.8rem] text-text-secondary">
            O que estiver ativo aqui aparece na mini tela de "Promoções" do site — e, se for de um produto, a
            promoção entra sozinha no carrinho do cliente quando ele atingir a quantidade.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 rounded-card border border-border-light bg-bg-main p-5 shadow-sm">
        <h3 className="mb-4 font-heading text-[1rem] font-semibold text-text-primary">
          {editingId ? 'Editar promoção' : 'Nova promoção'}
        </h3>

        <div className="mb-4">
          <label className={lbl}>Vincular a um produto <span className="font-normal text-text-secondary">(opcional)</span></label>
          <select
            value={form.produtoId}
            onChange={(e) => setForm((p) => ({ ...p, produtoId: e.target.value }))}
            className={ic}
          >
            <option value="">Nenhum (promoção geral, sem produto)</option>
            {products.map((prod) => (
              <option key={prod.id} value={prod.id}>{prod.name} — {formatPrice(prod.price)}</option>
            ))}
          </select>
        </div>

        {produtoSelecionado && (
          <div className="mb-4 rounded-card border border-rose/20 bg-rose/5 p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr]">
              <div>
                <label className={lbl}>Leve quantas unidades</label>
                <input
                  type="number"
                  min="2"
                  value={form.quantidade}
                  onChange={(e) => setForm((p) => ({ ...p, quantidade: e.target.value }))}
                  className={ic}
                />
              </div>
              <div>
                <label className={lbl}>Por quanto no total (R$)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={form.precoPromocional}
                  onChange={(e) => setForm((p) => ({ ...p, precoPromocional: e.target.value }))}
                  placeholder="0,00"
                  className={ic}
                />
              </div>
            </div>

            {precoNum != null && (
              <div className="mt-3 rounded-card bg-bg-main px-4 py-3 text-[0.85rem]">
                <p className="font-semibold text-text-primary">
                  Prévia: Leve {quantidadeNum} por {formatPrice(precoNum)}
                </p>
                <p className="text-text-secondary">
                  Isso dá {formatPrice(precoUnitarioPromo)} a unidade (preço normal: {formatPrice(produtoSelecionado.price)})
                  {economia > 0 && <span className="font-semibold text-success"> · economia de {formatPrice(economia)}</span>}
                </p>
                {economia <= 0 && (
                  <p className="mt-1 text-rose-dark">O preço promocional não está mais barato que comprar avulso.</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div>
            <label className={lbl}>Título</label>
            <input
              required
              value={form.titulo}
              onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
              placeholder={produtoSelecionado ? `Ex: ${produtoSelecionado.name} em dobro` : 'Ex: Frete grátis em Santos'}
              className={ic}
            />
          </div>
          <div>
            <label className={lbl}>Descrição <span className="font-normal text-text-secondary">(opcional)</span></label>
            <textarea
              rows={2}
              value={form.descricao}
              onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
              placeholder="Detalhe a promoção pro cliente"
              className={`${ic} resize-none`}
            />
          </div>
        </div>

        {erro && <p className="mt-3 text-[0.85rem] text-rose-dark">{erro}</p>}

        <div className="mt-4 flex gap-3">
          <button type="submit" disabled={saving} className="rounded-full bg-rose px-6 py-2.5 text-[0.9rem] font-semibold text-white hover:bg-rose-dark disabled:opacity-60">
            {saving ? 'Salvando…' : editingId ? 'Salvar' : 'Adicionar promoção'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-full border border-border-light px-5 py-2.5 text-[0.9rem] text-text-secondary hover:border-rose hover:text-rose">
              Cancelar
            </button>
          )}
        </div>
      </form>

      {promocoes.length === 0 ? (
        <p className="py-8 text-center text-text-secondary">Nenhuma promoção cadastrada ainda.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {promocoes.map((p) => (
            <div
              key={p.id}
              className={`overflow-hidden rounded-card border bg-bg-main shadow-sm transition-opacity ${
                p.ativa ? 'border-border-light' : 'border-border-light opacity-60'
              }`}
            >
              {p.produtos?.imagem_url && (
                <img src={p.produtos.imagem_url} alt={p.produtos.nome} className="h-32 w-full object-cover" />
              )}
              <div className="p-4">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <p className="font-heading text-[1rem] font-bold text-text-primary">{p.titulo}</p>
                  <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold ${
                    p.ativa ? 'bg-success/15 text-success' : 'bg-bg-alt text-text-secondary'
                  }`}>
                    {p.ativa ? 'Ativa' : 'Inativa'}
                  </span>
                </div>

                {p.produtos && (
                  <p className="mb-1 inline-block rounded-full bg-rose/10 px-3 py-1 text-[0.82rem] font-semibold text-rose">
                    Leve {p.quantidade} por {formatPrice(p.preco_promocional)}
                  </p>
                )}
                {p.produtos && (
                  <p className="text-[0.8rem] text-text-secondary">
                    {p.produtos.nome} · normal <span className="line-through">{formatPrice(p.produtos.preco)}</span> a unidade
                  </p>
                )}
                {p.descricao && <p className="mt-1 text-[0.85rem] text-text-secondary">{p.descricao}</p>}

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAtiva(p)}
                    className={`rounded-full border px-3 py-1 text-[0.78rem] font-medium ${
                      p.ativa ? 'border-success/40 text-success' : 'border-border-light text-text-secondary'
                    }`}
                  >
                    {p.ativa ? 'Desativar' : 'Ativar'}
                  </button>
                  <button type="button" onClick={() => handleEdit(p)} className="rounded-full border border-border-light px-3 py-1 text-[0.78rem] font-medium text-text-secondary hover:border-rose hover:text-rose">
                    Editar
                  </button>
                  <button type="button" onClick={() => handleDelete(p)} className="rounded-full border border-rose/30 px-3 py-1 text-[0.78rem] font-medium text-rose-dark hover:border-rose">
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
