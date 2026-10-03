// components/ProductDetail.jsx
import { useState } from 'react';
import {
  CheckIcon,
  CartIcon,
  ShieldIcon,
  TruckIcon,
  LeafIcon,
  RulerIcon,
} from './Icons';
import './ProductDetail.css';

/**
 * ProductDetail — Vista editorial y de alta conversión para un producto individual.
 * Se muestra mediante renderizado condicional en App.js.
 * Props:
 *   - producto: objeto completo del producto seleccionado
 *   - onVolver: callback para volver al catálogo
 *   - onAgregarAlCarrito: callback (producto, cantidad) → agrega al carrito
 *   - onAbrirCarrito: callback para desplegar el drawer del carrito
 */
function ProductDetail({ producto, onVolver, onAgregarAlCarrito, onAbrirCarrito }) {
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  // Formato de moneda para Argentina (ARS)
  const precioFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(producto.precio);

  // Cálculo de 3 cuotas sin interés
  const cuotaFormateada = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(Math.round(producto.precio / 3));

  // Cálculo de precio con transferencia (10% descuento)
  const precioTransferencia = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(Math.round(producto.precio * 0.9));

  const stockMsg =
    producto.stock > 5
      ? { clase: 'detalle__stock--disponible', texto: `${producto.stock} unidades listas en taller` }
      : { clase: 'detalle__stock--bajo', texto: `Últimas ${producto.stock} unidades disponibles` };

  const handleModificarQty = (delta) => {
    setCantidad((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (producto.stock && next > producto.stock) return producto.stock;
      return next;
    });
  };

  const handleAgregar = () => {
    onAgregarAlCarrito(producto, cantidad);
    setAgregado(true);
    setTimeout(() => {
      setAgregado(false);
    }, 2200);
  };

  return (
    <article className="detalle" aria-label={`Ficha técnica de ${producto.nombre}`}>

      {/* ── Breadcrumb de navegación superior ── */}
      <nav className="detalle__breadcrumb" aria-label="Migas de pan">
        <button type="button" className="detalle__breadcrumb-link" onClick={onVolver}>
          Catálogo
        </button>
        <span className="detalle__breadcrumb-sep" aria-hidden="true">/</span>
        <span className="detalle__breadcrumb-cat">{producto.categoria}</span>
        <span className="detalle__breadcrumb-sep" aria-hidden="true">/</span>
        <span className="detalle__breadcrumb-current" aria-current="page">{producto.nombre}</span>
      </nav>

      {/* ── Columna Izquierda: Escenario Visual de la Pieza ── */}
      <div className="detalle__visual">
        <div className="detalle__img-wrapper">
          <img
            className="detalle__img"
            src={producto.imagen}
            alt={producto.nombre}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/imagenes/logo.svg';
            }}
          />

          {producto.destacado && (
            <span className="detalle__destacado-badge">Pieza Destacada</span>
          )}

          <div className="detalle__sello">
            <LeafIcon size={16} />
            <span>Madera FSC · Taller Buenos Aires</span>
          </div>
        </div>

        {/* Cita artesanal */}
        <div className="detalle__quote">
          <p>
            Cada veta cuenta la historia de manos expertas y materiales nobles que envejecen con carácter.
          </p>
          <cite>— Taller Hermanos Jota, San Cristóbal</cite>
        </div>
      </div>

      {/* ── Columna Derecha: Información Editorial y Conversión ── */}
      <div className="detalle__info">

        <div className="detalle__header">
          <span className="detalle__categoria">{producto.categoria}</span>
          <h1 className="detalle__nombre">{producto.nombre}</h1>
        </div>

        {/* Bloque de Precios y Financiación */}
        <div className="detalle__precio-card">
          <div className="detalle__precio-main">
            <span className="detalle__precio">{precioFormateado}</span>
            {producto.precioUnidad && <span className="detalle__precio-unit">/ unidad</span>}
          </div>

          <div className="detalle__cuotas">
            <span className="detalle__cuotas-badge">3 cuotas sin interés</span>
            <span className="detalle__cuotas-txt">de <strong>{cuotaFormateada}</strong></span>
          </div>

          <p className="detalle__transferencia">
            o <strong>{precioTransferencia}</strong> (10% OFF pagando con transferencia bancaria)
          </p>
        </div>

        {/* Narrativa de producto */}
        <div className="detalle__descripcion-wrap">
          <h3 className="detalle__subtitulo">Historia &amp; Diseño</h3>
          <p className="detalle__descripcion">{producto.descripcion}</p>
        </div>

        {/* Ficha técnica y especificaciones */}
        <div className="detalle__specs">
          <h3 className="detalle__subtitulo">Especificaciones Técnicas</h3>

          <div className="detalle__specs-grid">
            {producto.dimensiones && (
              <div className="detalle__spec-item">
                <span className="detalle__spec-icon" aria-hidden="true"><RulerIcon size={16} /></span>
                <div>
                  <span className="detalle__spec-label">Dimensiones</span>
                  <span className="detalle__spec-val">{producto.dimensiones}</span>
                </div>
              </div>
            )}

            <div className="detalle__spec-item">
              <span className="detalle__spec-icon" aria-hidden="true"><LeafIcon size={16} /></span>
              <div>
                <span className="detalle__spec-label">Disponibilidad</span>
                <span className={`detalle__stock ${stockMsg.clase}`}>{stockMsg.texto}</span>
              </div>
            </div>
          </div>

          {/* Tags de materiales */}
          {producto.materiales && (
            <div className="detalle__materiales-wrap">
              <span className="detalle__spec-label">Materiales y Acabados:</span>
              <div className="detalle__materiales-lista">
                {producto.materiales.map((mat) => (
                  <span key={mat} className="detalle__material-tag">{mat}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selector de cantidad y acciones de compra */}
        <div className="detalle__compra-box">
          <div className="detalle__qty-row">
            <label className="detalle__qty-label" htmlFor="qty-input">Cantidad:</label>
            <div className="detalle__qty-picker">
              <button
                type="button"
                className="detalle__qty-btn"
                onClick={() => handleModificarQty(-1)}
                disabled={cantidad <= 1}
                aria-label="Restar una unidad"
              >
                −
              </button>
              <span id="qty-input" className="detalle__qty-num">{cantidad}</span>
              <button
                type="button"
                className="detalle__qty-btn"
                onClick={() => handleModificarQty(1)}
                disabled={producto.stock && cantidad >= producto.stock}
                aria-label="Sumar una unidad"
              >
                +
              </button>
            </div>
            {producto.stock && (
              <span className="detalle__qty-max">Máx. {producto.stock} un.</span>
            )}
          </div>

          {/* Botones de acción principal */}
          <div className="detalle__acciones">
            <button
              type="button"
              className={`btn btn--primario detalle__btn-add ${agregado ? 'btn--agregado' : ''}`}
              onClick={handleAgregar}
              aria-label={`Agregar ${producto.nombre} al carrito`}
            >
              {agregado ? (
                <span className="btn-agregado-wrap">
                  <CheckIcon size={18} /> ¡{cantidad > 1 ? `${cantidad} piezas agregadas` : 'Agregado al carrito'}!
                </span>
              ) : (
                <span className="btn-content-wrap">
                  Agregar <CartIcon size={18} />
                </span>
              )}
            </button>

            {onAbrirCarrito && (
              <button
                type="button"
                className="btn btn--carrito-link detalle__btn-cart"
                onClick={onAbrirCarrito}
                aria-label="Abrir carrito de compras"
              >
                <CartIcon size={18} /> Ver carrito
              </button>
            )}
          </div>
        </div>

        {/* Garantías y sellos de confianza (Trust Badges) */}
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
