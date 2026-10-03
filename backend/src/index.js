// src/index.js
// Entry point del backend — Hermanos Jota API

const express = require("express");
const path = require("path");
const cors = require("cors");
const logger = require("./middlewares/logger");
const productosRouter = require("./routes/productos");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares globales ──────────────────────────────────────────────────────

// Habilitar CORS para permitir peticiones desde el frontend React (localhost:3000)
app.use(cors());

// Middleware de logging personalizado: registra método + URL de cada request
app.use(logger);

// Parsear el body de las requests como JSON (para futuras peticiones POST)
app.use(express.json());

// Servir imágenes estáticas por si se solicitan directamente al backend
app.use("/imagenes", express.static(path.join(__dirname, "../../client/public/imagenes")));

// ── Rutas ─────────────────────────────────────────────────────────────────────

// Montar el router de productos bajo el prefijo /api/productos
app.use("/api/productos", productosRouter);

// Ruta raíz de bienvenida
app.get("/", (req, res) => {
  res.json({
    mensaje: "API Hermanos Jota — Backend funcionando correctamente",
    version: "1.0.0",
    endpoints: {
      productos: "GET /api/productos",
      productoPorId: "GET /api/productos/:id",
    },
  });
});

// Middleware de manejo de rutas no encontradas (404 genérico)
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    mensaje: `El endpoint ${req.method} ${req.url} no existe`,
  });
});

// ── Arrancar servidor ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🪵 Hermanos Jota API corriendo en http://localhost:${PORT}`);
  console.log(`📦 Endpoints disponibles:`);
  console.log(`   GET  /api/productos`);
  console.log(`   GET  /api/productos/:id\n`);
});
