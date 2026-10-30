# Hermanos Jota — E-Commerce Full Stack (Sprints 3, 4, 5 & 6)

Aplicación web full stack de comercio electrónico para **Hermanos Jota**, mueblería de autor con sede en San Cristóbal, Buenos Aires. Desarrollada para cumplir al 100% con los requisitos de la **Consigna de los Sprints 3, 4, 5 y 6** del curso Full Stack (Santander / ITBA).

- **Backend:** Node.js + Express + MongoDB Atlas + Mongoose (CRUD REST completo).
- **Frontend:** React 19 + React Router DOM (enrutamiento declarativo SPA, páginas modulares, formularios controlados, carrito global y diseño editorial accesible).
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
│   └── src/
│       ├── config/
│       │   └── db.js             # Conexión asíncrona a MongoDB Atlas y listeners de estado
│       ├── controllers/
│       │   └── producto.controller.js # Controladores desacoplados de operaciones CRUD
│       ├── middlewares/
│       │   ├── logger.js         # Logging personalizado: [timestamp] METHOD URL
│       │   └── errorHandler.js   # Manejador centralizado de errores (CastError, ValidationError, 404, 500)
│       ├── models/
│       │   └── Producto.js       # Esquema Mongoose con validaciones y timestamps
│       ├── routes/
│       │   ├── productos.routes.js # Enrutador declarativo HTTP hacia los controladores
│       │   └── productos.js      # Re-export retrocompatible
│       ├── app.js                # Configuración de Express, CORS, middlewares y rutas
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
        │   └── CartContext.jsx   # Contexto global del carrito, estado, modal y notificaciones Toast
        ├── hooks/
        │   ├── useProducts.js    # Custom Hook para catálogo con AbortController, carga y recarga
        │   └── useProduct.js     # Custom Hook para detalle de producto por ID
        ├── services/
        │   └── productService.js # Capa de servicio para peticiones HTTP a la API REST
        ├── pages/
        │   ├── InicioPage.jsx    # Portada con Hero Section + Catálogo de piezas
        │   ├── CatalogoPage.jsx  # Vista de catálogo filtrable por categorías
        │   ├── DetallePage.jsx   # Carga por ID usando useProduct() y visualización editorial
        │   ├── ContactoPage.jsx  # Formulario controlado de atención y consultas
        │   ├── CrearProductoPage.jsx # Panel admin para alta de productos (POST)
        │   └── NotFoundPage.jsx  # Vista 404 personalizada con diseño editorial
        ├── components/
        │   ├── index.js          # Barrel export unificado
        │   ├── layout/           # Navbar, Footer
        │   ├── products/         # ProductCard, ProductList, ProductDetail
        │   ├── cart/             # CartDrawer
        │   ├── contact/          # ContactForm
        │   └── common/           # Icons, Toast
        ├── App.js                # CartProvider, BrowserRouter, Routes y componentes de layout
        └── App.test.js           # 6 tests unitarios automatizados pasando
```

---

## API REST — Endpoints (Sprint 5-6)

Todos los endpoints responden en formato JSON y manejan códigos de estado HTTP semánticos:

| Método | Endpoint | Descripción | Respuestas HTTP |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/productos` | Obtiene la lista completa de productos desde MongoDB Atlas | `200 OK`, `500 Internal Error` |
| **GET** | `/api/productos/:id` | Obtiene un producto por su `_id` | `200 OK`, `400 Bad Request` (CastError), `404 Not Found`, `500` |
| **POST** | `/api/productos` | Crea un nuevo producto en la base de datos | `201 Created`, `400 Bad Request` (Validación), `500` |
| **PUT** | `/api/productos/:id` | Actualiza los datos de un producto existente | `200 OK`, `400 Bad Request`, `404 Not Found`, `500` |
| **DELETE** | `/api/productos/:id` | Elimina un producto por su `_id` | `200 OK`, `400 Bad Request`, `404 Not Found`, `500` |

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
| `/admin/crear-producto` | `CrearProductoPage` | Formulario de alta para administradores (POST a `/api/productos`) |
| `*` | Ruta 404 | Página de captura de errores de navegación con enlace al inicio |

---

## Cómo Ejecutar el Proyecto en Local

### 1. Configuración de Variables de Entorno del Backend

Crea un archivo `.env` dentro del directorio `backend/` basándote en `.env.example`:

```env
PORT=3001
MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/hermanos-jota?retryWrites=true&w=majority
```

### 2. Iniciar el Backend (Express + MongoDB)

```bash
cd backend
pnpm install
pnpm run dev     # Inicia con nodemon en http://localhost:3001
```

### 3. Iniciar el Frontend (React)

En una segunda terminal:

```bash
cd client
pnpm install
pnpm start       # Inicia en http://localhost:3000
```

### 4. Ejecutar los Tests Automatizados

```bash
cd client
pnpm test -- --watchAll=false
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
4. Guardar y desplegar. Obtendrás una URL como `https://hermanos-jota-backend.onrender.com`.

### Frontend en Vercel (Single Page Application)

1. Crear un proyecto en Vercel importando el repositorio.
2. Configurar:
   - **Root Directory:** `client`
   - **Framework Preset:** `Create React App`
3. En **Environment Variables**:
   - `REACT_APP_API_URL`: URL del backend en Render (ej: `https://hermanos-jota-backend.onrender.com`).
4. Desplegar. Vercel gestionará el build estático y el enrutamiento client-side.

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
