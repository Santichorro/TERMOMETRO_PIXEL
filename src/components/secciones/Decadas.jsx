import { memo } from 'react';
import { stripeColor } from '../../lib/colors.js';
import { TEXTOS } from '../../config/textos.js';
import { fmt as f } from '../../lib/formato.js';

// Una columna pixel por década (en PC) o una barra por fila (en celular).
// Tocar una década la carga en el explorador.
function Decadas({ decadas, seleccion, onElegir }) {
  const max = Math.max(1.5, ...decadas.map(d => d.value));
  const hayIncompletas = decadas.some(d => d.months < 120);
  return (
    <section id="decadas" className="seccion">
      <div className="seccion-ancha decadas-bloque">
        <div className="decadas-cabeza">
          <h2>{TEXTOS.decadas.titulo}</h2>
          <p className="lead">{TEXTOS.decadas.texto}</p>
        </div>
        <div className="decadas-panel panel">
          <ol className="decadas">
            {decadas.map(d => {
              const incompleta = d.months < 120;
              return (
                <li key={d.decade}>
                  <button type="button" className={`decada ${seleccion === d.decade ? 'activa' : ''} ${incompleta ? 'incompleta' : ''}`}
                    onClick={() => onElegir(d)} aria-pressed={seleccion === d.decade}
                    style={{ '--p': Math.max(2, (Math.max(0, d.value) / max) * 100) }}>
                    <span className="decada-valor">{f(d.value)} °C</span>
                    <span className="decada-pista">
                      <span className="decada-barra" style={{ background: stripeColor(d.value) }} />
                    </span>
                    <span className="decada-nombre">{d.decade}s{incompleta && <sup aria-label={TEXTOS.decadas.incompleta}>*</sup>}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          {hayIncompletas && <p className="decadas-nota"><sup>*</sup> {TEXTOS.decadas.incompletaNota}</p>}
        </div>
      </div>
    </section>
  );
}

// memo: solo se vuelve a dibujar si cambian sus datos (no en cada año recorrido)
export default memo(Decadas);
