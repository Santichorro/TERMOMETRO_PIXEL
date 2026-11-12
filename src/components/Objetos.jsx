import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import useMedia from '../lib/useMedia.js';
import Sprite from './Sprites.jsx';
import PixelIcon from './PixelIcon.jsx';
import { OBJETOS } from '../config/objetos.js';
import { plantilla } from '../config/textos.js';

// ==========================================================
// OBJETOS INTERACTIVOS sobre el suelo del paisaje.
// Al tocarlos abren una ficha que explica de dónde salen los datos.
// ==========================================================

export default function Objetos({ datos, onAbrir }) {
  const [abierto, setAbierto] = useState(null);
  const celular = useMedia('(max-width: 640px)');

  useEffect(() => {
    if (!abierto) return;
    const tecla = e => e.key === 'Escape' && setAbierto(null);
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [abierto]);

  const obj = OBJETOS.find(o => o.id === abierto);
  const ficha = obj && (
    <div id="ficha-objeto" className="ficha panel" role="dialog" aria-label={obj.titulo}
      style={{ '--x': `${Math.min(80, Math.max(20, obj.x))}%` }}>
      <button type="button" className="ficha-cerrar" onClick={() => setAbierto(null)} aria-label="Cerrar">
        <PixelIcon nombre="cerrar" tamano={14} />
      </button>
      <h3>{obj.titulo}</h3>
      <p>{plantilla(obj.texto, datos)}</p>
    </div>
  );

  return (
    <div className="objetos">
      <ul className="objetos-fila">
        {OBJETOS.map(o => (
          <li key={o.id} style={{ '--x': `${o.x}%` }}>
            <button type="button" className={`objeto ${abierto === o.id ? 'activo' : ''}`}
              aria-expanded={abierto === o.id} aria-controls="ficha-objeto"
              onClick={() => {
                setAbierto(a => (a === o.id ? null : o.id));
                onAbrir(o.id);
              }}>
              {o.imagen ? <img src={o.imagen} alt="" className="pixel-img" width="48" height="48" /> : <Sprite nombre={o.sprite} />}
              <span className="objeto-nombre">{o.nombre}</span>
            </button>
          </li>
        ))}
      </ul>
      {obj && (celular ? createPortal(ficha, document.body) : ficha)}
    </div>
  );
}
