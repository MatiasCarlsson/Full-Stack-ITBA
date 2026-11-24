// pages/PerfilPage.jsx
// Ruta protegida /perfil — gestión de datos personales y accesos rápidos del cliente

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOptionalCart } from '../context/CartContext';
import {
  PackageIcon,
  LogOutIcon,
  CheckIcon,
  AlertIcon,
  CalendarIcon,
} from '../components/common/Icons';
import { formatearFecha, obtenerIniciales } from '../utils/format';
import './CuentaPages.css';

export default function PerfilPage() {
  const { usuario, estadisticas, actualizarPerfil, logout } = useAuth();
  const cart = useOptionalCart();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState(usuario?.nombre || '');
  const [telefono, setTelefono] = useState(usuario?.telefono || '');
  const [direccion, setDireccion] = useState(usuario?.direccion || '');
  const [guardando, setGuardando] = useState(false);
  const [estado, setEstado] = useState({ tipo: '', mensaje: '' });

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre || '');
      setTelefono(usuario.telefono || '');
      setDireccion(usuario.direccion || '');
    }
  }, [usuario]);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setEstado({ tipo: '', mensaje: '' });

    if (nombre.trim().length < 2) {
      setEstado({ tipo: 'error', mensaje: 'El nombre debe tener al menos 2 caracteres.' });
      return;
    }

    setGuardando(true);
    try {
      await actualizarPerfil({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        direccion: direccion.trim(),
      });
      setEstado({ tipo: 'exito', mensaje: 'Cambios guardados en tu perfil.' });
      if (cart) cart.mostrarToast('Perfil actualizado');
    } catch (err) {
      setEstado({
        tipo: 'error',
        mensaje: err.message || 'No se pudieron guardar los cambios.',
      });
    } finally {
      setGuardando(false);
    }
  };

  const handleCerrarSesion = () => {
    logout();
    if (cart) cart.mostrarToast('Cerraste sesión correctamente');
    navigate('/');
  };

  if (!usuario) return null;

  const iniciales = obtenerIniciales(usuario.nombre);
  const totalPedidos = estadisticas?.totalPedidos ?? 0;

  return (
    <main className="cuenta-page">
      <div className="perfil-container">
        <header className="perfil-header">
          <div className="perfil-identidad">
            <div className="perfil-avatar" aria-hidden="true">
              {iniciales}
            </div>
            <div>
              <h1 className="perfil-nombre">{usuario.nombre}</h1>
              <p className="perfil-email">{usuario.email}</p>
              {usuario.createdAt ? (
                <p className="perfil-fecha">
                  <CalendarIcon size={14} /> Cliente desde {formatearFecha(usuario.createdAt)}
                </p>
              ) : null}
            </div>
          </div>

          <div className="perfil-header__acciones">
            <Link to="/mis-pedidos" className="cuenta-btn cuenta-btn--secundario">
              <PackageIcon size={17} /> Mis pedidos
            </Link>
            <button
              type="button"
              className="cuenta-btn cuenta-btn--fantasma"
              onClick={handleCerrarSesion}
            >
              <LogOutIcon size={17} /> Cerrar sesión
            </button>
          </div>
        </header>

        <div className="perfil-grid">
          {/* Datos personales editables */}
          <section className="perfil-card" aria-labelledby="perfil-datos-titulo">
            <h2 id="perfil-datos-titulo" className="perfil-card__title">
              Datos de contacto y entrega
            </h2>
            <p className="perfil-card__desc">
              Usamos estos datos para precompletar tus pedidos y coordinar la entrega con el taller.
            </p>

            {estado.mensaje ? (
              <div
                className={`cuenta-alerta cuenta-alerta--${estado.tipo}`}
                role={estado.tipo === 'error' ? 'alert' : 'status'}
              >
                {estado.tipo === 'exito' ? <CheckIcon size={18} /> : <AlertIcon size={18} />}
                <span>{estado.mensaje}</span>
              </div>
            ) : null}

            <form className="cuenta-form" onSubmit={handleGuardar} noValidate>
              <div className="cuenta-campo">
                <label className="cuenta-campo__label" htmlFor="perfil-nombre">
                  Nombre completo
                </label>
                <input
                  id="perfil-nombre"
                  type="text"
                  className="cuenta-campo__input"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>

              <div className="cuenta-campo">
                <label className="cuenta-campo__label" htmlFor="perfil-email">
                  Correo electrónico
                </label>
                <input
                  id="perfil-email"
                  type="email"
                  className="cuenta-campo__input cuenta-campo__input--readonly"
                  value={usuario.email}
                  readOnly
                  disabled
                />
              </div>

              <div className="cuenta-campo">
                <label className="cuenta-campo__label" htmlFor="perfil-telefono">
                  Teléfono de contacto
                </label>
                <input
                  id="perfil-telefono"
                  type="tel"
                  className="cuenta-campo__input"
                  placeholder="+54 11 4567-8900"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                />
              </div>

              <div className="cuenta-campo">
                <label className="cuenta-campo__label" htmlFor="perfil-direccion">
                  Dirección habitual de entrega
                </label>
                <input
                  id="perfil-direccion"
                  type="text"
                  className="cuenta-campo__input"
                  placeholder="Calle, número, piso y localidad"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="cuenta-btn cuenta-btn--primario"
                disabled={guardando}
              >
                {guardando ? 'Guardando cambios…' : 'Guardar cambios'}
              </button>
            </form>
          </section>

          {/* Resumen de actividad */}
          <aside className="perfil-aside">
            <div className="perfil-card">
              <h2 className="perfil-card__title">Actividad en el taller</h2>
              <div className="perfil-metric">
                <span className="perfil-metric__num">{totalPedidos}</span>
                <span className="perfil-metric__label">
                  {totalPedidos === 1 ? 'Pedido registrado' : 'Pedidos registrados'}
                </span>
              </div>
              <p className="perfil-card__desc">
                {totalPedidos > 0
                  ? 'Consultá el detalle de cada pieza y el estado de coordinación.'
                  : 'Cuando confirmes una compra desde el carrito, aparecerá en tu historial.'}
              </p>
              <Link
                to={totalPedidos > 0 ? '/mis-pedidos' : '/productos'}
                className="cuenta-btn cuenta-btn--secundario cuenta-btn--full"
              >
                {totalPedidos > 0 ? 'Ver mis pedidos' : 'Explorar catálogo'}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
