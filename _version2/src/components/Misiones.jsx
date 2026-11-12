import { useEffect, useState } from 'react';
import PixelIcon from './PixelIcon.jsx';
import { MISIONES } from '../config/misiones.js';
import { progreso } from '../lib/progreso.js';
import { fmt } from '../lib/formato.js';
import { TEXTOS, plantilla } from '../config/textos.js';

// ==========================================================
// PANEL DE MISIONES (cajón lateral). El progreso vive en App.
// ==========================================================


export default function Misiones({ abierto, onCerrar, completas, datosLogro, onAdivinar }) {
  const [estimacion, setEstimacion] = useState(0.5);
  const [pistas, setPistas] = useState({});
  const { xp, total, nivel, nivelNum, hechas } = progreso(completas);

  useEffect(() => {
    if (!abierto) return;
    const tecla = e => e.key === 'Escape' && onCerrar();
    document.addEventListener('keydown', tecla);
    return () => document.removeEventListener('keydown', tecla);
  }, [abierto, onCerrar]);

  return (
    <aside className={`misiones ${abierto ? 'abierto' : ''}`} aria-label={TEXTOS.misiones.titulo} aria-hidden={!abierto} inert={!abierto}>
      <div className="misiones-cabeza">
        <h2>{TEXTOS.misiones.titulo}</h2>
        <button type="button" className="icono-boton" onClick={onCerrar} aria-label="Cerrar misiones">
          <PixelIcon nombre="cerrar" tamano={16} />
        </button>
      </div>

      <div className="xp">
        <div className="xp-fila">
          <PixelIcon nombre="estrella" tamano={16} color="var(--coral)" />
          <span className="xp-nivel">{plantilla(TEXTOS.misiones.nivel, { n: nivelNum })} · {nivel.nombre}</span>
          <span className="xp-num">{xp} / {total} XP</span>
        </div>
        <div className="xp-barra" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={xp}>
          {Array.from({ length: 24 }, (_, i) => (
            <span key={i} className={i < Math.round((xp / total) * 24) ? 'lleno' : ''} />
          ))}
        </div>
        <p className="xp-cuenta">{plantilla(TEXTOS.misiones.completas, { c: hechas, t: MISIONES.length })}</p>
      </div>

      <ol className="misiones-lista">
        {MISIONES.map(m => {
          const hecha = Boolean(completas[m.id]);
          return (
            <li key={m.id} className={`mision ${hecha ? 'hecha' : ''}`}>
              <span className="mision-check" aria-hidden="true">
                {hecha && <PixelIcon nombre="check" tamano={12} color="#fff" />}
              </span>
              <div className="mision-cuerpo">
                <h3>{m.titulo} <span className="mision-xp">+{m.xp} XP</span></h3>
                <p>{hecha ? plantilla(m.logro, datosLogro[m.id] ?? {}) : m.texto}</p>
                {!hecha && (
                  <button type="button" className="pista-boton" aria-expanded={Boolean(pistas[m.id])}
                    onClick={() => setPistas(p => ({ ...p, [m.id]: !p[m.id] }))}>
                    {TEXTOS.misiones.pista}
                  </button>
                )}
                {!hecha && pistas[m.id] && <p className="pista">{m.pista}</p>}
                {m.tipo === 'adivinar' && !hecha && (
                  <div className="adivinar">
                    <label>
                      <span className="adivinar-valor">{fmt(estimacion)} °C</span>
                      <input type="range" min="0" max="3" step="0.05" value={estimacion}
                        onChange={e => setEstimacion(Number(e.target.value))} />
                    </label>
                    <button type="button" className="boton" onClick={() => onAdivinar(estimacion)}>{m.boton}</button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {hechas === MISIONES.length && <p className="misiones-final">{TEXTOS.misiones.final}</p>}
    </aside>
  );
}
