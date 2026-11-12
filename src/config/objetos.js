// ==========================================================
// OBJETOS INTERACTIVOS del paisaje: al tocarlos explican de dónde salen los datos.
// x: posición horizontal en % · sprite: nombre del dibujo en components/Sprites.jsx
// Para usar un PNG propio, agrega imagen: '/assets/decoracion/fabrica.png'
// ==========================================================

export const OBJETOS = [
  {
    id: 'fabrica', sprite: 'fabrica', x: 10,
    nombre: 'Fábrica de 1890',
    titulo: 'El cero: antes de la industria',
    texto: 'Los límites del Acuerdo de París se miden desde la época preindustrial. Usamos el promedio de 1880 a 1900, cuando apenas empezaban a quemarse combustibles a gran escala. Estaba {offset} °C por debajo de la referencia de NASA.',
  },
  {
    id: 'estacion', sprite: 'estacion', x: 33,
    nombre: 'Estación meteorológica',
    titulo: 'Miles de estaciones en tierra',
    texto: 'GISTEMP reúne las mediciones de miles de estaciones meteorológicas de todo el mundo (red NOAA GHCN v4). Cada una aporta su diferencia frente a su propio promedio, y así se pueden combinar lugares muy distintos.',
  },
  {
    id: 'boya', sprite: 'boya', x: 62,
    nombre: 'Boya oceánica',
    titulo: 'El océano también cuenta',
    texto: 'El océano cubre cerca del 70 % del planeta. Su temperatura de superficie (serie ERSST v5) se mide con barcos y boyas, y se combina con la de tierra para formar el índice global tierra-océano.',
  },
  {
    id: 'termometro', sprite: 'termometro', x: 88,
    nombre: 'Termómetro gigante',
    titulo: 'Qué tan cerca estamos',
    texto: 'Los últimos 12 meses promedian {ultimos12} °C sobre la era preindustrial. El límite de París es +1,5 °C de calentamiento sostenido, medido en décadas, no en un solo año.',
  },
];
