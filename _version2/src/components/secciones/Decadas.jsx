import { stripeColor } from '../../lib/colors.js';
import { TEXTOS } from '../../config/textos.js';

import { fmt as f } from '../../lib/formato.js';

// Barras pixel por década; tocar una la carga en el explorador
export default function Decadas({ decadas, seleccion, onElegir }) {
  const max = Math.max(1.5, ...decadas.map(d => d.value));
  return (
    <section id="decadas" className="seccion">
      <div className="seccion-grid">
        <div className="seccion-texto">
          <h2>{TEXTOS.decadas.titulo}</h2>
          <p>{TEXTOS.decadas.texto}</p>
        </div>
        <ol className="decadas">
          {decadas.map(d => (
            <li key={d.decade}>
              <button type="button" className={`decada ${seleccion === d.decade ? 'activa' : ''}`}
                onClick={() => onElegir(d)} aria-pressed={seleccion === d.decade}>
                <span className="decada-nombre">{d.decade}s</span>
                <span className="decada-pista">
                  <span className="decada-barra" style={{ width: `${Math.max(2, (Math.max(0, d.value) / max) * 100)}%`, background: stripeColor(d.value) }} />
                </span>
                <span className="decada-valor">{f(d.value)} °C</span>
                {d.months < 120 && <span className="decada-nota">{TEXTOS.decadas.incompleta}</span>}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
