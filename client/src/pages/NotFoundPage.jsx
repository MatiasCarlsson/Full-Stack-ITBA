// pages/NotFoundPage.jsx
// Página 404 personalizada con diseño editorial de Hermanos Jota

import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main
      className="app__not-found"
      style={{
        textAlign: 'center',
        padding: '6rem 1.5rem',
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ fontSize: '3.5rem', marginBottom: '1rem' }} aria-hidden="true">
        🪵
      </span>
      <h2
        style={{
          fontFamily: 'var(--font-secundaria)',
          fontSize: '2rem',
          color: 'var(--color-siena)',
          marginBottom: '0.75rem',
        }}
      >
        Página no encontrada
      </h2>
      <p
        style={{
          color: 'var(--color-texto-suave)',
          maxWidth: '420px',
          marginBottom: '2rem',
        }}
      >
        La ruta o pieza que buscás no existe o ha sido reubicada en nuestro taller.
      </p>
      <Link to="/" className="btn btn--primario" style={{ textDecoration: 'none' }}>
        Volver al inicio
      </Link>
    </main>
  );
}
