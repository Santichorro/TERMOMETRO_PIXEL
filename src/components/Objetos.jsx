import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import useMedia from '../lib/useMedia.js';
import PixelIcon from './PixelIcon.jsx';
import { OBJETOS } from '../config/objetos.js';
import { plantilla } from '../config/textos.js';

// ==========================================================
// FICHA de un objeto del planeta (fábrica, estación, boya, termómetro).
// En PC aparece junto al planeta; en celular, como tarjeta centrada por delante
// de todo (con un velo detrás que también la cierra).
// ==========================================================

export default function FichaObjeto({ id, datos, onCerrar }) {
  const celular = useMedia('(max-width: 640px)');

  useEffect(() => {
    if (!id) return;
    const tecla = e => e.key === 'Escape' && onCerrar();
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [id, onCerrar]);

  const obj = OBJETOS.find(o => o.id === id);
  if (!obj) return null;
  const ficha = (
    <div key={obj.id} id="ficha-objeto" className="ficha panel" role="dialog" aria-label={obj.titulo}>
      <button type="button" className="ficha-cerrar" onClick={onCerrar} aria-label="Cerrar">
        <PixelIcon nombre="cerrar" tamano={14} />
      </button>
      <p className="ficha-nombre">{obj.nombre}</p>
      <h3>{obj.titulo}</h3>
      <p>{plantilla(obj.texto, datos)}</p>
    </div>
  );
  if (!celular) return ficha;
  return createPortal(
    <div className="ficha-capa" onClick={onCerrar}>
      <div onClick={e => e.stopPropagation()}>{ficha}</div>
    </div>,
    document.body,
  );
}
