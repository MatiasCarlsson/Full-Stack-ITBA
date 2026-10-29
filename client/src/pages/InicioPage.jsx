// pages/InicioPage.jsx
// Página de inicio: hero section + catálogo completo de productos
import ProductList from '../components/ProductList';

function InicioPage({ onVerDetalle, onAgregarAlCarrito }) {
  return (
    <>
      <section className="hero">
        <p className="hero__eyebrow">Artesanía · Sustentabilidad · Buenos Aires</p>
        <h1 className="hero__title">Cada pieza cuenta<br />una historia</h1>
        <p className="hero__subtitle">
          Muebles de autor elaborados con madera certificada FSC y acabados
          naturales que envejecen con gracia.
        </p>
      </section>

      <main className="app__main">
        <ProductList
          onVerDetalle={onVerDetalle}
          onAgregarAlCarrito={onAgregarAlCarrito}
        />
      </main>
    </>
  );
}

export default InicioPage;
