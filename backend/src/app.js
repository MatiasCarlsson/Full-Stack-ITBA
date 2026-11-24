// src/app.js
// Configuración de la aplicación Express, middlewares globales y enrutamiento

const express = require('express');
const path = require('path');
const logger = require('./middlewares/logger');
const { aplicarSeguridad, sanitizarCuerpo } = require('./middlewares/seguridad');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');
const productosRouter = require('./routes/productos.routes');
const authRouter = require('./routes/auth.routes');
const pedidosRouter = require('./routes/pedidos.routes');

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
app.use('/api/auth', authRouter);
app.use('/api/pedidos', pedidosRouter);

// Ruta raíz informativa de la API
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API Hermanos Jota — Backend en línea',
    version: '3.0.0',
    status: 'operativo',
    database: 'MongoDB Atlas',
    endpoints: {
      'GET    /api/productos':         'Lista todos los productos',
      'GET    /api/productos/:id':     'Devuelve un producto por ID',
      'POST   /api/productos':         'Crea un nuevo producto (admin)',
      'PUT    /api/productos/:id':     'Actualiza un producto existente (admin)',
      'DELETE /api/productos/:id':     'Elimina un producto (admin)',
      'POST   /api/auth/registro':     'Registra un nuevo usuario (bcrypt + JWT)',
      'POST   /api/auth/login':        'Autentica un usuario y devuelve JWT',
      'GET    /api/auth/perfil':       'Obtiene el perfil del usuario autenticado',
      'PUT    /api/auth/perfil':       'Actualiza los datos del perfil autenticado',
      'POST   /api/pedidos':           'Registra un pedido asociado al usuario (JWT)',
      'GET    /api/pedidos/mis-pedidos': 'Lista los pedidos del usuario autenticado',
      'GET    /api/pedidos/:id':       'Obtiene el detalle de un pedido propio',
    },
  });
});

// ── Manejo Centralizado de Errores ──────────────────────────────────────────────

// Captura rutas no registradas (404)
app.use(notFoundHandler);

// Manejador global de errores (CastError, ValidationError, 500)
app.use(errorHandler);

module.exports = app;
