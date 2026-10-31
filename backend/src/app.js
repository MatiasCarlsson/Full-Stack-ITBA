// src/app.js
// Configuración de la aplicación Express, middlewares globales y enrutamiento

const express = require('express');
const path = require('path');
const logger = require('./middlewares/logger');
const { aplicarSeguridad, sanitizarCuerpo } = require('./middlewares/seguridad');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const productosRouter = require('./routes/productos.routes');

const app = express();

// ── Middlewares Globales ────────────────────────────────────────────────────────

// Cabeceras defensivas, CORS acotado a los orígenes propios y límite de peticiones.
// Reemplaza al cors() abierto: el detalle está en middlewares/seguridad.js
aplicarSeguridad(app);

// Middleware de logging personalizado: registra [timestamp] METHOD URL
app.use(logger);

// Parsear cuerpos JSON, incluyendo imágenes convertidas a Data URL desde el panel admin
app.use(express.json({ limit: '12mb' }));

// Quita del cuerpo las claves que Mongo interpretaría como operadores ($set, $gt, a.b)
app.use(sanitizarCuerpo);

// Servir imágenes estáticas del frontend
app.use('/imagenes', express.static(path.join(__dirname, '../../client/public/imagenes')));

// ── Rutas de la API ─────────────────────────────────────────────────────────────

app.use('/api/productos', productosRouter);

// Ruta raíz informativa de la API
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API Hermanos Jota — Backend en línea',
    version: '2.1.0',
    status: 'operativo',
    database: 'MongoDB Atlas',
    endpoints: {
      'GET    /api/productos':       'Lista todos los productos',
      'GET    /api/productos/:id':   'Devuelve un producto por ID',
      'POST   /api/productos':       'Crea un nuevo producto',
      'PUT    /api/productos/:id':   'Actualiza un producto existente',
      'DELETE /api/productos/:id':   'Elimina un producto',
    },
  });
});

// ── Manejo Centralizado de Errores ──────────────────────────────────────────────

// Captura rutas no registradas (404)
app.use(notFoundHandler);

// Manejador global de errores (CastError, ValidationError, 500)
app.use(errorHandler);

module.exports = app;
