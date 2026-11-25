// src/models/Pedido.js
// Modelo Mongoose para los pedidos realizados por usuarios autenticados

const mongoose = require('mongoose');

const itemPedidoSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    precioUnitario: {
      type: Number,
      required: true,
      min: 0,
    },
    cantidad: {
      type: Number,
      required: true,
      min: [1, 'La cantidad mínima por ítem es 1'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    imagenUrl: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const pedidoSchema = new mongoose.Schema(
  {
    numeroOrden: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
      index: true,
    },
    items: {
      type: [itemPedidoSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'El pedido debe contener al menos un producto',
      },
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    estado: {
      type: String,
      enum: ['confirmado', 'en_taller', 'enviado', 'entregado', 'cancelado'],
      default: 'confirmado',
    },
    direccionEntrega: {
      type: String,
      default: '',
      trim: true,
      maxlength: [200, 'La dirección de entrega no puede superar los 200 caracteres'],
    },
    notasEntrega: {
      type: String,
      default: '',
      trim: true,
      maxlength: [400, 'Las notas no pueden superar los 400 caracteres'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('Pedido', pedidoSchema);
