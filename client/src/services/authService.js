// services/authService.js
// Gestión de sesión JWT en localStorage y llamadas HTTP de autenticación

import { API_BASE_URL } from '../config/api';

const AUTH_URL = `${API_BASE_URL}/api/auth`;
export const AUTH_STORAGE_KEY = 'hermanos-jota-auth-v1';

/**
 * Lee la sesión persistida (token + usuario) desde localStorage de forma segura.
 */
export function leerSesionGuardada() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { token: null, usuario: null };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.token !== 'string' || !parsed.token) {
      return { token: null, usuario: null };
    }
    return {
      token: parsed.token,
      usuario: parsed.usuario || null,
    };
  } catch {
    return { token: null, usuario: null };
  }
}

export function guardarSesion({ token, usuario }) {
  try {
    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token, usuario })
    );
  } catch {
    // Modo incógnito o cuota llena: la sesión igual continúa viva en memoria
  }
}

export function limpiarSesion() {
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Sin acción si localStorage no está disponible
  }
}

export function cabecerasAuth(tokenExplicit) {
  const token = tokenExplicit || leerSesionGuardada().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parsearErrorAuth(response) {
  const data = await response.json().catch(() => ({}));
  if (response.status === 429) {
    return new Error('Demasiados intentos seguidos. Esperá unos minutos y volvé a probar.');
  }
  if (Array.isArray(data.detalles) && data.detalles.length > 0) {
    return new Error(data.detalles[0]);
  }
  const err = new Error(
    data.mensaje || data.error || `Error de autenticación (${response.status})`
  );
  err.status = response.status;
  return err;
}

export async function registrarUsuario(datos) {
  const response = await fetch(`${AUTH_URL}/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  if (!response.ok) {
    throw await parsearErrorAuth(response);
  }
  return response.json();
}

export async function iniciarSesion(credenciales) {
  const response = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credenciales),
  });
  if (!response.ok) {
    throw await parsearErrorAuth(response);
  }
  return response.json();
}

export async function obtenerPerfilActual(token, signal) {
  const response = await fetch(`${AUTH_URL}/perfil`, {
    headers: cabecerasAuth(token),
    signal,
  });
  if (!response.ok) {
    throw await parsearErrorAuth(response);
  }
  return response.json();
}

export async function actualizarPerfilActual(datos, token) {
  const response = await fetch(`${AUTH_URL}/perfil`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...cabecerasAuth(token),
    },
    body: JSON.stringify(datos),
  });
  if (!response.ok) {
    throw await parsearErrorAuth(response);
  }
  return response.json();
}
