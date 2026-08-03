import { useEffect, useMemo, useRef, useState } from 'react';
import { CATEGORIES } from '../data/products';
import { useAdminProducts } from '../context/AdminProductsContext';
import CategoryBar from './CategoryBar';
import ProductSection from './ProductSection';
import ProductCardSkeleton from './ProductCardSkeleton';

const GROUPS = CATEGORIES.filter((cat) => cat.id !== 'todos');
const SCROLL_OFFSET = 140;

export default function Menu({ query = '' }) {
  const { activeProducts, loading } = useAdminProducts();
  const [active, setActive] = useState(GROUPS[0].id);
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
    const targetId = id === 'todos' ? GROUPS[0].id : id;
    const el = sectionRefs.current[targetId];
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const hasResults = visibleFeatured.length > 0 || visibleGroups.some((g) => g.products.length > 0);

  return (
    <div id="cardapio">
      <CategoryBar categories={CATEGORIES} active={active} onSelect={scrollToCategory} />

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
        <ProductSection id="destaques" title="Destaques" products={visibleFeatured} />
      )}

      {visibleGroups.map(
        (group) =>
          group.products.length > 0 && (
            <ProductSection
              key={group.id}
              id={group.id}
              title={group.label}
              products={group.products}
              ref={(el) => {
                sectionRefs.current[group.id] = el;
              }}
            />
          )
      )}
    </div>
  );
}
