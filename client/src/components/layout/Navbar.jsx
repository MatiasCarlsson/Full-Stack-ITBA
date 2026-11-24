// components/layout/Navbar.jsx
// Barra de navegación dinámica con React Router, AuthContext, CartContext y menú móvil

import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useOptionalCart } from '../../context/CartContext';
import { useOptionalAuth } from '../../context/AuthContext';
import {
  CartIcon,
  LogOutIcon,
  MenuIcon,
  CloseIcon,
} from '../common/Icons';
import BotonTema from '../common/BotonTema';
import { obtenerIniciales } from '../../utils/format';
import './Navbar.css';

function Navbar({ cantidadCarrito: propCantidad, onAbrirCarrito: propAbrir }) {
  const contextCart = useOptionalCart();
  const auth = useOptionalAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Cierra el menú móvil al cambiar de ruta
  useEffect(() => {
    setMenuAbierto(false);
  }, [location.pathname]);

  const cantidad =
    propCantidad !== undefined
      ? propCantidad
      : contextCart
        ? contextCart.cantidadCarrito
        : 0;

  const handleAbrirCarrito =
    propAbrir || (contextCart ? contextCart.abrirCarrito : () => {});

  const estaAutenticado = Boolean(auth?.estaAutenticado);
  const usuario = auth?.usuario;
  const primerNombre = usuario?.nombre ? usuario.nombre.split(' ')[0] : '';

  const handleLogout = () => {
    if (auth) auth.logout();
    if (contextCart) contextCart.mostrarToast('Sesión cerrada');
    setMenuAbierto(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        {/* Marca */}
        <NavLink
          to="/"
          className="navbar__logo"
          aria-label="Ir a la portada de Hermanos Jota"
        >
          <img src="/logo.svg" alt="" aria-hidden="true" />
          <span className="navbar__brand-name">Hermanos Jota</span>
        </NavLink>

        {/* Navegación principal */}
        <nav
          className={`navbar__nav${menuAbierto ? ' navbar__nav--abierto' : ''}`}
          aria-label="Navegación principal"
        >
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

          {estaAutenticado ? (
            <>
              <NavLink
                to="/mis-pedidos"
                className={({ isActive }) =>
                  `navbar__link${isActive ? ' navbar__link--active' : ''}`
                }
              >
                Mis pedidos
              </NavLink>
              <NavLink
                to="/perfil"
                className={({ isActive }) =>
                  `navbar__user-pill${isActive ? ' navbar__user-pill--active' : ''}`
                }
                aria-label={`Mi perfil (${usuario.nombre})`}
              >
                <span className="navbar__avatar" aria-hidden="true">
                  {obtenerIniciales(usuario.nombre)}
                </span>
                <span className="navbar__user-name">{primerNombre}</span>
              </NavLink>
              <button
                type="button"
                className="navbar__logout"
                onClick={handleLogout}
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
              >
                <LogOutIcon size={16} />
                <span className="navbar__logout-txt">Salir</span>
              </button>
            </>
          ) : (
            <div className="navbar__auth-group">
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `navbar__link${isActive ? ' navbar__link--active' : ''}`
                }
              >
                Ingresar
              </NavLink>
              <NavLink
                to="/registro"
                className={({ isActive }) =>
                  `navbar__cta${isActive ? ' navbar__cta--active' : ''}`
                }
              >
                Crear cuenta
              </NavLink>
            </div>
          )}
        </nav>

        {/* Controles globales */}
        <div className="navbar__controls">
          <BotonTema />

          <button
            type="button"
            className="navbar__carrito"
            onClick={handleAbrirCarrito}
            aria-label={`Ver carrito de compras con ${cantidad} productos`}
          >
            <span className="navbar__carrito-icono" aria-hidden="true">
              <CartIcon size={19} />
            </span>
            <span className="navbar__carrito-txt">Carrito</span>
            {cantidad > 0 ? (
              <span className="navbar__carrito-badge">{cantidad}</span>
            ) : null}
          </button>

          <button
            type="button"
            className="navbar__menu-btn"
            onClick={() => setMenuAbierto((v) => !v)}
            aria-expanded={menuAbierto}
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú de navegación'}
          >
            {menuAbierto ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
