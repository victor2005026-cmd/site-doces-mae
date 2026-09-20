import { useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIES } from '../data/products';
import { useAdminProducts } from '../context/AdminProductsContext';
import CategoryBar from './CategoryBar';
import ProductSection from './ProductSection';
import ProductCardSkeleton from './ProductCardSkeleton';
import ProductDetailModal from './ProductDetailModal';
import EventoTitulo from './EventoTitulo';

const GROUPS = CATEGORIES.filter((cat) => cat.id !== 'todos');
const SCROLL_OFFSET = 140;

export default function Menu({ query = '' }) {
  const { activeProducts, loading, config } = useAdminProducts();
  const [active, setActive] = useState(GROUPS[0].id);
  const [produtoDetalhe, setProdutoDetalhe] = useState(null);
  const sectionRefs = useRef({});
  const normalizedQuery = query.trim().toLowerCase();

  const featured = useMemo(() => activeProducts.filter((p) => p.badge), [activeProducts]);

  const visibleFeatured = useMemo(
    () => featured.filter((p) => p.name.toLowerCase().includes(normalizedQuery)),
    [featured, normalizedQuery]
  );

  const visibleGroups = useMemo(
    () =>
      GROUPS.map((cat) => ({
        ...cat,
        products: activeProducts.filter(
          (p) => p.category === cat.id && p.name.toLowerCase().includes(normalizedQuery)
        ),
      })),
    [activeProducts, normalizedQuery]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: '-150px 0px -60% 0px', threshold: 0 }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [visibleGroups]);

  const scrollToCategory = (id) => {
    // "Todos" leva à primeira seção que de fato aparece (Eventos pode estar vazio)
    const targetId = id === 'todos' ? visibleGroups.find((g) => g.products.length > 0)?.id : id;
    const el = sectionRefs.current[targetId];
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const hasResults = visibleFeatured.length > 0 || visibleGroups.some((g) => g.products.length > 0);

  // Categoria sem nenhum produto ativo (ex: "Eventos" antes do primeiro item
  // ser cadastrado) não ganha aba — senão o clique não leva a lugar nenhum.
  // Durante o carregamento mostra todas pra barra não "piscar".
  const tabCategories = useMemo(() => {
    const visiveis = loading
      ? CATEGORIES
      : CATEGORIES.filter((c) => c.id === 'todos' || activeProducts.some((p) => p.category === c.id));
    // A aba de eventos mostra o título configurado no admin (ex: "Dia dos Professores")
    return visiveis.map((c) => (c.id === 'eventos' ? { ...c, label: <EventoTitulo config={config} compacto /> } : c));
  }, [loading, activeProducts, config]);

  // Se a aba marcada não existe (ex: "eventos" sem produtos), marca a primeira
  // categoria que aparece de verdade.
  const activeTab = tabCategories.some((c) => c.id === active)
    ? active
    : tabCategories.find((c) => c.id !== 'todos')?.id;

  return (
    <div id="cardapio">
      <CategoryBar categories={tabCategories} active={activeTab} onSelect={scrollToCategory} />

      {loading && (
        <div className="container-site py-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      )}

      {!loading && !hasResults && (
        <p className="container-site py-10 text-center text-text-secondary">
          Nenhum produto encontrado pra essa busca.
        </p>
      )}

      {visibleFeatured.length > 0 && (
        <ProductSection id="destaques" title="Destaques" products={visibleFeatured} onOpenDetail={setProdutoDetalhe} />
      )}

      {visibleGroups.map(
        (group) =>
          group.products.length > 0 && (
            <ProductSection
              key={group.id}
              id={group.id}
              title={group.id === 'eventos' ? <EventoTitulo config={config} /> : group.label}
              products={group.products}
              onOpenDetail={setProdutoDetalhe}
              ref={(el) => {
                sectionRefs.current[group.id] = el;
              }}
            />
          )
      )}

      <ProductDetailModal product={produtoDetalhe} onClose={() => setProdutoDetalhe(null)} />
    </div>
  );
}
