// scripts/servidor-memoria.js
// Levanta la API real sobre una MongoDB en memoria, ya sembrada con el catálogo.
// Sirve para que cualquiera del equipo corra el proyecto sin credenciales de Atlas.
// Los datos viven mientras el proceso esté vivo: al cortarlo se pierde todo.
// Uso: pnpm run dev:memoria

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Valores de desarrollo. Se definen antes de requerir la app, porque la capa de seguridad
// lee las variables de entorno al cargarse.
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-local';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'jwt-secreto-desarrollo-hermanos-jota';

const app = require('../src/app');
const Producto = require('../src/models/Producto');
const Usuario = require('../src/models/Usuario');
const semilla = require('./catalogo-semilla');

const PORT = process.env.PORT || 3001;

async function iniciar() {
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await Producto.insertMany(semilla);

  // Usuario cliente de prueba listo para explorar /perfil y /mis-pedidos
  const passwordHash = await bcrypt.hash('Taller2026!', 10);
  await Usuario.create({
    nombre: 'Clara Mendoza',
    email: 'cliente@hermanosjota.com.ar',
    passwordHash,
    rol: 'cliente',
    telefono: '+54 11 4567-8900',
    direccion: 'Av. San Juan 2847, CABA',
  });

  console.log(`🌱 MongoDB en memoria lista con ${semilla.length} piezas.`);
  console.log(`🔑 Clave de administración: ${process.env.ADMIN_TOKEN}`);
  console.log('👤 Cliente demo: cliente@hermanosjota.com.ar / Taller2026!');

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
