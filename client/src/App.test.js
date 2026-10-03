import { render, screen, within } from '@testing-library/react';
import App from './App';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import ContactForm from './components/ContactForm';

test('renderiza el nombre de la marca Hermanos Jota', () => {
  render(<App />);
  const brandElements = screen.getAllByText(/Hermanos Jota/i);
  expect(brandElements.length).toBeGreaterThan(0);
});

test('renderiza los enlaces de navegación y botón de carrito', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /^catálogo$/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^contacto$/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /carrito/i })).toBeInTheDocument();
});

const mockProducto = {
  id: 1,
  nombre: 'Mesa de Comedor Roble',
  precio: 350000,
  categoria: 'Mesas',
  imagen: '/imagenes/mesa-comedor-roble.png',
  destacado: true,
  stock: 12,
  descripcion: 'Mesa de diseño nórdico con tapa maciza.',
  dimensiones: '200 x 100 x 75 cm',
  materiales: ['Roble macizo', 'Aceite natural'],
};

test('ProductCard renderiza botón "Agregar" con aria-label y SVG de carrito', () => {
  render(
    <ProductCard
      producto={mockProducto}
      onVerDetalle={() => {}}
      onAgregarAlCarrito={() => {}}
    />
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
