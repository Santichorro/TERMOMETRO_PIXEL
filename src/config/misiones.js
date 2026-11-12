// ==========================================================
// MISIONES — cada una enseña un concepto del enunciado.
// tipo:
//   'rango'       → completa al cambiar el período
//   'referencia'  → completa al cambiar la referencia
//   'buscar'      → completa al recorrer hasta el año objetivo (se calcula de los datos)
//   'adivinar'    → el usuario estima el valor actual y luego se revela
// ==========================================================

export const MISIONES = [
  {
    id: 'rango',
    tipo: 'rango',
    xp: 25,
    titulo: 'Elige tu época',
    texto: 'Arrastra las asas de la línea de tiempo y elige el período que te interese.',
    logro: 'Comparamos el promedio de los primeros 12 meses con el de los últimos 12, no meses sueltos.',
  },
  {
    id: 'referencia',
    tipo: 'referencia',
    xp: 25,
    titulo: '¿Más caliente que qué?',
    texto: 'Cambia la referencia entre NASA (1951–1980) y antes de la industria (1880–1900).',
    logro: 'El suelo se movió 0,22 °C, pero las temperaturas siguen iguales: eso es una anomalía.',
  },
  {
    id: 'buscar',
    tipo: 'buscar',
    xp: 25,
    umbral: 1.0,
    titulo: 'Cruza el primer grado',
    texto: 'Recorre los años y encuentra el primero que promedió más de +1 °C sobre la era preindustrial.',
    logro: '{anio} fue el primer año completo por encima de +1 °C.',
  },
  {
    id: 'adivinar',
    tipo: 'adivinar',
    xp: 25,
    titulo: 'Adivina el presente',
    texto: '¿Cuánto más caliente crees que está la Tierra hoy que antes de la industria?',
    boton: 'Revelar',
    logro: 'Los últimos 12 meses promedian {real} °C. Tu estimación: {tuyo} °C.',
  },
];

export const NIVELES = [
  { xp: 0, nombre: 'Curioso del clima' },
  { xp: 25, nombre: 'Explorador' },
  { xp: 50, nombre: 'Lector de anomalías' },
  { xp: 75, nombre: 'Guardián del grado' },
  { xp: 100, nombre: 'Climatólogo pixel' },
];
