// ==========================================================
// OBJETOS 3D sobre el planeta: al tocarlos explican de dónde salen los datos.
// lat / lon: dónde se paran en el globo · escala: tamaño relativo
// Repartidos cada ~72° de longitud a partir de la boya (−140°): −140, −66, −2, 78, 148;
// el arrecife (150°) va en el hemisferio sur, lejos de la estación de Siberia.
// Los modelos se dibujan en src/lib/objetos3d.js
// ==========================================================

export const OBJETOS = [
  {
    id: 'fabrica', lat: 53.5, lon: -2.2, escala: 1.9,
    nombre: 'Fábrica de 1890',
    titulo: 'El cero: antes de la industria',
    texto: 'Los límites del Acuerdo de París se miden desde la época preindustrial. Usamos el promedio de 1880 a 1900, cuando apenas empezaban a quemarse combustibles a gran escala. Estaba {offset} °C por debajo de la referencia de NASA.',
  },
  {
    id: 'estacion', lat: 62, lon: 148, escala: 1.9,
    nombre: 'Estación meteorológica',
    titulo: 'Miles de estaciones en tierra',
    texto: 'GISTEMP reúne las mediciones de miles de estaciones meteorológicas de todo el mundo (red NOAA GHCN v4). Cada una aporta su diferencia frente a su propio promedio, y así se pueden combinar lugares muy distintos.',
  },
  {
    id: 'boya', lat: 0, lon: -140, escala: 2, flota: true,
    nombre: 'Boya oceánica',
    titulo: 'El océano también cuenta',
    texto: 'El océano cubre cerca del 70 % del planeta. Su temperatura de superficie (serie ERSST v5) se mide con barcos y boyas, y se combina con la de tierra para formar el índice global tierra-océano.',
  },
  {
    id: 'glaciar', lat: 31, lon: 78, escala: 1.9,
    nombre: 'Glaciar del Himalaya',
    titulo: '¿Por qué importan unas décimas?',
    texto: 'Hace unos 20.000 años, en la última era glacial, el planeta era en promedio solo unos 6 °C más frío que hoy, y el hielo cubría gran parte de Norteamérica y Europa. Unos pocos grados en el promedio global cambian el mundo entero: por eso cada décima cuenta.',
  },
  {
    id: 'arrecife', lat: -20, lon: 150, escala: 1.9, flota: true,
    nombre: 'Arrecife de coral',
    titulo: 'Cuando el mar no se enfría',
    texto: 'Los corales de la Gran Barrera, en Australia, viven cerca de su límite de temperatura. Si el agua se mantiene más caliente de lo normal durante semanas, expulsan las algas que les dan color y alimento, y se blanquean. Mira este arrecife: pierde el color a medida que avanzas en los años.',
  },
  {
    id: 'termometro', lat: -6, lon: -66, escala: 1.9,
    nombre: 'Termómetro gigante',
    titulo: 'Qué tan cerca estamos',
    texto: 'Los últimos 12 meses promedian {ultimos12} °C sobre la era preindustrial. El límite de París es +1,5 °C de calentamiento sostenido, medido en décadas, no en un solo año.',
  },
];
