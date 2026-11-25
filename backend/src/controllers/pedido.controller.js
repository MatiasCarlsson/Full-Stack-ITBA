// src/controllers/pedido.controller.js
// Controladores de creación y consulta de pedidos autenticados

const crypto = require('node:crypto');
const mongoose = require('mongoose');
const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');

function generarNumeroOrden() {
  const anio = new Date().getFullYear();
  const sufijo = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `HJ-${anio}-${sufijo}`;
}

/**
 * Crea un pedido asociado al usuario autenticado validando precios y stock en el servidor.
 * POST /api/pedidos
 */
async function crearPedido(req, res, next) {
  try {
    const { items, direccionEntrega = '', notasEntrega = '' } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Carrito vacío',
        mensaje: 'Agregá al menos una pieza antes de confirmar el pedido.',
      });
    }

    // Agrupa ítems repetidos y valida formato de IDs y cantidades antes de ir a MongoDB
    const cantidadesPorId = new Map();
    for (const item of items) {
      const productoId = String(item.productoId || item._id || item.id || '').trim();
      const cantidad = Number(item.cantidad);

      if (!mongoose.Types.ObjectId.isValid(productoId)) {
        return res.status(400).json({
          error: 'Producto inválido',
          mensaje: 'Uno de los productos del carrito no tiene un identificador válido.',
        });
      }

      if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 50) {
        return res.status(400).json({
          error: 'Cantidad inválida',
          mensaje: 'Cada producto debe tener una cantidad entera entre 1 y 50 unidades.',
        });
      }

      cantidadesPorId.set(productoId, (cantidadesPorId.get(productoId) || 0) + cantidad);
    }

    const ids = Array.from(cantidadesPorId.keys());
    const productosEnDb = await Producto.find({ _id: { $in: ids } });

    if (productosEnDb.length !== ids.length) {
      return res.status(404).json({
        error: 'Producto no disponible',
        mensaje: 'Una o más piezas de tu carrito ya no se encuentran en el catálogo.',
      });
    }

    const mapaProductos = new Map(productosEnDb.map((p) => [p._id.toString(), p]));
    const itemsConfirmados = [];
    const operacionesStock = [];
    let total = 0;

    for (const [id, cantidad] of cantidadesPorId.entries()) {
      const producto = mapaProductos.get(id);

      if (typeof producto.stock === 'number' && producto.stock < cantidad) {
        return res.status(400).json({
          error: 'Stock insuficiente',
          mensaje:
            producto.stock === 0
              ? `"${producto.nombre}" se quedó sin stock disponible.`
              : `Solo quedan ${producto.stock} unidades de "${producto.nombre}".`,
        });
      }

      // El precio siempre se toma de la base de datos, nunca del cliente
      const precioUnitario = producto.precio;
      const subtotal = precioUnitario * cantidad;
      total += subtotal;

      itemsConfirmados.push({
        producto: producto._id,
        nombre: producto.nombre,
        precioUnitario,
        cantidad,
        subtotal,
        imagenUrl: producto.imagenUrl || '',
      });

      if (typeof producto.stock === 'number') {
        operacionesStock.push({
          updateOne: {
            filter: { _id: producto._id, stock: { $gte: cantidad } },
            update: { $inc: { stock: -cantidad } },
          },
        });
      }
    }

    // Descuenta stock de manera condicional para evitar condiciones de carrera básicas
    if (operacionesStock.length > 0) {
      const resultadoStock = await Producto.bulkWrite(operacionesStock);
      if (resultadoStock.modifiedCount !== operacionesStock.length) {
        return res.status(409).json({
          error: 'Conflicto de stock',
          mensaje: 'El stock de alguna pieza cambió mientras confirmabas. Revisá tu carrito.',
        });
      }
    }

    const direccionFinal = String(direccionEntrega || req.usuario.direccion || '').trim();

    const pedido = await Pedido.create({
      numeroOrden: generarNumeroOrden(),
      usuario: req.usuario._id,
      items: itemsConfirmados,
      total,
      estado: 'confirmado',
      direccionEntrega: direccionFinal,
      notasEntrega: String(notasEntrega || '').trim(),
    });

    return res.status(201).json({
      mensaje: `Pedido ${pedido.numeroOrden} confirmado con éxito.`,
      pedido,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Lista todos los pedidos del usuario autenticado ordenados del más reciente al más antiguo.
 * GET /api/pedidos/mis-pedidos (y GET /api/pedidos)
 */
async function obtenerMisPedidos(req, res, next) {
  try {
    const pedidos = await Pedido.find({ usuario: req.usuario._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      pedidos,
      total: pedidos.length,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Devuelve un pedido puntual verificando que pertenezca al usuario autenticado.
 * GET /api/pedidos/:id
 */
async function obtenerPedidoPorId(req, res, next) {
  try {
    const { id } = req.params;
    const pedido = await Pedido.findById(id).lean();

    if (!pedido) {
      return res.status(404).json({
        error: 'Pedido no encontrado',
        mensaje: `No existe un pedido con el ID ${id}.`,
      });
    }

    if (pedido.usuario.toString() !== req.usuario._id.toString()) {
      return res.status(403).json({
        error: 'Acceso denegado',
        mensaje: 'No tenés permiso para consultar este pedido.',
      });
    }

    return res.json({ pedido });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  crearPedido,
  obtenerMisPedidos,
  obtenerPedidoPorId,
};
