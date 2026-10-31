// src/middlewares/requiereAdmin.js
// Portero de las operaciones de escritura.
//
// El agujero que tapa: hoy un POST, un PUT o un DELETE llegan al handler sin presentar nada.
// Se comprueba mandándole un DELETE a un id inexistente, porque contesta "404 no encontrado"
// en vez de "401 no autorizado": el servidor ya se puso a buscar el producto antes de
// preguntarse quién estaba pidiendo borrarlo.
const { createHash, timingSafeEqual } = require('node:crypto');

// Comparar dos textos con === corta en la primera letra distinta, así que el tiempo de
// respuesta filtra cuánto del token se acertó. Comparando los hashes, los dos lados miden
// siempre 32 bytes y la comparación tarda lo mismo acierte o no.
const sonIguales = (unTexto, otroTexto) => {
    const resumir = (texto) => createHash('sha256').update(String(texto)).digest();
    return timingSafeEqual(resumir(unTexto), resumir(otroTexto));
};

const requiereAdmin = (req, res, siguiente) => {
    const esperado = process.env.ADMIN_TOKEN;

    // Sin token configurado la API quedaría abierta. Se prefiere que falle de entrada y no
    // que se despliegue sin portero sin que nadie lo note.
    if (!esperado) {
        return res.status(500).json({
            error: 'Configuración incompleta',
            mensaje: 'El servidor no tiene definida la variable ADMIN_TOKEN.'
        });
    }

    const recibido = req.get('x-admin-token');

    if (!recibido || !sonIguales(recibido, esperado)) {
        return res.status(401).json({
            error: 'No autorizado',
            mensaje: 'Esta operación necesita la clave de administración.'
        });
    }

    return siguiente();
};

module.exports = requiereAdmin;
