// services/productService.js
// Capa de abstracción para todas las interacciones HTTP con la API de productos

import { API_BASE_URL } from '../config/api';
import { cabecerasAdmin } from './adminAuth';

const BASE_URL = `${API_BASE_URL}/api/productos`;

// Crear, editar y borrar exigen la clave de administración: la API responde 401 sin ella.
const CABECERAS_ESCRITURA = () => ({ 'Content-Type': 'application/json', ...cabecerasAdmin() });

/**
 * Traduce una respuesta con error a un mensaje que se pueda mostrar tal cual.
 * @param {Response} response
 * @returns {Promise<Error>}
 */
async function errorDeRespuesta(response) {
  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    return new Error('La clave de administración es incorrecta o venció. Volvé a ingresarla.');
  }

  if (response.status === 429) {
    return new Error('Demasiados intentos seguidos. Esperá unos minutos y volvé a probar.');
  }

  // El backend manda "detalles" como arreglo cuando falla la validación del esquema.
  if (Array.isArray(data.detalles) && data.detalles.length > 0) {
    return new Error(data.detalles.join(' '));
  }

  return new Error(data.mensaje || data.detalle || data.error || `Error ${response.status}`);
}

/**
 * Obtiene la lista completa de productos desde el backend.
 * @param {AbortSignal} [signal] - Señal opcional para abortar la petición.
 * @returns {Promise<Array>} Lista de productos.
 */
export async function getProductos(signal) {
  const response = await fetch(BASE_URL, { signal });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${response.statusText || errorText.slice(0, 100)}`);
  }
  return response.json();
}

/**
 * Obtiene un producto por su ID de MongoDB.
 * @param {string} id - ID del producto.
 * @param {AbortSignal} [signal] - Señal opcional para abortar la petición.
 * @returns {Promise<Object>} Datos del producto.
 */
export async function getProductoById(id, signal) {
  const response = await fetch(`${BASE_URL}/${id}`, { signal });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${response.statusText || errorText.slice(0, 100)}`);
  }
  return response.json();
}

/**
 * Crea un nuevo producto (POST).
 * @param {Object} productoData - Datos del formulario.
 * @returns {Promise<Object>} Producto creado con su _id.
 */
export async function createProducto(productoData) {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: CABECERAS_ESCRITURA(),
    body: JSON.stringify(productoData),
  });

  if (!response.ok) {
    throw await errorDeRespuesta(response);
  }

  return response.json();
}

/**
 * Actualiza un producto existente (PUT).
 * @param {string} id - ID del producto a modificar.
 * @param {Object} productoData - Atributos a actualizar.
 * @returns {Promise<Object>} Producto actualizado.
 */
export async function updateProducto(id, productoData) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: CABECERAS_ESCRITURA(),
    body: JSON.stringify(productoData),
  });

  if (!response.ok) {
    throw await errorDeRespuesta(response);
  }

  return response.json();
}

/**
 * Elimina un producto por ID (DELETE).
 * @param {string} id - ID del producto a eliminar.
 * @returns {Promise<Object>} Confirmación de eliminación.
 */
export async function deleteProducto(id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: cabecerasAdmin(),
  });

  if (!response.ok) {
    throw await errorDeRespuesta(response);
  }

  return response.json();
}
