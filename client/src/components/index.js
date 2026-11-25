// components/index.js
// Barrel export unificado (para conveniencia en tests; las páginas importan directo para tree-shaking)

// Layout
export { default as Navbar } from './layout/Navbar';
export { default as Footer } from './layout/Footer';

// Auth
export { default as RutaProtegida } from './auth/RutaProtegida';

// Products
export { default as ProductCard } from './products/ProductCard';
export { default as ProductList } from './products/ProductList';
export { default as ProductDetail } from './products/ProductDetail';

// Cart
export { default as CartDrawer } from './cart/CartDrawer';

// Contact
export { default as ContactForm } from './contact/ContactForm';

// Common / UI
export { default as Toast } from './common/Toast';
export { default as BotonTema } from './common/BotonTema';
export * from './common/Icons';
