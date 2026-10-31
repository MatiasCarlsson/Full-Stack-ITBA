# Hermanos Jota — E-Commerce Full Stack (Sprints 3, 4, 5 & 6)

Aplicación web full stack de comercio electrónico para **Hermanos Jota**, mueblería de autor con sede en San Cristóbal, Buenos Aires. Desarrollada para cumplir al 100% con los requisitos de la **Consigna de los Sprints 3, 4, 5 y 6** del curso Full Stack (Santander / ITBA).

- **Backend:** Node.js + Express + MongoDB Atlas + Mongoose (CRUD REST completo, protegido con clave de administración, CORS acotado, Helmet y límite de peticiones).
- **Frontend:** React 19 + React Router DOM (enrutamiento declarativo SPA, páginas modulares, formularios controlados, carrito global, panel de administración con CRUD completo, tema claro y oscuro, y diseño editorial accesible).
- **Gestor de paquetes:** [PNPM](https://pnpm.io/) (no se utiliza NPM para instalar dependencias).

## Integrantes

| Integrante | Correo | GitHub |
| :--- | :--- | :--- |
| Matías Carlsson | — | [@MatiasCarlsson](https://github.com/MatiasCarlsson) |
| Dante Lamorte | [dantelamorte@outlook.com](mailto:dantelamorte@outlook.com) | [@DanteLamorte](https://github.com/DanteLamorte) |

---

## Identidad y Manual de Marca

- **Paleta de Colores**:
  - Siena Tostado: `#A0522D` (Color principal, encabezados, botones primarios)
  - Verde Salvia: `#87A96B` (Acento sustentabilidad, tags y badges de stock)
  - Alabastro Cálido: `#F5E6D3` (Fondo general del sitio)
  - Vara de Oro: `#D4A437` (Detalles premium, badges de piezas destacadas)
  - Rosa Polvoriento: `#C47A6D` (Acentos complementarios)
  - Blanco Alabastrado: `#FFFFFF` / Fondo Card: `#FDF6EE`
  - Texto Principal: `#3D2B1F`
- **Tipografías**:
  - Primaria: `Inter` (cuerpo de texto, botones, fichas técnicas y navegación)
  - Secundaria: `Playfair Display` (títulos editoriales y marca)
- **Iconografía**:
  - Iconos SVG minimalistas y arquitectónicos en `Icons.jsx` (cero emojis en la interfaz).
  - Favicon oficial en la pestaña del navegador (`favicon.ico`, `logo.svg` y versiones HiDPI).

---

## Arquitectura del Proyecto

```text
Sprint 3-4/
├── .gitignore                    # Reglas de exclusión para Git (node_modules, builds, logs, .env)
├── README.md                     # Documentación general y guía de ejecución
├── Consigna de entrega sprint 3-4.pdf
├── Consigna de entrega sprint 5-6.pdf
├── Manual de Marca.pdf
├── Catálogo Hermanos Jota.pdf
│
├── backend/                      # Servidor Node.js + Express + MongoDB Atlas (Puerto 3001)
│   ├── .env                      # Variables de entorno locales (MONGODB_URI, PORT) — no commitear
│   ├── .env.example              # Plantilla pública de variables de entorno
│   ├── .gitignore
│   ├── package.json
│   ├── scripts/
│   │   ├── catalogo-semilla.js   # Las 11 piezas del catálogo, para poblar la base
│   │   ├── sembrar.js            # pnpm run seed: carga la semilla en MongoDB
│   │   ├── servidor-memoria.js   # pnpm run dev:memoria: API con MongoDB en memoria, sin Atlas
│   │   └── probar-seguridad.js   # 31 chequeos de la capa de seguridad sobre MongoDB en memoria
│   └── src/
│       ├── config/
│       │   └── db.js             # Conexión asíncrona a MongoDB Atlas y listeners de estado
│       ├── controllers/
│       │   └── producto.controller.js # Controladores desacoplados de operaciones CRUD
│       ├── middlewares/
│       │   ├── logger.js         # Logging personalizado: [timestamp] METHOD URL
│       │   ├── errorHandler.js   # Manejador centralizado de errores (CastError, ValidationError, 404, 500)
│       │   ├── seguridad.js      # Helmet, CORS por lista de orígenes, rate limiting y limpieza del cuerpo
│       │   └── requiereAdmin.js  # Portero de las escrituras: exige la cabecera x-admin-token
│       ├── models/
│       │   └── Producto.js       # Esquema Mongoose con validaciones y timestamps
│       ├── routes/
│       │   └── productos.routes.js # Enrutador declarativo HTTP hacia los controladores
│       ├── app.js                # Configuración de Express, seguridad, middlewares y rutas
│       └── index.js              # Entry point del servidor, arranque de DB y graceful shutdown
│
└── client/                       # Aplicación Frontend en React (Puerto 3000)
    ├── .env.production           # Configuración de API_URL para despliegue en Vercel
    ├── .env.example              # Plantilla pública de variables frontend
    ├── package.json              # Configurado con proxy a http://localhost:3001
    ├── public/
    │   ├── favicon.ico           # Favicon multirresolución con logo oficial
    │   ├── logo.svg              # Logo vectorial de la marca
    │   └── imagenes/             # Imágenes de productos con nombres URL-safe
    └── src/
        ├── config/
        │   └── api.js            # Base URL dinámica (local con proxy CRA / producción en Render)
        ├── context/
        │   ├── CartContext.jsx   # Contexto global del carrito, estado, modal y notificaciones Toast
        │   └── TemaContext.jsx   # Tema claro y oscuro, con preferencia guardada y respeto al sistema
        ├── hooks/
        │   ├── useProducts.js    # Custom Hook para catálogo con AbortController, carga y recarga
        │   └── useProduct.js     # Custom Hook para detalle de producto por ID
        ├── services/
        │   ├── productService.js # Capa de servicio para peticiones HTTP a la API REST
        │   └── adminAuth.js      # Clave de administración en sessionStorage y cabeceras de escritura
        ├── pages/
        │   ├── InicioPage.jsx    # Portada con Hero Section + Catálogo de piezas
        │   ├── CatalogoPage.jsx  # Vista de catálogo filtrable por categorías
        │   ├── DetallePage.jsx   # Carga por ID usando useProduct() y visualización editorial
        │   ├── ContactoPage.jsx  # Formulario controlado de atención y consultas
        │   ├── AdminPage.jsx     # Panel admin: listado del catálogo con editar y eliminar
        │   ├── CrearProductoPage.jsx # Alta de productos (POST)
        │   ├── EditarProductoPage.jsx # Edición por ID con useParams (PUT)
        │   └── NotFoundPage.jsx  # Vista 404 personalizada con diseño editorial
        ├── components/
        │   ├── index.js          # Barrel export unificado
        │   ├── layout/           # Navbar, Footer
        │   ├── products/         # ProductCard, ProductList, ProductDetail
        │   ├── cart/             # CartDrawer
        │   ├── contact/          # ContactForm
        │   ├── admin/            # FormularioProducto (compartido por alta y edición), GuardiaAdmin
        │   └── common/           # Icons, Toast, BotonTema
        ├── tema-oscuro.css       # Tema oscuro, sin tocar las hojas existentes
        ├── App.js                # TemaProvider, CartProvider, BrowserRouter, Routes y layout
        └── App.test.js           # 11 tests unitarios automatizados pasando
```

---

## API REST — Endpoints (Sprint 5-6)

Leer el catálogo es público. Crear, editar y eliminar exigen la cabecera `x-admin-token` con el
valor de `ADMIN_TOKEN`: sin ella la respuesta es `401 Unauthorized`.

Todos los endpoints responden en formato JSON y manejan códigos de estado HTTP semánticos:

| Método | Endpoint | Descripción | Respuestas HTTP |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/productos` | Obtiene la lista completa de productos desde MongoDB Atlas | `200 OK`, `500 Internal Error` |
| **GET** | `/api/productos/:id` | Obtiene un producto por su `_id` | `200 OK`, `400 Bad Request` (CastError), `404 Not Found`, `500` |
| **POST** 🔒 | `/api/productos` | Crea un nuevo producto en la base de datos | `201 Created`, `400 Bad Request` (Validación), `401 Unauthorized`, `429 Too Many Requests`, `500` |
| **PUT** 🔒 | `/api/productos/:id` | Actualiza los datos de un producto existente | `200 OK`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `429`, `500` |
| **DELETE** 🔒 | `/api/productos/:id` | Elimina un producto por su `_id` | `200 OK`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `429`, `500` |

🔒 = requiere la cabecera `x-admin-token`.

### Modelo de Datos Mongoose (`Producto`)

```javascript
{
  nombre:      { type: String, required: true },
  descripcion: { type: String },
  precio:      { type: Number, required: true },
  stock:       { type: Number, default: 0 },
  imagenUrl:   { type: String },
  categoria:   { type: String },
  materiales:  { type: [String] },
  dimensiones: { type: String },
  destacado:   { type: Boolean, default: false }
}
```

---

## Rutas del Frontend (React Router DOM)

| Ruta | Componente / Página | Descripción |
| :--- | :--- | :--- |
| `/` | `InicioPage` | Hero section de presentación artesanal + listado de productos |
| `/productos` | `CatalogoPage` | Catálogo de muebles con selector de categorías |
| `/productos/:id` | `DetallePage` | Ficha técnica individual cargada dinámicamente mediante `useParams()` |
| `/contacto` | `ContactoPage` | Formulario de contacto y asesoramiento del taller |
| `/admin` | `AdminPage` | Panel con el catálogo completo: editar y eliminar cada pieza |
| `/admin/crear-producto` | `CrearProductoPage` | Formulario de alta (POST a `/api/productos`) |
| `/admin/editar-producto/:id` | `EditarProductoPage` | Edición de una pieza, leída con `useParams()` (PUT) |
| `*` | Ruta 404 | Página de captura de errores de navegación con enlace al inicio |

Las tres rutas de `/admin` piden la clave de administración antes de mostrarse. Esa pantalla es
comodidad: quien decide de verdad es la API, que rechaza toda escritura sin la cabecera.

---

## Cómo Ejecutar el Proyecto en Local

### 1. Configuración de Variables de Entorno del Backend

Crea un archivo `.env` dentro del directorio `backend/` basándote en `.env.example`:

```env
PORT=3001
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/hermanos-jota?retryWrites=true&w=majority
NODE_ENV=development

# Clave que exige la API para crear, editar y borrar. Generala con:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ADMIN_TOKEN=

# Orígenes que pueden llamar a la API desde un navegador, separados por coma.
# En desarrollo podés dejarla vacía: cualquier origen local pasa igual.
ORIGENES_PERMITIDOS=http://localhost:3000
```

### 2. Iniciar el Backend (Express + MongoDB)

```bash
cd backend
pnpm install
pnpm run seed    # Carga las 11 piezas del catálogo en la base (borra lo que hubiera)
pnpm run dev     # Inicia con nodemon en http://localhost:3001
```

> **¿Sin credenciales de Atlas?** `pnpm run dev:memoria` levanta la misma API sobre una MongoDB
> en memoria, ya sembrada con el catálogo. No necesita `.env` ni cuenta de Atlas. La clave de
> administración en ese modo es `admin-local`, y los datos se pierden al frenar el proceso.

### 3. Iniciar el Frontend (React)

En una segunda terminal:

```bash
cd client
pnpm install
pnpm start       # Inicia en http://localhost:3000
```

### 4. Ejecutar los Tests Automatizados

11 tests del frontend:

```bash
cd client
pnpm run test:ci
```

> Con PNPM **no** hay que escribir `pnpm test -- --watchAll=false`. Ese `--` es sintaxis de NPM y
> acá se pasa literal a `react-scripts`, que termina rompiendo la invocación de Jest con un error
> de sintaxis que no tiene nada que ver con el código. Usá `pnpm run test:ci`.

31 chequeos de la capa de seguridad del backend, sobre una MongoDB en memoria (no toca Atlas):

```bash
cd backend
pnpm run test:seguridad
```

### 5. Compilar para Producción

```bash
cd client
pnpm run build
```

---

## Guía de Despliegue en la Nube

### Backend en Render.com (Web Service)

1. Crear un nuevo servicio **Web Service** conectado al repositorio.
2. Configurar:
   - **Root Directory:** `backend`
   - **Build Command:** `pnpm install`
   - **Start Command:** `pnpm start` (o `node src/index.js`)
3. En **Environment Variables**:
   - `MONGODB_URI`: Cadena de conexión de MongoDB Atlas.
   - `NODE_ENV`: `production`
   - `ADMIN_TOKEN`: la clave que exigirá la API para escribir. **Sin esto, el panel de admin no
     puede guardar nada.**
   - `ORIGENES_PERMITIDOS`: `https://full-stack-itba-ecru.vercel.app`. **Sin esto, con
     `NODE_ENV=production` el navegador rechaza todas las llamadas del frontend.**
4. Guardar y desplegar. Obtendrás una URL como `https://full-stack-itba.onrender.com`.

### Frontend en Vercel (Single Page Application)

1. Crear un proyecto en Vercel importando el repositorio.
2. Configurar:
   - **Root Directory:** `client`
   - **Framework Preset:** `Create React App`
3. En **Environment Variables**:
   - `REACT_APP_API_URL`: URL del backend en Render (ej: `https://full-stack-itba.onrender.com`).
4. Desplegar. Vercel gestionará el build estático y el enrutamiento client-side.

---

## 🌗 Tema Claro y Oscuro

Un botón en la barra superior alterna los dos temas. La elección queda guardada en `localStorage`
y, si el visitante nunca eligió, se respeta la preferencia configurada en su sistema operativo.
Un script corto en `public/index.html` pinta el tema antes del primer render, para que la página
no arranque clara y pegue un destello al oscurecerse.

Todo el tema oscuro vive en `client/src/tema-oscuro.css` y cuelga de `:root[data-theme="dark"]`,
así que **no modifica ni una línea de las hojas de estilo existentes**: en claro el sitio queda
exactamente como estaba.

No alcanzaba con redefinir las variables de `:root`, porque tres de ellas cumplen dos papeles a la
vez en las hojas actuales: `--color-alabastro` es texto en 10 reglas y fondo en 3, `--color-blanco`
es texto en 9 y fondo en 5, y `--color-texto` es texto en 23 y fondo en 2. Cada una se mueve en la
dirección de su papel mayoritario y los casos minoritarios están parcheados uno por uno, con el
porqué escrito al lado. El contraste de todos los textos de todas las pantallas se midió contra el
mínimo de la WCAG.

---

## 🔐 Seguridad de la API

| Defensa | Qué resuelve |
| :--- | :--- |
| `requiereAdmin` | `POST`, `PUT` y `DELETE` exigen la cabecera `x-admin-token`. Antes, un `DELETE` sin credenciales llegaba al controlador y respondía `404`: el servidor buscaba el producto antes de preguntarse quién pedía borrarlo. |
| CORS por lista | `app.use(cors())` respondía con el comodín `*`, así que cualquier sitio podía llamar a la API desde el navegador de un visitante. Ahora la lista sale de `ORIGENES_PERMITIDOS`. |
| Helmet | Cabeceras defensivas y baja del `x-powered-by: Express`, que anunciaba la tecnología del servidor. |
| Rate limiting | 300 peticiones cada 15 minutos en general y 20 para escrituras. Frena la prueba de claves por fuerza bruta y protege el `express.json({ limit: '12mb' })` que necesitan las imágenes en Data URL. |
| Limpieza del cuerpo | Se descartan las claves que empiezan con `$` o tienen puntos, que Mongo interpretaría como operadores dentro de un `findByIdAndUpdate`. |

La comparación de la clave es en tiempo constante, para que el tiempo de respuesta no filtre
cuánto del token se acertó.

Todo esto está cubierto por `pnpm run test:seguridad`, que monta la app real sobre una MongoDB en
memoria y la ataca con 31 chequeos.

---

## Buenas Prácticas Aplicadas

1. **Vercel React Best Practices & Performance**:
   - Peticiones con `AbortController` en `useEffect` para cancelar llamadas si el usuario navega a otra pantalla.
   - Estado del carrito centralizado en `App.js` con persistencia en memoria durante la navegación SPA.
   - `useMemo` para memorizar la derivación de categorías y cómputos de precios y descuentos sin recomputación innecesaria.
   - Formulario de alta en `/admin/crear-producto` completamente controlado con validación local previa y manejo de errores devueltos por el backend.
2. **TypeScript & React Standards**:
   - Desacoplamiento de componentes de presentación (`ProductCard`, `ProductDetail`) de páginas contenedoras de datos (`DetallePage`, `CatalogoPage`).
   - Normalización de identificadores (`_id` de MongoDB con fallback a `id`) y propiedades de imágenes (`imagenUrl` / `imagen`).
3. **Frontend Design Craft**:
   - Transiciones suaves en hover, botones con estados activos, microinteracciones de confirmación ("¡Agregado al carrito!") y diseño tipográfico con serif editorial (`Playfair Display`) y sans-serif funcional (`Inter`).
