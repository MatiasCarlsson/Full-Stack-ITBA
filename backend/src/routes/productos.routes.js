// src/routes/productos.routes.js
// Rutas semánticas para el recurso de productos

const express = require('express');
const router = express.Router();
const {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} = require('../controllers/producto.controller');

// GET /api/productos y POST /api/productos
router.route('/')
  .get(obtenerProductos)
  .post(crearProducto);

// GET, PUT y DELETE /api/productos/:id
router.route('/:id')
  .get(obtenerProductoPorId)
  .put(actualizarProducto)
  .delete(eliminarProducto);

module.exports = router;
