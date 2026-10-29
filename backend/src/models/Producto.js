// src/models/Producto.js
// Modelo Mongoose para los productos de Hermanos Jota

const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema(
  {
    // Campos requeridos por la consigna Sprint 5-6
    nombre:      { type: String,   required: [true, 'El nombre es obligatorio'], trim: true },
    descripcion: { type: String,   default: '' },
    precio:      { type: Number,   required: [true, 'El precio es obligatorio'], min: [0, 'El precio no puede ser negativo'] },
    stock:       { type: Number,   default: 0, min: [0, 'El stock no puede ser negativo'] },
    imagenUrl:   { type: String,   default: '' },

    // Campos extendidos del Sprint 3-4 (mantener compatibilidad con frontend)
    categoria:   { type: String,   default: '' },
    materiales:  { type: [String], default: [] },
    dimensiones: { type: String,   default: '' },
    destacado:   { type: Boolean,  default: false },
  },
  {
    timestamps: true,   // agrega createdAt y updatedAt automáticamente
    versionKey: false,  // elimina el campo __v de los documentos
  }
);

module.exports = mongoose.model('Producto', productoSchema);
