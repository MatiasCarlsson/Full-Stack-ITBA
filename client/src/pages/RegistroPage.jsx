// pages/RegistroPage.jsx
// Registro de clientes con validación controlada e indicador de fortaleza de contraseña

import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOptionalCart } from '../context/CartContext';
import { EyeIcon, EyeOffIcon, AlertIcon } from '../components/common/Icons';
import './CuentaPages.css';

function evaluarFortaleza(password) {
  if (!password) return { nivel: 0, etiqueta: '' };
  let puntos = 0;
  if (password.length >= 6) puntos += 1;
  if (password.length >= 10) puntos += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) puntos += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) puntos += 1;

  if (puntos <= 1) return { nivel: 1, etiqueta: 'Débil', clase: 'debil' };
  if (puntos <= 2) return { nivel: 2, etiqueta: 'Aceptable', clase: 'media' };
  return { nivel: 3, etiqueta: 'Sólida', clase: 'fuerte' };
}

export default function RegistroPage() {
  const { registrar, estaAutenticado } = useAuth();
  const cart = useOptionalCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmarPassword: '',
    direccion: '',
  });
  const [mostrarClave, setMostrarClave] = useState(false);
  const [erroresCampo, setErroresCampo] = useState({});
  const [errorApi, setErrorApi] = useState('');
  const [enviando, setEnviando] = useState(false);

  const origen = location.state?.from?.pathname || '/perfil';
  const vieneDeCheckout = Boolean(location.state?.abrirCarrito);

  useEffect(() => {
    if (estaAutenticado) {
      navigate(vieneDeCheckout ? '/' : origen, { replace: true });
    }
  }, [estaAutenticado, vieneDeCheckout, origen, navigate]);

  const fortaleza = useMemo(() => evaluarFortaleza(form.password), [form.password]);

  const actualizarCampo = (campo) => (e) => {
    const valor = e.target.value;
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (erroresCampo[campo]) {
      setErroresCampo((prev) => ({ ...prev, [campo]: '' }));
    }
    if (errorApi) setErrorApi('');
  };

  const validar = () => {
    const errs = {};
    if (form.nombre.trim().length < 2) {
      errs.nombre = 'Ingresá tu nombre y apellido (mínimo 2 caracteres).';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errs.email = 'Ingresá un correo electrónico válido.';
    }
    if (form.password.length < 6) {
      errs.password = 'Usá al menos 6 caracteres para tu contraseña.';
    }
    if (form.password !== form.confirmarPassword) {
      errs.confirmarPassword = 'Las contraseñas no coinciden.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorApi('');

    const errs = validar();
    setErroresCampo(errs);
    if (Object.keys(errs).length > 0) return;

    setEnviando(true);
    try {
      const data = await registrar({
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        password: form.password,
        direccion: form.direccion.trim(),
      });
      if (cart) {
        cart.mostrarToast(`Bienvenido a Hermanos Jota, ${data.usuario.nombre.split(' ')[0]}`);
        if (vieneDeCheckout) {
          cart.abrirCarrito();
        }
      }
      navigate(vieneDeCheckout ? '/' : origen, { replace: true });
    } catch (err) {
      setErrorApi(err.message || 'No pudimos crear tu cuenta. Intentá nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="cuenta-page">
      <div className="auth-layout">
        <aside className="auth-aside" aria-hidden="true">
          <div className="auth-aside__inner">
            <p className="auth-aside__kicker">Nuevo cliente</p>
            <h2 className="auth-aside__headline">
              Tu espacio para elegir, encargar y conservar muebles de oficio.
            </h2>
            <p className="auth-aside__text">
              Creá tu cuenta en segundos. Tu contraseña viaja cifrada y nunca se
              almacena en texto plano.
            </p>
            <dl className="auth-aside__facts">
              <div>
                <dt>Entrega</dt>
                <dd>Coordinada a medida</dd>
              </div>
              <div>
                <dt>Showroom</dt>
                <dd>San Cristóbal, CABA</dd>
              </div>
            </dl>
          </div>
        </aside>

        <section className="auth-card" aria-labelledby="registro-titulo">
          <header className="auth-card__header">
            <h1 id="registro-titulo" className="auth-card__title">
              Crear cuenta
            </h1>
            <p className="auth-card__subtitle">
              {vieneDeCheckout
                ? 'Registrate para asociar y confirmar el pedido de tu carrito.'
                : 'Registrate para comprar y llevar el historial de tus pedidos.'}
            </p>
          </header>

          {errorApi ? (
            <div className="cuenta-alerta cuenta-alerta--error" role="alert">
              <AlertIcon size={18} />
              <span>{errorApi}</span>
            </div>
          ) : null}

          <form className="cuenta-form" onSubmit={handleSubmit} noValidate>
            <div className="cuenta-campo">
              <label className="cuenta-campo__label" htmlFor="reg-nombre">
                Nombre completo
              </label>
              <input
                id="reg-nombre"
                name="nombre"
                type="text"
                autoComplete="name"
                className={`cuenta-campo__input${erroresCampo.nombre ? ' cuenta-campo__input--error' : ''}`}
                placeholder="Ej. Lucía Fernández"
                value={form.nombre}
                onChange={actualizarCampo('nombre')}
                required
              />
              {erroresCampo.nombre ? (
                <span className="cuenta-campo__error">{erroresCampo.nombre}</span>
              ) : null}
            </div>

            <div className="cuenta-campo">
              <label className="cuenta-campo__label" htmlFor="reg-email">
                Correo electrónico
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                className={`cuenta-campo__input${erroresCampo.email ? ' cuenta-campo__input--error' : ''}`}
                placeholder="nombre@ejemplo.com"
                value={form.email}
                onChange={actualizarCampo('email')}
                required
              />
              {erroresCampo.email ? (
                <span className="cuenta-campo__error">{erroresCampo.email}</span>
              ) : null}
            </div>

            <div className="cuenta-campo">
              <label className="cuenta-campo__label" htmlFor="reg-password">
                Contraseña
              </label>
              <div className="cuenta-campo__password-wrap">
                <input
                  id="reg-password"
                  name="password"
                  type={mostrarClave ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`cuenta-campo__input cuenta-campo__input--con-btn${erroresCampo.password ? ' cuenta-campo__input--error' : ''}`}
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={actualizarCampo('password')}
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
              {fortaleza.nivel > 0 ? (
                <div className="password-meter" aria-live="polite">
                  <div className="password-meter__bars">
                    {[1, 2, 3].map((step) => (
                      <span
                        key={step}
                        className={`password-meter__bar${
                          step <= fortaleza.nivel
                            ? ` password-meter__bar--${fortaleza.clase}`
                            : ''
                        }`}
                      />
                    ))}
                  </div>
                  <span className="password-meter__label">
                    Seguridad: {fortaleza.etiqueta}
                  </span>
                </div>
              ) : null}
              {erroresCampo.password ? (
                <span className="cuenta-campo__error">{erroresCampo.password}</span>
              ) : null}
            </div>

            <div className="cuenta-campo">
              <label className="cuenta-campo__label" htmlFor="reg-confirmar">
                Confirmar contraseña
              </label>
              <input
                id="reg-confirmar"
                name="confirmarPassword"
                type={mostrarClave ? 'text' : 'password'}
                autoComplete="new-password"
                className={`cuenta-campo__input${erroresCampo.confirmarPassword ? ' cuenta-campo__input--error' : ''}`}
                placeholder="Repetí tu contraseña"
                value={form.confirmarPassword}
                onChange={actualizarCampo('confirmarPassword')}
                required
              />
              {erroresCampo.confirmarPassword ? (
                <span className="cuenta-campo__error">
                  {erroresCampo.confirmarPassword}
                </span>
              ) : null}
            </div>

            <div className="cuenta-campo">
              <label className="cuenta-campo__label" htmlFor="reg-direccion">
                Dirección de entrega <span className="cuenta-campo__opcional">(opcional)</span>
              </label>
              <input
                id="reg-direccion"
                name="direccion"
                type="text"
                autoComplete="street-address"
                className="cuenta-campo__input"
                placeholder="Calle, altura y localidad"
                value={form.direccion}
                onChange={actualizarCampo('direccion')}
              />
            </div>

            <button
              type="submit"
              className="cuenta-btn cuenta-btn--primario"
              disabled={enviando}
            >
              {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>

          <footer className="auth-card__footer">
            <p>
              ¿Ya tenés cuenta?{' '}
              <Link
                to="/login"
                state={location.state}
                className="auth-card__link"
              >
                Iniciar sesión
              </Link>
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
}
