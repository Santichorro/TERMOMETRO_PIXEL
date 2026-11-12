import { useEffect, useMemo, useState } from 'react';
import { parseGistempCsv, prepareGistempData } from './gistemp.js';

const CSV_URL = '/data/GLB.Ts+dSST.csv';

// Carga el CSV de NASA una vez y lo prepara (línea base 1880–1900, serie desde 1926)
export default function useGistemp() {
  const [texto, setTexto] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(CSV_URL)
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(setTexto)
      .catch(e => setError(e.message));
  }, []);

  return useMemo(() => {
    if (error) return { estado: 'error', error };
    if (!texto) return { estado: 'cargando' };
    try {
      const mensual = parseGistempCsv(texto);
      const { baselineOffset, series } = prepareGistempData(mensual);
      return { estado: 'listo', baselineOffset, series };
    } catch (e) {
      return { estado: 'error', error: e.message };
    }
  }, [texto, error]);
}
