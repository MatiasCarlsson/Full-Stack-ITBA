// pages/AdminPage.jsx
// Página /admin — panel de administración con el listado completo del catálogo.
// Desde acá se crea, se edita y se elimina: es la parte "leer, actualizar y borrar" del
// CRUD, que antes solo existía en la API y no tenía pantalla.

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GuardiaAdmin from '../components/admin/GuardiaAdmin';
import { EditIcon, TrashIcon } from '../components/common/Icons';
import { deleteProducto, getProductos } from '../services/productService';
import './AdminPage.css';

const formatearPrecio = (precio) =>
  typeof precio === 'number' ? `$ ${precio.toLocaleString('es-AR')}` : '—';

function PanelAdmin() {
  const navigate = useNavigate();

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [borrando, setBorrando] = useState(null);

  const cargar = useCallback(async (signal) => {
    setCargando(true);
    setError(null);
    try {
      setProductos(await getProductos(signal));
    } catch (fallo) {
      if (fallo.name === 'AbortError') return;
      setError(fallo.message);
    } finally {
      if (!signal || !signal.aborted) setCargando(false);
    }
  }, []);

  useEffect(() => {
    const controlador = new AbortController();
    cargar(controlador.signal);
    return () => controlador.abort();
  }, [cargar]);

  const eliminar = async (producto) => {
    const confirmado = window.confirm(
      `¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    setBorrando(producto._id);
    setError(null);
    try {
      await deleteProducto(producto._id);
      // Se saca de la lista sin volver a pedir todo el catálogo.
      setProductos((actuales) => actuales.filter((item) => item._id !== producto._id));
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setBorrando(null);
    }
  };

  return (
    <main className="admin-home">
      <div className="admin-home__header">
        <p className="admin-home__eyebrow">Administración</p>
        <h1 className="admin-home__title">Panel de administración</h1>
        <p className="admin-home__description">
          Gestioná el catálogo de Hermanos Jota desde este espacio privado.
        </p>
      </div>

      <div className="admin-lista__barra">
        <span className="admin-lista__conteo">
          {cargando ? 'Cargando…' : `${productos.length} piezas en el catálogo`}
        </span>
        <Link className="admin-home__action" to="/admin/crear-producto">
          Publicar nuevo producto
        </Link>
      </div>

      {error && (
        <div className="admin-form__api-error" role="alert">
          ⚠ {error}
        </div>
      )}

      {!cargando && productos.length === 0 && !error && (
        <p className="admin-estado">
          Todavía no hay piezas cargadas. Empezá publicando la primera.
        </p>
      )}

      {productos.length > 0 && (
        <ul className="admin-lista">
          {productos.map((producto) => (
            <li className="admin-lista__item" key={producto._id}>
              <div className="admin-lista__miniatura">
                {producto.imagenUrl ? (
                  <img src={producto.imagenUrl} alt="" aria-hidden="true" />
                ) : (
                  <span className="admin-lista__sin-foto">Sin foto</span>
                )}
              </div>

              <div className="admin-lista__datos">
                <Link className="admin-lista__nombre" to={`/productos/${producto._id}`}>
                  {producto.nombre}
                </Link>
                <span className="admin-lista__meta">
                  {producto.categoria || 'Sin categoría'} · {formatearPrecio(producto.precio)}
                </span>
                <span className="admin-lista__meta">
                  {producto.stock > 0 ? `Stock: ${producto.stock}` : 'Sin stock'}
                  {producto.destacado && ' · Destacada'}
                </span>
              </div>

              <div className="admin-lista__acciones">
                <button
                  type="button"
                  className="admin-lista__btn"
                  onClick={() => navigate(`/admin/editar-producto/${producto._id}`)}
                  aria-label={`Editar ${producto.nombre}`}
                >
                  <EditIcon size={16} />
                  <span>Editar</span>
                </button>
                <button
                  type="button"
                  className="admin-lista__btn admin-lista__btn--borrar"
                  onClick={() => eliminar(producto)}
                  disabled={borrando === producto._id}
                  aria-label={`Eliminar ${producto.nombre}`}
                >
                  <TrashIcon size={16} />
                  <span>{borrando === producto._id ? 'Borrando…' : 'Eliminar'}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function AdminPage() {
  return (
    <GuardiaAdmin>
      <PanelAdmin />
    </GuardiaAdmin>
  );
}

export default AdminPage;
