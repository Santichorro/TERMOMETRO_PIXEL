import { memo } from 'react';
import Referencia from '../Referencia.jsx';
import Explicacion from '../Explicacion.jsx';
import { TEXTOS, plantilla } from '../../config/textos.js';

// ¿Qué es una anomalía? Texto + demostración con dos ceros.
function Anomalia({ referencia, onReferencia, ejemplo, offset }) {
  const escala = 70; // px por °C en la ilustración
  const cero = referencia === 'nasa' ? -offset : 0;
  const alto = v => Math.max(4, Math.abs(v - cero) * escala);
  return (
    <section id="anomalia" className="seccion">
      <div className="seccion-grid">
        <div className="seccion-texto">
          <h2>{TEXTOS.anomalia.titulo}</h2>
          <Explicacion lead={TEXTOS.anomalia.lead} puntos={TEXTOS.anomalia.puntos} />
          {ejemplo && <p className="dato-destacado">{plantilla(TEXTOS.anomalia.ejemplo, ejemplo)}</p>}
        </div>
        <figure className="demo panel">
          <div className="demo-escena" aria-hidden="true">
            <div className="demo-cero" style={{ bottom: `${24 + cero * escala}px` }}>
              <span>{referencia === 'nasa' ? 'cero NASA (1951–1980)' : 'cero (1880–1900)'}</span>
            </div>
            {ejemplo?.serie.map(c => (
              <div key={c.etiqueta} className="demo-col"
                style={{ height: `${alto(c.valor)}px`, bottom: `${24 + Math.min(c.valor, cero) * escala}px`, background: c.color }}>
                <span className="demo-valor">{(c.valor - cero >= 0 ? '+' : '−') + Math.abs(c.valor - cero).toFixed(2).replace('.', ',')}</span>
                <span className="demo-anio">{c.etiqueta}</span>
              </div>
            ))}
          </div>
          <figcaption>
            <Referencia valor={referencia} onCambiar={onReferencia} id="ref-demo" />
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

// memo: solo se vuelve a dibujar si cambian sus datos (no en cada año recorrido)
export default memo(Anomalia);
