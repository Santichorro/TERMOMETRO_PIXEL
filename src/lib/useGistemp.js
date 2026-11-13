import { useCallback, useEffect, useMemo, useState } from 'react';
import { parseGistempCsv, prepareGistempData } from './gistemp.js';

const CSV_URL = '/data/GLB.Ts+dSST.csv';

function procesar(texto) {
  const mensual = parseGistempCsv(texto);
  if (!mensual.length) throw new Error('el archivo no trae meses con datos');
  const { baselineOffset, series } = prepareGistempData(mensual);
  if (!series.length) throw new Error('no hay datos desde 1926');
  if (!Number.isFinite(baselineOffset)) throw new Error('faltan los años 1880–1900 para calcular el cero preindustrial');
  return { baselineOffset, series, meses: mensual.length, inicio: mensual[0].date };
}

// Carga el CSV de NASA (línea base 1880–1900, serie desde 1926).
// cargarArchivo(file) permite reemplazarlo por otro CSV compatible:
// si el archivo no sirve, se conservan los datos anteriores.
export default function useGistemp() {
  const [origen, setOrigen] = useState({ texto: '', nombre: 'GLB.Ts+dSST.csv' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(CSV_URL)
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(texto => setOrigen(o => (o.texto ? o : { ...o, texto })))
      .catch(e => setError(e.message));
  }, []);

  const cargarArchivo = useCallback(async archivo => {
    const texto = await archivo.text();
    procesar(texto); // lanza un error si no es compatible
    setOrigen({ texto, nombre: archivo.name });
    setError('');
  }, []);

  const datos = useMemo(() => {
    if (error && !origen.texto) return { estado: 'error', error };
    if (!origen.texto) return { estado: 'cargando' };
    try {
      return { estado: 'listo', ...procesar(origen.texto), nombre: origen.nombre };
    } catch (e) {
      return { estado: 'error', error: e.message };
    }
  }, [origen, error]);

  return { ...datos, cargarArchivo };
}
