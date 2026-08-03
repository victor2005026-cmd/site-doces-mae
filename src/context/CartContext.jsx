import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { formatPrice } from '../data/products';
import { WHATSAPP_NUMBER } from '../lib/whatsapp';
import { supabase } from '../lib/supabase';
import { calcularSubtotalComPromocoes, calcularEconomiaPromocoes } from '../lib/promocoes';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [coupon, setCoupon] = useState(null); // { cupomId, codigo, tipo, valor, desconto }
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [promocoesBundle, setPromocoesBundle] = useState([]);

  // Promoções tipo "leve N por R$X" vinculadas a produto — aplicadas
  // automaticamente no subtotal, sem precisar de cupom.
  useEffect(() => {
    const fetchPromocoes = () => {
      supabase
        .from('promocoes')
        .select('produto_id, quantidade, preco_promocional')
        .eq('ativa', true)
        .not('produto_id', 'is', null)
        .then(({ data, error }) => {
          if (error) { console.error('Erro ao buscar promoções do carrinho:', error); return; }
          setPromocoesBundle(data ?? []);
        });
    };
    fetchPromocoes();

    const channel = supabase
      .channel('promocoes-carrinho')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promocoes' }, fetchPromocoes)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

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
    setCoupon(null);
    setCouponError('');
  };

  const totalCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(() => calcularSubtotalComPromocoes(items, promocoesBundle), [items, promocoesBundle]);
  const economiaPromocoes = useMemo(() => calcularEconomiaPromocoes(items, promocoesBundle), [items, promocoesBundle]);

  // telefone: opcional, usado só pra validar cupons restritos a um cliente específico
  const applyCoupon = async (codigo, telefone = '') => {
    if (!codigo?.trim()) return;
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const { data, error } = await supabase.rpc('aplicar_cupom', {
        p_codigo: codigo.trim(),
        p_telefone: telefone || '',
        p_valor_pedido: subtotal,
      });
      if (error) {
        setCouponError('Não consegui validar o cupom. Tenta de novo.');
        setCoupon(null);
        return;
      }
      const resultado = Array.isArray(data) ? data[0] : data;
      if (!resultado || resultado.erro) {
        setCouponError(resultado?.erro || 'Cupom inválido.');
        setCoupon(null);
        return;
      }
      setCoupon({
        cupomId: resultado.cupom_id,
        codigo: resultado.codigo,
        tipo: resultado.tipo,
        valor: Number(resultado.valor),
        desconto: Number(resultado.desconto),
      });
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError('');
  };

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
    promocoesBundle,
    economiaPromocoes,
    checkoutLink,
    coupon,
    couponError,
    applyingCoupon,
    applyCoupon,
    removeCoupon,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart deve ser usado dentro de um CartProvider');
  return context;
}
