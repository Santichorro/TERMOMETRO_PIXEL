// ==========================================================
// MISIONES — cada una enseña un concepto del enunciado.
// tipo:
//   'modelo'      → girar Y acercar el modelo 3D
//   'rango'       → cambiar el período
//   'referencia'  → cambiar la referencia NASA ⇄ preindustrial
//   'buscar'      → seleccionar el primer año completo ≥ umbral
//   'record'      → seleccionar el año completo más cálido
//   'objetos'     → abrir `cantidad` objetos del paisaje
//   'decada'      → tocar la década más cálida en "Década por década"
//   'escuchar'    → escuchar un período completo
//   'adivinar'    → estimar el presente y revelar
// Textos de logro admiten {llaves} con datos reales.
// ==========================================================

export const MISIONES = [
  {
    id: 'modelo', tipo: 'modelo', xp: 20,
    titulo: 'Toma el planeta en tus manos',
    texto: 'Gira el modelo 3D y acércate a las columnas más recientes.',
    pista: 'Arrastra sobre el modelo para girarlo. Para acercar, haz clic en él y usa la rueda, o los botones + y −.',
    logro: 'Cada columna es un año; cada fila, una década. Las rojas del fondo son las más recientes.',
  },
  {
    id: 'rango', tipo: 'rango', xp: 20,
    titulo: 'Elige tu época',
    texto: 'Cambia el período en la línea de tiempo.',
    pista: 'Arrastra las asas de la línea de tiempo o toca "20 años".',
    logro: 'Comparamos el promedio de los primeros 12 meses con el de los últimos 12: nunca meses sueltos.',
  },
  {
    id: 'referencia', tipo: 'referencia', xp: 30,
    titulo: '¿Más caliente que qué?',
    texto: 'Cambia la referencia y observa qué pasa con el cero.',
    pista: 'Usa el interruptor "Antes de la industria / Referencia de NASA".',
    logro: 'El cero se movió {offset} °C, pero las columnas no cambiaron de altura real. Eso es una anomalía: una diferencia frente a una referencia.',
  },
  {
    id: 'buscar', tipo: 'buscar', xp: 30, umbral: 1.0,
    titulo: 'Cruza el primer grado',
    texto: 'Encuentra el primer año que promedió más de +1 °C sobre la era preindustrial.',
    pista: 'Recorre la línea de tiempo después del año 2000 y mira el valor de cada año.',
    logro: '{anio} fue el primer año completo por encima de +1 °C.',
  },
  {
    id: 'record', tipo: 'record', xp: 30,
    titulo: 'El año récord',
    texto: 'Encuentra el año completo más cálido del registro.',
    pista: 'Busca la columna más alta del modelo y haz clic en ella.',
    logro: '{anio} es el año más cálido del registro: {valor} °C sobre la era preindustrial.',
  },
  {
    id: 'objetos', tipo: 'objetos', xp: 30, cantidad: 3,
    titulo: 'Detrás de los datos',
    texto: 'Toca 3 objetos del paisaje para saber de dónde salen los números.',
    pista: 'Los objetos están sobre el suelo, debajo del modelo: la fábrica, la estación, la boya y el termómetro.',
    logro: 'Los datos combinan estaciones en tierra y mediciones del océano, y se comparan con antes de la industria.',
  },
  {
    id: 'decada', tipo: 'decada', xp: 30,
    titulo: 'La década más caliente',
    texto: 'En "Década por década", toca la década más cálida.',
    pista: 'Baja a la sección Décadas: la barra más larga y más roja es la respuesta.',
    logro: 'La década de {decada} promedia {valor} °C sobre la era preindustrial.',
  },
  {
    id: 'escuchar', tipo: 'escuchar', xp: 30,
    titulo: 'Escucha el siglo',
    texto: 'Reproduce un período completo con sonido.',
    pista: 'Activa el sonido arriba a la derecha y pulsa "Escuchar el período" en la sección Escuchar.',
    logro: 'Las notas suben a medida que el planeta se calienta.',
  },
  {
    id: 'adivinar', tipo: 'adivinar', xp: 40,
    titulo: 'Adivina el presente',
    texto: '¿Cuánto más caliente crees que está la Tierra hoy que antes de la industria?',
    boton: 'Revelar',
    pista: 'Mueve el deslizador a tu estimación y pulsa Revelar.',
    logro: 'Los últimos 12 meses promedian {real} °C. Tu estimación: {tuyo} °C.',
  },
];

export const NIVELES = [
  { xp: 0, nombre: 'Curioso del clima' },
  { xp: 50, nombre: 'Explorador' },
  { xp: 110, nombre: 'Lector de anomalías' },
  { xp: 170, nombre: 'Guardián del grado' },
  { xp: 230, nombre: 'Climatólogo pixel' },
];
