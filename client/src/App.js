// App.js — Hermanos Jota E-commerce
// Componente raíz: gestiona el estado global del carrito y la navegación entre vistas.

import { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import ContactForm from './components/ContactForm';
import CartDrawer from './components/CartDrawer';
import './App.css';

function App() {
  // ── Estado global del carrito ───────────────────────────────────────────────
  // Array de productos agregados. Cada elemento tiene { ...producto, cantidad }
  const [carrito, setCarrito] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  // ── Estado de navegación ────────────────────────────────────────────────────
  // 'catalogo' | 'detalle' | 'contacto'
  const [vistaActual, setVistaActual] = useState('catalogo');

  // Producto seleccionado para ver en detalle
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Mensaje de notificación toast
  const [toastMensaje, setToastMensaje] = useState(null);

  const mostrarToast = (mensaje) => {
    setToastMensaje(mensaje);
    setTimeout(() => {
      setToastMensaje(null);
    }, 2500);
  };

  // ── Handlers de Carrito ─────────────────────────────────────────────────────

  /**
   * Agrega un producto al carrito.
   * Si el producto ya existe, incrementa su cantidad.
   */
  const handleAgregarAlCarrito = (producto, cantidad = 1) => {
    const qty = typeof cantidad === 'number' && cantidad > 0 ? cantidad : 1;
    setCarrito((prevCarrito) => {
      const existe = prevCarrito.find((item) => item.id === producto.id);
      if (existe) {
        return prevCarrito.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + qty }
            : item
        );
      }
      return [...prevCarrito, { ...producto, cantidad: qty }];
    });
    mostrarToast(
      qty > 1
        ? `${qty}x "${producto.nombre}" agregados al carrito`
        : `"${producto.nombre}" agregado al carrito`
    );
  };

  /**
   * Modifica la cantidad de un producto (+1 o -1).
   * Si llega a 0, elimina el producto del carrito.
   */
  const handleModificarCantidad = (id, delta) => {
    setCarrito((prevCarrito) =>
      prevCarrito
        .map((item) => {
          if (item.id === id) {
            const nuevaCantidad = item.cantidad + delta;
            return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  /**
   * Elimina un producto específico del carrito.
   */
  const handleEliminarDelCarrito = (id) => {
    setCarrito((prevCarrito) => prevCarrito.filter((item) => item.id !== id));
  };

  /**
   * Vacía todos los productos del carrito.
   */
  const handleVaciarCarrito = () => {
    setCarrito([]);
  };

  /**
   * Finaliza la compra (simulada).
   */
  const handleFinalizarCompra = () => {
    alert(
      '¡Muchas gracias por tu pedido en Hermanos Jota!\n\nCoordinaremos la entrega de tus piezas y los detalles de pago a la brevedad.'
    );
    setCarrito([]);
    setCarritoAbierto(false);
  };

  // ── Handlers de Navegación ──────────────────────────────────────────────────

  /**
   * Muestra el detalle de un producto (renderizado condicional).
   */
  const handleVerDetalle = (producto) => {
    setProductoSeleccionado(producto);
    setVistaActual('detalle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Vuelve al catálogo y limpia el producto seleccionado.
   */
  const handleVolverAlCatalogo = () => {
    setProductoSeleccionado(null);
    setVistaActual('catalogo');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Navega a una vista desde el Navbar.
   */
  const handleNavegar = (vista) => {
    setProductoSeleccionado(null);
    setVistaActual(vista);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cantidad total de ítems en el carrito (suma de cantidades)
  const cantidadCarrito = carrito.reduce((total, item) => total + item.cantidad, 0);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="app">

      {/* Notificación Toast flotante */}
      {toastMensaje && (
        <div className="toast" role="status" aria-live="polite">
          {toastMensaje}
        </div>
      )}

      {/* Navbar: recibe cantidadCarrito y handler para abrir carrito */}
      <Navbar
        cantidadCarrito={cantidadCarrito}
        vistaActual={vistaActual}
        onNavegar={handleNavegar}
        onAbrirCarrito={() => setCarritoAbierto(true)}
      />

      {/* ── Renderizado condicional de vistas ── */}

      {/* Vista: Catálogo */}
      {vistaActual === 'catalogo' && (
        <>
          <section className="hero">
            <p className="hero__eyebrow">Artesanía · Sustentabilidad · Buenos Aires</p>
            <h1 className="hero__title">Cada pieza cuenta<br />una historia</h1>
            <p className="hero__subtitle">
              Muebles de autor elaborados con madera certificada FSC y acabados
              naturales que envejecen con gracia.
            </p>
          </section>

          <main className="app__main">
            <ProductList
              onVerDetalle={handleVerDetalle}
              onAgregarAlCarrito={handleAgregarAlCarrito}
            />
          </main>
        </>
      )}

      {/* Vista: Detalle de producto */}
      {vistaActual === 'detalle' && productoSeleccionado && (
        <main className="detalle-wrapper">
          <ProductDetail
            producto={productoSeleccionado}
            onVolver={handleVolverAlCatalogo}
            onAgregarAlCarrito={handleAgregarAlCarrito}
            onAbrirCarrito={() => setCarritoAbierto(true)}
          />
        </main>
      )}

      {/* Vista: Formulario de contacto */}
      {vistaActual === 'contacto' && (
        <main className="contacto-wrapper">
          <h2>Contacto con el Taller</h2>
          <p>Escribinos y coordinamos una visita al showroom o cotización personalizada.</p>
          <ContactForm />
        </main>
      )}

      {/* Panel lateral del Carrito */}
      <CartDrawer
        abierto={carritoAbierto}
        onCerrar={() => setCarritoAbierto(false)}
        items={carrito}
        onModificarCantidad={handleModificarCantidad}
        onEliminarItem={handleEliminarDelCarrito}
        onVaciarCarrito={handleVaciarCarrito}
        onFinalizarCompra={handleFinalizarCompra}
      />

      <Footer />

    </div>
  );
}

export default App;
