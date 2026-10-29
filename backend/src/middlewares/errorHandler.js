// src/middlewares/errorHandler.js
// Manejadores centralizados de errores y rutas 404

/**
 * Middleware para rutas no encontradas (404).
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: 'Ruta no encontrada',
    mensaje: `El endpoint ${req.method} ${req.originalUrl} no existe en este servidor`,
  });
}

/**
 * Middleware centralizado para captura y formateo de errores.
 */
function errorHandler(err, req, res, next) {
  // Error de formato en ID de MongoDB (CastError)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'ID de producto inválido',
      mensaje: `El valor "${err.value}" no es un identificador válido de MongoDB`,
    });
  }

  // Error de validación del esquema de Mongoose
  if (err.name === 'ValidationError') {
    const detalles = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: 'Datos inválidos',
      detalles,
      detalle: err.message,
    });
  }

  // Error de duplicado de índice único
  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Recurso duplicado',
      mensaje: 'Ya existe un elemento con los datos provistos',
    });
  }

  // Error interno del servidor por defecto
  const statusCode = err.statusCode || 500;
  console.error(`❌ [Error ${statusCode}] ${req.method} ${req.url}:`, err.message);

  res.status(statusCode).json({
    error: err.name || 'Error del servidor',
    mensaje: err.message || 'Ocurrió un error inesperado al procesar la solicitud',
    detalle: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
