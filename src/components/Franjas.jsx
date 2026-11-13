import { memo, useRef } from 'react';
import { stripeColor } from '../lib/colors.js';
import { TEXTOS } from '../config/textos.js';

// ==========================================================
// FRANJAS bajo el planeta: una franja por año, coordinada con la gráfica 2D.
// Comparte el mismo estado (rango y año activo) desde App:
// - Pasar el puntero o arrastrar dentro del período: recorre los años.
// - Asas amarillas: cambian el período (también con el teclado).
// ==========================================================

// Franjas de color memorizadas: no se recrean al recorrer los años
const Colores = memo(function Colores({ anios, desde, hasta }) {
  return (
    <div className="franjas-colores" aria-hidden="true">
      {anios.map(a => (
        <span key={a.year} style={{ background: stripeColor(a.value) }}
          className={a.year < desde || a.year > hasta ? 'fuera' : ''} />
      ))}
    </div>
  );
});

export default function Franjas({ anios, rango, onRango, anioActivo, onRecorrer }) {
  const pistaRef = useRef(null);
  const arrastre = useRef(null);
  if (!anios.length) return <div className="franjas-planeta esqueleto" />;

  const primero = anios[0].year;
  const ultimo = anios.at(-1).year;
  const total = ultimo - primero + 1;
  const pos = y => ((y - primero) / total) * 100;

  const anioEn = clientX => {
    const r = pistaRef.current.getBoundingClientRect();
    const f = Math.min(0.9999, Math.max(0, (clientX - r.left) / r.width));
    return primero + Math.floor(f * total);
  };
  const mover = (asa, y) => {
    if (asa === 'desde') onRango([Math.min(y, rango[1]), rango[1]]);
    else onRango([rango[0], Math.max(y, rango[0])]);
  };
  const dentro = y => Math.min(rango[1], Math.max(rango[0], y));

  const abajo = e => {
    const r = pistaRef.current.getBoundingClientRect();
    const xDe = y => r.left + (pos(y) / 100) * r.width;
    const cerca = x => Math.abs(e.clientX - x) < 14;
    arrastre.current = cerca(xDe(rango[0])) ? 'desde' : cerca(xDe(rango[1] + 1)) ? 'hasta' : 'recorrer';
    e.currentTarget.setPointerCapture(e.pointerId);
    if (arrastre.current === 'recorrer') onRecorrer(dentro(anioEn(e.clientX)));
  };
  const movimiento = e => {
    const y = anioEn(e.clientX);
    if (arrastre.current === 'desde' || arrastre.current === 'hasta') mover(arrastre.current, y);
    else if (arrastre.current === 'recorrer') onRecorrer(dentro(y));
    else if (e.pointerType === 'mouse' && y >= rango[0] && y <= rango[1]) onRecorrer(y);
  };
  const arriba = () => { arrastre.current = null; };

  const teclaAsa = asa => e => {
    const actual = asa === 'desde' ? rango[0] : rango[1];
    const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -10, PageUp: 10 }[e.key];
    const destino = e.key === 'Home' ? primero : e.key === 'End' ? ultimo : d ? actual + d : null;
    if (destino === null) return;
    e.preventDefault();
    mover(asa, Math.min(ultimo, Math.max(primero, destino)));
  };

  return (
    <div className="franjas-planeta">
      <div className="franjas-pista" ref={pistaRef}
        onPointerDown={abajo} onPointerMove={movimiento} onPointerUp={arriba} onPointerCancel={arriba}>
        <Colores anios={anios} desde={rango[0]} hasta={rango[1]} />
        {anioActivo != null && <div className="franjas-cursor" style={{ left: `${pos(anioActivo + 0.5)}%` }} />}
        {['desde', 'hasta'].map(asa => {
          const y = asa === 'desde' ? rango[0] : rango[1];
          return (
            <div key={asa} className={`franjas-asa franjas-asa-${asa}`} style={{ left: `${pos(asa === 'desde' ? y : y + 1)}%` }}
              role="slider" tabIndex={0} aria-label={asa === 'desde' ? 'Inicio del período' : 'Fin del período'}
              aria-valuemin={primero} aria-valuemax={ultimo} aria-valuenow={y} onKeyDown={teclaAsa(asa)} />
          );
        })}
      </div>
      <div className="franjas-pie">
        <span>{rango[0]}</span>
        <span className="franjas-ayuda">{TEXTOS.planeta.franjas}</span>
        <span>{rango[1]}</span>
      </div>
    </div>
  );
}
