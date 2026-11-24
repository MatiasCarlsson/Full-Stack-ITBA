import { render, screen, within, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import { ProductCard, ProductDetail, ContactForm, CartDrawer, RutaProtegida } from './components';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import CrearProductoPage from './pages/CrearProductoPage';
import LoginPage from './pages/LoginPage';
import RegistroPage from './pages/RegistroPage';
import PerfilPage from './pages/PerfilPage';
import { guardarClaveAdmin, olvidarClaveAdmin } from './services/adminAuth';
import { AUTH_STORAGE_KEY, guardarSesion } from './services/authService';

// Limpieza entre pruebas para mantener aislamiento total de sessionStorage y localStorage
afterEach(() => {
  olvidarClaveAdmin();
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.localStorage.removeItem('hermanos-jota-carrito-v1');
});

test('renderiza el nombre de la marca Hermanos Jota', () => {
  render(<App />);
  const brandElements = screen.getAllByText(/Hermanos Jota/i);
  expect(brandElements.length).toBeGreaterThan(0);
});

test('renderiza los enlaces de navegación, acceso de usuario y botón de carrito', () => {
  render(<App />);
  expect(screen.getByRole('link', { name: /^catálogo$/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /^contacto$/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /^ingresar$/i })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /\+ publicar/i })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /carrito/i })).toBeInTheDocument();
});

const mockProducto = {
  _id: '6ae36b21f12dd7482a1421bd',
  nombre: 'Mesa de Comedor Roble',
  precio: 350000,
  categoria: 'Mesas',
  imagenUrl: '/imagenes/mesa-comedor-roble.png',
  destacado: true,
  stock: 12,
  descripcion: 'Mesa de diseño nórdico con tapa maciza.',
  dimensiones: '200 x 100 x 75 cm',
  materiales: ['Roble macizo', 'Aceite natural'],
};

test('ProductCard renderiza botón "Agregar" con aria-label y SVG de carrito dentro de Router', () => {
  render(
    <MemoryRouter>
      <ProductCard producto={mockProducto} onAgregarAlCarrito={() => {}} />
    </MemoryRouter>
  );
  const btnAgregar = screen.getByRole('button', {
    name: /agregar mesa de comedor roble al carrito/i,
  });
  expect(btnAgregar).toBeInTheDocument();
  expect(btnAgregar).toHaveTextContent(/agregar/i);
  expect(within(btnAgregar).getByTestId('cart-icon')).toBeInTheDocument();
});

test('ProductDetail renderiza botón "Agregar" con aria-label y SVG de carrito', () => {
  render(
    <ProductDetail
      producto={mockProducto}
      onVolver={() => {}}
      onAgregarAlCarrito={() => {}}
      onAbrirCarrito={() => {}}
    />
  );
  const btnAgregar = screen.getByRole('button', {
    name: /agregar mesa de comedor roble al carrito/i,
  });
  expect(btnAgregar).toBeInTheDocument();
  expect(btnAgregar).toHaveTextContent(/agregar/i);
  expect(within(btnAgregar).getByTestId('cart-icon')).toBeInTheDocument();
});

test('ContactForm renderiza campos de nombre, email, mensaje y botón de envío', () => {
  render(<ContactForm />);
  expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/mensaje/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /enviar consulta/i })).toBeInTheDocument();
});

test('sin la clave de administración, el alta de producto no se muestra', () => {
  render(
    <MemoryRouter>
      <CrearProductoPage />
    </MemoryRouter>
  );
  expect(screen.getByLabelText(/clave de administración/i)).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /alta de producto/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /guardar producto/i })).not.toBeInTheDocument();
});

test('con la clave cargada, CrearProductoPage renderiza los campos del formulario', () => {
  guardarClaveAdmin('clave-de-prueba');

  render(
    <MemoryRouter>
      <CrearProductoPage />
    </MemoryRouter>
  );
  expect(screen.getByRole('heading', { name: /alta de producto/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/precio/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/stock/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /guardar producto/i })).toBeInTheDocument();
});

test('el formulario expone los campos del modelo que antes no se podían editar', () => {
  guardarClaveAdmin('clave-de-prueba');

  render(
    <MemoryRouter>
      <CrearProductoPage />
    </MemoryRouter>
  );
  expect(screen.getByLabelText(/dimensiones/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/materiales/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/destacadas de la portada/i)).toBeInTheDocument();
});

test('el formulario de alta no envía nada si faltan nombre y precio', () => {
  guardarClaveAdmin('clave-de-prueba');

  render(
    <MemoryRouter>
      <CrearProductoPage />
    </MemoryRouter>
  );
  fireEvent.click(screen.getByRole('button', { name: /guardar producto/i }));

  expect(screen.getByText(/el nombre es obligatorio/i)).toBeInTheDocument();
  expect(screen.getByText(/el precio es obligatorio/i)).toBeInTheDocument();
});

test('el botón de tema alterna el atributo data-theme del documento', () => {
  render(<App />);

  const boton = screen.getByRole('button', { name: /cambiar al tema (oscuro|claro)/i });
  const inicial = document.documentElement.getAttribute('data-theme');

  fireEvent.click(boton);
  const despues = document.documentElement.getAttribute('data-theme');
  expect(despues).not.toBe(inicial);

  fireEvent.click(boton);
  expect(document.documentElement.getAttribute('data-theme')).toBe(inicial);
});

test('el tema elegido queda guardado para la próxima visita', () => {
  window.localStorage.removeItem('hermanos-jota-tema');
  render(<App />);

  fireEvent.click(screen.getByRole('button', { name: /cambiar al tema (oscuro|claro)/i }));
  expect(window.localStorage.getItem('hermanos-jota-tema')).toMatch(/^(claro|oscuro)$/);
});

// ── Pruebas Sprint 7-8: Autenticación, rutas protegidas y flujo de compra ──

test('RutaProtegida redirige a /login cuando el visitante no está autenticado', () => {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/perfil']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/perfil"
            element={
              <RutaProtegida>
                <PerfilPage />
              </RutaProtegida>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );

  expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
});

test('RegistroPage valida campos obligatorios y contraseñas coincidentes', () => {
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/registro']}>
        <RegistroPage />
      </MemoryRouter>
    </AuthProvider>
  );

  fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: 'A' } });
  fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'invalido' } });
  fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: '123456' } });
  fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: '654321' } });
  fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

  expect(screen.getByText(/mínimo 2 caracteres/i)).toBeInTheDocument();
  expect(screen.getByText(/correo electrónico válido/i)).toBeInTheDocument();
  expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
});

test('CartDrawer exige iniciar sesión antes de finalizar compra si no hay usuario logueado', () => {
  render(
    <AuthProvider>
      <CartProvider>
        <MemoryRouter>
          <CartDrawer
            abierto={true}
            items={[{ ...mockProducto, cantidad: 1 }]}
            onCerrar={() => {}}
          />
        </MemoryRouter>
      </CartProvider>
    </AuthProvider>
  );

  expect(screen.getByRole('button', { name: /iniciar sesión para comprar/i })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /finalizar compra/i })).not.toBeInTheDocument();
});

test('CartDrawer habilita "Finalizar Compra" cuando el usuario tiene sesión activa', () => {
  guardarSesion({
    token: 'jwt-simulado-test',
    usuario: {
      id: 'u1',
      nombre: 'Clara Mendoza',
      email: 'clara@ejemplo.com',
      direccion: 'Av. San Juan 2847',
    },
  });

  render(
    <AuthProvider>
      <CartProvider>
        <MemoryRouter>
          <CartDrawer
            abierto={true}
            items={[{ ...mockProducto, cantidad: 2 }]}
            onCerrar={() => {}}
          />
        </MemoryRouter>
      </CartProvider>
    </AuthProvider>
  );

  expect(screen.getByRole('button', { name: /finalizar compra/i })).toBeInTheDocument();
  expect(screen.getByText(/Clara Mendoza/i)).toBeInTheDocument();
});
