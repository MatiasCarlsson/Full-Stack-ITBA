import { Link } from 'react-router-dom';
import './AdminPage.css';

function AdminPage() {
  return (
    <main className="admin-home">
      <div className="admin-home__header">
        <p className="admin-home__eyebrow">Administración</p>
        <h1 className="admin-home__title">Panel de administración</h1>
        <p className="admin-home__description">
          Gestioná el catálogo de Hermanos Jota desde este espacio privado.
        </p>
      </div>

      <Link className="admin-home__action" to="/admin/crear-producto">
        Publicar nuevo producto
      </Link>
    </main>
  );
}

export default AdminPage;
