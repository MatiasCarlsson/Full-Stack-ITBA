// components/index.js
// Barrel export para unificar importaciones de componentes

// Layout
export { default as Navbar } from './layout/Navbar';
export { default as Footer } from './layout/Footer';

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
export * from './common/Icons';
