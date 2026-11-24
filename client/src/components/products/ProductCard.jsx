// components/products/ProductCard.jsx
// Tarjeta de producto memoizada con formateo cacheado y limpieza segura de temporizadores

import { memo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOptionalCart } from '../../context/CartContext';
import { CheckIcon, CartIcon } from '../common/Icons';
import { formatearPrecio } from '../../utils/format';
import './ProductCard.css';

const ProductCard = memo(function ProductCard({ producto, onAgregarAlCarrito }) {
  const navigate = useNavigate();
  const contextCart = useOptionalCart();

  const [agregado, setAgregado] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const imagenSrc = producto.imagenUrl || producto.imagen || '/imagenes/logo.svg';
  const productoId = producto._id || producto.id;
  const sinStock = typeof producto.stock === 'number' && producto.stock <= 0;
  const precioFormateado = formatearPrecio(producto.precio);

  const irAlDetalle = () => navigate(`/productos/${productoId}`);

  const handleAgregar = () => {
    if (sinStock) return;
    if (onAgregarAlCarrito) {
      onAgregarAlCarrito(producto);
    } else if (contextCart) {
      contextCart.agregarAlCarrito(producto);
    }

    setAgregado(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setAgregado(false);
      timerRef.current = null;
    }, 1200);
  };

  return (
    <article className="product-card">
      {/* Imagen clickeable con pista visual sutil */}
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
          decoding="async"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/imagenes/logo.svg';
          }}
        />
        <div className="product-card__hover-cue" aria-hidden="true">
          <span>Ver ficha técnica</span>
        </div>
        {producto.destacado ? (
          <span className="product-card__badge">Destacado</span>
        ) : null}
      </div>

      {/* Cuerpo */}
      <div className="product-card__body">
        {producto.categoria ? (
          <span className="product-card__categoria">{producto.categoria}</span>
        ) : null}
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
        {producto.descripcion ? (
          <p className="product-card__descripcion">{producto.descripcion}</p>
        ) : null}
      </div>

      {/* Acción principal */}
      <div className="product-card__footer">
        <button
          type="button"
          className={`btn btn--primario product-card__btn${
            agregado ? ' btn--agregado' : ''
          }`}
          onClick={handleAgregar}
          disabled={sinStock}
          aria-label={`Agregar ${producto.nombre} al carrito`}
        >
          {sinStock ? (
            <span>Sin stock</span>
          ) : agregado ? (
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
});

export default ProductCard;
