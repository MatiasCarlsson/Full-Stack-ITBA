// components/common/Toast.jsx
import { useCart } from '../../context/CartContext';

export default function Toast() {
  const { toastMensaje } = useCart();

  if (!toastMensaje) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      {toastMensaje}
    </div>
  );
}
