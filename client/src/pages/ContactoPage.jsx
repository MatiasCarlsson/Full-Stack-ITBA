// pages/ContactoPage.jsx
// Página /contacto — envuelve el formulario existente con header
import ContactForm from '../components/ContactForm';

function ContactoPage() {
  return (
    <main className="contacto-wrapper">
      <h2>Contacto con el Taller</h2>
      <p>Escribinos y coordinamos una visita al showroom o cotización personalizada.</p>
      <ContactForm />
    </main>
  );
}

export default ContactoPage;
