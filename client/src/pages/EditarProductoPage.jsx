// pages/EditarProductoPage.jsx
// Página /admin/editar-producto/:id — carga la pieza con useParams y la actualiza con PUT.
// Usa el mismo formulario que el alta, con los valores ya cargados.

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FormularioProducto, { productoAFormulario } from '../components/admin/FormularioProducto';
import GuardiaAdmin from '../components/admin/GuardiaAdmin';
import { getProductoById, updateProducto } from '../services/productService';
import './CrearProductoPage.css';

function EditarProductoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [valoresIniciales, setValoresIniciales] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  useEffect(() => {
    const controlador = new AbortController();

    getProductoById(id, controlador.signal)
      .then((producto) => setValoresIniciales(productoAFormulario(producto)))
      .catch((error) => {
        // Abortar al desmontar no es una falla que haya que mostrar.
        if (error.name === 'AbortError') return;
        setErrorCarga(error.message);
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargando(false);
      });

    return () => controlador.abort();
  }, [id]);

  const guardar = async (body) => {
    await updateProducto(id, body);
    navigate(`/productos/${id}`);
  };

  return (
    <GuardiaAdmin>
      <main className="admin-wrapper">
        <div className="admin-header">
          <h2 className="admin-titulo">Editar pieza</h2>
          <p className="admin-bajada">
            Cambiá lo que haga falta. Lo que dejes igual se guarda igual.
          </p>
        </div>

        {cargando && <p className="admin-estado">Cargando la pieza…</p>}

        {errorCarga && (
          <div className="admin-form__api-error" role="alert">
            ⚠ {errorCarga}
          </div>
        )}

        {/* El formulario arranca con los valores ya cargados, así que se monta recién
            cuando llegaron. Sin esto habría que sincronizar el estado después. */}
        {valoresIniciales && (
          <FormularioProducto
            valoresIniciales={valoresIniciales}
            onGuardar={guardar}
            onCancelar={() => navigate('/admin')}
            textoGuardar="Guardar cambios"
          />
        )}
      </main>
    </GuardiaAdmin>
  );
}

export default EditarProductoPage;
