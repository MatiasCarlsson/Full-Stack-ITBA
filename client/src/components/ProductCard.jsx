// components/ProductCard.jsx
import { useState } from 'react';
import { CheckIcon, CartIcon } from './Icons';
import './ProductCard.css';

/**
 * ProductCard — Tarjeta individual de un producto.
 * Props:
 *   - producto: objeto con id, nombre, precio, categoria, imagen, destacado
 *   - onVerDetalle: callback (producto) → muestra ProductDetail
 *   - onAgregarAlCarrito: callback (producto) → agrega al estado del carrito en App.js
 */
function ProductCard({ producto, onVerDetalle, onAgregarAlCarrito }) {
  const [agregado, setAgregado] = useState(false);

  const precioFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(producto.precio);

  const handleAgregar = () => {
    onAgregarAlCarrito(producto);
    setAgregado(true);
    setTimeout(() => {
      setAgregado(false);
    }, 1200);
  };

  return (
    <article className="product-card">

      {/* Imagen con badge opcional — clickeable para abrir el detalle */}
      <div
        className="product-card__img-wrapper"
        onClick={() => onVerDetalle(producto)}
        role="button"
        tabIndex={0}
        aria-label={`Ver ficha de ${producto.nombre}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onVerDetalle(producto);
          }
        }}
      >
        <img
          className="product-card__img"
          src={producto.imagen}
          alt={producto.nombre}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/imagenes/logo.svg';
          }}
        />
        {producto.destacado && (
          <span className="product-card__badge">Destacado</span>
        )}
        <div className="product-card__hover-cue" aria-hidden="true">
          <span>Ver detalle</span>
        </div>
      </div>

      {/* Info del producto */}
      <div className="product-card__body">
        <p className="product-card__categoria">{producto.categoria}</p>
        <h3
          className="product-card__nombre"
          onClick={() => onVerDetalle(producto)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onVerDetalle(producto);
            }
          }}
        >
          {producto.nombre}
        </h3>
        <p className="product-card__precio">
          {precioFormateado}
          {producto.precioUnidad && <span> / unidad</span>}
        </p>
      </div>

      {/* Botones de acción */}
      <div className="product-card__acciones">
        <button
          type="button"
          className="btn btn--secundario"
          onClick={() => onVerDetalle(producto)}
          aria-label={`Ver detalle de ${producto.nombre}`}
        >
          Ver detalle
        </button>
        <button
          type="button"
          className={`btn btn--primario ${agregado ? 'btn--agregado' : ''}`}
          onClick={handleAgregar}
          aria-label={`Agregar ${producto.nombre} al carrito`}
        >
          {agregado ? (
            <span className="btn-agregado-wrap">
              <CheckIcon size={14} /> Agregado
            </span>
          ) : (
            <span className="btn-content-wrap">
              Agregar <CartIcon size={15} />
            </span>
          )}
        </button>
      </div>

    </article>
  );
}

export default ProductCard;
