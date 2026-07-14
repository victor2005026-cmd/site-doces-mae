import { PRODUCTS } from './products';

export const SITE_IMAGES = [
  { key: 'site-banner-wide', label: 'Banner do topo (foto larga)', fallback: '/images/banner-wide.jpg' },
  { key: 'site-banner-logo', label: 'Foto redonda ao lado do nome da loja', fallback: '/images/banner-brigadeiro-heart.jpg' },
];

export const PRODUCT_IMAGES = PRODUCTS.map((product) => ({
  key: product.id,
  label: product.name,
  fallback: product.image,
}));
