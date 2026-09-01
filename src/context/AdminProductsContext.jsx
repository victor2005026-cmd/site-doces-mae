import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PRODUCTS } from '../data/products';

export const DEFAULT_HOURS = {
  openDays: [1, 2, 3, 4, 5, 6],
  openTime: '09:00',
  closeTime: '18:00',
  forceStatus: null,
  forceLabel: '',
};

// converte o jsonb `configuracoes.horario_funcionamento` para o formato usado no form do admin
function horarioToHours(horarioFuncionamento) {
  const h = horarioFuncionamento ?? {};
  return {
    openDays: h.dias ?? DEFAULT_HOURS.openDays,
    openTime: h.abre ?? DEFAULT_HOURS.openTime,
    closeTime: h.fecha ?? DEFAULT_HOURS.closeTime,
    forceStatus: h.forceStatus ?? DEFAULT_HOURS.forceStatus,
    forceLabel: h.forceLabel ?? DEFAULT_HOURS.forceLabel,
  };
}

function hoursToHorario(hours) {
  return {
    dias: hours.openDays,
    abre: hours.openTime,
    fecha: hours.closeTime,
    forceStatus: hours.forceStatus,
    forceLabel: hours.forceLabel,
  };
}

// data/products.js só entra em cena se a busca no Supabase falhar (ex: fora do ar)
const SEED_FALLBACK = PRODUCTS.map((p) => ({ ...p, active: true, mostSold: Boolean(p.badge) }));

function rowToProduct(row) {
  return {
    id: row.id,
    name: row.nome,
    description: row.descricao ?? '',
    price: Number(row.preco),
    category: row.categoria,
    image: row.imagem_url ?? '',
    alt: row.nome,
    badge: row.mais_vendido ? 'Mais vendido' : undefined,
    active: row.ativo,
    mostSold: row.mais_vendido,
    order: row.ordem,
    units: row.unidades ?? null,
    grams: row.gramas ?? null,
  };
}

function productToRow(data) {
  const row = {};
  if (data.id !== undefined) row.id = data.id;
  if (data.name !== undefined) row.nome = data.name;
  if (data.description !== undefined) row.descricao = data.description;
  if (data.price !== undefined) row.preco = data.price;
  if (data.category !== undefined) row.categoria = data.category;
  if (data.image !== undefined) row.imagem_url = data.image;
  if (data.active !== undefined) row.ativo = data.active;
  if (data.mostSold !== undefined) row.mais_vendido = data.mostSold;
  else if (data.badge !== undefined) row.mais_vendido = Boolean(data.badge);
  if (data.order !== undefined) row.ordem = data.order;
  if (data.units !== undefined) row.unidades = data.units;
  if (data.grams !== undefined) row.gramas = data.grams;
  return row;
}

const AdminProductsContext = createContext(null);

export function AdminProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);

  // try/catch aqui não é só formalidade: sem ele, uma falha de REDE (não um
  // "error" normal de resposta do Supabase, mas por ex. o cliente ficar
  // offline no meio da requisição) derruba essa promise sem nunca cair no
  // fallback nem tirar a tela do "carregando" — trava assim pra sempre.
  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('produtos').select('*').order('ordem', { ascending: true });
      if (error) throw error;
      setProducts((data ?? []).map(rowToProduct));
    } catch (err) {
      console.error('Erro ao buscar produtos do Supabase, usando fallback local:', err);
      setProducts(SEED_FALLBACK);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('configuracoes').select('*').eq('id', 1).single();
      if (error) throw error;
      setConfig(data);
    } catch (err) {
      console.error('Erro ao buscar configurações:', err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel('produtos-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  useEffect(() => {
    fetchConfig();

    const channel = supabase
      .channel('configuracoes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'configuracoes' }, () => {
        fetchConfig();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchConfig]);

  const hours = horarioToHours(config?.horario_funcionamento);

  const saveHours = async (newHours) => {
    const horario_funcionamento = hoursToHorario(newHours);
    setConfig((prev) => (prev ? { ...prev, horario_funcionamento } : prev));
    const { error } = await supabase.from('configuracoes').update({ horario_funcionamento }).eq('id', 1);
    if (error) console.error('Erro ao salvar horário:', error);
    return { error };
  };

  // campo: 'banner_url' | 'logo_url' | 'banner_secundario_url'
  const saveImagemSite = async (campo, url) => {
    setConfig((prev) => (prev ? { ...prev, [campo]: url } : prev));
    const { error } = await supabase.from('configuracoes').update({ [campo]: url }).eq('id', 1);
    if (error) console.error('Erro ao salvar imagem do site:', error);
    return { error };
  };

  const addProduct = async (data) => {
    const { data: criado, error } = await supabase
      .from('produtos')
      .insert(productToRow({ ...data, active: true }))
      .select()
      .single();
    if (error) console.error('Erro ao criar produto:', error);
    else setProducts((prev) => [...prev, rowToProduct(criado)]);
    return { error };
  };

  const updateProduct = async (id, data) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    const { error } = await supabase.from('produtos').update(productToRow(data)).eq('id', id);
    if (error) console.error('Erro ao atualizar produto:', error);
    return { error };
  };

  const deleteProduct = async (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (error) console.error('Erro ao deletar produto:', error);
    return { error };
  };

  const toggleActive = async (id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
    const { error } = await supabase.from('produtos').update({ ativo: !product.active }).eq('id', id);
    if (error) console.error('Erro ao atualizar produto:', error);
  };

  const toggleMostSold = async (id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, mostSold: !p.mostSold } : p)));
    const { error } = await supabase.from('produtos').update({ mais_vendido: !product.mostSold }).eq('id', id);
    if (error) console.error('Erro ao atualizar produto:', error);
  };

  // Recebe os produtos de UMA categoria já na nova ordem e reescreve a
  // posição de todos — atualiza a tela na hora, sem esperar o tempo real.
  const reordenarProdutos = async (produtosOrdenados) => {
    const mapaOrdem = new Map(produtosOrdenados.map((p, i) => [p.id, i]));
    setProducts((prev) => prev.map((p) => (mapaOrdem.has(p.id) ? { ...p, order: mapaOrdem.get(p.id) } : p)));
    await Promise.all(
      produtosOrdenados.map((p, i) => supabase.from('produtos').update({ ordem: i }).eq('id', p.id))
    );
  };

  const activeProducts = products.filter((p) => p.active);

  return (
    <AdminProductsContext.Provider
      value={{
        products,
        activeProducts,
        loading,
        hours,
        config,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleActive,
        toggleMostSold,
        reordenarProdutos,
        saveHours,
        saveImagemSite,
      }}
    >
      {children}
    </AdminProductsContext.Provider>
  );
}

export function useAdminProducts() {
  const ctx = useContext(AdminProductsContext);
  if (!ctx) throw new Error('useAdminProducts deve ser usado dentro de AdminProductsProvider');
  return ctx;
}
