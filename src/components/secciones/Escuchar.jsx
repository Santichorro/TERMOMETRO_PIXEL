import PixelIcon from '../PixelIcon.jsx';
import { TEXTOS } from '../../config/textos.js';

// Reproduce el período elegido año por año con sonido
export default function Escuchar({ reproduciendo, onAlternar, progreso, etiqueta, rango }) {
  return (
    <section id="escuchar" className="seccion alterna">
      <div className="seccion-grid invertida">
        <div className="reproductor panel">
          <button type="button" className="boton grande" onClick={onAlternar} aria-pressed={reproduciendo}>
            <PixelIcon nombre={reproduciendo ? 'pausa' : 'play'} tamano={18} />
            {reproduciendo ? TEXTOS.escuchar.pausar : TEXTOS.escuchar.seccionBoton}
          </button>
          <div className="reproductor-pista" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progreso * 100)}>
            <span style={{ transform: `scaleX(${progreso})` }} />
          </div>
          <p className="reproductor-estado">
            <strong>{etiqueta}</strong> · {rango[0]}–{rango[1]}
          </p>
          <p className="nota">{TEXTOS.escuchar.nota}</p>
        </div>
        <div className="seccion-texto">
          <h2>{TEXTOS.escuchar.titulo}</h2>
          <p>{TEXTOS.escuchar.texto}</p>
        </div>
      </div>
    </section>
  );
}
