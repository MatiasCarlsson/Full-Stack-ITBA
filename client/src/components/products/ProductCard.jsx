// components/products/ProductCard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { CheckIcon, CartIcon } from '../common/Icons';
import './ProductCard.css';

/**
 * ProductCard — Tarjeta individual de un producto.
 * Puede recibir onAgregarAlCarrito o consumir CartContext directamente.
 */
function ProductCard({ producto, onAgregarAlCarrito }) {
  const navigate = useNavigate();

  let contextCart = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    contextCart = useCart();
  } catch {
    contextCart = null;
  }

  const [agregado, setAgregado] = useState(false);

  // Compatibilidad: 'imagenUrl' (MongoDB) o 'imagen' (datos locales Sprint 3-4)
  const imagenSrc = producto.imagenUrl || producto.imagen || '/imagenes/logo.svg';
  // Compatibilidad: '_id' (MongoDB) o 'id' (datos locales)
  const productoId = producto._id || producto.id;
  const irAlDetalle = () => navigate(`/productos/${productoId}`);

  const precioFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(producto.precio);

  const handleAgregar = () => {
    if (onAgregarAlCarrito) {
      onAgregarAlCarrito(producto);
    } else if (contextCart) {
      contextCart.agregarAlCarrito(producto);
    }
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
        onClick={irAlDetalle}
        role="button"
        tabIndex={0}
        aria-label={`Ver ficha de ${producto.nombre}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            irAlDetalle();
          }
        }}
      >
        <img
          className="product-card__img"
          src={imagenSrc}
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
      </div>

      {/* Cuerpo de la tarjeta */}
      <div className="product-card__body">
        <span className="product-card__categoria">{producto.categoria}</span>
        <h3
          className="product-card__nombre"
          onClick={irAlDetalle}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') irAlDetalle();
          }}
        >
          {producto.nombre}
        </h3>
        <p className="product-card__precio">{precioFormateado}</p>
        <p className="product-card__descripcion">{producto.descripcion}</p>
      </div>

      {/* Pie de la tarjeta: Botón Agregar */}
      <div className="product-card__footer">
        <button
          type="button"
          className={`btn btn--primario product-card__btn ${
            agregado ? 'btn--agregado' : ''
          }`}
          onClick={handleAgregar}
          aria-label={`Agregar ${producto.nombre} al carrito`}
        >
          {agregado ? (
            <span className="btn-agregado-wrap">
              <CheckIcon size={16} /> ¡Agregado!
            </span>
          ) : (
            <span className="btn-content-wrap">
              Agregar <CartIcon size={16} />
            </span>
          )}
        </button>
      </div>

    </article>
  );
}

export default ProductCard;
