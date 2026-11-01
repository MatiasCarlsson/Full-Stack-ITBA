// components/admin/GuardiaAdmin.jsx
// Envuelve las pantallas de administración y pide la clave antes de mostrarlas.
//
// Esto es comodidad, no seguridad: quien de verdad decide es la API, que responde 401 a
// toda escritura sin la cabecera x-admin-token. Si alguien esquivara esta pantalla, el
// servidor seguiría rechazándolo igual. Lo que evita es que el panel aparente funcionar
// para después fallar en cada botón.

import { useState } from 'react';
import { guardarClaveAdmin, hayClaveAdmin, olvidarClaveAdmin } from '../../services/adminAuth';
import { LockIcon } from '../common/Icons';
import './GuardiaAdmin.css';

function GuardiaAdmin({ children }) {
  const [desbloqueado, setDesbloqueado] = useState(hayClaveAdmin);
  const [clave, setClave] = useState('');
  const [error, setError] = useState(null);

  const entrar = (evento) => {
    evento.preventDefault();

    if (!clave.trim()) {
      setError('Escribí la clave de administración.');
      return;
    }

    guardarClaveAdmin(clave);
    setClave('');
    setError(null);
    setDesbloqueado(true);
  };

  const salir = () => {
    olvidarClaveAdmin();
    setDesbloqueado(false);
  };

  if (!desbloqueado) {
    return (
      <main className="admin-acceso">
        <span className="admin-acceso__icono" aria-hidden="true">
          <LockIcon size={28} />
        </span>
        <h1 className="admin-acceso__titulo">Área de administración</h1>
        <p className="admin-acceso__bajada">
          Ingresá la clave para gestionar el catálogo. Se olvida al cerrar la pestaña.
        </p>

        <form className="admin-acceso__form" onSubmit={entrar}>
          <label className="admin-form__label" htmlFor="clave-admin">
            Clave de administración
          </label>
          <input
            id="clave-admin"
            className={`admin-form__input ${error ? 'admin-form__input--error' : ''}`}
            type="password"
            value={clave}
            onChange={(evento) => {
              setClave(evento.target.value);
              if (error) setError(null);
            }}
            autoComplete="current-password"
            autoFocus
          />
          {error && <span className="admin-form__error-text">{error}</span>}

          <button type="submit" className="admin-form__btn-guardar">
            Entrar
          </button>
        </form>
      </main>
    );
  }

  return (
    <>
      <div className="admin-sesion">
        <button type="button" className="admin-sesion__salir" onClick={salir}>
          Cerrar sesión de admin
        </button>
      </div>
      {children}
    </>
  );
}

export default GuardiaAdmin;
