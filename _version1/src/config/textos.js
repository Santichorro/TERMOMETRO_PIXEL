// ==========================================================
// TEXTOS — todo lo que se lee en pantalla está aquí.
// Cambia libremente; los {llaves} se reemplazan con datos reales.
// ==========================================================

export const TEXTOS = {
  titulo: 'Termómetro de la Tierra',
  subtitulo: 'Cien años de temperatura global, año por año',

  cifra: {
    etiquetaAnual: 'Promedio del año',
    etiquetaMensual: 'Mes',
    lejos: 'a {d} °C de +1,5',
    encima: '{d} °C sobre +1,5',
    encima2: 'por encima de +2,0',
    parcial: 'año incompleto ({m} meses)',
    notaParis: 'Los umbrales de París se miden desde 1880–1900.',
  },

  referencia: {
    titulo: '¿Más caliente que qué?',
    pre: 'Antes de la industria',
    preDetalle: '1880–1900',
    nasa: 'Referencia de NASA',
    nasaDetalle: '1951–1980',
    explicacion:
      'Una anomalía es cuánto se aleja la temperatura de un promedio de referencia. NASA publica sus datos comparando con 1951–1980; para hablar del Acuerdo de París los comparamos con el clima antes de la industria. Cambia la referencia y mira cómo se mueve el suelo: las temperaturas son las mismas, lo que cambia es desde dónde medimos.',
  },

  comparacion: {
    inicio: 'Primeros 12 meses',
    final: 'Últimos 12 meses',
    cambio: 'Cambio',
  },

  linea: {
    ayuda: 'Arrastra las asas para elegir tu período · pasa por las franjas para recorrer los años',
    todo: 'Todo',
    anios: '{n} años',
  },

  vidrios: {
    p15: '+1,5 °C París',
    p20: '+2,0 °C',
  },

  sonido: { activar: 'Activar sonido', silenciar: 'Silenciar' },

  misiones: {
    titulo: 'Misiones',
    nivel: 'Nivel {n}',
    completas: '{c} de {t}',
    final: 'Termómetro completo. Ya sabes leer el clima del planeta.',
  },

  creditos: 'Datos: NASA GISS Surface Temperature Analysis (GISTEMP v4) · Arquitectura de Sistemas Multimedia, UAO',
};

// Reemplaza {llaves} en un texto: plantilla('a {d} °C', { d: '0,07' })
export function plantilla(texto, valores) {
  return texto.replace(/\{(\w+)\}/g, (_, k) => valores[k] ?? '');
}
