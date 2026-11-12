import { TEXTOS } from '../config/textos.js';

// Interruptor de referencia: antes de la industria (1880–1900) ⇄ NASA (1951–1980)
export default function Referencia({ valor, onCambiar, id = 'ref' }) {
  const opciones = [
    { id: 'pre', nombre: TEXTOS.referencia.pre, detalle: TEXTOS.referencia.preDetalle },
    { id: 'nasa', nombre: TEXTOS.referencia.nasa, detalle: TEXTOS.referencia.nasaDetalle },
  ];
  return (
    <div className="referencia">
      <p className="referencia-titulo" id={`${id}-titulo`}>{TEXTOS.referencia.titulo}</p>
      <div className="interruptor" role="radiogroup" aria-labelledby={`${id}-titulo`}>
        {opciones.map(o => (
          <button key={o.id} type="button" role="radio" aria-checked={valor === o.id}
            className={valor === o.id ? 'activo' : ''} onClick={() => onCambiar(o.id)}>
            <span>{o.nombre}</span>
            <small>{o.detalle}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
