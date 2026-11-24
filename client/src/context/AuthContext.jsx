// context/AuthContext.jsx
// Estado global de autenticación con persistencia JWT y sincronización con el backend

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  leerSesionGuardada,
  guardarSesion,
  limpiarSesion,
  registrarUsuario,
  iniciarSesion,
  obtenerPerfilActual,
  actualizarPerfilActual,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(() => leerSesionGuardada());
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(() => Boolean(leerSesionGuardada().token));

  // Al iniciar la app, si hay un JWT guardado, valida la sesión contra /api/auth/perfil
  useEffect(() => {
    if (!sesion.token) {
      setCargandoSesion(false);
      return;
    }

    const controller = new AbortController();
    let activo = true;

    obtenerPerfilActual(sesion.token, controller.signal)
      .then((data) => {
        if (!activo) return;
        const nuevaSesion = { token: sesion.token, usuario: data.usuario };
        setSesion(nuevaSesion);
        setEstadisticas(data.estadisticas || null);
        guardarSesion(nuevaSesion);
      })
      .catch((err) => {
        if (!activo || err.name === 'AbortError') return;
        // Si el backend rechaza el token (401), cerramos la sesión caducada
        if (err.status === 401) {
          limpiarSesion();
          setSesion({ token: null, usuario: null });
          setEstadisticas(null);
        }
      })
      .finally(() => {
        if (activo) setCargandoSesion(false);
      });

    return () => {
      activo = false;
      controller.abort();
    };
  }, [sesion.token]);

  const registrar = useCallback(async (datos) => {
    const data = await registrarUsuario(datos);
    const nuevaSesion = { token: data.token, usuario: data.usuario };
    guardarSesion(nuevaSesion);
    setSesion(nuevaSesion);
    setEstadisticas({ totalPedidos: 0, ultimoPedido: null });
    return data;
  }, []);

  const login = useCallback(async (credenciales) => {
    const data = await iniciarSesion(credenciales);
    const nuevaSesion = { token: data.token, usuario: data.usuario };
    guardarSesion(nuevaSesion);
    setSesion(nuevaSesion);
    return data;
  }, []);

  const logout = useCallback(() => {
    limpiarSesion();
    setSesion({ token: null, usuario: null });
    setEstadisticas(null);
  }, []);

  const actualizarPerfil = useCallback(
    async (datos) => {
      const data = await actualizarPerfilActual(datos, sesion.token);
      setSesion((prev) => {
        const actualizada = { token: prev.token, usuario: data.usuario };
        guardarSesion(actualizada);
        return actualizada;
      });
      return data;
    },
    [sesion.token]
  );

  const recargarPerfil = useCallback(async () => {
    if (!sesion.token) return null;
    const data = await obtenerPerfilActual(sesion.token);
    const actualizada = { token: sesion.token, usuario: data.usuario };
    guardarSesion(actualizada);
    setSesion(actualizada);
    setEstadisticas(data.estadisticas || null);
    return data;
  }, [sesion.token]);

  const estaAutenticado = Boolean(sesion.token && sesion.usuario);

  const value = useMemo(
    () => ({
      usuario: sesion.usuario,
      token: sesion.token,
      estadisticas,
      cargandoSesion,
      estaAutenticado,
      registrar,
      login,
      logout,
      actualizarPerfil,
      recargarPerfil,
    }),
    [
      sesion.usuario,
      sesion.token,
      estadisticas,
      cargandoSesion,
      estaAutenticado,
      registrar,
      login,
      logout,
      actualizarPerfil,
      recargarPerfil,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider');
  }
  return context;
}

export function useOptionalAuth() {
  return useContext(AuthContext);
}
