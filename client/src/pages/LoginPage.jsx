// pages/LoginPage.jsx
// Inicio de sesión de clientes con redirección inteligente tras autenticar

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOptionalCart } from '../context/CartContext';
import { EyeIcon, EyeOffIcon, AlertIcon } from '../components/common/Icons';
import './CuentaPages.css';

export default function LoginPage() {
  const { login, estaAutenticado } = useAuth();
  const cart = useOptionalCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const origen = location.state?.from?.pathname || '/perfil';
  const vieneDeCheckout = Boolean(location.state?.abrirCarrito);

  useEffect(() => {
    if (estaAutenticado) {
      navigate(vieneDeCheckout ? '/' : origen, { replace: true });
      if (vieneDeCheckout && cart) {
        cart.abrirCarrito();
      }
    }
  }, [estaAutenticado, vieneDeCheckout, origen, navigate, cart]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailLimpio = email.trim();
    if (!emailLimpio || !password) {
      setError('Completá tu correo electrónico y tu contraseña para ingresar.');
      return;
    }

    setEnviando(true);
    try {
      const data = await login({ email: emailLimpio, password });
      if (cart) {
        cart.mostrarToast(`¡Hola de nuevo, ${data.usuario.nombre.split(' ')[0]}!`);
        if (vieneDeCheckout) {
          cart.abrirCarrito();
        }
      }
      navigate(vieneDeCheckout ? '/' : origen, { replace: true });
    } catch (err) {
      setError(err.message || 'No pudimos iniciar sesión. Verificá tus credenciales.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="cuenta-page">
      <div className="auth-layout">
        <aside className="auth-aside" aria-hidden="true">
          <div className="auth-aside__inner">
            <p className="auth-aside__kicker">Taller Hermanos Jota</p>
            <h2 className="auth-aside__headline">
              Seguí tus piezas desde la carpintería hasta tu casa.
            </h2>
            <p className="auth-aside__text">
              Con tu cuenta guardás tus datos de entrega, confirmás compras en un paso
              y consultás el historial completo de tus pedidos.
            </p>
            <dl className="auth-aside__facts">
              <div>
                <dt>Garantía</dt>
                <dd>10 años estructural</dd>
              </div>
              <div>
                <dt>Origen</dt>
                <dd>Madera certificada FSC</dd>
              </div>
            </dl>
          </div>
        </aside>

        <section className="auth-card" aria-labelledby="login-titulo">
          <header className="auth-card__header">
            <h1 id="login-titulo" className="auth-card__title">
              Iniciar sesión
            </h1>
            <p className="auth-card__subtitle">
              {vieneDeCheckout
                ? 'Ingresá a tu cuenta para confirmar tu pedido en el carrito.'
                : 'Accedé a tu perfil y al seguimiento de tus pedidos.'}
            </p>
          </header>

          {error ? (
            <div className="cuenta-alerta cuenta-alerta--error" role="alert">
              <AlertIcon size={18} />
              <span>{error}</span>
            </div>
          ) : null}

          <form className="cuenta-form" onSubmit={handleSubmit} noValidate>
            <div className="cuenta-campo">
              <label className="cuenta-campo__label" htmlFor="login-email">
                Correo electrónico
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                className="cuenta-campo__input"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="cuenta-campo">
              <label className="cuenta-campo__label" htmlFor="login-password">
                Contraseña
              </label>
              <div className="cuenta-campo__password-wrap">
                <input
                  id="login-password"
                  name="password"
                  type={mostrarClave ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="cuenta-campo__input cuenta-campo__input--con-btn"
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="cuenta-campo__toggle"
                  onClick={() => setMostrarClave((v) => !v)}
                  aria-label={mostrarClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {mostrarClave ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="cuenta-btn cuenta-btn--primario"
              disabled={enviando}
            >
              {enviando ? 'Ingresando…' : 'Iniciar sesión'}
            </button>
          </form>

          <footer className="auth-card__footer">
            <p>
              ¿Todavía no tenés cuenta?{' '}
              <Link
                to="/registro"
                state={location.state}
                className="auth-card__link"
              >
                Crear una cuenta
              </Link>
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
}
