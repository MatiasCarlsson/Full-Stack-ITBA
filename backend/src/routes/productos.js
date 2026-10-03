// src/routes/productos.js
// Router de Express para los endpoints de productos

const express = require("express");
const router = express.Router();
const productos = require("../data/productos");

// GET /api/productos — Devuelve el listado completo de productos en JSON
router.get("/", (req, res) => {
  res.json(productos);
});

// GET /api/productos/:id — Devuelve un producto por su ID
// Responde con 404 si el producto no existe
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const producto = productos.find((p) => p.id === id);

  if (!producto) {
    return res.status(404).json({
      error: "Producto no encontrado",
      mensaje: `No existe un producto con el ID ${id}`,
    });
  }

  res.json(producto);
});

module.exports = router;
