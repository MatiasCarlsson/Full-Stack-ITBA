import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import ContactForm from './components/ContactForm';
import CrearProductoPage from './pages/CrearProductoPage';

test('renderiza el nombre de la marca Hermanos Jota', () => {
  render(<App />);
  const brandElements = screen.getAllByText(/Hermanos Jota/i);
  expect(brandElements.length).toBeGreaterThan(0);
});

test('renderiza los enlaces de navegación y botón de carrito', () => {
  render(<App />);
  expect(screen.getByRole('link', { name: /^catálogo$/i })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /^contacto$/i })).toBeInTheDocument();
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
      <ProductCard
        producto={mockProducto}
        onAgregarAlCarrito={() => {}}
      />
    </MemoryRouter>
  );
  const btnAgregar = screen.getByRole('button', { name: /agregar mesa de comedor roble al carrito/i });
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
  const btnAgregar = screen.getByRole('button', { name: /agregar mesa de comedor roble al carrito/i });
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

test('CrearProductoPage renderiza campos de formulario de alta de producto', () => {
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
