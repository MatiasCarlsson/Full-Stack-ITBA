// components/auth/RutaProtegida.jsx
// Protege rutas privadas (/perfil, /mis-pedidos) redirigiendo a /login si no hay sesión

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RutaProtegida({ children }) {
  const { estaAutenticado, cargandoSesion } = useAuth();
  const location = useLocation();

  if (cargandoSesion) {
    return (
      <main className="app__main">
        <div className="product-list__estado" role="status" aria-live="polite">
          <div className="product-list__spinner" aria-hidden="true" />
          <p className="product-list__cargando-txt">Verificando tu sesión…</p>
        </div>
      </main>
    );
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
