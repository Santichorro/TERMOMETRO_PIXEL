import { memo } from 'react';
import { TEXTOS, plantilla } from '../../config/textos.js';

// De dónde salen los datos: cinco pasos cortos; lo técnico queda plegado en "Saber más".
function Datos({ valores }) {
  return (
    <section id="datos" className="seccion">
      <div className="seccion-ancha">
        <div className="datos-cabeza">
          <h2>{TEXTOS.datos.titulo}</h2>
          <p className="lead">{TEXTOS.datos.lead}</p>
        </div>
        <ol className="pasos">
          {TEXTOS.datos.pasos.map(p => (
            <li key={p.t}>
              <h3>{p.t}</h3>
              <p>{plantilla(p.d, valores)}</p>
              {p.mas && (
                <details>
                  <summary>{TEXTOS.datos.verMas}</summary>
                  <p>{plantilla(p.mas, valores)}</p>
                </details>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// memo: solo se vuelve a dibujar si cambian sus datos (no en cada año recorrido)
export default memo(Datos);
