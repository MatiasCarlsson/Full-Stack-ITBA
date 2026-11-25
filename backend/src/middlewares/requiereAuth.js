// src/middlewares/requiereAuth.js
// Middleware de autenticación mediante JSON Web Token (Bearer JWT)

const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const DEV_FALLBACK_SECRET = 'hermanos-jota-desarrollo-jwt-secreto-local';
let avisoEmitido = false;

/**
 * Obtiene el secreto JWT desde las variables de entorno.
 * En producción falla explícitamente si no está configurado; en desarrollo usa un fallback local.
 */
function obtenerJwtSecret() {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.trim().length > 0) {
    return process.env.JWT_SECRET.trim();
  }

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!avisoEmitido) {
    avisoEmitido = true;
    console.warn(
      '⚠️  [auth] JWT_SECRET no está definida: usando clave temporal de desarrollo local.'
    );
  }
  return DEV_FALLBACK_SECRET;
}

/**
 * Genera un JWT firmado para un usuario dado.
 */
function firmarToken(usuario) {
  const secret = obtenerJwtSecret();
  if (!secret) {
    const err = new Error('El servidor no tiene definida la variable JWT_SECRET.');
    err.statusCode = 500;
    throw err;
  }

  return jwt.sign(
    {
      sub: usuario._id.toString(),
      email: usuario.email,
      rol: usuario.rol,
    },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
}

/**
 * Protege rutas que requieren un usuario autenticado.
 * Valida la cabecera Authorization: Bearer <token> y carga el usuario en req.usuario.
 */
async function requiereAuth(req, res, next) {
  try {
    const secret = obtenerJwtSecret();
    if (!secret) {
      return res.status(500).json({
        error: 'Configuración incompleta',
        mensaje: 'El servidor no tiene definida la variable JWT_SECRET.',
      });
    }

    const authHeader = req.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No autenticado',
        mensaje: 'Iniciá sesión para acceder a esta sección.',
      });
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return res.status(401).json({
        error: 'Token faltante',
        mensaje: 'Iniciá sesión para continuar.',
      });
    }

    const payload = jwt.verify(token, secret);
    const usuario = await Usuario.findById(payload.sub);

    if (!usuario) {
      return res.status(401).json({
        error: 'Sesión inválida',
        mensaje: 'El usuario asociado a esta sesión ya no existe.',
      });
    }

    req.usuario = usuario;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Sesión vencida',
        mensaje: 'Tu sesión expiró. Volvé a iniciar sesión para continuar.',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido',
        mensaje: 'Las credenciales de sesión no son válidas. Volvé a ingresar.',
      });
    }
    return next(error);
  }
}

module.exports = {
  requiereAuth,
  firmarToken,
  obtenerJwtSecret,
};
