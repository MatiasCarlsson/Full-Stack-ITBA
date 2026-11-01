// scripts/probar-seguridad.js
// Prueba la capa de seguridad contra la app real de Hermanos Jota.
// Monta src/app.js tal cual sobre una MongoDB en memoria y la ataca, así que no hace falta
// Atlas ni credenciales y no se toca ningún dato real.
// Uso: pnpm run test:seguridad
process.env.NODE_ENV = 'production';
process.env.ORIGENES_PERMITIDOS = 'https://full-stack-itba-ecru.vercel.app,http://localhost:3000';
process.env.ADMIN_TOKEN = 'clave-de-prueba-123';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../src/app');
const Producto = require('../src/models/Producto');

let ok = 0;
let fallos = 0;

const chequear = (titulo, condicion, detalle) => {
  if (condicion) {
    ok += 1;
  } else {
    fallos += 1;
    console.log('  FALLA: ' + titulo + (detalle ? '  -> ' + detalle : ''));
  }
};

(async () => {
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  const semilla = await Producto.create({
    nombre: 'Sofá de prueba',
    precio: 1000,
    stock: 3,
    categoria: 'Sofás y Sillones',
  });

  const servidor = app.listen(0, async () => {
    const base = `http://localhost:${servidor.address().port}`;
    const pedir = (ruta, opciones) => fetch(base + ruta, opciones);
    const CLAVE = { 'x-admin-token': 'clave-de-prueba-123', 'Content-Type': 'application/json' };

    console.log('\n== Lo que no se tiene que romper ==');
    const listado = await pedir('/api/productos');
    chequear('el catálogo sigue siendo público', listado.status === 200, 'status ' + listado.status);
    chequear('y devuelve los productos', (await listado.json()).length === 1);

    const uno = await pedir(`/api/productos/${semilla._id}`);
    chequear('el detalle sigue siendo público', uno.status === 200);

    const malId = await pedir('/api/productos/no-es-un-id');
    chequear('un id malformado sigue dando 400', malId.status === 400, 'status ' + malId.status);

    const raiz = await pedir('/');
    chequear('la raíz informativa sigue andando', raiz.status === 200);

    console.log('\n== Cabeceras ==');
    chequear('ya no anuncia x-powered-by: Express', listado.headers.get('x-powered-by') === null,
      'quedó ' + listado.headers.get('x-powered-by'));
    chequear('helmet puso nosniff', listado.headers.get('x-content-type-options') === 'nosniff');
    chequear('helmet puso HSTS', Boolean(listado.headers.get('strict-transport-security')));
    chequear('el limitador informa el techo',
      Boolean(listado.headers.get('ratelimit') || listado.headers.get('ratelimit-limit')));

    console.log('\n== CORS ==');
    const propio = await pedir('/api/productos', {
      headers: { Origin: 'https://full-stack-itba-ecru.vercel.app' },
    });
    chequear('el frontend de Vercel tiene permiso',
      propio.headers.get('access-control-allow-origin') === 'https://full-stack-itba-ecru.vercel.app',
      'devolvió ' + propio.headers.get('access-control-allow-origin'));
    chequear('ya no contesta con el comodín *',
      propio.headers.get('access-control-allow-origin') !== '*');

    const local = await pedir('/api/productos', { headers: { Origin: 'http://localhost:3000' } });
    chequear('el desarrollo local sigue entrando', local.status === 200);

    const ajeno = await pedir('/api/productos', { headers: { Origin: 'https://sitio-ajeno.com' } });
    chequear('un sitio ajeno recibe 403', ajeno.status === 403, 'status ' + ajeno.status);

    // El proxy de desarrollo de Create React App manda el Origin con barra final. Si la
    // comparación fuera literal, toda escritura fallaría por una barra de diferencia.
    const conBarra = await pedir('/api/productos', {
      headers: { Origin: 'https://full-stack-itba-ecru.vercel.app/' },
    });
    chequear('la barra final no cambia el origen', conBarra.status === 200,
      'status ' + conBarra.status);

    const enMayusculas = await pedir('/api/productos', {
      headers: { Origin: 'https://Full-Stack-ITBA-Ecru.vercel.app' },
    });
    chequear('las mayúsculas del dominio tampoco', enMayusculas.status === 200,
      'status ' + enMayusculas.status);

    console.log('\n== El agujero que se tapa ==');
    const borrarSinClave = await pedir(`/api/productos/${semilla._id}`, { method: 'DELETE' });
    chequear('DELETE sin clave da 401, antes daba 404', borrarSinClave.status === 401,
      'status ' + borrarSinClave.status);

    const sigueViva = await pedir(`/api/productos/${semilla._id}`);
    chequear('y la pieza sigue en la base', sigueViva.status === 200);

    const editarSinClave = await pedir(`/api/productos/${semilla._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ precio: 1 }),
    });
    chequear('PUT sin clave da 401', editarSinClave.status === 401);

    const crearSinClave = await pedir('/api/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Intruso', precio: 1 }),
    });
    chequear('POST sin clave da 401', crearSinClave.status === 401);

    const claveMala = await pedir('/api/productos', {
      method: 'POST',
      headers: { 'x-admin-token': 'clave-equivocada', 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'Intruso', precio: 1 }),
    });
    chequear('POST con clave equivocada da 401', claveMala.status === 401);

    console.log('\n== El admin sigue pudiendo trabajar ==');
    const creado = await pedir('/api/productos', {
      method: 'POST',
      headers: CLAVE,
      body: JSON.stringify({ nombre: 'Mesa nueva', precio: 50000, stock: 2 }),
    });
    chequear('POST con la clave correcta crea', creado.status === 201, 'status ' + creado.status);
    const nuevo = await creado.json();

    const editado = await pedir(`/api/productos/${nuevo._id}`, {
      method: 'PUT',
      headers: CLAVE,
      body: JSON.stringify({ precio: 60000 }),
    });
    const editadoJson = await editado.json();
    chequear('PUT con la clave correcta edita', editado.status === 200);
    chequear('y devuelve el precio nuevo', editadoJson.precio === 60000, 'quedó ' + editadoJson.precio);
    chequear('sin pisar los campos que no vinieron', editadoJson.nombre === 'Mesa nueva');

    const borrado = await pedir(`/api/productos/${nuevo._id}`, {
      method: 'DELETE',
      headers: CLAVE,
    });
    chequear('DELETE con la clave correcta borra', borrado.status === 200);

    const yaNoEsta = await pedir(`/api/productos/${nuevo._id}`);
    chequear('y la pieza desaparece', yaNoEsta.status === 404);

    console.log('\n== Validaciones que ya existían ==');
    const sinNombre = await pedir('/api/productos', {
      method: 'POST',
      headers: CLAVE,
      body: JSON.stringify({ precio: 100 }),
    });
    chequear('POST sin nombre sigue dando 400', sinNombre.status === 400, 'status ' + sinNombre.status);

    const precioNegativo = await pedir('/api/productos', {
      method: 'POST',
      headers: CLAVE,
      body: JSON.stringify({ nombre: 'Raro', precio: -5 }),
    });
    chequear('precio negativo sigue dando 400', precioNegativo.status === 400);

    console.log('\n== Inyección en el cuerpo ==');
    const sucio = await pedir('/api/productos', {
      method: 'POST',
      headers: CLAVE,
      body: JSON.stringify({
        nombre: 'Mesa limpia',
        precio: 1000,
        $set: { destacado: true },
        'perfil.rol': 'admin',
      }),
    });
    const limpio = await sucio.json();
    chequear('crea igual, ignorando lo peligroso', sucio.status === 201);
    chequear('no quedó destacado por el $set', limpio.destacado === false);
    chequear('y conservó los datos buenos', limpio.nombre === 'Mesa limpia' && limpio.precio === 1000);
    await pedir(`/api/productos/${limpio._id}`, { method: 'DELETE', headers: CLAVE });

    console.log(`\nchequeos ok: ${ok}`);
    if (fallos > 0) console.log(`FALLARON: ${fallos}`);
    else console.log('Todo en verde.');

    servidor.close(async () => {
      await mongoose.disconnect();
      await mongo.stop();
      process.exit(fallos > 0 ? 1 : 0);
    });
  });
})();
