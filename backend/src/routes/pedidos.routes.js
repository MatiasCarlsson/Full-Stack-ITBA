// src/routes/pedidos.routes.js
// Rutas protegidas para la creación y consulta de pedidos de clientes

const express = require('express');
const router = express.Router();
const { requiereAuth } = require('../middlewares/requiereAuth');
const { limiteEscritura } = require('../middlewares/seguridad');
const {
  crearPedido,
  obtenerMisPedidos,
  obtenerPedidoPorId,
} = require('../controllers/pedido.controller');

router.get('/mis-pedidos', requiereAuth, obtenerMisPedidos);

router.route('/')
  .get(requiereAuth, obtenerMisPedidos)
  .post(limiteEscritura, requiereAuth, crearPedido);

router.get('/:id', requiereAuth, obtenerPedidoPorId);

module.exports = router;
