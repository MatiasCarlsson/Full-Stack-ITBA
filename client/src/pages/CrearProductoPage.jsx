// pages/CrearProductoPage.jsx
// Página /admin/crear-producto — alta de una pieza con POST a la API.
// El formulario es el mismo que usa la edición: vive en components/admin/FormularioProducto.

import { useNavigate } from 'react-router-dom';
import FormularioProducto, { CAMPOS_VACIOS } from '../components/admin/FormularioProducto';
import GuardiaAdmin from '../components/admin/GuardiaAdmin';
import { createProducto } from '../services/productService';
import './CrearProductoPage.css';

function CrearProductoPage() {
  const navigate = useNavigate();

  // Si falla, la excepción sube al formulario, que la muestra y vuelve a habilitar el botón.
  const guardar = async (body) => {
    const creado = await createProducto(body);
    navigate(`/productos/${creado._id}`);
  };

  return (
    <GuardiaAdmin>
      <main className="admin-wrapper">
        <div className="admin-header">
          <h2 className="admin-titulo">Alta de Producto</h2>
          <p className="admin-bajada">
            Completá los campos para agregar una nueva pieza al catálogo.
          </p>
        </div>

        <FormularioProducto
          valoresIniciales={CAMPOS_VACIOS}
          onGuardar={guardar}
          onCancelar={() => navigate('/admin')}
          textoGuardar="Guardar producto"
        />
      </main>
    </GuardiaAdmin>
  );
}

export default CrearProductoPage;
