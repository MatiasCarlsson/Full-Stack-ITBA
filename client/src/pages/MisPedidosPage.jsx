// pages/MisPedidosPage.jsx
// Ruta protegida /mis-pedidos — historial de compras del usuario autenticado

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenerMisPedidos } from '../services/orderService';
import {
  PackageIcon,
  AlertIcon,
  RefreshIcon,
  MapPinIcon,
  CalendarIcon,
} from '../components/common/Icons';
import { formatearPrecio, formatearFechaHora } from '../utils/format';
import './CuentaPages.css';

const ETIQUETAS_ESTADO = {
  confirmado: { texto: 'Confirmado', clase: 'confirmado' },
  en_taller: { texto: 'En taller', clase: 'en-taller' },
  enviado: { texto: 'En camino', clase: 'enviado' },
  entregado: { texto: 'Entregado', clase: 'entregado' },
  cancelado: { texto: 'Cancelado', clase: 'cancelado' },
};

export default function MisPedidosPage() {
  const { token, usuario } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargarPedidos = useCallback(
    async (signal) => {
      setCargando(true);
      setError('');
      try {
        const data = await obtenerMisPedidos(token, signal);
        setPedidos(Array.isArray(data.pedidos) ? data.pedidos : []);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'No pudimos cargar tu historial de pedidos.');
      } finally {
        if (!signal || !signal.aborted) setCargando(false);
      }
    },
    [token]
  );

  useEffect(() => {
    const controller = new AbortController();
    cargarPedidos(controller.signal);
    return () => controller.abort();
  }, [cargarPedidos]);

  return (
    <main className="cuenta-page">
      <div className="pedidos-container">
        <header className="pedidos-header">
          <div>
            <h1 className="pedidos-header__title">Mis pedidos</h1>
            <p className="pedidos-header__subtitle">
              Historial de piezas encargadas a nombre de {usuario?.nombre}.
            </p>
          </div>
          <Link to="/productos" className="cuenta-btn cuenta-btn--secundario">
            Seguir explorando
          </Link>
        </header>

        {cargando ? (
          <div className="pedidos-skeletons" aria-busy="true" aria-label="Cargando pedidos">
            {[1, 2].map((n) => (
              <div key={n} className="pedido-card pedido-card--skeleton" />
            ))}
          </div>
        ) : error ? (
          <div className="product-list__estado product-list__estado--error" role="alert">
            <div className="product-list__error-icono" aria-hidden="true">
              <AlertIcon size={36} />
            </div>
            <h2 className="product-list__error-msg">No pudimos consultar tus pedidos</h2>
            <p className="product-list__error-detail">{error}</p>
            <button
              type="button"
              className="product-list__reintentar"
              onClick={() => cargarPedidos()}
            >
              <RefreshIcon size={16} /> Reintentar
            </button>
          </div>
        ) : pedidos.length === 0 ? (
          <section className="pedidos-vacio">
            <div className="pedidos-vacio__icono" aria-hidden="true">
              <PackageIcon size={44} />
            </div>
            <h2 className="pedidos-vacio__titulo">Todavía no hiciste pedidos</h2>
            <p className="pedidos-vacio__texto">
              Elegí las piezas que quieras desde el catálogo y confirmá tu primera compra
              desde el carrito.
            </p>
            <Link to="/productos" className="cuenta-btn cuenta-btn--primario">
              Explorar catálogo
            </Link>
          </section>
        ) : (
          <ul className="pedidos-lista">
            {pedidos.map((pedido) => {
              const estado = ETIQUETAS_ESTADO[pedido.estado] || {
                texto: pedido.estado || 'Confirmado',
                clase: 'confirmado',
              };
              return (
                <li key={pedido._id} className="pedido-card">
                  <div className="pedido-card__top">
                    <div>
                      <span className="pedido-card__orden">{pedido.numeroOrden}</span>
                      <p className="pedido-card__fecha">
                        <CalendarIcon size={14} /> {formatearFechaHora(pedido.createdAt)}
                      </p>
                    </div>
                    <span className={`pedido-estado pedido-estado--${estado.clase}`}>
                      {estado.texto}
                    </span>
                  </div>

                  <ul className="pedido-card__items">
                    {pedido.items.map((item, idx) => (
                      <li key={`${pedido._id}-${item.producto || idx}`} className="pedido-item">
                        <img
                          className="pedido-item__img"
                          src={item.imagenUrl || '/imagenes/logo.svg'}
                          alt={item.nombre}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/imagenes/logo.svg';
                          }}
                        />
                        <div className="pedido-item__info">
                          <span className="pedido-item__nombre">{item.nombre}</span>
                          <span className="pedido-item__meta">
                            {item.cantidad} {item.cantidad === 1 ? 'unidad' : 'unidades'} ×{' '}
                            {formatearPrecio(item.precioUnitario)}
                          </span>
                        </div>
                        <span className="pedido-item__subtotal">
                          {formatearPrecio(item.subtotal)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="pedido-card__footer">
                    <div className="pedido-card__entrega">
                      {pedido.direccionEntrega ? (
                        <span>
                          <MapPinIcon size={14} /> {pedido.direccionEntrega}
                        </span>
                      ) : (
                        <span>Entrega a coordinar con el taller</span>
                      )}
                      {pedido.notasEntrega ? (
                        <span className="pedido-card__notas">Nota: {pedido.notasEntrega}</span>
                      ) : null}
                    </div>
                    <div className="pedido-card__total">
                      <span className="pedido-card__total-label">Total</span>
                      <strong className="pedido-card__total-monto">
                        {formatearPrecio(pedido.total)}
                      </strong>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
