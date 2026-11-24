// src/controllers/auth.controller.js
// Controladores de registro, login y gestión de perfil de usuario

const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');
const Pedido = require('../models/Pedido');
const { firmarToken } = require('../middlewares/requiereAuth');

const SALT_ROUNDS = 10;

/**
 * Registra un nuevo cliente con contraseña hasheada mediante bcrypt y devuelve un JWT.
 * POST /api/auth/registro
 */
async function registrar(req, res, next) {
  try {
    const { nombre, email, password, telefono = '', direccion = '' } = req.body || {};

    const errores = [];
    if (!nombre || String(nombre).trim().length < 2) {
      errores.push('Ingresá tu nombre completo (mínimo 2 caracteres).');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      errores.push('Ingresá un correo electrónico válido.');
    }
    if (!password || String(password).length < 6) {
      errores.push('La contraseña debe tener al menos 6 caracteres.');
    }
    if (password && String(password).length > 128) {
      errores.push('La contraseña no puede superar los 128 caracteres.');
    }

    if (errores.length > 0) {
      return res.status(400).json({
        error: 'Datos de registro inválidos',
        mensaje: errores[0],
        detalles: errores,
      });
    }

    const emailNormalizado = String(email).trim().toLowerCase();
    const existente = await Usuario.findOne({ email: emailNormalizado }).lean();

    if (existente) {
      return res.status(409).json({
        error: 'Correo ya registrado',
        mensaje: 'Ya existe una cuenta registrada con ese correo electrónico.',
      });
    }

    const passwordHash = await bcrypt.hash(String(password), SALT_ROUNDS);

    // Solo se aceptan campos explícitos; el rol siempre arranca como "cliente".
    const usuario = await Usuario.create({
      nombre: String(nombre).trim(),
      email: emailNormalizado,
      passwordHash,
      telefono: String(telefono || '').trim(),
      direccion: String(direccion || '').trim(),
      rol: 'cliente',
    });

    const token = firmarToken(usuario);

    return res.status(201).json({
      mensaje: 'Cuenta creada correctamente.',
      token,
      usuario: usuario.toPerfilSeguro(),
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Valida las credenciales de un usuario y emite un JWT de sesión.
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        error: 'Credenciales incompletas',
        mensaje: 'Ingresá tu correo electrónico y contraseña.',
      });
    }

    const emailNormalizado = String(email).trim().toLowerCase();
    const usuario = await Usuario.findOne({ email: emailNormalizado }).select('+passwordHash');

    // Mensaje uniforme para no revelar si un correo existe o no en la base.
    const mensajeError = 'Correo electrónico o contraseña incorrectos.';

    if (!usuario) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        mensaje: mensajeError,
      });
    }

    const valida = await bcrypt.compare(String(password), usuario.passwordHash);
    if (!valida) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        mensaje: mensajeError,
      });
    }

    const token = firmarToken(usuario);

    return res.json({
      mensaje: 'Sesión iniciada correctamente.',
      token,
      usuario: usuario.toPerfilSeguro(),
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Devuelve el perfil del usuario autenticado junto con métricas básicas de pedidos.
 * GET /api/auth/perfil
 */
async function obtenerPerfil(req, res, next) {
  try {
    const [totalPedidos, ultimoPedido] = await Promise.all([
      Pedido.countDocuments({ usuario: req.usuario._id }),
      Pedido.findOne({ usuario: req.usuario._id })
        .sort({ createdAt: -1 })
        .select('numeroOrden total estado createdAt')
        .lean(),
    ]);

    return res.json({
      usuario: req.usuario.toPerfilSeguro(),
      estadisticas: {
        totalPedidos,
        ultimoPedido: ultimoPedido || null,
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Actualiza los datos editables del perfil del usuario autenticado.
 * PUT /api/auth/perfil
 */
async function actualizarPerfil(req, res, next) {
  try {
    const { nombre, telefono, direccion } = req.body || {};
    const cambios = {};

    if (nombre !== undefined) {
      const limpio = String(nombre).trim();
      if (limpio.length < 2) {
        return res.status(400).json({
          error: 'Nombre inválido',
          mensaje: 'El nombre debe tener al menos 2 caracteres.',
        });
      }
      cambios.nombre = limpio;
    }

    if (telefono !== undefined) {
      cambios.telefono = String(telefono).trim();
    }

    if (direccion !== undefined) {
      cambios.direccion = String(direccion).trim();
    }

    const actualizado = await Usuario.findByIdAndUpdate(
      req.usuario._id,
      { $set: cambios },
      { returnDocument: 'after', runValidators: true }
    );

    return res.json({
      mensaje: 'Perfil actualizado correctamente.',
      usuario: actualizado.toPerfilSeguro(),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  registrar,
  login,
  obtenerPerfil,
  actualizarPerfil,
};
