// ==========================================================
// TEXTOS — todo lo que se lee en pantalla está aquí.
// Los {llaves} se reemplazan con datos reales calculados del CSV de NASA.
// ==========================================================

export const TEXTOS = {
  titulo: '1 point 5',
  nav: [
    { id: 'explorar', texto: 'Explorar' },
    { id: 'anomalia', texto: 'Anomalía' },
    { id: 'paris', texto: 'París' },
    { id: 'decadas', texto: 'Décadas' },
    { id: 'escuchar', texto: 'Escuchar' },
    { id: 'datos', texto: 'Datos' },
    { id: 'tabla', texto: 'Tabla' },
  ],

  portada: {
    titulo: 'Un siglo de calor, año por año',
    frase: 'Mira cómo cambia el planeta con la temperatura global medida por NASA. Elige tu período en el gráfico y mira cómo el día se vuelve atardecer.',
  },

  cifra: {
    etiquetaAnual: 'Promedio del año',
    etiquetaMensual: 'Mes',
    lejos: 'A {d} °C del límite de +1,5',
    encima: '{d} °C por encima de +1,5',
    encima2: 'Por encima de +2,0',
    parcial: 'año incompleto: {m} meses',
    ceroPre: 'Cero: promedio 1880–1900, la base del Acuerdo de París.',
    ceroNasa: 'Cero: promedio 1951–1980. París se mide desde 1880–1900.',
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

  planeta: {
    aria: 'Planeta Tierra en 3D que cambia de color según la anomalía global del año seleccionado.',
    vistaMapa: 'Mapa',
    vistaPlaneta: 'Planeta',
    ayuda: 'Arrastra para girar · toca los objetos con aro amarillo · clic y rueda para acercar',
    ayudaActivo: 'Rueda para acercar · Esc para soltar',
    ayudaTactil: 'Arrastra para girar · toca los objetos con aro amarillo',
    puntos: 'Objetos del planeta',
    franjas: 'Desliza sobre las franjas para recorrer los años',
    cargando: 'Preparando el planeta…',
  },

  grafica: {
    titulo: 'Elige tu período',
    ayuda: 'Arrastra las asas amarillas para elegir el período · pasa por las barras para recorrer los años',
    todo: 'Todo',
    anios: '{n} años',
    ceroPre: 'cero: 1880–1900',
    ceroNasa: 'cero NASA: 1951–1980',
  },

  vidrios: {
    p15: '+1,5 °C París',
    p20: '+2,0 °C',
  },

  anomalia: {
    titulo: '¿Qué es una anomalía?',
    lead: 'Es cuánto más caliente (o más frío) estuvo un mes comparado con un promedio de referencia. NASA no publica "grados de termómetro": publica esa diferencia.',
    puntos: [
      { t: 'Por qué una diferencia', d: 'Así se pueden juntar el desierto, la montaña y el océano en un solo número: no importa si un lugar es caliente, sino cuánto cambió.' },
      { t: 'Cero no es frío', d: 'Una anomalía de 0 °C significa "igual que la referencia".' },
      { t: 'El cero se puede mover', d: 'Cambia la referencia aquí al lado: las temperaturas no cambian, cambia desde dónde las medimos.' },
    ],
    ejemplo: '{anio} fue {nasa} °C frente a 1951–1980 y {pre} °C frente a antes de la industria. Mismo año, dos ceros.',
  },

  paris: {
    titulo: 'Los límites del Acuerdo de París',
    lead: 'En 2015 casi todos los países acordaron mantener el calentamiento muy por debajo de +2 °C y esforzarse por no pasar de +1,5 °C, medido desde antes de la industria.',
    puntos: [
      { t: 'Se mide en décadas', d: 'El límite habla del calentamiento sostenido (promedios de unos 20 años), no de un año o un mes caliente.' },
      { t: 'Un mes no basta', d: 'Un mes por encima de +1,5 °C no significa que el límite ya se pasó. Por eso aquí comparamos ventanas de tiempo.' },
    ],
    ultimos12: 'Últimos 12 meses',
    ultimos20: 'Promedio de los últimos 20 años',
    falta: 'Al promedio de 20 años le faltan {d} °C para llegar a +1,5.',
    paso: 'El promedio de 20 años ya superó +1,5 °C.',
    hoyTitulo: 'Lo más reciente',
    ultimoDato: 'Último mes publicado',
    record: 'Mes más cálido del registro',
    sobre15: 'Meses sobre +1,5 °C',
    sobre15Detalle: 'de los últimos 24',
  },

  decadas: {
    titulo: 'Década por década',
    texto: 'Promediar diez años borra los altibajos de El Niño, La Niña o una erupción volcánica y deja ver la tendencia. Toca una década para cargarla en el explorador.',
    incompleta: 'década incompleta',
    incompletaNota: 'Década incompleta: la serie empieza en 1926 y la década actual sigue en curso.',
    cargada: 'Cargada en el explorador',
  },

  escuchar: {
    titulo: 'Escucha el siglo',
    lead: 'Cada año suena como una nota: cuanto más caliente, más aguda.',
    puntos: [
      { t: 'Qué escuchas', d: 'Una melodía que sube con el calor. Los años más cálidos además suenan más ásperos.' },
      { t: 'De izquierda a derecha', d: 'El sonido viaja de un oído al otro a medida que avanzan los años.' },
      { t: 'Hecho con los datos', d: 'Nada está grabado: el navegador genera cada nota a partir del valor de ese año.' },
    ],
    reproducir: 'Escuchar',
    pausar: 'Pausar',
    nota: 'Se reproduce el período elegido en el gráfico, año por año.',
    seccionBoton: 'Escuchar el período',
  },

  datos: {
    titulo: 'De dónde salen los datos',
    lead: 'Todo lo que ves viene de un solo archivo público de la NASA. Así se convierte en esta página:',
    pasos: [
      { t: 'Se mide', d: 'Miles de estaciones en tierra (NOAA GHCN v4) y la temperatura del mar (ERSST v5) se combinan en un índice global tierra-océano: NASA GISTEMP v4.',
        mas: 'Lo produce el Instituto Goddard de Estudios Espaciales de la NASA y se actualiza hacia el día 10 de cada mes. Los meses recientes pueden corregirse cuando llegan reportes tardíos.' },
      { t: 'Se compara', d: 'NASA publica cada mes como diferencia frente al promedio de ese mismo mes entre 1951 y 1980.',
        mas: 'Incertidumbre: en las últimas décadas, los valores anuales son precisos a unos 0,05 °C, según NASA.' },
      { t: 'Se cambia el cero', d: 'Para hablar de París usamos el promedio 1880–1900 de la misma serie. Está {offset} °C respecto a 1951–1980, y ese valor se resta a todos los meses.',
        mas: 'Ese período solo se usa como cero: no se muestra. La serie que ves empieza en 1926.' },
      { t: 'Se limpia', d: 'Los meses aún sin publicar aparecen como *** en el archivo. Se omiten: convertirlos en 0 sería inventar un mes igual a la referencia.' },
      { t: 'Se dibuja', d: 'De {inicio} a {fin}: {meses} meses de datos reales.',
        mas: 'En la vista Mapa del planeta el promedio es el dato real, pero el reparto por regiones es ilustrativo: imita los mapas de NASA (más calor en el Ártico y en tierra firme). NASA publica los mapas por región en otros archivos más pesados.' },
    ],
    verMas: 'Saber más',
    enlace: 'Ver el sitio de NASA GISTEMP',
  },

  tabla: {
    titulo: 'Mira los números',
    lead: 'Cada mes con sus dos escalas. Descarga la serie completa o prueba con otro archivo de NASA.',
    anio: 'Año',
    mes: 'Mes',
    colNasa: 'Frente a 1951–1980',
    colPre: 'Frente a 1880–1900',
    offset: 'Diferencia entre los dos ceros: {offset} °C',
    descargar: 'Descargar JSON',
    cargar: 'Cargar otro CSV',
    fuente: 'Archivo: {fuente} · {meses} meses desde {inicio}',
    ayudaCsv: 'Sirve cualquier GLB.Ts+dSST.csv de NASA GISTEMP (o un archivo con el mismo formato: fila "Year," y columnas Jan a Dec).',
    errorCsv: 'No se pudo leer "{nombre}": {error}. Se siguen mostrando los datos anteriores.',
    cargado: 'Datos cargados desde "{nombre}".',
    cita: 'Cómo citar: GISTEMP Team, {anio}: GISS Surface Temperature Analysis (GISTEMP), version 4. NASA Goddard Institute for Space Studies. Consultado el {fecha}. Lenssen, N., et al. (2024), J. Geophys. Res. Atmos., 129(17).',
  },

  pie: {
    creditos: 'Datos: NASA GISS Surface Temperature Analysis (GISTEMP v4). Proyecto de Arquitectura de Sistemas Multimedia, Universidad Autónoma de Occidente. Software y fuentes libres.',
    repo: 'Código en GitHub',
  },

  misiones: {
    titulo: 'Misiones',
    abrir: 'Misiones',
    nivel: 'Nivel {n}',
    completas: '{c} de {t}',
    pista: 'Pista',
    final: 'Completaste todas las misiones. Ya sabes leer el termómetro del planeta.',
  },

};

export function plantilla(texto, valores) {
  return texto.replace(/\{(\w+)\}/g, (_, k) => valores[k] ?? '');
}
