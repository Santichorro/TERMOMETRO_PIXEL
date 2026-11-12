import { useRef } from 'react';
import { stripeColor } from '../lib/colors.js';
import { TEXTOS, plantilla } from '../config/textos.js';

// ==========================================================
// LÍNEA DE TIEMPO: las franjas de calentamiento (una por año) son el selector.
// - Asas: eligen el período (desde / hasta).
// - Pasar el puntero o arrastrar entre las asas: recorre los años.
// - Teclado: flechas sobre cada asa.
// ==========================================================

const PRESETS = [null, 50, 20, 10];

export default function LineaTiempo({ anios, rango, onRango, anioActivo, onRecorrer }) {
  const barraRef = useRef(null);
  const arrastre = useRef(null);
  if (!anios.length) return <div className="linea esqueleto" />;

  const primero = anios[0].year;
  const ultimo = anios.at(-1).year;
  const total = ultimo - primero + 1;
  const pos = y => ((y - primero) / total) * 100;

  const anioEn = clientX => {
    const r = barraRef.current.getBoundingClientRect();
    const f = Math.min(0.9999, Math.max(0, (clientX - r.left) / r.width));
    return primero + Math.floor(f * total);
  };

  const mover = (asa, y) => {
    if (asa === 'desde') onRango([Math.min(y, rango[1]), rango[1]]);
    else onRango([rango[0], Math.max(y, rango[0])]);
  };

  const abajo = e => {
    const y = anioEn(e.clientX);
    const r = barraRef.current.getBoundingClientRect();
    const cerca = asa => Math.abs(e.clientX - (r.left + (pos(asa === 'desde' ? rango[0] : rango[1] + 1) / 100) * r.width)) < 18;
    arrastre.current = cerca('desde') ? 'desde' : cerca('hasta') ? 'hasta' : 'recorrer';
    e.currentTarget.setPointerCapture(e.pointerId);
    if (arrastre.current === 'recorrer') onRecorrer(Math.min(rango[1], Math.max(rango[0], y)));
  };
  const movimiento = e => {
    const y = anioEn(e.clientX);
    if (arrastre.current === 'desde' || arrastre.current === 'hasta') mover(arrastre.current, y);
    else if (arrastre.current === 'recorrer' || e.pointerType === 'mouse')
      if (y >= rango[0] && y <= rango[1]) onRecorrer(y);
  };
  const arriba = () => { arrastre.current = null; };

  const teclaAsa = asa => e => {
    const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -10, PageUp: 10 }[e.key];
    if (!d) return;
    e.preventDefault();
    const actual = asa === 'desde' ? rango[0] : rango[1];
    mover(asa, Math.min(ultimo, Math.max(primero, actual + d)));
  };

  const activoPreset = PRESETS.find(p => (p ? rango[0] === ultimo - p + 1 && rango[1] === ultimo : rango[0] === primero && rango[1] === ultimo));

  return (
    <section className="linea" aria-label="Línea de tiempo">
      <div className="linea-cabeza">
        <div className="linea-presets" role="group" aria-label="Períodos rápidos">
          {PRESETS.map(p => (
            <button key={p ?? 'todo'} type="button"
              className={`chip ${activoPreset === p ? 'activo' : ''}`}
              onClick={() => onRango(p ? [ultimo - p + 1, ultimo] : [primero, ultimo])}>
              {p ? plantilla(TEXTOS.linea.anios, { n: p }) : TEXTOS.linea.todo}
            </button>
          ))}
        </div>
        <p className="linea-ayuda">{TEXTOS.linea.ayuda}</p>
      </div>

      <div className="linea-pista" ref={barraRef}
        onPointerDown={abajo} onPointerMove={movimiento} onPointerUp={arriba} onPointerCancel={arriba}>
        <div className="franjas">
          {anios.map(a => (
            <span key={a.year} style={{ background: stripeColor(a.value) }}
              className={a.year < rango[0] || a.year > rango[1] ? 'fuera' : ''} />
          ))}
        </div>
        <div className="seleccion" style={{ left: `${pos(rango[0])}%`, width: `${pos(rango[1] + 1) - pos(rango[0])}%` }} />
        {anioActivo != null && (
          <div className="cursor" style={{ left: `${pos(anioActivo + 0.5)}%` }} />
        )}
        {['desde', 'hasta'].map(asa => {
          const y = asa === 'desde' ? rango[0] : rango[1];
          return (
            <div key={asa} className={`asa asa-${asa}`} style={{ left: `${pos(asa === 'desde' ? y : y + 1)}%` }}
              role="slider" tabIndex={0}
              aria-label={asa === 'desde' ? 'Año inicial' : 'Año final'}
              aria-valuemin={primero} aria-valuemax={ultimo} aria-valuenow={y}
              onKeyDown={teclaAsa(asa)}>
              <span className="asa-anio">{y}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
