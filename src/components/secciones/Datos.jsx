import { TEXTOS, plantilla } from '../../config/textos.js';

export default function Datos({ valores }) {
  return (
    <section id="datos" className="seccion">
      <div className="seccion-ancha">
        <h2>{TEXTOS.datos.titulo}</h2>
        <dl className="datos-lista">
          {TEXTOS.datos.items.map(it => (
            <div key={it.t}>
              <dt>{it.t}</dt>
              <dd>{plantilla(it.d, valores)}</dd>
            </div>
          ))}
        </dl>
        <a className="enlace" href="https://data.giss.nasa.gov/gistemp/" target="_blank" rel="noreferrer">{TEXTOS.datos.enlace}</a>
      </div>
    </section>
  );
}
