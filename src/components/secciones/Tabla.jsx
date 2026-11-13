import { useMemo, useRef, useState, memo } from 'react';
import PixelIcon from '../PixelIcon.jsx';
import { buildExportJson } from '../../lib/gistemp.js';
import { fmt } from '../../lib/formato.js';
import { TEXTOS, plantilla } from '../../config/textos.js';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// Tabla mes a mes con las dos escalas + descargar JSON + cargar otro CSV compatible
function Tabla({ series, offset, fuente, aviso, onArchivo, onDescargar }) {
  const anios = useMemo(() => [...new Set(series.map(d => d.year))].reverse(), [series]);
  const [anioElegido, setAnioElegido] = useState(null);
  const anio = anios.includes(anioElegido) ? anioElegido : anios[0];
  const filas = series.filter(d => d.year === anio);
  const entrada = useRef(null);
  const listo = series.length > 0;

  const descargar = () => {
    const json = buildExportJson(series, offset);
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gistemp-preindustrial.json';
    a.click();
    URL.revokeObjectURL(url);
    onDescargar?.();
  };

  const elegirArchivo = e => {
    const archivo = e.target.files?.[0];
    if (archivo) onArchivo(archivo);
    e.target.value = ''; // permite volver a cargar el mismo archivo
  };

  const hoy = new Date();
  const cita = plantilla(TEXTOS.tabla.cita, {
    anio: hoy.getFullYear(),
    fecha: hoy.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }),
  });

  return (
    <section id="tabla" className="seccion alterna">
      <div className="seccion-grid invertida">
        <div className="tabla-panel panel">
          <div className="tabla-cabeza">
            <label className="campo">
              <span>{TEXTOS.tabla.anio}</span>
              <select value={anio ?? ''} onChange={e => setAnioElegido(Number(e.target.value))} disabled={!listo}>
                {anios.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
            <p className="tabla-offset">{plantilla(TEXTOS.tabla.offset, { offset: fmt(offset) })}</p>
          </div>
          <div className="tabla-scroll">
            <table>
              <caption className="solo-lector">{`${TEXTOS.tabla.titulo} ${anio ?? ''}`}</caption>
              <thead>
                <tr><th scope="col">{TEXTOS.tabla.mes}</th><th scope="col">{TEXTOS.tabla.colNasa}</th><th scope="col">{TEXTOS.tabla.colPre}</th></tr>
              </thead>
              <tbody>
                {filas.map(d => (
                  <tr key={d.date}>
                    <th scope="row">{MESES[d.month - 1]}</th>
                    <td>{fmt(d.anomaly1951_1980)} °C</td>
                    <td className="fuerte">{fmt(d.anomalyPreindustrial)} °C</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="seccion-texto">
          <h2>{TEXTOS.tabla.titulo}</h2>
          <p className="lead">{TEXTOS.tabla.lead}</p>
          <div className="acciones">
            <button type="button" className="boton" onClick={descargar} disabled={!listo}>
              <PixelIcon nombre="descargar" tamano={16} />{TEXTOS.tabla.descargar}
            </button>
            <button type="button" className="boton secundario" onClick={() => entrada.current?.click()}>
              <PixelIcon nombre="subir" tamano={16} />{TEXTOS.tabla.cargar}
            </button>
            <input ref={entrada} type="file" accept=".csv,text/csv" onChange={elegirArchivo} hidden />
          </div>
          {aviso && <p className={`aviso-archivo ${aviso.tipo}`} role={aviso.tipo === 'error' ? 'alert' : 'status'}>{aviso.texto}</p>}
          <p className="nota">{TEXTOS.tabla.ayudaCsv}</p>
          {fuente && <p className="nota">{plantilla(TEXTOS.tabla.fuente, fuente)}</p>}
          <p className="cita">{cita}</p>
        </div>
      </div>
    </section>
  );
}

// memo: solo se vuelve a dibujar si cambian sus datos (no en cada año recorrido)
export default memo(Tabla);
