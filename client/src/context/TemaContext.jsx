// context/TemaContext.jsx
// Contexto global del tema claro y oscuro.
// Guarda la elección en localStorage y, si el visitante nunca eligió, respeta la
// preferencia que ya tiene configurada en su sistema operativo.

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const TemaContext = createContext(null);

// La misma clave que usa el script anti-parpadeo de public/index.html. Si se cambia acá,
// hay que cambiarla allá también.
const CLAVE_GUARDADA = 'hermanos-jota-tema';
const CONSULTA_SISTEMA = '(prefers-color-scheme: dark)';

const esTemaValido = (valor) => valor === 'claro' || valor === 'oscuro';

// localStorage puede tirar una excepción en modo incógnito o con las cookies bloqueadas,
// así que cada lectura y cada escritura van protegidas. El sitio tiene que funcionar igual.
function leerGuardado() {
  try {
    const guardado = window.localStorage.getItem(CLAVE_GUARDADA);
    return esTemaValido(guardado) ? guardado : null;
  } catch {
    return null;
  }
}

function guardar(tema) {
  try {
    window.localStorage.setItem(CLAVE_GUARDADA, tema);
  } catch {
    // Sin persistencia el tema dura lo que dura la pestaña. Es degradación aceptable.
  }
}

function preferenciaDelSistema() {
  if (typeof window.matchMedia !== 'function') return 'claro';
  return window.matchMedia(CONSULTA_SISTEMA).matches ? 'oscuro' : 'claro';
}

export function TemaProvider({ children }) {
  // Se calcula una sola vez, en el primer render, para que el atributo del <html> que ya
  // dejó puesto el script anti-parpadeo coincida con el estado de React.
  const [tema, setTema] = useState(() => leerGuardado() || preferenciaDelSistema());
  const [eligioElUsuario, setEligioElUsuario] = useState(() => leerGuardado() !== null);

  // Refleja el tema en el <html>, que es de donde cuelga todo tema-oscuro.css.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema === 'oscuro' ? 'dark' : 'light');
  }, [tema]);

  // Si el visitante nunca eligió, el sitio sigue al sistema aunque lo cambie con la página
  // abierta. En cuanto toca el botón, manda su elección y esto deja de escucharse.
  useEffect(() => {
    if (eligioElUsuario || typeof window.matchMedia !== 'function') return undefined;

    const consulta = window.matchMedia(CONSULTA_SISTEMA);
    const alCambiar = (evento) => setTema(evento.matches ? 'oscuro' : 'claro');

    consulta.addEventListener('change', alCambiar);
    return () => consulta.removeEventListener('change', alCambiar);
  }, [eligioElUsuario]);

  const alternarTema = useCallback(() => {
    setTema((anterior) => {
      const siguiente = anterior === 'oscuro' ? 'claro' : 'oscuro';
      guardar(siguiente);
      return siguiente;
    });
    setEligioElUsuario(true);
  }, []);

  const valor = useMemo(
    () => ({ tema, esOscuro: tema === 'oscuro', alternarTema }),
    [tema, alternarTema]
  );

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

export function useTema() {
  const contexto = useContext(TemaContext);
  if (!contexto) {
    throw new Error('useTema tiene que usarse dentro de un TemaProvider');
  }
  return contexto;
}

export default TemaContext;
