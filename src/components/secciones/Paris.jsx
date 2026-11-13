import { memo } from 'react';
import { TEXTOS, plantilla } from '../../config/textos.js';
import Explicacion from '../Explicacion.jsx';

import { fmt as f } from '../../lib/formato.js';

// Medidor hacia +1,5 / +2,0 °C con ventanas de 12 meses y 20 años
function Paris({ ultimos12, ultimos20, hoy }) {
  const max = 2.2;
  const pct = v => `${Math.max(0, Math.min(100, (v / max) * 100))}%`;
  const listo = Number.isFinite(ultimos20);
  return (
    <section id="paris" className="seccion alterna">
      <div className="seccion-grid invertida">
        <div className="medidor panel">
          <div className="medidor-pista">
            {listo && <div className="medidor-relleno largo" style={{ width: pct(ultimos20) }} />}
            {listo && <div className="medidor-relleno corto" style={{ width: pct(ultimos12) }} />}
            {[0, 0.5, 1, 1.5, 2].map(v => (
              <span key={v} className={`medidor-marca ${v >= 1.5 ? 'limite' : ''}`} style={{ left: pct(v) }}>
                <i />{v === 0 ? '0' : `+${String(v).replace('.', ',')}`}
              </span>
            ))}
          </div>
          <dl className="medidor-datos">
            <div><dt>{TEXTOS.paris.ultimos20}</dt><dd>{listo ? `${f(ultimos20)} °C` : '—'}</dd></div>
            <div><dt>{TEXTOS.paris.ultimos12}</dt><dd>{listo ? `${f(ultimos12)} °C` : '—'}</dd></div>
          </dl>
          {listo && (
            <p className="dato-destacado">
              {ultimos20 < 1.5
                ? plantilla(TEXTOS.paris.falta, { d: (1.5 - ultimos20).toFixed(2).replace('.', ',') })
                : TEXTOS.paris.paso}
            </p>
          )}
          {hoy && (
            <div className="hoy">
              <h3>{TEXTOS.paris.hoyTitulo}</h3>
              <dl>
                <div><dt>{TEXTOS.paris.ultimoDato}</dt><dd>{f(hoy.ultimo.valor)} °C</dd><dd className="hoy-nota">{hoy.ultimo.etiqueta}</dd></div>
                <div><dt>{TEXTOS.paris.record}</dt><dd>{f(hoy.record.valor)} °C</dd><dd className="hoy-nota">{hoy.record.etiqueta}</dd></div>
                <div><dt>{TEXTOS.paris.sobre15}</dt><dd>{hoy.sobre15}</dd><dd className="hoy-nota">{TEXTOS.paris.sobre15Detalle}</dd></div>
              </dl>
            </div>
          )}
        </div>
        <div className="seccion-texto">
          <h2>{TEXTOS.paris.titulo}</h2>
          <Explicacion lead={TEXTOS.paris.lead} puntos={TEXTOS.paris.puntos} />
        </div>
      </div>
    </section>
  );
}

// memo: solo se vuelve a dibujar si cambian sus datos (no en cada año recorrido)
export default memo(Paris);
