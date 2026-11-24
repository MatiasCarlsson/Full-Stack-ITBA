// App.js — Hermanos Jota E-commerce (Sprint 7 & 8)
// Arquitectura con AuthProvider, CartProvider, TemaProvider, rutas protegidas y UX fluida

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { TemaProvider } from './context/TemaContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import Toast from './components/common/Toast';
import RutaProtegida from './components/auth/RutaProtegida';
import InicioPage from './pages/InicioPage';
import CatalogoPage from './pages/CatalogoPage';
import DetallePage from './pages/DetallePage';
import ContactoPage from './pages/ContactoPage';
import LoginPage from './pages/LoginPage';
import RegistroPage from './pages/RegistroPage';
import PerfilPage from './pages/PerfilPage';
import MisPedidosPage from './pages/MisPedidosPage';
import AdminPage from './pages/AdminPage';
import CrearProductoPage from './pages/CrearProductoPage';
import EditarProductoPage from './pages/EditarProductoPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [pathname]);
  return null;
}

function App() {
  return (
    <TemaProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <div className="app">
              <Toast />
              <Navbar />

              <Routes>
                <Route path="/" element={<InicioPage />} />
                <Route path="/productos" element={<CatalogoPage />} />
                <Route path="/productos/:id" element={<DetallePage />} />
                <Route path="/contacto" element={<ContactoPage />} />

                {/* Flujo de autenticación de usuarios (Sprint 7-8) */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registro" element={<RegistroPage />} />

                {/* Rutas privadas protegidas por JWT */}
                <Route
                  path="/perfil"
                  element={
                    <RutaProtegida>
                      <PerfilPage />
                    </RutaProtegida>
                  }
                />
                <Route
                  path="/mis-pedidos"
                  element={
                    <RutaProtegida>
                      <MisPedidosPage />
                    </RutaProtegida>
                  }
                />

                {/* Administración del catálogo */}
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/crear-producto" element={<CrearProductoPage />} />
                <Route path="/admin/editar-producto/:id" element={<EditarProductoPage />} />

                <Route path="*" element={<NotFoundPage />} />
              </Routes>

              <CartDrawer />
              <Footer />
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </TemaProvider>
  );
}

export default App;
