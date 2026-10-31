// services/adminAuth.js
// Guarda la clave de administración del lado del navegador y la ofrece al servicio de
// productos, que es quien la manda en la cabecera x-admin-token.
//
// Va en sessionStorage y no en localStorage a propósito: la clave se olvida al cerrar la
// pestaña, así que una computadora compartida no queda con el panel abierto para siempre.
// Nunca viaja en la URL ni queda en el historial.

const CLAVE_SESION = 'hermanos-jota-admin';

// sessionStorage puede tirar una excepción en modo incógnito o con el almacenamiento
// bloqueado. En ese caso la clave vive en memoria y dura lo que dura la pestaña.
let enMemoria = null;

export function obtenerClaveAdmin() {
  if (enMemoria) return enMemoria;
  try {
    return window.sessionStorage.getItem(CLAVE_SESION) || null;
  } catch {
    return null;
  }
}

export function guardarClaveAdmin(clave) {
  const limpia = String(clave || '').trim();
  enMemoria = limpia || null;
  try {
    if (limpia) window.sessionStorage.setItem(CLAVE_SESION, limpia);
    else window.sessionStorage.removeItem(CLAVE_SESION);
  } catch {
    // Queda solo en memoria. El panel sigue funcionando mientras no se recargue.
  }
}

export function olvidarClaveAdmin() {
  guardarClaveAdmin('');
}

export function hayClaveAdmin() {
  return Boolean(obtenerClaveAdmin());
}

/**
 * Cabeceras para las operaciones de escritura.
 * @returns {Record<string,string>}
 */
export function cabecerasAdmin() {
  const clave = obtenerClaveAdmin();
  return clave ? { 'x-admin-token': clave } : {};
}
