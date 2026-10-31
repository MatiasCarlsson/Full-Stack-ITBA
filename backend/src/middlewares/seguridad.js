// src/middlewares/seguridad.js
// Capa de seguridad que se aplica a toda la API, antes de las rutas.
// Un solo lugar donde se decide quién puede llamar, con qué frecuencia y qué puede mandar.

const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Las URLs se comparan sin barra final ni mayúsculas, porque "https://sitio.com" y
// "https://sitio.com/" son el mismo origen y nadie debería tener que acordarse de cuál puso.
const normalizar = (url) => String(url).trim().replace(/\/+$/, '').toLowerCase();

const leerLista = (variable) =>
  (process.env[variable] || '')
    .split(',')
    .map(normalizar)
    .filter(Boolean);

const origenesPermitidos = leerLista('ORIGENES_PERMITIDOS');
const enProduccion = process.env.NODE_ENV === 'production';

// Cualquier puerto de la máquina local. Hace falta porque el proxy de desarrollo de Create
// React App reescribe la cabecera Origin y la manda como la del backend, con barra final:
// sin esto, toda escritura falla en local aunque la lista tenga http://localhost:3000.
const esOrigenLocal = (origen) =>
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origen);

// ── CORS ────────────────────────────────────────────────────────────────────────
// CORS no protege al servidor, protege al navegador de otra gente. Con app.use(cors())
// la API responde con el comodín "*", así que cualquier sitio del mundo puede hacer que
// el navegador de un visitante llame a esta API. La lista pasa a ser explícita.
const politicaDeOrigen = cors({
  origin(origen, responder) {
    // curl, Postman y los health checks de Render no mandan Origin. Bloquearlos no suma
    // seguridad, porque no tienen una sesión de usuario que alguien pueda aprovechar.
    if (!origen) return responder(null, true);

    const limpio = normalizar(origen);

    // Fuera de producción, la máquina local siempre puede. Es lo que mantiene usable el
    // desarrollo sin aflojar nada en el servidor desplegado.
    if (!enProduccion && esOrigenLocal(limpio)) return responder(null, true);

    // Sin lista configurada, en desarrollo se deja pasar todo para no estorbar.
    // En producción se bloquea, porque un descuido no puede terminar en un comodín.
    if (origenesPermitidos.length === 0) {
      if (!enProduccion) return responder(null, true);
      return responder(new Error('ORIGENES_PERMITIDOS no está configurada en el servidor.'));
    }

    if (origenesPermitidos.includes(limpio)) return responder(null, true);
    return responder(new Error(`El origen ${origen} no está autorizado a usar esta API.`));
  },
  credentials: true,
});

// ── Límite de peticiones ────────────────────────────────────────────────────────
// Techo general por IP. Es holgado a propósito: frena el abuso automatizado sin molestar
// a alguien que navega el catálogo.
const limiteGeneral = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones', mensaje: 'Esperá unos minutos y volvé a intentar.' },
});

// Techo mucho más bajo para las escrituras. Si alguien se pone a probar claves de admin,
// se queda sin intentos antes de llegar a ninguna parte. Además, como el parser acepta
// cuerpos de 12 MB para las imágenes en Data URL, esto es lo que evita que alguien use
// ese tamaño para saturar el servidor.
const limiteEscritura = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos', mensaje: 'Esperá unos minutos y volvé a intentar.' },
});

// ── Limpieza del cuerpo ─────────────────────────────────────────────────────────
// Mongo interpreta como operadores las claves que empiezan con "$", y los puntos navegan
// campos anidados. Si eso llega crudo a un findByIdAndUpdate, el cuerpo de la petición deja
// de ser datos y pasa a ser una consulta. Acá se limpia antes de que toque la base.
//
// Va a mano en lugar de express-mongo-sanitize para no sumar una dependencia por quince
// líneas, y porque así solo se toca el cuerpo, que es lo único que termina en la base.
const limpiarClavesPeligrosas = (valor) => {
  if (Array.isArray(valor)) return valor.map(limpiarClavesPeligrosas);

  if (valor === null || typeof valor !== 'object') return valor;

  return Object.entries(valor).reduce((limpio, [clave, contenido]) => {
    if (clave.startsWith('$') || clave.includes('.')) return limpio;
    limpio[clave] = limpiarClavesPeligrosas(contenido);
    return limpio;
  }, {});
};

function sanitizarCuerpo(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = limpiarClavesPeligrosas(req.body);
  }
  next();
}

// ── Aviso de configuración ──────────────────────────────────────────────────────
// Avisa una sola vez, al arrancar, si la API quedó desprotegida.
function avisarConfiguracion() {
  if (enProduccion && origenesPermitidos.length === 0) {
    console.warn(
      '⚠️  [seguridad] ORIGENES_PERMITIDOS está vacía en producción: el navegador va a ' +
        'rechazar las llamadas del frontend. Cargá la URL de Vercel en esa variable.'
    );
  }

  if (!process.env.ADMIN_TOKEN) {
    console.warn(
      '⚠️  [seguridad] ADMIN_TOKEN no está definida: las operaciones de escritura van a ' +
        'responder 500 hasta que se configure.'
    );
  }
}

/**
 * Aplica las defensas globales sobre la app de Express.
 * Se llama antes de registrar las rutas.
 * @param {import('express').Express} app
 */
function aplicarSeguridad(app) {
  // Render y Vercel están detrás de un proxy. Sin esto, el limitador ve la IP del proxy
  // para todo el mundo y termina contando a todos los visitantes como si fueran uno solo.
  app.set('trust proxy', 1);

  // helmet pone las cabeceras defensivas y saca x-powered-by, que hoy anuncia que esto es
  // Express. contentSecurityPolicy va apagado porque esta API devuelve JSON e imágenes: la
  // CSP la tiene que declarar el frontend, que es quien sirve HTML.
  app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
  app.use(politicaDeOrigen);
  app.use(limiteGeneral);

  avisarConfiguracion();
}

module.exports = { aplicarSeguridad, limiteEscritura, sanitizarCuerpo };
