// components/products/ProductList.jsx
import { useState, useMemo } from 'react';
import ProductCard from './ProductCard';
import { AlertIcon, RefreshIcon } from '../common/Icons';
import { useProducts } from '../../hooks/useProducts';
import './ProductList.css';

/**
 * ProductList — Lista de productos obtenidos desde la API REST.
 * Maneja tres estados: cargando, error y éxito, con filtros reactivos.
 */
function ProductList({ onVerDetalle, onAgregarAlCarrito }) {
  const { productos, cargando, error, recargar } = useProducts();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');

  // Lista de categorías únicas derivadas
  const categorias = useMemo(() => {
    const cats = new Set(productos.map((p) => p.categoria).filter(Boolean));
    return ['Todas', ...Array.from(cats)];
  }, [productos]);

  // Filtrado reactivo de productos
  const productosFiltrados = useMemo(() => {
    if (categoriaSeleccionada === 'Todas') {
      return productos;
    }
    return productos.filter((p) => p.categoria === categoriaSeleccionada);
  }, [productos, categoriaSeleccionada]);

  return (
    <section className="product-list" aria-labelledby="catalogo-titulo">

      {/* Cabecera del catálogo y selector de categorías */}
      <div className="product-list__header">
        <div>
          <h2 id="catalogo-titulo" className="product-list__titulo">
            Nuestros Muebles
          </h2>
          <p className="product-list__bajada">
            Piezas artesanales de autor elaboradas con materiales nobles
          </p>
        </div>

        {/* Filtros por categoría */}
        {!cargando && !error && categorias.length > 1 && (
          <div
            className="product-list__filtros"
            role="group"
            aria-label="Filtrar por categoría"
          >
            {categorias.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`product-list__filtro-btn ${
                  categoriaSeleccionada === cat
                    ? 'product-list__filtro-btn--activo'
                    : ''
                }`}
                onClick={() => setCategoriaSeleccionada(cat)}
                aria-pressed={categoriaSeleccionada === cat}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Conteo de productos mostrados */}
      {!cargando && !error && (
        <p className="product-list__conteo" aria-live="polite">
          Mostrando {productosFiltrados.length}{' '}
          {productosFiltrados.length === 1 ? 'pieza' : 'piezas'}
          {categoriaSeleccionada !== 'Todas' && ` en "${categoriaSeleccionada}"`}
        </p>
      )}

      {/* Grid principal */}
      <div className="product-list__grid">

        {/* ESTADO 1: Cargando */}
        {cargando && (
          <div className="product-list__estado">
            <div
              className="product-list__spinner"
              aria-label="Cargando productos..."
            />
            <p className="product-list__cargando-txt">
              Cargando catálogo de Hermanos Jota…
            </p>
          </div>
        )}

        {/* ESTADO 2: Error */}
        {error && !cargando && (
          <div className="product-list__estado product-list__estado--error">
            <div className="product-list__error-icono" aria-hidden="true">
              <AlertIcon size={40} />
            </div>
            <h3 className="product-list__error-msg">
              No pudimos cargar los productos
            </h3>
            <p className="product-list__error-detail">{error}</p>
            <button
              type="button"
              className="product-list__reintentar"
              onClick={recargar}
            >
              <RefreshIcon size={16} /> Reintentar
            </button>
          </div>
        )}

        {/* ESTADO 3: Éxito — Lista de tarjetas */}
        {!cargando && !error && productosFiltrados.map((producto) => (
          <ProductCard
            key={producto._id || producto.id}
            producto={producto}
            onVerDetalle={onVerDetalle}
            onAgregarAlCarrito={onAgregarAlCarrito}
          />
        ))}

        {/* Estado vacío (filtro sin resultados) */}
        {!cargando && !error && productosFiltrados.length === 0 && (
          <div className="product-list__vacio">
            <p>No encontramos piezas en la categoría "{categoriaSeleccionada}".</p>
            <button
              type="button"
              className="btn btn--secundario"
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
