// src/models/Usuario.js
// Modelo Mongoose para los usuarios registrados de Hermanos Jota

const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [80, 'El nombre no puede superar los 80 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Ingresá un correo electrónico válido'],
    },
    passwordHash: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      select: false, // Nunca se devuelve por defecto en las consultas
    },
    rol: {
      type: String,
      enum: ['cliente', 'admin'],
      default: 'cliente',
    },
    telefono: {
      type: String,
      default: '',
      trim: true,
      maxlength: [30, 'El teléfono no puede superar los 30 caracteres'],
    },
    direccion: {
      type: String,
      default: '',
      trim: true,
      maxlength: [200, 'La dirección no puede superar los 200 caracteres'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * Devuelve una representación segura del usuario sin exponer el hash de contraseña.
 */
usuarioSchema.methods.toPerfilSeguro = function toPerfilSeguro() {
  return {
    id: this._id,
    nombre: this.nombre,
    email: this.email,
    rol: this.rol,
    telefono: this.telefono || '',
    direccion: this.direccion || '',
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Usuario', usuarioSchema);
