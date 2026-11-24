// src/routes/auth.routes.js
// Rutas de autenticación y perfil de usuario

const express = require('express');
const router = express.Router();
const { requiereAuth } = require('../middlewares/requiereAuth');
const { limiteAuth } = require('../middlewares/seguridad');
const {
  registrar,
  login,
  obtenerPerfil,
  actualizarPerfil,
} = require('../controllers/auth.controller');

router.post('/registro', limiteAuth, registrar);
router.post('/login', limiteAuth, login);
router.get('/perfil', requiereAuth, obtenerPerfil);
router.put('/perfil', requiereAuth, actualizarPerfil);

module.exports = router;
