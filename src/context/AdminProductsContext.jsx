import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PRODUCTS } from '../data/products';

const HOURS_KEY = 'docesdaale:admin-hours';

export const DEFAULT_HOURS = {
  openDays: [1, 2, 3, 4, 5, 6],
  openTime: '09:00',
  closeTime: '18:00',
  forceStatus: null,
  forceLabel: '',
};

function loadHours() {
  try {
    const raw = localStorage.getItem(HOURS_KEY);
    if (raw) return { ...DEFAULT_HOURS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_HOURS };
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
  };
}

function productToRow(data) {
  const row = {};
  if (data.name !== undefined) row.nome = data.name;
  if (data.description !== undefined) row.descricao = data.description;
  if (data.price !== undefined) row.preco = data.price;
  if (data.category !== undefined) row.categoria = data.category;
  if (data.image !== undefined) row.imagem_url = data.image;
  if (data.active !== undefined) row.ativo = data.active;
  if (data.mostSold !== undefined) row.mais_vendido = data.mostSold;
  else if (data.badge !== undefined) row.mais_vendido = Boolean(data.badge);
  return row;
}

const AdminProductsContext = createContext(null);

export function AdminProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hours, setHoursState] = useState(loadHours);

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase.from('produtos').select('*').order('ordem', { ascending: true });
    if (error) {
      console.error('Erro ao buscar produtos do Supabase, usando fallback local:', error);
      setProducts(SEED_FALLBACK);
    } else {
      setProducts((data ?? []).map(rowToProduct));
    }
    setLoading(false);
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

  const saveHours = (config) => {
    setHoursState(config);
    localStorage.setItem(HOURS_KEY, JSON.stringify(config));
  };

  const addProduct = async (data) => {
    const { error } = await supabase.from('produtos').insert(productToRow({ ...data, active: true }));
    if (error) console.error('Erro ao criar produto:', error);
    return { error };
  };

  const updateProduct = async (id, data) => {
    const { error } = await supabase.from('produtos').update(productToRow(data)).eq('id', id);
    if (error) console.error('Erro ao atualizar produto:', error);
    return { error };
  };

  const deleteProduct = async (id) => {
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (error) console.error('Erro ao deletar produto:', error);
    return { error };
  };

  const toggleActive = async (id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const { error } = await supabase.from('produtos').update({ ativo: !product.active }).eq('id', id);
    if (error) console.error('Erro ao atualizar produto:', error);
  };

  const toggleMostSold = async (id) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const { error } = await supabase.from('produtos').update({ mais_vendido: !product.mostSold }).eq('id', id);
    if (error) console.error('Erro ao atualizar produto:', error);
  };

  const activeProducts = products.filter((p) => p.active);

  return (
    <AdminProductsContext.Provider
      value={{
        products,
        activeProducts,
        loading,
        hours,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleActive,
        toggleMostSold,
        saveHours,
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
