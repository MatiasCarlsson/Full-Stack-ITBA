// hooks/useProducts.js
// Custom Hook para obtener la lista de productos con manejo de carga, error y reintentos

import { useState, useEffect, useCallback } from 'react';
import { getProductos } from '../services/productService';

export function useProducts() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const fetchList = useCallback(async (signal) => {
    setCargando(true);
    setError(null);
    try {
      const data = await getProductos(signal);
      setProductos(data);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'No se pudo conectar con el catálogo de productos');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchList(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchList]);

  const recargar = useCallback(() => {
    const controller = new AbortController();
    fetchList(controller.signal);
  }, [fetchList]);

  return { productos, cargando, error, recargar };
}
