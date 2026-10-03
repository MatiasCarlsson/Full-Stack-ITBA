// components/Navbar.jsx
import { CartIcon } from './Icons';
import './Navbar.css';

/**
 * Navbar — Barra de navegación principal.
 * Recibe:
 *   - cantidadCarrito: número total de ítems en el carrito (via props desde App.js)
 *   - vistaActual: string con la vista activa ('catalogo' | 'contacto')
 *   - onNavegar: callback para cambiar de vista
 *   - onAbrirCarrito: callback para desplegar el drawer del carrito
 */
function Navbar({ cantidadCarrito, vistaActual, onNavegar, onAbrirCarrito }) {
  return (
    <header className="navbar">
      <div className="navbar__inner">

        {/* Logo y nombre de marca */}
        <button
          type="button"
          className="navbar__logo"
          onClick={() => onNavegar('catalogo')}
          aria-label="Ir a la portada del catálogo de Hermanos Jota"
        >
          <img src="/logo.svg" alt="" aria-hidden="true" />
          <span className="navbar__brand-name">Hermanos Jota</span>
        </button>

        {/* Links de navegación */}
        <nav className="navbar__nav" aria-label="Navegación principal">
          <button
            type="button"
            className={`navbar__link ${vistaActual === 'catalogo' ? 'navbar__link--active' : ''}`}
            onClick={() => onNavegar('catalogo')}
          >
            Catálogo
          </button>
          <button
            type="button"
            className={`navbar__link ${vistaActual === 'contacto' ? 'navbar__link--active' : ''}`}
            onClick={() => onNavegar('contacto')}
          >
            Contacto
          </button>
        </nav>

        {/* Botón carrito con badge de cantidad */}
        <button
          type="button"
          className="navbar__carrito"
          onClick={onAbrirCarrito}
          aria-label={`Ver carrito de compras con ${cantidadCarrito} productos`}
        >
          <span className="navbar__carrito-icono" aria-hidden="true">
            <CartIcon size={19} />
          </span>
          <span className="navbar__carrito-txt">Carrito</span>
          {cantidadCarrito > 0 && (
            <span className="navbar__carrito-badge">{cantidadCarrito}</span>
          )}
        </button>

      </div>
    </header>
  );
}

export default Navbar;
