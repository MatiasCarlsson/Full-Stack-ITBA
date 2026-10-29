// context/CartContext.jsx
// Contexto global del carrito de compras y notificaciones toast
// Elimina el prop-drilling en la aplicación y optimiza re-renders

import { createContext, useContext, useState, useMemo, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [carrito, setCarrito] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [toastMensaje, setToastMensaje] = useState(null);

  const mostrarToast = useCallback((mensaje) => {
    setToastMensaje(mensaje);
    const timer = setTimeout(() => {
      setToastMensaje(null);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const agregarAlCarrito = useCallback((producto, cantidad = 1) => {
    const qty = typeof cantidad === 'number' && cantidad > 0 ? cantidad : 1;
    const productoId = producto._id || producto.id;

    setCarrito((prev) => {
      const existe = prev.find((item) => (item._id || item.id) === productoId);
      if (existe) {
        return prev.map((item) =>
          (item._id || item.id) === productoId
            ? { ...item, cantidad: item.cantidad + qty }
            : item
        );
      }
      return [...prev, { ...producto, cantidad: qty }];
    });

    mostrarToast(
      qty > 1
        ? `${qty}x "${producto.nombre}" agregados al carrito`
        : `"${producto.nombre}" agregado al carrito`
    );
  }, [mostrarToast]);

  const modificarCantidad = useCallback((id, delta) => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if ((item._id || item.id) === id) {
            const nuevaCantidad = item.cantidad + delta;
            return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  }, []);

  const eliminarDelCarrito = useCallback((id) => {
    setCarrito((prev) => prev.filter((item) => (item._id || item.id) !== id));
  }, []);

  const vaciarCarrito = useCallback(() => {
    setCarrito([]);
  }, []);

  const abrirCarrito = useCallback(() => {
    setCarritoAbierto(true);
  }, []);

  const cerrarCarrito = useCallback(() => {
    setCarritoAbierto(false);
  }, []);

  const finalizarCompra = useCallback(() => {
    alert(
      '¡Muchas gracias por tu pedido en Hermanos Jota!\n\nCoordinaremos la entrega de tus piezas y los detalles de pago a la brevedad.'
    );
    setCarrito([]);
    setCarritoAbierto(false);
  }, []);

  const cantidadCarrito = useMemo(() => {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
  }, [carrito]);

  const value = useMemo(() => ({
    carrito,
    carritoAbierto,
    cantidadCarrito,
    toastMensaje,
    abrirCarrito,
    cerrarCarrito,
    agregarAlCarrito,
    modificarCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    finalizarCompra,
    mostrarToast,
  }), [
    carrito,
    carritoAbierto,
    cantidadCarrito,
    toastMensaje,
    abrirCarrito,
    cerrarCarrito,
    agregarAlCarrito,
    modificarCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    finalizarCompra,
    mostrarToast,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser utilizado dentro de un CartProvider');
  }
  return context;
}
