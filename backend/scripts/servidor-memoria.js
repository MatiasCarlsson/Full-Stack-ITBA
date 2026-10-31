// scripts/servidor-memoria.js
// Levanta la API real sobre una MongoDB en memoria, ya sembrada con el catálogo.
// Sirve para que cualquiera del equipo corra el proyecto sin credenciales de Atlas.
// Los datos viven mientras el proceso esté vivo: al cortarlo se pierde todo.
// Uso: pnpm run dev:memoria

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Valores de desarrollo. Se definen antes de requerir la app, porque la capa de seguridad
// lee las variables de entorno al cargarse.
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-local';

const app = require('../src/app');
const Producto = require('../src/models/Producto');
const semilla = require('./catalogo-semilla');

const PORT = process.env.PORT || 3001;

async function iniciar() {
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await Producto.insertMany(semilla);

  console.log(`🌱 MongoDB en memoria lista con ${semilla.length} piezas.`);
  console.log(`🔑 Clave de administración: ${process.env.ADMIN_TOKEN}`);

  const servidor = app.listen(PORT, () => {
    console.log(`🪵  API de Hermanos Jota en http://localhost:${PORT}`);
    console.log('⚠️  Los cambios se pierden al frenar el proceso.\n');
  });

  const apagar = async () => {
    servidor.close();
    await mongoose.disconnect();
    await mongo.stop();
    process.exit(0);
  };

  process.on('SIGINT', apagar);
  process.on('SIGTERM', apagar);
}

iniciar().catch((error) => {
  console.error('❌ No se pudo iniciar el servidor en memoria:', error.message);
  process.exit(1);
});
