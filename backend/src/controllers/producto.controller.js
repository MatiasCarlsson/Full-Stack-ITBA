// src/controllers/producto.controller.js
// Controlador para operaciones CRUD del recurso Producto

const Producto = require('../models/Producto');

/**
 * Obtiene el listado completo de productos desde MongoDB Atlas.
 * GET /api/productos
 */
async function obtenerProductos(req, res, next) {
  try {
    const productos = await Producto.find().sort({ createdAt: -1 });
    res.json(productos);
  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene un producto por su identificador único (_id).
 * GET /api/productos/:id
 */
async function obtenerProductoPorId(req, res, next) {
  try {
    const { id } = req.params;
    const producto = await Producto.findById(id);

    if (!producto) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        mensaje: `No existe un producto con el ID ${id}`,
      });
    }

    res.json(producto);
  } catch (error) {
    next(error);
  }
}

/**
 * Crea un nuevo producto en la base de datos.
 * POST /api/productos
 */
async function crearProducto(req, res, next) {
  try {
    const nuevoProducto = new Producto(req.body);
    const productoGuardado = await nuevoProducto.save();
    res.status(201).json(productoGuardado);
  } catch (error) {
    next(error);
  }
}

/**
 * Actualiza los datos de un producto existente.
 * PUT /api/productos/:id
 */
async function actualizarProducto(req, res, next) {
  try {
    const { id } = req.params;
    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,           // Retorna el documento actualizado
        runValidators: true, // Aplica las validaciones del esquema
      }
    );

    if (!productoActualizado) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        mensaje: `No existe un producto con el ID ${id}`,
      });
    }

    res.json(productoActualizado);
  } catch (error) {
    next(error);
  }
}

/**
 * Elimina un producto por su identificador único (_id).
 * DELETE /api/productos/:id
 */
async function eliminarProducto(req, res, next) {
  try {
    const { id } = req.params;
    const productoEliminado = await Producto.findByIdAndDelete(id);

    if (!productoEliminado) {
      return res.status(404).json({
        error: 'Producto no encontrado',
        mensaje: `No existe un producto con el ID ${id}`,
      });
    }

    res.json({
      mensaje: `Producto "${productoEliminado.nombre}" eliminado correctamente`,
      id: productoEliminado._id,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};
