# Guía de despliegue: Render y Vercel

Esta guía explica cómo desplegar:

- El backend Node.js + Express en **Render**.
- El frontend React en **Vercel**.

El proyecto utiliza **PNPM** como gestor de paquetes. No es necesario ejecutar `npm install`.

## 1. Requisitos previos

Antes de comenzar, verificá que:

1. El código esté subido a GitHub.
2. Tengas acceso al repositorio `MatiasCarlsson/Full-Stack-ITBA`.
3. La base de datos de MongoDB Atlas esté activa.
4. Tengas disponible la cadena de conexión de MongoDB Atlas.
5. Tengas instalados Node.js y PNPM en tu equipo para validar el proyecto localmente.

Podés comprobar PNPM con:

```bash
pnpm --version
```

## 2. Revisión rápida de MongoDB Atlas

La aplicación ya está preparada para conectarse a MongoDB Atlas:

- El backend lee la variable `MONGODB_URI`.
- El servidor conecta con MongoDB antes de comenzar a escuchar peticiones.
- La base utilizada por el proyecto es `hermanos-jota`.

No es necesario modificar el código de Atlas para desplegar. Solo confirmá en MongoDB Atlas que:

1. El usuario y la contraseña de la base sean válidos.
2. La red permita conexiones desde Render.
3. La cadena de conexión incluya la base `hermanos-jota`.

> Para una configuración inicial sencilla, MongoDB Atlas puede permitir temporalmente el acceso desde cualquier dirección (`0.0.0.0/0`). En producción, es preferible restringir el acceso según las opciones disponibles en tu plan y entorno.

## 3. Desplegar el backend en Render

### 3.1 Crear el servicio

1. Ingresá en [render.com](https://render.com/) y abrí tu cuenta.
2. Seleccioná **New +**.
3. Elegí **Web Service**.
4. Conectá tu cuenta de GitHub si todavía no lo hiciste.
5. Seleccioná el repositorio `MatiasCarlsson/Full-Stack-ITBA`.

### 3.2 Configurar el servicio

Usá estos valores:

| Campo | Valor |
| :--- | :--- |
| **Name** | `hermanos-jota-backend` |
| **Region** | La región más cercana a tus usuarios |
| **Branch** | `matias` (o la rama que uses para producción) |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `pnpm install --frozen-lockfile` |
| **Start Command** | `pnpm start` |
| **Instance Type** | `Free`, si corresponde a tu plan |

El `Root Directory` debe ser `backend`, porque allí se encuentran el `package.json`, el lockfile y `src/index.js`.

### 3.3 Agregar variables de entorno

En **Environment → Environment Variables**, agregá:

| Variable | Valor |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | Tu cadena privada de MongoDB Atlas |

No escribas las credenciales de MongoDB directamente en el repositorio ni en este archivo.

Render suele proporcionar su propio puerto mediante `PORT`. El backend ya utiliza `process.env.PORT`, por lo que funciona tanto con el puerto configurado como con el valor predeterminado local `3001`.

### 3.4 Ejecutar el despliegue

1. Presioná **Create Web Service**.
2. Esperá a que finalice el build.
3. Copiá la URL pública que Render asigne, por ejemplo:

```text
https://hermanos-jota-backend.onrender.com
```

### 3.5 Verificar el backend

Abrí en el navegador:

```text
https://TU-URL-DE-RENDER.onrender.com/
```

Deberías recibir un JSON con:

```json
{
  "status": "operativo"
}
```

Después probá:

```text
https://TU-URL-DE-RENDER.onrender.com/api/productos
```

La respuesta debería ser un array JSON de productos. Si aparece un error de conexión, revisá primero `MONGODB_URI` y los logs del servicio en Render.

## 4. Desplegar el frontend en Vercel

### 4.1 Crear el proyecto

1. Ingresá en [vercel.com](https://vercel.com/) y abrí tu cuenta.
2. Seleccioná **Add New → Project**.
3. Importá el repositorio `MatiasCarlsson/Full-Stack-ITBA`.

### 4.2 Configurar el proyecto

Usá estos valores:

| Campo | Valor |
| :--- | :--- |
| **Framework Preset** | `Create React App` |
| **Root Directory** | `client` |
| **Install Command** | `pnpm install --frozen-lockfile` |
| **Build Command** | `pnpm run build` |
| **Output Directory** | `build` |

Si Vercel ofrece activar la configuración automática de PNPM, aceptala. El `packageManager` del proyecto declara `pnpm@12.8.2`.

### 4.3 Configurar la URL del backend

En **Settings → Environment Variables**, agregá:

| Variable | Valor | Entornos |
| :--- | :--- | :--- |
| `REACT_APP_API_URL` | `https://TU-URL-DE-RENDER.onrender.com` | Production, Preview y Development |

No agregues una `/` al final de la URL. La aplicación concatena internamente `/api/productos`.

Después de guardar la variable, ejecutá un nuevo deploy. Las variables `REACT_APP_*` se incorporan durante el build, por lo que modificarla sin volver a compilar no actualiza el frontend ya desplegado.

### 4.4 Ejecutar el despliegue

1. Presioná **Deploy**.
2. Esperá a que finalice el build de Vercel.
3. Abrí el dominio asignado por Vercel.
4. Verificá que cargue el catálogo y que las imágenes se visualicen.

## 5. Verificación funcional final

Desde la URL pública de Vercel, comprobá:

- La portada `/`.
- El catálogo `/productos`.
- El detalle de un producto `/productos/:id`.
- El formulario de contacto `/contacto`.
- El panel `/admin`.
- La creación de productos en `/admin/crear-producto`.
- La carga de una imagen local.
- La carga de una URL remota de imagen.
- El carrito.

También podés revisar en las herramientas de desarrollador del navegador que las peticiones apunten a:

```text
https://TU-URL-DE-RENDER.onrender.com/api/productos
```

## 6. Problemas frecuentes

### El backend no inicia en Render

Revisá:

1. Que **Root Directory** sea `backend`.
2. Que el comando de inicio sea `pnpm start`.
3. Que `MONGODB_URI` exista en las variables de entorno.
4. Que MongoDB Atlas permita la conexión desde Render.
5. Los logs del servicio en Render.

### El frontend muestra un error de conexión

Revisá:

1. Que `REACT_APP_API_URL` contenga la URL pública de Render.
2. Que la URL no termine en `/`.
3. Que hayas vuelto a desplegar Vercel después de crear o modificar la variable.
4. Que el endpoint `/api/productos` responda correctamente en Render.

### Las rutas internas muestran 404 al recargar

React Router utiliza rutas del lado del cliente. Si Vercel devuelve 404 al recargar directamente `/productos` o `/admin`, agregá un archivo `client/vercel.json` con esta configuración y volvé a desplegar:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Render queda inactivo durante el primer acceso

En planes gratuitos, el servicio puede tardar unos segundos en reactivarse después de un período sin tráfico. Esperá la respuesta inicial y volvé a cargar el catálogo.

