// src/config/db.js
// Configuración y conexión asíncrona a MongoDB Atlas usando Mongoose

const mongoose = require('mongoose');

/**
 * Establece la conexión con la base de datos MongoDB Atlas.
 * Lee la URI desde process.env.MONGODB_URI.
 * @returns {Promise<typeof mongoose>}
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('Error: MONGODB_URI no está definida en las variables de entorno (.env)');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`Conectado a MongoDB Atlas — Base de datos: "${conn.connection.name}"`);
    return conn;
  } catch (error) {
    console.error('Error crítico al conectar con MongoDB Atlas:', error.message);
    process.exit(1);
  }
}

// Listeners de eventos de la conexión
mongoose.connection.on('disconnected', () => {
  console.warn('Conexión con MongoDB perdida. Reintentando...');
});

mongoose.connection.on('error', (err) => {
  console.error('Error de conexión en runtime de MongoDB:', err.message);
});

module.exports = { connectDB };
