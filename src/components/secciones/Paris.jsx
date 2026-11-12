import { TEXTOS, plantilla } from '../../config/textos.js';

import { fmt as f } from '../../lib/formato.js';

// Medidor hacia +1,5 / +2,0 °C con ventanas de 12 meses y 20 años
export default function Paris({ ultimos12, ultimos20 }) {
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
        </div>
        <div className="seccion-texto">
          <h2>{TEXTOS.paris.titulo}</h2>
          {TEXTOS.paris.parrafos.map(p => <p key={p}>{p}</p>)}
        </div>
      </div>
    </section>
  );
}
