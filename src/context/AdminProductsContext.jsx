import { createContext, useContext, useState } from 'react';
import { PRODUCTS } from '../data/products';

const PRODUCTS_KEY = 'docesdaale:admin-products';
const HOURS_KEY = 'docesdaale:admin-hours';

export const DEFAULT_HOURS = {
  openDays: [1, 2, 3, 4, 5, 6],
  openTime: '09:00',
  closeTime: '18:00',
  forceStatus: null,
  forceLabel: '',
};

function loadProducts() {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return PRODUCTS.map((p) => ({ ...p, active: true }));
}

function loadHours() {
  try {
    const raw = localStorage.getItem(HOURS_KEY);
    if (raw) return { ...DEFAULT_HOURS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_HOURS };
}

const AdminProductsContext = createContext(null);

export function AdminProductsProvider({ children }) {
  const [products, setProducts] = useState(loadProducts);
  const [hours, setHoursState] = useState(loadHours);

  const persist = (updated) => {
    setProducts(updated);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
  };

  const saveHours = (config) => {
    setHoursState(config);
    localStorage.setItem(HOURS_KEY, JSON.stringify(config));
  };

  const addProduct = (data) => {
    const newProduct = { ...data, id: 'custom-' + Date.now(), active: true };
    persist([...products, newProduct]);
  };

  const updateProduct = (id, data) => {
    persist(products.map((p) => (p.id === id ? { ...p, ...data } : p)));
  };

  const toggleActive = (id) => {
    persist(products.map((p) => (p.id === id ? { ...p, active: !p.active } : p)));
  };

  const activeProducts = products.filter((p) => p.active);

  return (
    <AdminProductsContext.Provider
      value={{ products, activeProducts, hours, addProduct, updateProduct, toggleActive, saveHours }}
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
