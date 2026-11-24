// pages/InicioPage.jsx
// Portada editorial asimétrica con escultura 3D lazy-loaded (Three.js) y catálogo completo

import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import ProductList from '../components/products/ProductList';
import { useOptionalAuth } from '../context/AuthContext';

const HeroSculpture3D = lazy(() => import('../components/hero/HeroSculpture3D'));

function HeroPlaceholder() {
  return (
    <div className="hero-stage hero-stage--fallback" aria-hidden="true">
      <img
        src="/imagenes/sillas-cordoba.png"
        alt=""
        loading="eager"
      />
    </div>
  );
}

function InicioPage() {
  const auth = useOptionalAuth();
  const estaAutenticado = Boolean(auth?.estaAutenticado);

  return (
    <>
      <section className="hero" aria-labelledby="hero-titulo">
        <div className="hero__inner">
          <div className="hero__copy">
            <p className="hero__origen">Taller de carpintería en San Cristóbal, Buenos Aires</p>
            <h1 id="hero-titulo" className="hero__title">
              Cada pieza cuenta una historia
            </h1>
            <p className="hero__subtitle">
              Muebles de autor ensamblados con madera certificada FSC, uniones de
              bronce y acabados al aceite natural que envejecen con gracia.
            </p>

            <div className="hero__actions">
              <a href="#catalogo" className="btn btn--primario hero__btn-primary">
                Explorar catálogo
              </a>
              {estaAutenticado ? (
                <Link to="/mis-pedidos" className="btn btn--secundario hero__btn-secondary">
                  Ver mis pedidos
                </Link>
              ) : (
                <Link to="/registro" className="btn btn--secundario hero__btn-secondary">
                  Crear cuenta
                </Link>
              )}
            </div>

            <dl className="hero__highlights">
              <div>
                <dt>Madera noble</dt>
                <dd>100% certificada FSC</dd>
              </div>
              <div>
                <dt>Respaldo real</dt>
                <dd>10 años de garantía</dd>
              </div>
              <div>
                <dt>Hecho en taller</dt>
                <dd>Entrega coordinada</dd>
              </div>
            </dl>
          </div>

          <div className="hero__media">
            <Suspense fallback={<HeroPlaceholder />}>
              <HeroSculpture3D />
            </Suspense>
          </div>
        </div>
      </section>

      <main id="catalogo" className="app__main">
        <ProductList />
      </main>
    </>
  );
}

export default InicioPage;
