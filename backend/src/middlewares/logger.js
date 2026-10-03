// src/middlewares/logger.js
// Middleware global de logging: registra el método HTTP y la URL de cada request

const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
};

module.exports = logger;
