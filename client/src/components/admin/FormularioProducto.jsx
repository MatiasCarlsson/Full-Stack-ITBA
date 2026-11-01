// components/admin/FormularioProducto.jsx
// Formulario controlado de producto, compartido por el alta y la edición.
//
// Las dos pantallas son el mismo formulario con otro título y otro destino: la única
// diferencia es qué función recibe los datos al enviar. Por eso vive acá y no duplicado.

import { useState } from 'react';
import '../../pages/CrearProductoPage.css';

export const CAMPOS_VACIOS = {
  nombre: '',
  descripcion: '',
  precio: '',
  stock: '',
  imagenUrl: '',
  categoria: '',
  dimensiones: '',
  materiales: '',
  destacado: false,
};

const TIPOS_IMAGEN_ACEPTADOS = 'image/*';
const TAMANO_MAXIMO_IMAGEN = 8 * 1024 * 1024;

/**
 * Convierte un producto de la API en los valores del formulario.
 * Los materiales viajan como arreglo y se editan como texto separado por comas.
 * @param {Object} producto
 */
export function productoAFormulario(producto) {
  return {
    nombre: producto.nombre ?? '',
    descripcion: producto.descripcion ?? '',
    precio: producto.precio ?? '',
    stock: producto.stock ?? '',
    imagenUrl: producto.imagenUrl ?? '',
    categoria: producto.categoria ?? '',
    dimensiones: producto.dimensiones ?? '',
    materiales: Array.isArray(producto.materiales) ? producto.materiales.join(', ') : '',
    destacado: Boolean(producto.destacado),
  };
}

function validar(formData) {
  const errs = {};

  if (!formData.nombre.trim()) {
    errs.nombre = 'El nombre es obligatorio.';
  }

  if (formData.precio === '') {
    errs.precio = 'El precio es obligatorio.';
  } else if (isNaN(Number(formData.precio)) || Number(formData.precio) < 0) {
    errs.precio = 'El precio debe ser un número positivo.';
  }

  if (formData.stock !== '' && (isNaN(Number(formData.stock)) || Number(formData.stock) < 0)) {
    errs.stock = 'El stock debe ser un número positivo.';
  }

  return errs;
}

/**
 * FormularioProducto — campos controlados, validación y vista previa de imagen.
 *
 * @param {Object}   props
 * @param {Object}   props.valoresIniciales  Valores con los que arranca el formulario.
 * @param {Function} props.onGuardar         Recibe el cuerpo listo para la API. Puede fallar.
 * @param {Function} props.onCancelar        Qué hacer al apretar Cancelar.
 * @param {string}   props.textoGuardar      Texto del botón principal.
 * @param {string}   props.textoGuardando    Texto del botón mientras se envía.
 */
function FormularioProducto({
  valoresIniciales = CAMPOS_VACIOS,
  onGuardar,
  onCancelar,
  textoGuardar = 'Guardar producto',
  textoGuardando = 'Guardando…',
}) {
  const [formData, setFormData] = useState(valoresIniciales);
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [errorApi, setErrorApi] = useState(null);
  const [nombreArchivo, setNombreArchivo] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: null }));
  };

  const handleArchivoChange = (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      setErrores((prev) => ({ ...prev, imagen: 'El archivo seleccionado debe ser una imagen.' }));
      setNombreArchivo('');
      return;
    }

    if (archivo.size > TAMANO_MAXIMO_IMAGEN) {
      setErrores((prev) => ({ ...prev, imagen: 'La imagen no puede superar los 8 MB.' }));
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
      setErrores((prev) => ({ ...prev, imagen: 'No se pudo leer el archivo seleccionado.' }));
      setNombreArchivo('');
    };
    lector.readAsDataURL(archivo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorApi(null);

    const nuevosErrores = validar(formData);
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    const body = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim(),
      precio: Number(formData.precio),
      stock: formData.stock !== '' ? Number(formData.stock) : 0,
      imagenUrl: formData.imagenUrl.trim(),
      categoria: formData.categoria.trim(),
      dimensiones: formData.dimensiones.trim(),
      materiales: formData.materiales
        .split(',')
        .map((material) => material.trim())
        .filter(Boolean),
      destacado: Boolean(formData.destacado),
    };

    setEnviando(true);
    try {
      await onGuardar(body);
    } catch (err) {
      setErrorApi(err.message || 'No se pudo conectar con el servidor');
      setEnviando(false);
    }
  };

  return (
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

      {/* Categoría + Dimensiones en fila */}
      <div className="admin-form__row">
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

        <div className="admin-form__group">
          <label className="admin-form__label" htmlFor="dimensiones">Dimensiones</label>
          <input
            id="dimensiones"
            className="admin-form__input"
            type="text"
            name="dimensiones"
            value={formData.dimensiones}
            onChange={handleChange}
            placeholder="Ej: 220cm × 90cm × 80cm"
          />
        </div>
      </div>

      {/* Materiales */}
      <div className="admin-form__group">
        <label className="admin-form__label" htmlFor="materiales">Materiales</label>
        <input
          id="materiales"
          className="admin-form__input"
          type="text"
          name="materiales"
          value={formData.materiales}
          onChange={handleChange}
          placeholder="Ej: Algarrobo macizo, Lana merino, Cera de abejas"
          aria-describedby="materiales-ayuda"
        />
        <span className="admin-form__hint" id="materiales-ayuda">
          Separados por comas. Es lo que se muestra como etiquetas en el detalle de la pieza.
        </span>
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

      {/* Destacado */}
      <div className="admin-form__check">
        <input
          id="destacado"
          type="checkbox"
          name="destacado"
          checked={formData.destacado}
          onChange={handleChange}
        />
        <label htmlFor="destacado">Mostrar esta pieza entre las destacadas de la portada</label>
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
          onClick={onCancelar}
          disabled={enviando}
        >
          Cancelar
        </button>
        <button type="submit" className="admin-form__btn-guardar" disabled={enviando}>
          {enviando ? textoGuardando : textoGuardar}
        </button>
      </div>

    </form>
  );
}

export default FormularioProducto;
