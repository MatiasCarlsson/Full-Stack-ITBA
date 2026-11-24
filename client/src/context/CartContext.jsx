// context/CartContext.jsx
// Contexto global del carrito con persistencia localStorage versionada y notificaciones Toast

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';

const CART_STORAGE_KEY = 'hermanos-jota-carrito-v1';
const CartContext = createContext(null);

function leerCarritoGuardado() {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function serializarItemMinimo(producto, cantidad) {
  return {
    _id: producto._id || producto.id,
    nombre: producto.nombre,
    precio: Number(producto.precio) || 0,
    imagenUrl: producto.imagenUrl || producto.imagen || '',
    stock: typeof producto.stock === 'number' ? producto.stock : undefined,
    categoria: producto.categoria || '',
    cantidad,
  };
}

export function CartProvider({ children }) {
  const [carrito, setCarrito] = useState(() => leerCarritoGuardado());
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [toastMensaje, setToastMensaje] = useState(null);
  const toastTimerRef = useRef(null);

  // Persiste cambios del carrito en localStorage para no perder piezas al recargar o iniciar sesión
  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(carrito));
    } catch {
      // Silencioso en navegación privada o almacenamiento lleno
    }
  }, [carrito]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const mostrarToast = useCallback((mensaje) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMensaje(mensaje);
    toastTimerRef.current = setTimeout(() => {
      setToastMensaje(null);
      toastTimerRef.current = null;
    }, 2800);
  }, []);

  const agregarAlCarrito = useCallback(
    (producto, cantidad = 1) => {
      const qty = typeof cantidad === 'number' && cantidad > 0 ? cantidad : 1;
      const productoId = producto._id || producto.id;

      setCarrito((prev) => {
        const existe = prev.find((item) => (item._id || item.id) === productoId);
        if (existe) {
          const maxStock = typeof producto.stock === 'number' ? producto.stock : Infinity;
          const nuevaCantidad = Math.min(existe.cantidad + qty, maxStock);
          return prev.map((item) =>
            (item._id || item.id) === productoId
              ? { ...item, cantidad: nuevaCantidad }
              : item
          );
        }
        return [...prev, serializarItemMinimo(producto, qty)];
      });

      mostrarToast(
        qty > 1
          ? `${qty}x "${producto.nombre}" agregados al carrito`
          : `"${producto.nombre}" agregado al carrito`
      );
    },
    [mostrarToast]
  );

  const modificarCantidad = useCallback((id, delta) => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if ((item._id || item.id) === id) {
            const maxStock = typeof item.stock === 'number' ? item.stock : Infinity;
            const nuevaCantidad = Math.min(item.cantidad + delta, maxStock);
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

  const { cantidadCarrito, totalCarrito } = useMemo(() => {
    let cantidad = 0;
    let total = 0;
    for (const item of carrito) {
      cantidad += item.cantidad;
      total += item.precio * item.cantidad;
    }
    return { cantidadCarrito: cantidad, totalCarrito: total };
  }, [carrito]);

  const value = useMemo(
    () => ({
      carrito,
      carritoAbierto,
      cantidadCarrito,
      totalCarrito,
      toastMensaje,
      abrirCarrito,
      cerrarCarrito,
      agregarAlCarrito,
      modificarCantidad,
      eliminarDelCarrito,
      vaciarCarrito,
      mostrarToast,
    }),
    [
      carrito,
      carritoAbierto,
      cantidadCarrito,
      totalCarrito,
      toastMensaje,
      abrirCarrito,
      cerrarCarrito,
      agregarAlCarrito,
      modificarCantidad,
      eliminarDelCarrito,
      vaciarCarrito,
      mostrarToast,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser utilizado dentro de un CartProvider');
  }
  return context;
}

export function useOptionalCart() {
  return useContext(CartContext);
}
