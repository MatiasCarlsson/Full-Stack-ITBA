// hooks/useProduct.js
// Custom Hook para obtener el detalle de un producto individual por ID

import { useState, useEffect } from 'react';
import { getProductoById } from '../services/productService';

export function useProduct(id) {
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();
    setCargando(true);
    setError(null);

    getProductoById(id, controller.signal)
      .then((data) => {
        setProducto(data);
        setCargando(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message || 'No se pudo cargar el producto');
        setCargando(false);
      });

    return () => {
      controller.abort();
    };
  }, [id]);

  return { producto, cargando, error };
}
