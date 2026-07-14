import { createContext, useContext, useMemo, useState } from 'react';
import { formatPrice } from '../data/products';
import { WHATSAPP_NUMBER } from '../lib/whatsapp';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsOpen(true);
  };

  const incrementItem = (id) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)));
  };

  const decrementItem = (id) => {
    setItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    setIsOpen(false);
  };

  const totalCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.price, 0), [items]);

  const checkoutMessage = useMemo(() => {
    if (items.length === 0) return '';
    const lines = items.map(
      (item) => `• ${item.quantity}x ${item.name} — ${formatPrice(item.quantity * item.price)}`
    );
    return [
      'Olá! Gostaria de fazer o seguinte pedido:',
      '',
      ...lines,
      '',
      `Subtotal: ${formatPrice(subtotal)}`,
    ].join('\n');
  }, [items, subtotal]);

  const checkoutLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(checkoutMessage)}`;

  const value = {
    items,
    isOpen,
    setIsOpen,
    addItem,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    totalCount,
    subtotal,
    checkoutLink,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart deve ser usado dentro de um CartProvider');
  return context;
}
