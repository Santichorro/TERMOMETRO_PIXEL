// src/lib/gistemp.js
// Utilidades para trabajar con NASA GISS/GISTEMP v4 (GLB.Ts+dSST.csv)

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const BASELINE_START = 1880;
export const BASELINE_END = 1900;
export const PROJECT_START = '1926-01';

// ---------------------------------------------------------------
// Paso 6 — Parsear el CSV (una fila por año → un objeto por mes)
// ---------------------------------------------------------------
export function parseGistempCsv(csvText) {
  const lines = csvText
    .split(/\r?\n/)          // soporta Windows (\r\n) y Unix (\n)
    .map(line => line.trim())
    .filter(Boolean);        // eliminar líneas en blanco

  // Buscar la línea que empieza con "Year,"
  // (salta el título y la línea en blanco del archivo NASA)
  const headerIndex = lines.findIndex(line => line.startsWith('Year,'));
  if (headerIndex === -1) throw new Error('Formato no reconocido: no se encontró la fila "Year,"');

  const headers = lines[headerIndex].split(',').map(h => h.trim());
  const monthlyData = [];

  for (const line of lines.slice(headerIndex + 1)) {
    const values = line.split(',');
    const row = Object.fromEntries(headers.map((h, i) => [h, values[i]?.trim()]));

    const year = Number(row.Year);
    if (!Number.isInteger(year)) continue; // saltar filas no numéricas (p. ej. encabezados repetidos)

    MONTHS.forEach((monthName, monthIndex) => {
      const raw = row[monthName];

      // *** = dato faltante → omitir completamente, NUNCA usar 0
      if (!raw || raw.includes('*')) return;

      const anomaly = Number(raw);
      if (!Number.isFinite(anomaly)) return;

      monthlyData.push({
        year,
        month: monthIndex + 1,
        // padStart asegura "1926-01" en lugar de "1926-1"
        date: year + '-' + String(monthIndex + 1).padStart(2, '0'),
        anomaly1951_1980: anomaly,
      });
    });
  }

  return monthlyData; // array de { year, month, date, anomaly1951_1980 }
}

// ---------------------------------------------------------------
// Utilidades numéricas
// ---------------------------------------------------------------
export function average(values) {
  if (!values.length) return NaN;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function round(value, decimals = 3) {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

// ---------------------------------------------------------------
// Paso 7 — Cambiar la referencia de 1951–1980 a 1880–1900
// ---------------------------------------------------------------
export function computeBaselineOffset(data, start = BASELINE_START, end = BASELINE_END) {
  const values = data
    .filter(d => d.year >= start && d.year <= end)
    .map(d => d.anomaly1951_1980);
  if (!values.length) throw new Error(`No hay datos entre ${start} y ${end} para calcular la línea base`);
  return average(values); // ≈ −0.2 °C: 1880–1900 era más frío que 1951–1980
}

export function prepareGistempData(data, { from = PROJECT_START } = {}) {
  const baselineOffset = computeBaselineOffset(data);
  const series = data
    .filter(d => d.date >= from) // comparación lexicográfica YYYY-MM
    .map(d => ({
      ...d, // se conserva la anomalía original de NASA
      anomalyPreindustrial: round(d.anomaly1951_1980 - baselineOffset, 3),
    }));
  return { baselineOffset, series };
}

// ---------------------------------------------------------------
// Paso 8 — Filtrar por rango y comparar ventanas de 12 meses
// ---------------------------------------------------------------
export function filterByRange(series, startDate, endDate) {
  return series.filter(d => d.date >= startDate && d.date <= endDate);
}

export function compareWindows(series, windowSize = 12, key = 'anomalyPreindustrial') {
  if (series.length < windowSize) return null;
  const first = series.slice(0, windowSize);
  const last = series.slice(-windowSize);
  const firstAvg = average(first.map(d => d[key]));
  const lastAvg = average(last.map(d => d[key]));
  return {
    firstAvg,
    lastAvg,
    change: lastAvg - firstAvg,
    firstLabel: `${first[0].date} → ${first.at(-1).date}`,
    lastLabel: `${last[0].date} → ${last.at(-1).date}`,
  };
}

// ---------------------------------------------------------------
// Paso 10 — Construir el JSON exportable
// ---------------------------------------------------------------
export function buildExportJson(series, baselineOffset) {
  return {
    metadata: {
      source: 'NASA GISS/GISTEMP v4',
      dataset: 'GLB.Ts+dSST.csv — Land-Ocean Temperature Index (L-OTI)',
      units: '°C',
      originalBaseline: '1951-1980',
      derivedBaseline: `promedio ${BASELINE_START}-${BASELINE_END} de la misma serie`,
      baselineOffset: round(baselineOffset, 3),
      firstDate: series[0]?.date ?? null,
      lastDate: series.at(-1)?.date ?? null,
      count: series.length,
      generatedAt: new Date().toISOString(),
    },
    data: series.map(({ year, month, date, anomaly1951_1980, anomalyPreindustrial }) => ({
      year, month, date, anomaly1951_1980, anomalyPreindustrial,
    })),
  };
}

export function formatC(value, decimals = 2) {
  if (!Number.isFinite(value)) return '—';
  if (Number(value.toFixed(decimals)) === 0) return `${(0).toFixed(decimals)} °C`;
  const sign = value > 0 ? '+' : value < 0 ? '−' : '±';
  return `${sign}${Math.abs(value).toFixed(decimals)} °C`;
}

// ---------------------------------------------------------------
// Agregados para la página
// ---------------------------------------------------------------
export function annualMeans(series, key = 'anomalyPreindustrial') {
  const byYear = new Map();
  for (const d of series) {
    if (!byYear.has(d.year)) byYear.set(d.year, []);
    byYear.get(d.year).push(d[key]);
  }
  return [...byYear.entries()].map(([year, values]) => ({
    year,
    value: average(values),
    complete: values.length === 12,
  }));
}

export function decadeMeans(series, key = 'anomalyPreindustrial') {
  const byDecade = new Map();
  for (const d of series) {
    const decade = Math.floor(d.year / 10) * 10;
    if (!byDecade.has(decade)) byDecade.set(decade, []);
    byDecade.get(decade).push(d[key]);
  }
  return [...byDecade.entries()].map(([decade, values]) => ({
    decade,
    value: average(values),
    months: values.length,
  }));
}

export function warmestMonth(series, key = 'anomalyPreindustrial') {
  return series.reduce((max, d) => (d[key] > max[key] ? d : max), series[0]);
}

export function countAbove(series, threshold, key = 'anomalyPreindustrial') {
  return series.filter(d => d[key] > threshold).length;
}

// ---------------------------------------------------------------
// Sendero: un elemento por año (rangos largos) o por mes (rangos cortos)
// ---------------------------------------------------------------
const MONTH_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
                     'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export const MONTHLY_RANGE_LIMIT_YEARS = 15;

export function buildPathItems(series, key = 'anomalyPreindustrial') {
  if (!series.length) return { unit: 'year', items: [] };
  const spanYears = series.at(-1).year - series[0].year + 1;

  if (spanYears <= MONTHLY_RANGE_LIMIT_YEARS) {
    return {
      unit: 'month',
      items: series.map(d => ({
        key: d.date,
        year: d.year,
        month: d.month,
        value: d[key],
        label: `${MONTH_SHORT[d.month - 1]} ${d.year}`,
        months: 1,
      })),
    };
  }

  const byYear = new Map();
  for (const d of series) {
    if (!byYear.has(d.year)) byYear.set(d.year, []);
    byYear.get(d.year).push(d[key]);
  }
  return {
    unit: 'year',
    items: [...byYear.entries()].map(([year, values]) => ({
      key: String(year),
      year,
      month: null,
      value: average(values),
      label: String(year),
      months: values.length,
    })),
  };
}
