// pages/CrearProductoPage.jsx
// Página /admin/crear-producto — formulario controlado para POST a la API
// Usa useNavigate para redirigir al catálogo tras crear con éxito

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProducto } from '../services/productService';
import './CrearProductoPage.css';

const CAMPOS_INICIALES = {
  nombre:      '',
  descripcion: '',
  precio:      '',
  stock:       '',
  imagenUrl:   '',
  categoria:   '',
};

const TIPOS_IMAGEN_ACEPTADOS = 'image/*';
const TAMANO_MAXIMO_IMAGEN = 8 * 1024 * 1024;

function CrearProductoPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(CAMPOS_INICIALES);
  const [errores, setErrores]   = useState({});
  const [enviando, setEnviando] = useState(false);
  const [errorApi, setErrorApi]  = useState(null);
  const [nombreArchivo, setNombreArchivo] = useState('');

  // ── Validación ────────────────────────────────────────────────────────────
  const validar = () => {
    const errs = {};
    if (!formData.nombre.trim())
      errs.nombre = 'El nombre es obligatorio.';
    if (!formData.precio)
      errs.precio = 'El precio es obligatorio.';
    else if (isNaN(Number(formData.precio)) || Number(formData.precio) < 0)
      errs.precio = 'El precio debe ser un número positivo.';
    if (formData.stock !== '' && (isNaN(Number(formData.stock)) || Number(formData.stock) < 0))
      errs.stock = 'El stock debe ser un número positivo.';
    return errs;
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: null }));
  };

  const handleArchivoChange = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      setErrores((prev) => ({
        ...prev,
        imagen: 'El archivo seleccionado debe ser una imagen.',
      }));
      setNombreArchivo('');
      return;
    }

    if (archivo.size > TAMANO_MAXIMO_IMAGEN) {
      setErrores((prev) => ({
        ...prev,
        imagen: 'La imagen no puede superar los 8 MB.',
      }));
      setNombreArchivo('');
      return;
    }

    const lector = new FileReader();
    lector.onload = () => {
      setFormData((prev) => ({ ...prev, imagenUrl: lector.result }));
      setNombreArchivo(archivo.name);
      setErrores((prev) => ({ ...prev, imagen: null }));
    };
    lector.onerror = () => {
      setErrores((prev) => ({
        ...prev,
        imagen: 'No se pudo leer el archivo seleccionado.',
      }));
      setNombreArchivo('');
    };
    lector.readAsDataURL(archivo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorApi(null);
    const nuevosErrores = validar();
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setEnviando(true);
    try {
      const body = {
        nombre:      formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio:      Number(formData.precio),
        stock:       formData.stock !== '' ? Number(formData.stock) : 0,
        imagenUrl:   formData.imagenUrl.trim(),
        categoria:   formData.categoria.trim(),
      };

      await createProducto(body);

      // Éxito → redirigir al catálogo con useNavigate
      navigate('/productos');
    } catch (err) {
      setErrorApi(err.message || 'No se pudo conectar con el servidor');
      setEnviando(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="admin-wrapper">
      <div className="admin-header">
        <h2 className="admin-titulo">Alta de Producto</h2>
        <p className="admin-bajada">Completá los campos para agregar una nueva pieza al catálogo.</p>
      </div>

      <form className="admin-form" onSubmit={handleSubmit} noValidate>

        {/* Nombre */}
        <div className="admin-form__group">
          <label className="admin-form__label" htmlFor="nombre">
            Nombre <span className="admin-form__required">*</span>
          </label>
          <input
            id="nombre"
            className={`admin-form__input ${errores.nombre ? 'admin-form__input--error' : ''}`}
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej: Sofá Patagonia"
            required
          />
          {errores.nombre && <span className="admin-form__error-text">{errores.nombre}</span>}
        </div>

        {/* Descripción */}
        <div className="admin-form__group">
          <label className="admin-form__label" htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            className="admin-form__textarea"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Descripción detallada de la pieza..."
            rows="4"
          />
        </div>

        {/* Precio + Stock en fila */}
        <div className="admin-form__row">
          <div className="admin-form__group">
            <label className="admin-form__label" htmlFor="precio">
              Precio (ARS) <span className="admin-form__required">*</span>
            </label>
            <input
              id="precio"
              className={`admin-form__input ${errores.precio ? 'admin-form__input--error' : ''}`}
              type="number"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              placeholder="Ej: 85000"
              min="0"
              required
            />
            {errores.precio && <span className="admin-form__error-text">{errores.precio}</span>}
          </div>

          <div className="admin-form__group">
            <label className="admin-form__label" htmlFor="stock">Stock</label>
            <input
              id="stock"
              className={`admin-form__input ${errores.stock ? 'admin-form__input--error' : ''}`}
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="Ej: 5"
              min="0"
            />
            {errores.stock && <span className="admin-form__error-text">{errores.stock}</span>}
          </div>
        </div>

        {/* Categoría */}
        <div className="admin-form__group">
          <label className="admin-form__label" htmlFor="categoria">Categoría</label>
          <input
            id="categoria"
            className="admin-form__input"
            type="text"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            placeholder="Ej: Sofás y Sillones"
          />
        </div>

        {/* URL de imagen */}
        <div className="admin-form__group">
          <label className="admin-form__label" htmlFor="imagenUrl">URL de imagen</label>
          <input
            id="imagenUrl"
            className="admin-form__input"
            type="text"
            name="imagenUrl"
            value={formData.imagenUrl}
            onChange={handleChange}
            placeholder="/imagenes/nombre-del-producto.png"
          />
          <span className="admin-form__hint">
            Podés pegar un enlace de internet o seleccionar una imagen desde tu dispositivo.
          </span>
          <label className="admin-form__file-label" htmlFor="imagenArchivo">
            Seleccionar imagen
          </label>
          <input
            id="imagenArchivo"
            className="admin-form__file-input"
            type="file"
            accept={TIPOS_IMAGEN_ACEPTADOS}
            onChange={handleArchivoChange}
          />
          {nombreArchivo && (
            <span className="admin-form__file-name">Archivo seleccionado: {nombreArchivo}</span>
          )}
          {errores.imagen && <span className="admin-form__error-text">{errores.imagen}</span>}
          {formData.imagenUrl && (
            <img
              className="admin-form__image-preview"
              src={formData.imagenUrl}
              alt="Vista previa del producto"
            />
          )}
        </div>

        {/* Error de la API */}
        {errorApi && (
          <div className="admin-form__api-error" role="alert">
            ⚠ {errorApi}
          </div>
        )}

        {/* Acciones */}
        <div className="admin-form__acciones">
          <button
            type="button"
            className="admin-form__btn-cancelar"
            onClick={() => navigate('/productos')}
            disabled={enviando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="admin-form__btn-guardar"
            disabled={enviando}
          >
            {enviando ? 'Guardando…' : 'Guardar producto'}
          </button>
        </div>

      </form>
    </main>
  );
}

export default CrearProductoPage;
