// pages/DetallePage.jsx
// Página /productos/:id — carga el producto por ID usando el hook useProduct

import { useParams, useNavigate } from 'react-router-dom';
import ProductDetail from '../components/products/ProductDetail';
import { AlertIcon } from '../components/common/Icons';
import { useProduct } from '../hooks/useProduct';

function DetallePage({ onAgregarAlCarrito, onAbrirCarrito }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { producto, cargando, error } = useProduct(id);

  const handleVolver = () => navigate('/productos');

  if (cargando) {
    return (
      <main className="detalle-wrapper">
        <div className="product-list__estado">
          <div className="product-list__spinner" aria-label="Cargando producto..." />
          <p className="product-list__cargando-txt">Cargando producto…</p>
        </div>
      </main>
    );
  }

  if (error || !producto) {
    return (
      <main className="detalle-wrapper">
        <div className="product-list__estado product-list__estado--error">
          <div className="product-list__error-icono" aria-hidden="true">
            <AlertIcon size={36} />
          </div>
          <h3 className="product-list__error-msg">No se pudo cargar el producto</h3>
          <p className="product-list__error-detail">{error || 'El producto solicitado no fue encontrado.'}</p>
          <button type="button" className="product-list__reintentar" onClick={handleVolver}>
            ← Volver al catálogo
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="detalle-wrapper">
      <ProductDetail
        producto={producto}
        onVolver={handleVolver}
        onAgregarAlCarrito={onAgregarAlCarrito}
        onAbrirCarrito={onAbrirCarrito}
      />
    </main>
  );
}

export default DetallePage;
