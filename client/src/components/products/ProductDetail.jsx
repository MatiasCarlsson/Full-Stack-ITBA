// components/products/ProductDetail.jsx
// Ficha editorial individual optimizada con formateo cacheado y limpieza segura de timers

import { useState, useRef, useEffect } from 'react';
import { useOptionalCart } from '../../context/CartContext';
import {
  CheckIcon,
  CartIcon,
  ShieldIcon,
  TruckIcon,
  LeafIcon,
  RulerIcon,
} from '../common/Icons';
import { formatearPrecio } from '../../utils/format';
import './ProductDetail.css';

function ProductDetail({ producto, onVolver, onAgregarAlCarrito, onAbrirCarrito }) {
  const contextCart = useOptionalCart();

  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const precioFormateado = formatearPrecio(producto.precio);
  const cuotaFormateada = formatearPrecio(Math.round(producto.precio / 3));
  const precioTransferencia = formatearPrecio(Math.round(producto.precio * 0.9));

  const sinStock = typeof producto.stock === 'number' && producto.stock <= 0;

  const stockMsg = sinStock
    ? { clase: 'detalle__stock--bajo', texto: 'Sin stock disponible por el momento' }
    : producto.stock > 5
      ? { clase: 'detalle__stock--disponible', texto: `${producto.stock} unidades listas en taller` }
      : { clase: 'detalle__stock--bajo', texto: `Últimas ${producto.stock} unidades disponibles` };

  const handleModificarQty = (delta) => {
    setCantidad((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (typeof producto.stock === 'number' && next > producto.stock) return producto.stock;
      return next;
    });
  };

  const handleAgregar = () => {
    if (sinStock) return;
    if (onAgregarAlCarrito) {
      onAgregarAlCarrito(producto, cantidad);
    } else if (contextCart) {
      contextCart.agregarAlCarrito(producto, cantidad);
    }
    setAgregado(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setAgregado(false);
      timerRef.current = null;
    }, 2200);
  };

  const handleAbrir = onAbrirCarrito || (contextCart ? contextCart.abrirCarrito : null);

  return (
    <article className="detalle" aria-label={`Ficha técnica de ${producto.nombre}`}>
      {/* Breadcrumb */}
      <nav className="detalle__breadcrumb" aria-label="Migas de pan">
        {onVolver ? (
          <>
            <button type="button" className="detalle__breadcrumb-link" onClick={onVolver}>
              Catálogo
            </button>
            <span className="detalle__breadcrumb-sep" aria-hidden="true">/</span>
          </>
        ) : null}
        <span className="detalle__breadcrumb-cat">{producto.categoria}</span>
        <span className="detalle__breadcrumb-sep" aria-hidden="true">/</span>
        <span className="detalle__breadcrumb-current" aria-current="page">{producto.nombre}</span>
      </nav>

      {/* Columna Izquierda */}
      <div className="detalle__visual">
        <div className="detalle__img-wrapper">
          <img
            className="detalle__img"
            src={producto.imagenUrl || producto.imagen || '/imagenes/logo.svg'}
            alt={producto.nombre}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/imagenes/logo.svg';
            }}
          />

          {producto.destacado ? (
            <span className="detalle__destacado-badge">Pieza Destacada</span>
          ) : null}

          <div className="detalle__sello">
            <LeafIcon size={16} />
            <span>Madera FSC · Taller Buenos Aires</span>
          </div>
        </div>

        <div className="detalle__quote">
          <p>
            Cada veta cuenta la historia de manos expertas y materiales nobles que envejecen con carácter.
          </p>
          <cite>— Taller Hermanos Jota, San Cristóbal</cite>
        </div>
      </div>

      {/* Columna Derecha */}
      <div className="detalle__info">
        <div className="detalle__header">
          <span className="detalle__categoria">{producto.categoria}</span>
          <h1 className="detalle__nombre">{producto.nombre}</h1>
        </div>

        <div className="detalle__precio-card">
          <div className="detalle__precio-main">
            <span className="detalle__precio">{precioFormateado}</span>
            {producto.precioUnidad ? <span className="detalle__precio-unit">/ unidad</span> : null}
          </div>

          <div className="detalle__cuotas">
            <span className="detalle__cuotas-badge">3 cuotas sin interés</span>
            <span className="detalle__cuotas-txt">de <strong>{cuotaFormateada}</strong></span>
          </div>

          <p className="detalle__transferencia">
            o <strong>{precioTransferencia}</strong> (10% OFF pagando con transferencia bancaria)
          </p>
        </div>

        <div className="detalle__descripcion-wrap">
          <h3 className="detalle__subtitulo">Historia &amp; Diseño</h3>
          <p className="detalle__descripcion">{producto.descripcion}</p>
        </div>

        <div className="detalle__specs">
          <h3 className="detalle__subtitulo">Especificaciones Técnicas</h3>

          <div className="detalle__specs-grid">
            {producto.dimensiones ? (
              <div className="detalle__spec-item">
                <span className="detalle__spec-icon" aria-hidden="true"><RulerIcon size={16} /></span>
                <div>
                  <span className="detalle__spec-label">Dimensiones</span>
                  <span className="detalle__spec-val">{producto.dimensiones}</span>
                </div>
              </div>
            ) : null}

            <div className="detalle__spec-item">
              <span className="detalle__spec-icon" aria-hidden="true"><LeafIcon size={16} /></span>
              <div>
                <span className="detalle__spec-label">Disponibilidad</span>
                <span className={`detalle__stock ${stockMsg.clase}`}>{stockMsg.texto}</span>
              </div>
            </div>
          </div>

          {Array.isArray(producto.materiales) && producto.materiales.length > 0 ? (
            <div className="detalle__materiales-wrap">
              <span className="detalle__spec-label">Materiales y Acabados:</span>
              <div className="detalle__materiales-lista">
                {producto.materiales.map((mat) => (
                  <span key={mat} className="detalle__material-tag">{mat}</span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Compra */}
        <div className="detalle__compra-box">
          <div className="detalle__qty-row">
            <label className="detalle__qty-label" htmlFor="qty-input">Cantidad:</label>
            <div className="detalle__qty-picker">
              <button
                type="button"
                className="detalle__qty-btn"
                onClick={() => handleModificarQty(-1)}
                disabled={sinStock || cantidad <= 1}
                aria-label="Restar una unidad"
              >
                −
              </button>
              <span id="qty-input" className="detalle__qty-num">{cantidad}</span>
              <button
                type="button"
                className="detalle__qty-btn"
                onClick={() => handleModificarQty(1)}
                disabled={sinStock || (typeof producto.stock === 'number' && cantidad >= producto.stock)}
                aria-label="Sumar una unidad"
              >
                +
              </button>
            </div>
            {typeof producto.stock === 'number' && producto.stock > 0 ? (
              <span className="detalle__qty-max">Máx. {producto.stock} un.</span>
            ) : null}
          </div>

          <div className="detalle__acciones">
            <button
              type="button"
              className={`btn btn--primario detalle__btn-add${agregado ? ' btn--agregado' : ''}`}
              onClick={handleAgregar}
              disabled={sinStock}
              aria-label={`Agregar ${producto.nombre} al carrito`}
            >
              {sinStock ? (
                <span>Sin stock disponible</span>
              ) : agregado ? (
                <span className="btn-agregado-wrap">
                  <CheckIcon size={18} /> ¡{cantidad > 1 ? `${cantidad} piezas agregadas` : 'Agregado al carrito'}!
                </span>
              ) : (
                <span className="btn-content-wrap">
                  Agregar <CartIcon size={18} />
                </span>
              )}
            </button>

            {handleAbrir ? (
              <button
                type="button"
                className="btn btn--carrito-link detalle__btn-cart"
                onClick={handleAbrir}
                aria-label="Abrir carrito de compras"
              >
                <CartIcon size={18} /> Ver carrito
              </button>
            ) : null}
          </div>
        </div>

        <div className="detalle__trust-bar">
          <div className="detalle__trust-item">
            <ShieldIcon size={22} className="detalle__trust-icon" />
            <div>
              <strong>Garantía Estructural</strong>
              <p>10 años de cobertura y respaldo directo de fábrica</p>
            </div>
          </div>

          <div className="detalle__trust-item">
            <TruckIcon size={22} className="detalle__trust-icon" />
            <div>
              <strong>Envío Coordinado</strong>
              <p>Embalaje sustentable y entrega coordinada a medida</p>
            </div>
          </div>

          <div className="detalle__trust-item">
            <LeafIcon size={22} className="detalle__trust-icon" />
            <div>
              <strong>Madera Certificada</strong>
              <p>100% FSC de bosques reforestados y trazables</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProductDetail;
