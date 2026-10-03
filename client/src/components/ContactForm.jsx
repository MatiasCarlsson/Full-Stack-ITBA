// components/ContactForm.jsx
import { useState, useRef, useEffect } from 'react';
import { MailIcon } from './Icons';
import './ContactForm.css';

/**
 * ContactForm — Formulario de contacto con manejo de estado local.
 * Campos: nombre, email, mensaje.
 * Incluye validación de campos, estado de envío y mensaje de confirmación.
 */
function ContactForm() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    mensaje: '',
  });

  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const timerRef = useRef(null);

  // Limpiar timers pendientes si el componente se desmonta
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Validación de campos
  const validar = () => {
    const errs = {};
    if (!formData.nombre.trim()) {
      errs.nombre = 'Por favor ingresá tu nombre completo.';
    }
    if (!formData.email.trim()) {
      errs.email = 'Por favor ingresá tu correo electrónico.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'El formato de correo no es válido (ej: nombre@correo.com).';
    }
    if (!formData.mensaje.trim()) {
      errs.mensaje = 'Por favor escribí tu consulta o mensaje.';
    } else if (formData.mensaje.trim().length < 10) {
      errs.mensaje = 'El mensaje debe tener al menos 10 caracteres.';
    }
    return errs;
  };

  // Handler de cambio de inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error del campo si el usuario lo corrige
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handler de envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    const nuevosErrores = validar();

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setEnviando(true);
    setErrores({});

    // Simulación de envío con limpieza en unmount
    timerRef.current = setTimeout(() => {
      setEnviando(false);
      setEnviado(true);
    }, 1000);
  };

  const handleNuevoMensaje = () => {
    setEnviado(false);
    setFormData({ nombre: '', email: '', mensaje: '' });
    setErrores({});
  };

  // Renderizado condicional: éxito o formulario
  if (enviado) {
    return (
      <div className="contact-form contact-form__exito" role="status" aria-live="polite">
        <div className="contact-form__exito-icono" aria-hidden="true">
          <MailIcon size={44} />
        </div>
        <h3>¡Mensaje enviado con éxito!</h3>
        <p>
          Gracias, <strong>{formData.nombre}</strong>. Recibimos tu consulta y te responderemos
          a la brevedad a <strong>{formData.email}</strong>.
        </p>
        <button
          type="button"
          className="contact-form__nuevo"
          onClick={handleNuevoMensaje}
        >
          Enviar otra consulta
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>

      <div className="contact-form__group">
        <label className="contact-form__label" htmlFor="nombre">
          Nombre completo *
        </label>
        <input
          id="nombre"
          className={`contact-form__input ${errores.nombre ? 'contact-form__input--error' : ''}`}
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ej: Martina Rossi"
          aria-invalid={!!errores.nombre}
          aria-describedby={errores.nombre ? 'nombre-error' : undefined}
          required
        />
        {errores.nombre && (
          <span id="nombre-error" className="contact-form__error-text">
            {errores.nombre}
          </span>
        )}
      </div>

      <div className="contact-form__group">
        <label className="contact-form__label" htmlFor="email">
          Correo electrónico *
        </label>
        <input
          id="email"
          className={`contact-form__input ${errores.email ? 'contact-form__input--error' : ''}`}
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="tu@email.com"
          aria-invalid={!!errores.email}
          aria-describedby={errores.email ? 'email-error' : undefined}
          required
        />
        {errores.email && (
          <span id="email-error" className="contact-form__error-text">
            {errores.email}
          </span>
        )}
      </div>

      <div className="contact-form__group">
        <label className="contact-form__label" htmlFor="mensaje">
          Mensaje o consulta *
        </label>
        <textarea
          id="mensaje"
          className={`contact-form__textarea ${errores.mensaje ? 'contact-form__textarea--error' : ''}`}
          name="mensaje"
          value={formData.mensaje}
          onChange={handleChange}
          placeholder="Contanos en qué pieza o proyecto personalizado estás pensando..."
          rows="5"
          aria-invalid={!!errores.mensaje}
          aria-describedby={errores.mensaje ? 'mensaje-error' : undefined}
          required
        />
        {errores.mensaje && (
          <span id="mensaje-error" className="contact-form__error-text">
            {errores.mensaje}
          </span>
        )}
      </div>

      <button
        type="submit"
        className="contact-form__submit"
        disabled={enviando}
      >
        {enviando ? 'Enviando consulta…' : 'Enviar consulta'}
      </button>

    </form>
  );
}

export default ContactForm;
