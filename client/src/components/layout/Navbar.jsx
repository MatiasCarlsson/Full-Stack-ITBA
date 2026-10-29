// components/layout/Navbar.jsx
// Barra de navegación principal integrada con React Router DOM y CartContext

import { NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { CartIcon } from '../common/Icons';
import './Navbar.css';

/**
 * Navbar — Barra de navegación principal.
 * Lee estado de carrito desde CartContext o mediante props opcionales.
 */
function Navbar({ cantidadCarrito: propCantidad, onAbrirCarrito: propAbrir }) {
  // Soporte dual: lee del context o de props para retrocompatibilidad
  let contextCart = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    contextCart = useCart();
  } catch {
    contextCart = null;
  }

  const cantidad = propCantidad !== undefined
    ? propCantidad
    : contextCart
      ? contextCart.cantidadCarrito
      : 0;

  const handleAbrir = propAbrir || (contextCart ? contextCart.abrirCarrito : () => {});

  return (
    <header className="navbar">
      <div className="navbar__inner">

        {/* Logo y nombre de marca — NavLink a / */}
        <NavLink to="/" className="navbar__logo" aria-label="Ir a la portada de Hermanos Jota">
          <img src="/logo.svg" alt="" aria-hidden="true" />
          <span className="navbar__brand-name">Hermanos Jota</span>
        </NavLink>

        {/* Links de navegación — NavLink aplica clase 'active' automáticamente */}
        <nav className="navbar__nav" aria-label="Navegación principal">
          <NavLink
            to="/productos"
            className={({ isActive }) =>
              `navbar__link${isActive ? ' navbar__link--active' : ''}`
            }
          >
            Catálogo
          </NavLink>
          <NavLink
            to="/contacto"
            className={({ isActive }) =>
              `navbar__link${isActive ? ' navbar__link--active' : ''}`
            }
          >
            Contacto
          </NavLink>
        </nav>

        {/* Botón carrito con badge de cantidad */}
        <button
          type="button"
          className="navbar__carrito"
          onClick={handleAbrir}
          aria-label={`Ver carrito de compras con ${cantidad} productos`}
        >
          <span className="navbar__carrito-icono" aria-hidden="true">
            <CartIcon size={19} />
          </span>
          <span className="navbar__carrito-txt">Carrito</span>
          {cantidad > 0 && (
            <span className="navbar__carrito-badge">{cantidad}</span>
          )}
        </button>

      </div>
    </header>
  );
}

export default Navbar;
