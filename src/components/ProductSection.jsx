import { forwardRef } from 'react';
import ProductCard from './ProductCard';

const ProductSection = forwardRef(function ProductSection({ id, title, products }, ref) {
  return (
    <section id={id} ref={ref} className="scroll-mt-[100px] py-8 first:pt-6">
      <div className="container-site">
        <h2 className="mb-5 font-heading text-[1.3rem] font-semibold text-text-primary">{title}</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
});

export default ProductSection;
