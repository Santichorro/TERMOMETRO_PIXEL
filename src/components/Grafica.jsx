import { memo, useRef } from 'react';
import { stripeColor } from '../lib/colors.js';
import { fmt } from '../lib/formato.js';
import PixelIcon from './PixelIcon.jsx';
import { TEXTOS, plantilla } from '../config/textos.js';

// ==========================================================
// GRÁFICO 2D DE BARRAS = LÍNEA DE TIEMPO
// - Una barra por año (promedio anual), altura = anomalía.
// - Asas: eligen el período. Pasar el puntero o arrastrar dentro: recorre los años.
// - Líneas de +1,5 y +2,0 °C (París) y del cero de NASA.
// ==========================================================

const Y_MIN = -0.5;
const Y_MAX = 2.2;
const PRESETS = [null, 50, 20, 10];
const pctY = v => ((Y_MAX - v) / (Y_MAX - Y_MIN)) * 100;

// Barras: memorizadas. Al recorrer los años solo cambia el contorno del año activo
// (un solo <rect> aparte), no se vuelven a crear las ~100 barras.
const BarrasFijas = memo(function BarrasFijas({ anios, primero, piso, desde, hasta }) {
  const y0 = pctY(piso);
  return anios.map(a => {
    const y1 = pctY(a.value);
    const fuera = a.year < desde || a.year > hasta;
    return (
      <rect key={a.year} x={a.year - primero + 0.12} width={0.76}
        y={Math.min(y0, y1)} height={Math.max(0.6, Math.abs(y0 - y1))}
        fill={stripeColor(a.value)} opacity={fuera ? 0.28 : 1} />
    );
  });
});

function Barras({ anios, primero, total, piso, desde, hasta, activo }) {
  const y0 = pctY(piso);
  const y1 = activo ? pctY(activo.value) : 0;
  return (
    <svg className="grafica-barras" viewBox={`0 0 ${total} 100`} preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
      <BarrasFijas anios={anios} primero={primero} piso={piso} desde={desde} hasta={hasta} />
      {activo && (
        <rect className="activa" x={activo.year - primero + 0.12} width={0.76}
          y={Math.min(y0, y1)} height={Math.max(0.6, Math.abs(y0 - y1))} fill={stripeColor(activo.value)} />
      )}
    </svg>
  );
}

export default function Grafica({ anios, rango, onRango, anioActivo, onRecorrer, onSobre, piso, enRef, reproduciendo, onReproducir }) {
  const areaRef = useRef(null);
  const arrastre = useRef(null);
  const ultimoSobre = useRef(null);
  if (!anios.length) return <div className="grafica esqueleto" />;

  const primero = anios[0].year;
  const ultimo = anios.at(-1).year;
  const total = ultimo - primero + 1;
  const pctX = y => ((y - primero) / total) * 100;

  const anioEn = clientX => {
    const r = areaRef.current.getBoundingClientRect();
    const f = Math.min(0.9999, Math.max(0, (clientX - r.left) / r.width));
    return primero + Math.floor(f * total);
  };
  const mover = (asa, y) => {
    if (asa === 'desde') onRango([Math.min(y, rango[1]), rango[1]]);
    else onRango([rango[0], Math.max(y, rango[0])]);
  };
  const recorrer = y => {
    if (y < rango[0] || y > rango[1]) return;
    if (ultimoSobre.current !== y) { ultimoSobre.current = y; onSobre?.(); }
    onRecorrer(y);
  };
  const abajo = e => {
    const r = areaRef.current.getBoundingClientRect();
    const xDe = y => r.left + (pctX(y) / 100) * r.width;
    const cerca = x => Math.abs(e.clientX - x) < 16;
    arrastre.current = cerca(xDe(rango[0])) ? 'desde' : cerca(xDe(rango[1] + 1)) ? 'hasta' : 'recorrer';
    e.currentTarget.setPointerCapture(e.pointerId);
    if (arrastre.current === 'recorrer') recorrer(anioEn(e.clientX));
  };
  const movimiento = e => {
    const y = anioEn(e.clientX);
    if (arrastre.current === 'desde' || arrastre.current === 'hasta') mover(arrastre.current, y);
    else if (arrastre.current === 'recorrer' || e.pointerType === 'mouse') recorrer(y);
  };
  const arriba = () => { arrastre.current = null; };
  const teclaAsa = asa => e => {
    const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -10, PageUp: 10 }[e.key];
    const actual = asa === 'desde' ? rango[0] : rango[1];
    const destino = e.key === 'Home' ? primero : e.key === 'End' ? ultimo : d ? actual + d : null;
    if (destino === null) return;
    e.preventDefault();
    mover(asa, Math.min(ultimo, Math.max(primero, destino)));
  };

  const presetActivo = PRESETS.find(p => (p ? rango[0] === ultimo - p + 1 && rango[1] === ultimo : rango[0] === primero && rango[1] === ultimo));
  const activo = anios.find(a => a.year === anioActivo);
  const ejes = [2.0, 1.5, 1.0, 0.5, 0];

  return (
    <section className="grafica" aria-label={TEXTOS.grafica.titulo}>
      <div className="grafica-cabeza">
        <h2>{TEXTOS.grafica.titulo}</h2>
        <div className="grafica-presets" role="group" aria-label="Períodos rápidos">
          {PRESETS.map(p => (
            <button key={p ?? 'todo'} type="button" className={`chip ${presetActivo === p ? 'activo' : ''}`}
              onClick={() => onRango(p ? [ultimo - p + 1, ultimo] : [primero, ultimo])}>
              {p ? plantilla(TEXTOS.grafica.anios, { n: p }) : TEXTOS.grafica.todo}
            </button>
          ))}
        </div>
        <button type="button" className="boton" onClick={onReproducir} aria-pressed={reproduciendo}>
          <PixelIcon nombre={reproduciendo ? 'pausa' : 'play'} tamano={16} />
          {reproduciendo ? TEXTOS.escuchar.pausar : TEXTOS.escuchar.reproducir}
        </button>
      </div>

      <div className="grafica-cuerpo">
        <div className="grafica-eje" aria-hidden="true">
          {ejes.map(v => (
            <span key={v} style={{ top: `${pctY(v)}%` }}>{v === 0 ? '0' : `+${v.toFixed(1).replace('.', ',')}`}</span>
          ))}
        </div>

        <div className="grafica-area" ref={areaRef}
          onPointerDown={abajo} onPointerMove={movimiento} onPointerUp={arriba} onPointerCancel={arriba}>
          {ejes.map(v => <span key={v} className="grafica-guia" style={{ top: `${pctY(v)}%` }} />)}
          <span className="grafica-umbral u15" style={{ top: `${pctY(1.5)}%` }}><em>{TEXTOS.vidrios.p15}</em></span>
          <span className="grafica-umbral u20" style={{ top: `${pctY(2.0)}%` }}><em>{TEXTOS.vidrios.p20}</em></span>
          <span className="grafica-cero" style={{ top: `${pctY(piso)}%` }}><em>{piso > 0.05 ? TEXTOS.grafica.ceroNasa : TEXTOS.grafica.ceroPre}</em></span>

          <Barras anios={anios} primero={primero} total={total} piso={piso} desde={rango[0]} hasta={rango[1]} activo={activo} />

          <div className="seleccion" style={{ left: `${pctX(rango[0])}%`, width: `${pctX(rango[1] + 1) - pctX(rango[0])}%` }} />
          {activo && (
            <>
              <div className="cursor" style={{ left: `${pctX(anioActivo + 0.5)}%` }} />
              <span className="grafica-tip" style={{ left: `${pctX(anioActivo + 0.5)}%`, translate: `${pctX(anioActivo + 0.5) > 85 ? '-100%' : pctX(anioActivo + 0.5) < 15 ? '0%' : '-50%'} calc(-100% - 8px)`, top: `${Math.min(pctY(activo.value), pctY(piso))}%` }}>
                {activo.year} <strong>{fmt(enRef(activo.value))} °C</strong>
              </span>
            </>
          )}
          {['desde', 'hasta'].map(asa => {
            const y = asa === 'desde' ? rango[0] : rango[1];
            return (
              <div key={asa} className={`asa asa-${asa}`} style={{ left: `${pctX(asa === 'desde' ? y : y + 1)}%` }}
                role="slider" tabIndex={0} aria-label={asa === 'desde' ? 'Año inicial' : 'Año final'}
                aria-valuemin={primero} aria-valuemax={ultimo} aria-valuenow={y} onKeyDown={teclaAsa(asa)}>
                <span className="asa-anio">{y}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grafica-x" aria-hidden="true">
        {anios.filter(a => a.year % 10 === 0).map(a => (
          <span key={a.year} style={{ left: `${pctX(a.year + 0.5)}%` }}>{a.year}</span>
        ))}
      </div>
      <p className="grafica-ayuda">{TEXTOS.grafica.ayuda}</p>
    </section>
  );
}
