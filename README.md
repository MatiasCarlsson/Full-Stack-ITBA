# Hermanos Jota — E-Commerce Full Stack (Sprint 3 & 4)

Aplicación web full stack de comercio electrónico para **Hermanos Jota**, mueblería de autor con sede en San Cristóbal, Buenos Aires. Desarrollada para cumplir al 100% con los requisitos de la **Consigna Final Sprint 3 y 4** del curso Full Stack (Santander / ITBA), integrando un backend en **Node.js + Express** que sirve una API REST y un frontend interactivo en **React**.

---

## 🪵 Identidad y Manual de Marca

- **Paleta de Colores**:
  - Siena Tostado: `#A0522D` (Color principal, encabezados, botones primarios)
  - Verde Salvia: `#87A96B` (Acento sustentabilidad, tags y badges de feedback)
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

## 🏗️ Arquitectura del Proyecto

```text
Sprint 3-4/
├── .gitignore                    # Reglas de exclusión para Git (node_modules, builds, logs, .env)
├── README.md                     # Documentación general y guía de ejecución
├── Consigna de entrega sprint 3-4.pdf
├── Manual de Marca.pdf
├── Catálogo Hermanos Jota.pdf
│
├── backend/                      # Servidor Node.js + Express (Puerto 3001)
│   ├── .gitignore
│   ├── package.json
│   └── src/
│       ├── data/
│       │   └── productos.js      # Catálogo local de 11 productos con datos completos
│       ├── middlewares/
│       │   └── logger.js         # Logging personalizado: [timestamp] METHOD URL
│       ├── routes/
│       │   └── productos.js      # Router Express modular: GET / y GET /:id (con 404)
│       └── index.js              # Entry point Express, CORS, express.json() y static assets
│
└── client/                       # Aplicación Frontend en React 19 (Puerto 3000)
    ├── package.json              # Configurado con proxy a http://localhost:3001
    ├── public/
    │   ├── favicon.ico           # Favicon multirresolución con logo oficial
    │   ├── logo.svg              # Logo vectorial de la marca
    │   ├── logo192.png           # Icono PWA 192x192
    │   ├── logo512.png           # Icono PWA 512x512
    │   ├── manifest.json         # Metadatos PWA de Hermanos Jota
    │   ├── index.html            # Plantilla HTML con metadatos y favicons
    │   └── imagenes/             # Imágenes de productos con nombres URL-safe
    └── src/
        ├── components/
        │   ├── Navbar.jsx        # Barra de navegación con logo, enlaces y contador vía props
        │   ├── ProductCard.jsx   # Tarjeta con imagen clickeable y botón "Agregar" + CartIcon
        │   ├── ProductList.jsx   # Catálogo con filtros por categoría, loading y error
        │   ├── ProductDetail.jsx # Ficha técnica editorial, cuotas, selector qty y "Agregar" + CartIcon
        │   ├── ContactForm.jsx   # Formulario controlado con validación y mensaje de éxito
        │   ├── CartDrawer.jsx    # Panel lateral deslizable para gestionar el carrito
        │   ├── Icons.jsx         # Sistema reutilizable de iconos SVG
        │   └── Footer.jsx        # Pie de página con información de showroom y horarios
        ├── utils/
        │   └── pricing.js        # Utilidades de formateo de moneda (ARS)
        ├── App.js                # Estado global del carrito y renderizado condicional
        └── App.test.js           # Tests unitarios con React Testing Library y ESLint compliant
```

---

## 🚀 Cómo Ejecutar el Proyecto

Para que la aplicación funcione en su totalidad cliente-servidor, deben ejecutarse ambos entornos:

### 1. Iniciar el Backend (API REST)

En una terminal:

```bash
cd backend
npm install
npm run dev     # Inicia con nodemon en http://localhost:3001
# o bien: npm start
```

**Endpoints disponibles:**
- `GET http://localhost:3001/api/productos` — Listado completo en JSON (array de 11 productos).
- `GET http://localhost:3001/api/productos/:id` — Detalle del producto (responde `404 Not Found` si no existe).

### 2. Iniciar el Frontend (React)

En una **segunda terminal**:

```bash
cd client
npm install
npm start       # Inicia React en http://localhost:3000
```

El frontend cuenta con `"proxy": "http://localhost:3001"` configurado en su `package.json`, redirigiendo automáticamente las llamadas `/api/*` al backend.

### 3. Ejecutar los Tests del Frontend

```bash
cd client
npm test -- --watchAll=false
```

### 4. Generar Build de Producción

```bash
cd client
npm run build
```

---

## 📋 Cumplimiento de Requisitos Técnicos

| Requisito de la Consigna | Estado | Implementación |
| :--- | :---: | :--- |
| **Backend Express con datos en `.js` local** | ✅ | `backend/src/data/productos.js` (array de 11 productos). |
| **`GET /api/productos` en JSON** | ✅ | Endpoint funcional con status 200 y JSON completo. |
| **`GET /api/productos/:id` con 404** | ✅ | Búsqueda por ID con respuesta 404 estructurada. |
| **Middleware de logging global** | ✅ | Registra método HTTP y URL con timestamp en cada request. |
| **Middleware `express.json()`** | ✅ | Habilitado para futuras peticiones POST. |
| **Rutas con `express.Router`** | ✅ | `backend/src/routes/productos.js` montado bajo `/api/productos`. |
| **Componentes obligatorios** | ✅ | `Navbar`, `Footer`, `ProductCard`, `ProductList`, `ProductDetail`, `ContactForm`. |
| **Fetch con estados de carga y error** | ✅ | Spinner interactivo, mensaje de error amigable y botón de reintento. |
| **Renderizado con `.map()` y `key`s** | ✅ | Mapeo dinámico de productos y categorías con IDs únicos. |
| **Detalle de producto condicional** | ✅ | Renderizado en `App.js` sin recargar la página. |
| **Estado del carrito en `App.js`** | ✅ | Array de productos con cantidades acumuladas y drawer interactivo. |
| **Contador en `Navbar` vía props** | ✅ | Badge reactivo con la cantidad total de artículos. |
| **Formulario de contacto** | ✅ | Validación en tiempo real y confirmación visual de envío. |

---

## ✨ Características y Buenas Prácticas

1. **Vercel React Best Practices**:
   - `useEffect` con `AbortController` para cancelar peticiones pendientes si el componente se desmonta.
   - Limpieza de timers (`clearTimeout`) con `useRef` en el formulario para evitar fugas de memoria.
   - `useMemo` para derivación eficiente de categorías filtradas y cómputos de precios.
   - Componentes semánticos accesibles (`<button>`, `<header>`, `<article>`, `<nav>`, `<main>`).
2. **Nombres de archivos URL-safe**:
   - Imágenes de productos renombradas a kebab-case en minúsculas sin acentos ni espacios para evitar fallos de proxy y errores 500 en Create React App.
3. **Botón Unificado de Compra**:
   - Tanto en la tarjeta (`ProductCard`) como en la ficha técnica (`ProductDetail`), el botón de agregar es un `"Agregar"` acompañado del SVG reutilizable `<CartIcon />`.
4. **Testing Riguroso**:
   - 5 pruebas unitarias automatizadas con `@testing-library/react`.
   - Cumplimiento estricto de ESLint sin violación de la regla `testing-library/no-node-access`.
5. **Estrategia de Ramas Git**:
   - `main`: rama principal de producción.
   - `dev`: rama de integración y desarrollo.
   - `matias`: rama de trabajo de la funcionalidad del sprint.
