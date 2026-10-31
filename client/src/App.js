// App.js — Hermanos Jota E-commerce
// Refactorizado con CartProvider, React Router DOM y componentes desacoplados

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { TemaProvider } from './context/TemaContext';
import { Navbar, Footer, CartDrawer, Toast } from './components';
import InicioPage from './pages/InicioPage';
import CatalogoPage from './pages/CatalogoPage';
import DetallePage from './pages/DetallePage';
import ContactoPage from './pages/ContactoPage';
import AdminPage from './pages/AdminPage';
import CrearProductoPage from './pages/CrearProductoPage';
import EditarProductoPage from './pages/EditarProductoPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function App() {
  return (
    <TemaProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="app">
            {/* Toast de notificación flotante */}
            <Toast />

            {/* Barra de navegación principal */}
            <Navbar />

            {/* Rutas de React Router DOM */}
            <Routes>
              <Route path="/" element={<InicioPage />} />
              <Route path="/productos" element={<CatalogoPage />} />
              <Route path="/productos/:id" element={<DetallePage />} />
              <Route path="/contacto" element={<ContactoPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/crear-producto" element={<CrearProductoPage />} />
              <Route path="/admin/editar-producto/:id" element={<EditarProductoPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>

            {/* Panel lateral del carrito */}
            <CartDrawer />

            {/* Pie de página de la marca */}
            <Footer />
          </div>
        </BrowserRouter>
      </CartProvider>
    </TemaProvider>
  );
}

export default App;
