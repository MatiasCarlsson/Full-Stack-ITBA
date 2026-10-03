// components/CartDrawer.jsx
import { useEffect } from 'react';
import { CartIcon, CloseIcon, EmptyBoxIcon, TrashIcon } from './Icons';
import './CartDrawer.css';

/**
 * CartDrawer — Panel lateral deslizable para visualizar y gestionar el carrito.
 * Permite:
 *  - Ver listado de productos agregados con imagen, nombre y precio
 *  - Incrementar / decrementar cantidad
 *  - Eliminar producto individual
 *  - Vaciar carrito
 *  - Ver total calculado en ARS
 */
function CartDrawer({
  abierto,
  onCerrar,
  items,
  onModificarCantidad,
  onEliminarItem,
  onVaciarCarrito,
  onFinalizarCompra,
}) {
  // Cerrar con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && abierto) {
        onCerrar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  const total = items.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  const totalFormateado = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(total);

  return (
    <div className="cart-backdrop" onClick={onCerrar}>
      <aside
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        {/* Header */}
        <div className="cart-drawer__header">
          <div className="cart-drawer__title-wrap">
            <span className="cart-drawer__icon" aria-hidden="true">
              <CartIcon size={20} />
            </span>
            <h2 id="cart-title" className="cart-drawer__title">Tu Carrito</h2>
          </div>
          <button
            type="button"
            className="cart-drawer__close"
            onClick={onCerrar}
            aria-label="Cerrar carrito"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Contenido / Items */}
        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-drawer__vacio">
              <div className="cart-drawer__vacio-icono" aria-hidden="true">
                <EmptyBoxIcon size={48} />
              </div>
              <p className="cart-drawer__vacio-txt">Tu carrito está vacío</p>
              <p className="cart-drawer__vacio-sub">
                Explorá nuestro catálogo y sumá piezas de autor a tu hogar.
              </p>
              <button
                type="button"
                className="btn btn--primario"
                onClick={onCerrar}
                style={{ marginTop: '1rem' }}
              >
                Explorar catálogo
              </button>
            </div>
          ) : (
            <ul className="cart-drawer__lista">
              {items.map((item) => {
                const subtotal = new Intl.NumberFormat('es-AR', {
                  style: 'currency',
                  currency: 'ARS',
                  maximumFractionDigits: 0,
                }).format(item.precio * item.cantidad);

                return (
                  <li key={item.id} className="cart-item">
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      className="cart-item__img"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/imagenes/logo.svg';
                      }}
                    />

                    <div className="cart-item__info">
                      <div className="cart-item__top">
                        <h4 className="cart-item__nombre">{item.nombre}</h4>
                        <button
                          type="button"
                          className="cart-item__borrar"
                          onClick={() => onEliminarItem(item.id)}
                          aria-label={`Eliminar ${item.nombre} del carrito`}
                        >
                          <TrashIcon size={15} />
                        </button>
                      </div>

                      <p className="cart-item__precio-unit">
                        {new Intl.NumberFormat('es-AR', {
                          style: 'currency',
                          currency: 'ARS',
                          maximumFractionDigits: 0,
                        }).format(item.precio)} c/u
                      </p>

                      <div className="cart-item__bottom">
                        {/* Controles de cantidad */}
                        <div className="cart-item__cantidad-ctrl">
                          <button
                            type="button"
                            className="cart-item__btn-qty"
                            onClick={() => onModificarCantidad(item.id, -1)}
                            aria-label="Disminuir cantidad"
                          >
                            −
                          </button>
                          <span className="cart-item__qty">{item.cantidad}</span>
                          <button
                            type="button"
                            className="cart-item__btn-qty"
                            onClick={() => onModificarCantidad(item.id, 1)}
                            aria-label="Aumentar cantidad"
                          >
                            +
                          </button>
                        </div>

                        <span className="cart-item__subtotal">{subtotal}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer con Total y Acciones */}
        {items.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-drawer__total-row">
              <span className="cart-drawer__total-label">Total estimado:</span>
              <span className="cart-drawer__total-monto">{totalFormateado}</span>
            </div>

            <p className="cart-drawer__eco-note">
              Incluye embalaje sustentable y entrega coordinada
            </p>

            <button
              type="button"
              className="cart-drawer__checkout"
              onClick={onFinalizarCompra}
            >
              Completar pedido
            </button>

            <button
              type="button"
              className="cart-drawer__vaciar"
              onClick={onVaciarCarrito}
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

export default CartDrawer;
