// components/cart/CartDrawer.jsx
// Panel lateral del carrito con flujo de compra autenticado vía JWT (POST /api/pedidos)

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOptionalCart } from '../../context/CartContext';
import { useOptionalAuth } from '../../context/AuthContext';
import { crearPedido } from '../../services/orderService';
import {
  CartIcon,
  CloseIcon,
  TrashIcon,
  CheckIcon,
  AlertIcon,
  LockIcon,
} from '../common/Icons';
import { formatearPrecio } from '../../utils/format';
import './CartDrawer.css';

const NOOP = () => {};

function CartDrawer({
  abierto: propAbierto,
  onCerrar: propCerrar,
  items: propItems,
  onModificarCantidad: propModificar,
  onEliminarItem: propEliminar,
  onVaciarCarrito: propVaciar,
  onFinalizarCompra: propFinalizar,
}) {
  const contextCart = useOptionalCart();
  const auth = useOptionalAuth();
  const navigate = useNavigate();

  const abierto = propAbierto !== undefined ? propAbierto : (contextCart?.carritoAbierto ?? false);
  const onCerrar = propCerrar || contextCart?.cerrarCarrito || NOOP;
  const items = propItems || contextCart?.carrito || [];
  const onModificarCantidad = propModificar || contextCart?.modificarCantidad || NOOP;
  const onEliminarItem = propEliminar || contextCart?.eliminarDelCarrito || NOOP;
  const onVaciarCarrito = propVaciar || contextCart?.vaciarCarrito || NOOP;

  const estaAutenticado = Boolean(auth?.estaAutenticado);
  const usuario = auth?.usuario;
  const token = auth?.token;

  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [notasEntrega, setNotasEntrega] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [errorCompra, setErrorCompra] = useState('');
  const [pedidoConfirmado, setPedidoConfirmado] = useState(null);

  const drawerRef = useRef(null);

  // Precompleta la dirección del perfil al abrir el carrito
  useEffect(() => {
    if (abierto && usuario?.direccion && !direccionEntrega) {
      setDireccionEntrega(usuario.direccion);
    }
    if (!abierto) {
      setErrorCompra('');
      setPedidoConfirmado(null);
    }
  }, [abierto, usuario?.direccion, direccionEntrega]);

  // Cerrar con Escape
  useEffect(() => {
    if (!abierto) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCerrar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [abierto, onCerrar]);

  // Evitar scroll del body cuando está abierto
  useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [abierto]);

  if (!abierto) return null;

  const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0);
  const total = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const handleIrALogin = (ruta = '/login') => {
    onCerrar();
    navigate(ruta, { state: { abrirCarrito: true } });
  };

  const handleConfirmarPedido = async () => {
    if (propFinalizar) {
      propFinalizar();
      return;
    }

    if (!estaAutenticado) {
      handleIrALogin('/login');
      return;
    }

    setErrorCompra('');
    setProcesando(true);
    try {
      const payload = {
        items: items.map((item) => ({
          productoId: item._id || item.id,
          cantidad: item.cantidad,
        })),
        direccionEntrega: direccionEntrega.trim(),
        notasEntrega: notasEntrega.trim(),
      };

      const data = await crearPedido(payload, token);
      setPedidoConfirmado(data.pedido);
      setNotasEntrega('');
      onVaciarCarrito();
      if (auth?.recargarPerfil) {
        auth.recargarPerfil().catch(() => {});
      }
      if (contextCart?.mostrarToast) {
        contextCart.mostrarToast(`Pedido ${data.pedido.numeroOrden} confirmado`);
      }
    } catch (err) {
      setErrorCompra(
        err.message || 'No pudimos registrar el pedido. Revisá tu conexión e intentá otra vez.'
      );
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div
      className="cart-backdrop"
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
          <div className="cart-drawer__title-wrap">
            <CartIcon className="cart-drawer__icon" size={20} />
            <h2 className="cart-drawer__title">Tu Carrito</h2>
            <span className="cart-drawer__count">({cantidadTotal})</span>
          </div>
          <button
            type="button"
            className="cart-drawer__close"
            onClick={onCerrar}
            aria-label="Cerrar carrito"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="cart-drawer__body">
          {pedidoConfirmado ? (
            <div className="cart-confirmacion" role="status" aria-live="polite">
              <div className="cart-confirmacion__icono" aria-hidden="true">
                <CheckIcon size={28} />
              </div>
              <h3 className="cart-confirmacion__titulo">¡Pedido confirmado!</h3>
              <p className="cart-confirmacion__orden">
                Orden <strong>{pedidoConfirmado.numeroOrden}</strong>
              </p>
              <p className="cart-confirmacion__texto">
                Registramos tu compra por{' '}
                <strong>{formatearPrecio(pedidoConfirmado.total)}</strong> a nombre de{' '}
                {usuario?.nombre}. Coordinaremos la entrega desde el taller a la brevedad.
              </p>
              <div className="cart-confirmacion__acciones">
                <button
                  type="button"
                  className="btn btn--primario"
                  onClick={() => {
                    onCerrar();
                    navigate('/mis-pedidos');
                  }}
                >
                  Ver mis pedidos
                </button>
                <button
                  type="button"
                  className="btn btn--secundario"
                  onClick={onCerrar}
                >
                  Seguir explorando
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
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
                className="btn btn--primario cart-drawer__vacio-cta"
                onClick={onCerrar}
              >
                Ver productos
              </button>
            </div>
          ) : (
            <>
              <ul className="cart-drawer__lista">
                {items.map((item) => {
                  const itemId = item._id || item.id;
                  const subtotal = item.precio * item.cantidad;

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
                        <span className="cart-item__subtotal">
                          {formatearPrecio(subtotal)}
                        </span>

                        <div className="cart-item__cantidad-ctrl">
                          <button
                            type="button"
                            className="cart-item__btn-qty"
                            onClick={() => onModificarCantidad(itemId, -1)}
                            aria-label={`Restar una unidad de ${item.nombre}`}
                          >
                            −
                          </button>
                          <span className="cart-item__qty">{item.cantidad}</span>
                          <button
                            type="button"
                            className="cart-item__btn-qty"
                            onClick={() => onModificarCantidad(itemId, 1)}
                            disabled={
                              typeof item.stock === 'number' &&
                              item.cantidad >= item.stock
                            }
                            aria-label={`Sumar una unidad de ${item.nombre}`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="cart-item__borrar"
                        onClick={() => onEliminarItem(itemId)}
                        aria-label={`Eliminar ${item.nombre} del carrito`}
                      >
                        <TrashIcon size={16} />
                      </button>
                    </li>
                  );
                })}
              </ul>

              {estaAutenticado ? (
                <div className="cart-checkout-fields">
                  <label className="cart-checkout-field">
                    <span>Dirección de entrega (opcional)</span>
                    <input
                      type="text"
                      value={direccionEntrega}
                      onChange={(e) => setDireccionEntrega(e.target.value)}
                      placeholder="Calle, altura y localidad"
                    />
                  </label>
                  <label className="cart-checkout-field">
                    <span>Notas para el taller (opcional)</span>
                    <input
                      type="text"
                      value={notasEntrega}
                      onChange={(e) => setNotasEntrega(e.target.value)}
                      placeholder="Ej. Horario preferido de entrega"
                    />
                  </label>
                </div>
              ) : null}
            </>
          )}
        </div>

        {/* Footer con totales y acciones */}
        {!pedidoConfirmado && items.length > 0 ? (
          <div className="cart-drawer__footer">
            {errorCompra ? (
              <div className="cart-drawer__error" role="alert">
                <AlertIcon size={16} />
                <span>{errorCompra}</span>
              </div>
            ) : null}

            <div className="cart-drawer__total-row">
              <span className="cart-drawer__total-label">Total estimado</span>
              <span className="cart-drawer__total-monto">
                {formatearPrecio(total)}
              </span>
            </div>

            {estaAutenticado ? (
              <>
                <p className="cart-drawer__eco-note">
                  Pedido a nombre de <strong>{usuario.nombre}</strong>. Entrega coordinada a medida.
                </p>
                <button
                  type="button"
                  className="btn btn--primario cart-drawer__checkout"
                  onClick={handleConfirmarPedido}
                  disabled={procesando}
                >
                  {procesando ? 'Confirmando pedido…' : 'Finalizar Compra'}
                </button>
              </>
            ) : (
              <div className="cart-auth-gate">
                <p className="cart-auth-gate__msg">
                  <LockIcon size={15} /> Iniciá sesión para finalizar tu compra y guardar el pedido en tu cuenta.
                </p>
                <button
                  type="button"
                  className="btn btn--primario cart-drawer__checkout"
                  onClick={() => handleIrALogin('/login')}
                >
                  Iniciar sesión para comprar
                </button>
                <button
                  type="button"
                  className="cart-auth-gate__registro"
                  onClick={() => handleIrALogin('/registro')}
                >
                  ¿Sos nuevo? Crear cuenta
                </button>
              </div>
            )}

            <button
              type="button"
              className="cart-drawer__vaciar"
              onClick={onVaciarCarrito}
              disabled={procesando}
            >
              Vaciar carrito
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default CartDrawer;
