// config/api.js
// Define la URL base de la API backend.
// En desarrollo local queda como cadena vacía para usar el proxy de Create React App ("proxy": "http://localhost:3001").
// En producción (despliegue en Vercel/Netlify), utiliza REACT_APP_API_URL apuntando al backend en Render.
export const API_BASE_URL = process.env.REACT_APP_API_URL || '';
