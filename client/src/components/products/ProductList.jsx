// components/products/ProductList.jsx
// Catálogo reactivo con búsqueda diferida (useDeferredValue), ordenamiento y skeletons

import { useState, useMemo, useDeferredValue, startTransition } from 'react';
import ProductCard from './ProductCard';
import { AlertIcon, RefreshIcon, SearchIcon, CloseIcon } from '../common/Icons';
import { useProducts } from '../../hooks/useProducts';
import './ProductList.css';

const SKELETON_ITEMS = [1, 2, 3, 4, 5, 6];

function ProductList({ onAgregarAlCarrito }) {
  const { productos, cargando, error, recargar } = useProducts();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState('destacados');

  const busquedaDiferida = useDeferredValue(busqueda);

  const categorias = useMemo(() => {
    const cats = new Set();
    for (const p of productos) {
      if (p.categoria) cats.add(p.categoria);
    }
    return ['Todas', ...Array.from(cats)];
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    const termino = busquedaDiferida.trim().toLowerCase();

    const filtrados = productos.filter((p) => {
      if (categoriaSeleccionada !== 'Todas' && p.categoria !== categoriaSeleccionada) {
        return false;
      }
      if (!termino) return true;
      const texto = `${p.nombre || ''} ${p.categoria || ''} ${p.descripcion || ''}`.toLowerCase();
      return texto.includes(termino);
    });

    if (orden === 'precio-asc') {
      return [...filtrados].sort((a, b) => (a.precio || 0) - (b.precio || 0));
    }
    if (orden === 'precio-desc') {
      return [...filtrados].sort((a, b) => (b.precio || 0) - (a.precio || 0));
    }
    if (orden === 'nombre') {
      return [...filtrados].sort((a, b) =>
        String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es')
      );
    }
    // Destacados primero, manteniendo orden original
    return [...filtrados].sort((a, b) => Number(Boolean(b.destacado)) - Number(Boolean(a.destacado)));
  }, [productos, categoriaSeleccionada, busquedaDiferida, orden]);

  const handleSeleccionarCategoria = (cat) => {
    startTransition(() => {
      setCategoriaSeleccionada(cat);
    });
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setCategoriaSeleccionada('Todas');
    setOrden('destacados');
  };

  return (
    <section className="product-list" aria-labelledby="catalogo-titulo">
      {/* Cabecera */}
      <div className="product-list__header">
        <div>
          <h2 id="catalogo-titulo" className="product-list__titulo">
            Colección del taller
          </h2>
          <p className="product-list__bajada">
            Piezas de madera maciza trabajadas a mano en San Cristóbal
          </p>
        </div>

        {/* Buscador y ordenamiento */}
        {!cargando && !error ? (
          <div className="product-list__tools">
            <div className="product-list__search">
              <SearchIcon size={16} className="product-list__search-icon" />
              <input
                type="search"
                className="product-list__search-input"
                placeholder="Buscar pieza o material…"
                aria-label="Buscar muebles en el catálogo"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              {busqueda ? (
                <button
                  type="button"
                  className="product-list__search-clear"
                  onClick={() => setBusqueda('')}
                  aria-label="Limpiar búsqueda"
                >
                  <CloseIcon size={14} />
                </button>
              ) : null}
            </div>

            <label className="product-list__sort">
              <span className="sr-only">Ordenar catálogo</span>
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                aria-label="Ordenar catálogo"
              >
                <option value="destacados">Destacados</option>
                <option value="precio-asc">Menor precio</option>
                <option value="precio-desc">Mayor precio</option>
                <option value="nombre">Nombre A–Z</option>
              </select>
            </label>
          </div>
        ) : null}
      </div>

      {/* Filtros por categoría */}
      {!cargando && !error && categorias.length > 1 ? (
        <div
          className="product-list__filtros"
          role="group"
          aria-label="Filtrar por categoría"
        >
          {categorias.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`product-list__filtro-btn${
                categoriaSeleccionada === cat
                  ? ' product-list__filtro-btn--activo'
                  : ''
              }`}
              onClick={() => handleSeleccionarCategoria(cat)}
              aria-pressed={categoriaSeleccionada === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      ) : null}

      {/* Conteo */}
      {!cargando && !error ? (
        <p className="product-list__conteo" aria-live="polite">
          Mostrando {productosFiltrados.length}{' '}
          {productosFiltrados.length === 1 ? 'pieza' : 'piezas'}
          {categoriaSeleccionada !== 'Todas' ? ` en "${categoriaSeleccionada}"` : ''}
          {busquedaDiferida.trim() ? ` para "${busquedaDiferida.trim()}"` : ''}
        </p>
      ) : null}

      {/* Grid principal */}
      <div className="product-list__grid">
        {cargando ? (
          SKELETON_ITEMS.map((item) => (
            <div key={item} className="product-skeleton" aria-hidden="true">
              <div className="product-skeleton__img" />
              <div className="product-skeleton__body">
                <div className="product-skeleton__line product-skeleton__line--sm" />
                <div className="product-skeleton__line product-skeleton__line--lg" />
                <div className="product-skeleton__line product-skeleton__line--md" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="product-list__estado product-list__estado--error">
            <div className="product-list__error-icono" aria-hidden="true">
              <AlertIcon size={40} />
            </div>
            <h3 className="product-list__error-msg">
              No pudimos cargar el catálogo
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
        ) : productosFiltrados.length > 0 ? (
          productosFiltrados.map((producto) => (
            <ProductCard
              key={producto._id || producto.id}
              producto={producto}
              onAgregarAlCarrito={onAgregarAlCarrito}
            />
          ))
        ) : (
          <div className="product-list__vacio">
            <p>
              No encontramos piezas que coincidan con los filtros actuales.
            </p>
            <button
              type="button"
              className="btn btn--secundario"
              onClick={limpiarFiltros}
            >
              Mostrar todo el catálogo
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductList;
