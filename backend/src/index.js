// src/index.js
// Entry point del servidor — Hermanos Jota API

require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 3001;

// ── Inicialización del Servidor ─────────────────────────────────────────────────

async function startServer() {
  // 1. Conectar a MongoDB Atlas antes de abrir el puerto
  await connectDB();

  // 2. Levantar el servidor HTTP
  const server = app.listen(PORT, () => {
    console.log(`🪵  Hermanos Jota API corriendo en http://localhost:${PORT}`);
    console.log(`📦  Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log('📦  Endpoints disponibles:');
    console.log('   GET    /api/productos');
    console.log('   GET    /api/productos/:id');
    console.log('   POST   /api/productos');
    console.log('   PUT    /api/productos/:id');
    console.log('   DELETE /api/productos/:id\n');
  });

  // 3. Manejo de cierre elegante (Graceful Shutdown)
  const shutdown = (signal) => {
    console.log(`\n🛑 Recibida señal ${signal}. Cerrando servidor...`);
    server.close(() => {
      console.log('🔒 Servidor HTTP cerrado.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer();
