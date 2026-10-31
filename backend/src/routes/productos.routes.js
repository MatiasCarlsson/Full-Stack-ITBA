// src/routes/productos.routes.js
// Rutas semánticas para el recurso de productos

const express = require('express');
const router = express.Router();
const requiereAdmin = require('../middlewares/requiereAdmin');
const { limiteEscritura } = require('../middlewares/seguridad');
const {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} = require('../controllers/producto.controller');

// Leer el catálogo es público. Modificarlo exige la clave de administración y tiene un
// techo de intentos propio, para que nadie pueda probar claves a repetición.
const soloAdmin = [limiteEscritura, requiereAdmin];

// GET /api/productos y POST /api/productos
router.route('/')
  .get(obtenerProductos)
  .post(soloAdmin, crearProducto);

// GET, PUT y DELETE /api/productos/:id
router.route('/:id')
  .get(obtenerProductoPorId)
  .put(soloAdmin, actualizarProducto)
  .delete(soloAdmin, eliminarProducto);

module.exports = router;
