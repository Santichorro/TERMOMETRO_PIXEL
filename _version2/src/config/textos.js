// ==========================================================
// TEXTOS — todo lo que se lee en pantalla está aquí.
// Los {llaves} se reemplazan con datos reales calculados del CSV de NASA.
// ==========================================================

export const TEXTOS = {
  titulo: 'Termómetro de la Tierra',
  nav: [
    { id: 'explorar', texto: 'Explorar' },
    { id: 'anomalia', texto: 'Anomalía' },
    { id: 'paris', texto: 'París' },
    { id: 'decadas', texto: 'Décadas' },
    { id: 'escuchar', texto: 'Escuchar' },
    { id: 'datos', texto: 'Datos' },
  ],

  portada: {
    titulo: 'Un siglo de calor, año por año',
    frase: 'Cada bloque es un año de temperatura global medida por NASA. Gira el modelo, elige tu período y mira cómo el día se vuelve atardecer.',
  },

  cifra: {
    etiquetaAnual: 'Promedio del año',
    etiquetaMensual: 'Mes',
    lejos: 'A {d} °C del límite de +1,5',
    encima: '{d} °C por encima de +1,5',
    encima2: 'Por encima de +2,0',
    parcial: 'año incompleto: {m} meses',
    notaParis: 'Los límites de París se miden desde 1880–1900.',
  },

  referencia: {
    titulo: '¿Más caliente que qué?',
    pre: 'Antes de la industria',
    preDetalle: '1880–1900',
    nasa: 'Referencia de NASA',
    nasaDetalle: '1951–1980',
  },

  comparacion: {
    titulo: 'Tu período',
    inicio: 'Primeros 12 meses',
    final: 'Últimos 12 meses',
    cambio: 'Cambio',
  },

  modelo: {
    aria: 'Modelo 3D de columnas de temperatura. Cada columna es un año; las filas son décadas.',
    ayuda: 'Arrastra para girar · haz clic en el modelo para acercar con la rueda',
    ayudaActivo: 'Rueda para acercar · Esc para soltar · clic en una columna para verla',
    ayudaTactil: 'Arrastra para girar · pellizca para acercar · toca una columna para verla',
    ceroPre: 'cero: 1880–1900',
    ceroNasa: 'cero NASA: 1951–1980',
  },

  linea: {
    titulo: 'Elige tu período',
    ayuda: 'Arrastra las asas · pasa por las franjas para recorrer los años',
    todo: 'Todo',
    anios: '{n} años',
  },

  vidrios: {
    p15: '+1,5 °C París',
    p20: '+2,0 °C',
  },

  sonido: { activar: 'Sonido', silenciar: 'Sonido' },

  anomalia: {
    titulo: '¿Qué es una anomalía?',
    parrafos: [
      'NASA no publica la temperatura del planeta en grados "de termómetro". Publica anomalías: cuánto más caliente o más frío estuvo cada mes comparado con un promedio de referencia.',
      'Comparar contra un promedio permite juntar estaciones del desierto, de la montaña y del océano en un solo número: lo que importa no es si un lugar es caliente, sino cuánto cambió.',
      'Una anomalía de 0 °C no significa frío: significa "igual que la referencia". Cambia la referencia y mira cómo se mueve el cero: las temperaturas no cambian, cambia desde dónde las medimos.',
    ],
    ejemplo: 'Ejemplo: {anio} en la referencia de NASA es {nasa} °C. Medido desde antes de la industria es {pre} °C.',
  },

  paris: {
    titulo: 'Los límites del Acuerdo de París',
    parrafos: [
      'En 2015, casi todos los países acordaron mantener el calentamiento "muy por debajo de 2 °C" sobre los niveles preindustriales y hacer esfuerzos para no pasar de 1,5 °C.',
      'Esos límites hablan del calentamiento sostenido, medido en promedios de unas dos décadas, no de un año caliente aislado. Por eso aquí comparamos ventanas de tiempo y no meses sueltos.',
    ],
    ultimos12: 'Últimos 12 meses',
    ultimos20: 'Promedio de los últimos 20 años',
    falta: 'Al promedio de 20 años le faltan {d} °C para llegar a +1,5.',
    paso: 'El promedio de 20 años ya superó +1,5 °C.',
  },

  decadas: {
    titulo: 'Década por década',
    texto: 'Promediar diez años borra los altibajos de El Niño, La Niña o una erupción volcánica y deja ver la tendencia. Toca una década para cargarla en el explorador.',
    incompleta: 'década incompleta',
    cargada: 'Cargada en el explorador',
  },

  escuchar: {
    titulo: 'Escucha el siglo',
    texto: 'Cada año suena como una nota: cuanto más caliente, más aguda y más áspera. Al reproducir el período, escuchas cómo la melodía sube con el calor. Todo el sonido se genera en el navegador a partir de los datos.',
    reproducir: 'Escuchar el período',
    pausar: 'Pausar',
    nota: 'Se reproduce el período elegido en el explorador.',
  },

  datos: {
    titulo: 'De dónde salen los datos',
    items: [
      { t: 'NASA GISTEMP v4', d: 'El análisis de temperatura superficial del Instituto Goddard de Estudios Espaciales de la NASA. Se actualiza cada mes.' },
      { t: 'Tierra + océano', d: 'Combina miles de estaciones meteorológicas en tierra (NOAA GHCN v4) con la temperatura de la superficie del mar (ERSST v5).' },
      { t: 'Referencia 1951–1980', d: 'NASA publica cada mes como diferencia frente al promedio de ese mismo mes entre 1951 y 1980.' },
      { t: 'Antes de la industria', d: 'Para ubicar los límites de París usamos el promedio 1880–1900 de la misma serie: {offset} °C respecto a 1951–1980. Ese período no se muestra, solo se usa como cero.' },
      { t: 'Datos faltantes', d: 'Los meses sin publicar aparecen como *** en el archivo. Los omitimos: convertirlos en cero sería inventar un mes igual a la referencia.' },
      { t: 'Período mostrado', d: 'De {inicio} a {fin}: {meses} meses de datos reales.' },
    ],
    enlace: 'Ver el sitio de NASA GISTEMP',
  },

  misiones: {
    titulo: 'Misiones',
    abrir: 'Misiones',
    nivel: 'Nivel {n}',
    completas: '{c} de {t}',
    pista: 'Pista',
    final: 'Completaste todas las misiones. Ya sabes leer el termómetro del planeta.',
  },

  creditos: 'Datos: NASA GISS Surface Temperature Analysis (GISTEMP v4). Proyecto de Arquitectura de Sistemas Multimedia, UAO. Software y fuentes libres.',
};

export function plantilla(texto, valores) {
  return texto.replace(/\{(\w+)\}/g, (_, k) => valores[k] ?? '');
}
