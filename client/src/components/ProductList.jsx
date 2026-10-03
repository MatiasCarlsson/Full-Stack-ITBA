// components/ProductList.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import ProductCard from './ProductCard';
import { AlertIcon, RefreshIcon } from './Icons';
import './ProductList.css';

/**
 * ProductList — Lista de productos obtenidos desde la API REST.
 * Maneja tres estados: cargando, error y éxito.
 * Props:
 *   - onVerDetalle: callback (producto) → pasa a App.js para mostrar ProductDetail
 *   - onAgregarAlCarrito: callback (producto) → agrega al carrito en App.js
 */
function ProductList({ onVerDetalle, onAgregarAlCarrito }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');

  // Función de fetch con soporte para cancelación (AbortController)
  const fetchProductos = useCallback((signal) => {
    setCargando(true);
    setError(null);

    fetch('/api/productos', { signal })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Error ${res.status}: ${res.statusText || text.slice(0, 100)}`);
        }
        return res.json();
      })
      .then((data) => {
        setProductos(data);
        setCargando(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(
          err.message || 'No se pudo conectar con el servidor backend en http://localhost:3001'
        );
        setCargando(false);
      });
  }, []);

  // Fetch inicial al montar el componente con cleanup
  useEffect(() => {
    const controller = new AbortController();
    fetchProductos(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchProductos]);

  // Lista de categorías únicas derivadas
  const categorias = useMemo(() => {
    const cats = new Set(productos.map((p) => p.categoria).filter(Boolean));
    return ['Todas', ...Array.from(cats)];
  }, [productos]);

  // Productos filtrados según la categoría elegida
  const productosFiltrados = useMemo(() => {
    if (categoriaSeleccionada === 'Todas') return productos;
    return productos.filter((p) => p.categoria === categoriaSeleccionada);
  }, [productos, categoriaSeleccionada]);

  return (
    <section aria-labelledby="catalogo-titulo">
      <div className="product-list__header">
        <div>
          <h2 id="catalogo-titulo" className="product-list__titulo">Nuestros Muebles</h2>
          <p className="product-list__bajada">Piezas artesanales de autor elaboradas con materiales nobles</p>
        </div>

        {!cargando && !error && (
          <span className="product-list__count" aria-live="polite">
            {productosFiltrados.length} {productosFiltrados.length === 1 ? 'pieza disponible' : 'piezas disponibles'}
          </span>
        )}
      </div>

      {/* Filtro por categorías */}
      {!cargando && !error && categorias.length > 1 && (
        <div className="product-list__filtros" role="tablist" aria-label="Filtrar por categoría">
          {categorias.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={categoriaSeleccionada === cat}
              className={`product-list__filtro-btn ${
                categoriaSeleccionada === cat ? 'product-list__filtro-btn--activo' : ''
              }`}
              onClick={() => setCategoriaSeleccionada(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="product-list__grid">

        {/* Estado: cargando */}
        {cargando && (
          <div className="product-list__estado">
            <div className="product-list__spinner" aria-label="Cargando productos..." />
            <p className="product-list__cargando-txt">Cargando catálogo de Hermanos Jota…</p>
          </div>
        )}

        {/* Estado: error */}
        {!cargando && error && (
          <div className="product-list__estado product-list__estado--error">
            <div className="product-list__error-icono" aria-hidden="true">
              <AlertIcon size={36} />
            </div>
            <h3 className="product-list__error-msg">No pudimos conectar con el catálogo</h3>
            <p className="product-list__error-detail">{error}</p>
            <div className="product-list__error-ayuda">
              <p><strong>¿El backend está apagado?</strong></p>
              <p>Abrí una terminal e iniciá el servidor Express con:</p>
              <code>cd backend &amp;&amp; npm run dev</code>
            </div>
            <button
              type="button"
              className="product-list__reintentar"
              onClick={() => fetchProductos()}
            >
              <RefreshIcon size={16} /> Reintentar conexión
            </button>
          </div>
        )}

        {/* Estado: éxito — renderizar lista con .map() */}
        {!cargando && !error && productosFiltrados.map((producto) => (
          <ProductCard
            key={producto.id}
            producto={producto}
            onVerDetalle={onVerDetalle}
            onAgregarAlCarrito={onAgregarAlCarrito}
          />
        ))}

        {/* Estado: vacío por filtro */}
        {!cargando && !error && productosFiltrados.length === 0 && (
          <div className="product-list__estado">
            <p className="product-list__cargando-txt">
              No hay muebles en la categoría "{categoriaSeleccionada}".
            </p>
            <button
              type="button"
              className="product-list__reintentar"
              onClick={() => setCategoriaSeleccionada('Todas')}
            >
              Ver todas las categorías
            </button>
          </div>
        )}

      </div>
    </section>
  );
}

export default ProductList;
