import { useState } from 'react';
import PixelIcon from './PixelIcon.jsx';
import { MISIONES, NIVELES } from '../config/misiones.js';
import { TEXTOS, plantilla } from '../config/textos.js';

// ==========================================================
// MISIONES con XP. El estado vive en App; aquí solo se muestra
// y se maneja la misión de adivinar.
// ==========================================================

const fmt = v => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(2).replace('.', ',')}`;

export default function Misiones({ completas, datosLogro, onAdivinar, abierto, onAlternar }) {
  const [estimacion, setEstimacion] = useState(0.5);
  const xp = MISIONES.filter(m => completas[m.id]).reduce((s, m) => s + m.xp, 0);
  const total = MISIONES.reduce((s, m) => s + m.xp, 0);
  const nivel = [...NIVELES].reverse().find(n => xp >= n.xp);
  const nivelNum = NIVELES.indexOf(nivel) + 1;
  const hechas = MISIONES.filter(m => completas[m.id]).length;

  return (
    <aside className={`misiones panel ${abierto ? 'abierto' : ''}`} aria-label={TEXTOS.misiones.titulo}>
      <button type="button" className="misiones-cabeza" onClick={onAlternar} aria-expanded={abierto}>
        <span className="misiones-titulo">{TEXTOS.misiones.titulo}</span>
        <span className="misiones-cuenta">
          {plantilla(TEXTOS.misiones.completas, { c: hechas, t: MISIONES.length })}
          <span className="misiones-ver"> · {abierto ? 'ocultar' : 'ver'}</span>
        </span>
      </button>

      <div className="xp">
        <div className="xp-fila">
          <PixelIcon nombre="estrella" tamano={14} color="var(--amarillo-claro)" />
          <span className="xp-nivel">{plantilla(TEXTOS.misiones.nivel, { n: nivelNum })} · {nivel.nombre}</span>
          <span className="xp-num">{xp} XP</span>
        </div>
        <div className="xp-barra" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={xp}>
          {Array.from({ length: 20 }, (_, i) => (
            <span key={i} className={i < Math.round((xp / total) * 20) ? 'lleno' : ''} />
          ))}
        </div>
      </div>

      <ol className="misiones-lista">
        {MISIONES.map(m => {
          const hecha = Boolean(completas[m.id]);
          return (
            <li key={m.id} className={`mision ${hecha ? 'hecha' : ''}`}>
              <span className="mision-check" aria-hidden="true">
                {hecha && <PixelIcon nombre="check" tamano={12} color="var(--noche)" />}
              </span>
              <div className="mision-cuerpo">
                <h3>{m.titulo} <span className="mision-xp">+{m.xp} XP</span></h3>
                <p>{hecha ? plantilla(m.logro, datosLogro[m.id] ?? {}) : m.texto}</p>
                {m.tipo === 'adivinar' && !hecha && (
                  <div className="adivinar">
                    <label>
                      <span className="adivinar-valor">{fmt(estimacion)} °C</span>
                      <input type="range" min="0" max="3" step="0.05" value={estimacion}
                        onChange={e => setEstimacion(Number(e.target.value))} />
                    </label>
                    <button type="button" className="boton boton-chico" onClick={() => onAdivinar(estimacion)}>
                      {m.boton}
                    </button>
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
