import { forwardRef } from 'react';
import ProductCard from './ProductCard';
import { Azevinho } from './DecoracaoNatal';

const ProductSection = forwardRef(function ProductSection({ id, title, products, onOpenDetail }, ref) {
  return (
    <section id={id} ref={ref} className="scroll-mt-[100px] py-8 first:pt-6">
      {/* A seção já está dentro de um container: no celular, sem padding duplo */}
      <div className="container-site max-sm:px-0">
        <h2 className="mb-5 font-heading text-[1.3rem] font-semibold text-text-primary">
          <span className="natal-titulo-secao">
            <Azevinho className="h-6 w-8 flex-shrink-0" />
            {title}
          </span>
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onOpenDetail={onOpenDetail} />
          ))}
        </div>
      </div>
    </section>
  );
});

export default ProductSection;
