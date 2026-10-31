// scripts/sembrar.js
// Carga el catálogo completo en la base que indique MONGODB_URI.
// Vacía la colección de productos y vuelve a insertar las 11 piezas de la semilla.
// Uso: pnpm run seed

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db');
const Producto = require('../src/models/Producto');
const semilla = require('./catalogo-semilla');

async function sembrar() {
  await connectDB();

  const { deletedCount } = await Producto.deleteMany({});
  const insertados = await Producto.insertMany(semilla);

  console.log(`🧹 Se borraron ${deletedCount} productos que había.`);
  console.log(`🌱 Se insertaron ${insertados.length} piezas del catálogo.`);

  await mongoose.disconnect();
}

sembrar().catch((error) => {
  console.error('❌ No se pudo sembrar la base:', error.message);
  process.exit(1);
});
