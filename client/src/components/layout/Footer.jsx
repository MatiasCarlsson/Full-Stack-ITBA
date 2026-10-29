// components/Footer.jsx
import './Footer.css';

/**
 * Footer — Pie de página con info de la marca Hermanos Jota.
 */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">

        {/* Columna marca */}
        <div>
          <p className="footer__brand-name">Hermanos Jota</p>
          <p className="footer__brand-desc">
            Muebles de autor con madera certificada FSC y acabados naturales.
            Cada pieza cuenta la historia de manos expertas y materiales nobles.
          </p>
        </div>

        {/* Columna contacto */}
        <div>
          <p className="footer__col-title">Contacto</p>
          <ul className="footer__list">
            <li><strong>Showroom:</strong> Av. San Juan 2847, San Cristóbal, CABA</li>
            <li><strong>Email:</strong> info@hermanosjota.com.ar</li>
            <li><strong>WhatsApp:</strong> +54 11 4567-8900</li>
            <li><strong>Instagram:</strong> @hermanosjota_ba</li>
          </ul>
        </div>

        {/* Columna horarios */}
        <div>
          <p className="footer__col-title">Horarios</p>
          <ul className="footer__list">
            <li>Lunes a Viernes: 10:00 – 19:00</li>
            <li>Sábados: 10:00 – 14:00</li>
          </ul>
          <p className="footer__col-title" style={{ marginTop: '1.5rem' }}>Programa</p>
          <ul className="footer__list">
            <li>Garantía estructural 10 años</li>
            <li>Servicio de restauración</li>
            <li>Recompra garantizada 40%</li>
          </ul>
        </div>

      </div>

      <div className="footer__bottom">
        <span className="footer__copy">© 2026 Hermanos Jota. Todos los derechos reservados.</span>
        <span className="footer__eco">Madera certificada FSC · 30% materiales recuperados</span>
      </div>
    </footer>
  );
}

export default Footer;
