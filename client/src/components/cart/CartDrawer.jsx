import { useEffect, useRef, useMemo } from 'react';
import { useCart } from '../../context/CartContext';
import { CartIcon } from '../common/Icons';
import './CartDrawer.css';

/**
 * CartDrawer — Panel lateral deslizable para gestionar los ítems del carrito.
 * Lee de CartContext o de props para máxima flexibilidad.
 */
function CartDrawer({
  abierto: propAbierto,
  onCerrar: propCerrar,
  items: propItems,
  onModificarCantidad: propModificar,
  onEliminarItem: propEliminar,
  onVaciarCarrito: propVaciar,
  onFinalizarCompra: propFinalizar,
}) {
  let contextCart = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    contextCart = useCart();
  } catch {
    contextCart = null;
  }

  const abierto = propAbierto !== undefined ? propAbierto : (contextCart?.carritoAbierto ?? false);
  const onCerrar = useMemo(() => {
    return propCerrar || contextCart?.cerrarCarrito || (() => {});
  }, [propCerrar, contextCart]);
  const items = propItems || contextCart?.carrito || [];
  const onModificarCantidad = propModificar || contextCart?.modificarCantidad || (() => {});
  const onEliminarItem = propEliminar || contextCart?.eliminarDelCarrito || (() => {});
  const onVaciarCarrito = propVaciar || contextCart?.vaciarCarrito || (() => {});
  const onFinalizarCompra = propFinalizar || contextCart?.finalizarCompra || (() => {});

  const drawerRef = useRef(null);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && abierto) {
        onCerrar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [abierto, onCerrar]);

  // Evitar scroll del body cuando está abierto
  useEffect(() => {
    if (abierto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [abierto]);

  const total = items.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  const totalFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(total);

  if (!abierto) return null;

  return (
    <div
      className="cart-overlay"
      onClick={onCerrar}
      role="dialog"
      aria-modal="true"
      aria-label="Carrito de compras"
    >
      <div
        className="cart-drawer"
        ref={drawerRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="cart-drawer__header">
          <div className="cart-drawer__titulo-wrap">
            <CartIcon size={20} />
            <h2 className="cart-drawer__titulo">Tu Carrito</h2>
            <span className="cart-drawer__count">
              ({items.reduce((acc, i) => acc + i.cantidad, 0)})
            </span>
          </div>
          <button
            type="button"
            className="cart-drawer__close"
            onClick={onCerrar}
            aria-label="Cerrar carrito"
          >
            ✕
          </button>
        </div>

        {/* Lista de ítems */}
        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-drawer__vacio">
              <p className="cart-drawer__vacio-icono" aria-hidden="true">
                <CartIcon size={48} />
              </p>
              <p className="cart-drawer__vacio-txt">Tu carrito está vacío</p>
              <p className="cart-drawer__vacio-sub">
                Explorá nuestro catálogo y elegí muebles artesanales de autor.
              </p>
              <button
                type="button"
                className="btn btn--primario"
                onClick={onCerrar}
              >
                Ver productos
              </button>
            </div>
          ) : (
            <ul className="cart-drawer__lista">
              {items.map((item) => {
                const itemId = item._id || item.id;
                const subtotal = item.precio * item.cantidad;
                const subtotalFormateado = new Intl.NumberFormat('es-AR', {
                  style: 'currency',
                  currency: 'ARS',
                  maximumFractionDigits: 0,
                }).format(subtotal);

                return (
                  <li key={itemId} className="cart-item">
                    <img
                      className="cart-item__img"
                      src={item.imagenUrl || item.imagen || '/imagenes/logo.svg'}
                      alt={item.nombre}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/imagenes/logo.svg';
                      }}
                    />

                    <div className="cart-item__info">
                      <span className="cart-item__nombre">{item.nombre}</span>
                      <span className="cart-item__subtotal">{subtotalFormateado}</span>

                      {/* Control de cantidad */}
                      <div className="cart-item__qty">
                        <button
                          type="button"
                          className="cart-item__qty-btn"
                          onClick={() => onModificarCantidad(itemId, -1)}
                          aria-label={`Restar una unidad de ${item.nombre}`}
                        >
                          −
                        </button>
                        <span className="cart-item__qty-num">{item.cantidad}</span>
                        <button
                          type="button"
                          className="cart-item__qty-btn"
                          onClick={() => onModificarCantidad(itemId, 1)}
                          disabled={item.stock && item.cantidad >= item.stock}
                          aria-label={`Sumar una unidad de ${item.nombre}`}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Botón eliminar */}
                    <button
                      type="button"
                      className="cart-item__remove"
                      onClick={() => onEliminarItem(itemId)}
                      aria-label={`Eliminar ${item.nombre} del carrito`}
                    >
                      🗑
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer con totales y acciones */}
        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__total-row">
              <span className="cart-drawer__total-label">Total estimado:</span>
              <span className="cart-drawer__total-val">{totalFormateado}</span>
            </div>
            <p className="cart-drawer__envio-nota">
              Costos de envío y entrega coordinada calculados en el checkout.
            </p>

            <button
              type="button"
              className="btn btn--primario cart-drawer__btn-checkout"
              onClick={onFinalizarCompra}
            >
              Finalizar Pedido
            </button>

            <button
              type="button"
              className="cart-drawer__btn-vaciar"
              onClick={onVaciarCarrito}
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartDrawer;
