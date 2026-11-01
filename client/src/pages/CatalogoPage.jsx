// pages/CatalogoPage.jsx
// Página /productos — catálogo de productos sin hero section
import { ProductList } from '../components';

function CatalogoPage({ onVerDetalle, onAgregarAlCarrito }) {
  return (
    <main className="app__main">
      <ProductList
        onVerDetalle={onVerDetalle}
        onAgregarAlCarrito={onAgregarAlCarrito}
      />
    </main>
  );
}

export default CatalogoPage;
