// services/orderService.js
// Capa HTTP para la creación y consulta de pedidos de clientes autenticados

import { API_BASE_URL } from '../config/api';
import { cabecerasAuth } from './authService';

const PEDIDOS_URL = `${API_BASE_URL}/api/pedidos`;

async function parsearErrorPedido(response) {
  const data = await response.json().catch(() => ({}));
  const err = new Error(
    data.mensaje || data.error || `No se pudo procesar el pedido (${response.status})`
  );
  err.status = response.status;
  return err;
}

/**
 * Envía un nuevo pedido asociado al usuario del JWT actual.
 * @param {{ items: Array<{productoId: string, cantidad: number}>, direccionEntrega?: string, notasEntrega?: string }} payload
 */
export async function crearPedido(payload, token) {
  const response = await fetch(PEDIDOS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...cabecerasAuth(token),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await parsearErrorPedido(response);
  }

  return response.json();
}

/**
 * Obtiene el historial de pedidos del usuario autenticado.
 */
export async function obtenerMisPedidos(token, signal) {
  const response = await fetch(`${PEDIDOS_URL}/mis-pedidos`, {
    headers: cabecerasAuth(token),
    signal,
  });

  if (!response.ok) {
    throw await parsearErrorPedido(response);
  }

  return response.json();
}
