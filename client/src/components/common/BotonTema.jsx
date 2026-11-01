// components/common/BotonTema.jsx
// Botón que alterna entre el tema claro y el oscuro.

import { useTema } from '../../context/TemaContext';
import { SunIcon, MoonIcon } from './Icons';

function BotonTema() {
  const { esOscuro, alternarTema } = useTema();

  return (
    <button
      type="button"
      className="boton-tema"
      onClick={alternarTema}
      aria-label={esOscuro ? 'Cambiar al tema claro' : 'Cambiar al tema oscuro'}
      title={esOscuro ? 'Tema claro' : 'Tema oscuro'}
    >
      {esOscuro ? <SunIcon size={18} /> : <MoonIcon size={18} />}
    </button>
  );
}

export default BotonTema;
