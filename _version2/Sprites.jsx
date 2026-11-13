// ==========================================================
// SPRITES pixel art de los objetos del paisaje (16×16, dibujados a mano).
// Cada letra es un color de PALETA; '.' es transparente.
// Para reemplazarlos por PNG propios usa `imagen` en config/objetos.js.
// ==========================================================

const PALETA = {
  k: '#13212c', // contorno
  g: '#6b7a86', // gris
  G: '#a7b4bd', // gris claro
  w: '#f4f1ea', // blanco cálido
  r: '#c8483a', // rojo
  R: '#e86b55', // rojo claro
  y: '#f2c14e', // amarillo
  b: '#2f7ea8', // azul
  B: '#7cc3e6', // azul claro
  m: '#7a5232', // madera
  s: '#c7d5cf', // humo
};

const DIBUJOS = {
  fabrica: [
    '..ss............',
    '.ssss...........',
    '..ss..ss........',
    '......ss........',
    '..kk..kk........',
    '..kr..kr........',
    '..kr..kr........',
    '..kr..kr..k..k..',
    '..kr..kr.kgk.kgk',
    'kkkkkkkkkgggkggg',
    'kGGGGGGGGGGGGGGk',
    'kGykGykGGykGykGk',
    'kGkkGkkGGkkGkkGk',
    'kGGGGGGGGGGGGGGk',
    'kGGmmGGGGGGGGGGk',
    'kkkkkkkkkkkkkkkk',
  ],
  estacion: [
    '.......k........',
    '......kyk.......',
    '.......k........',
    '...kkkkkkkkk....',
    '.......k........',
    '.......k........',
    '...kkkkkkkkkk...',
    '...kwwwwwwwwk...',
    '...kwkwkwkwwk...',
    '...kwwwwwwwwk...',
    '...kwkwkwkwwk...',
    '...kwwwwwwwwk...',
    '...kkkkkkkkkk...',
    '....km....mk....',
    '....km....mk....',
    '...kkk....kkk...',
  ],
  boya: [
    '.......k........',
    '......kyk.......',
    '.......k........',
    '......kkk.......',
    '.....kRRRk......',
    '.....kRRRk......',
    '....kwwwwwk.....',
    '....kRRRRRk.....',
    '...kRRRRRRRk....',
    '...kwwwwwwwk....',
    '..kRRRRRRRRRk...',
    '.BBkkkkkkkkkBB..',
    'BbBBbBBBbBBBbBBb',
    'bBbbBbbbBbbbBbbB',
    'bbbbbbbbbbbbbbbb',
    '................',
  ],
  termometro: [
    '......kkkk......',
    '.....kwwwwk.....',
    '.....kwkkwk.k...',
    '.....kwwwwkkk...',
    '.....kwrrwk.k...',
    '.....kwrrwkkk...',
    '.....kwrrwk.k...',
    '.....kwrrwkkk...',
    '.....kwrrwk.....',
    '.....kwrrwk.....',
    '....kwrrrrwk....',
    '...kwrRRRRrwk...',
    '...krRRRRRRrk...',
    '...krRRRRRRrk...',
    '....krrrrrrk....',
    '.....kkkkkk.....',
  ],
};

export default function Sprite({ nombre, tamano = 48 }) {
  const mapa = DIBUJOS[nombre];
  if (!mapa) return null;
  const rects = [];
  mapa.forEach((fila, y) =>
    [...fila].forEach((c, x) => {
      if (PALETA[c]) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={PALETA[c]} />);
    }),
  );
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">
      {rects}
    </svg>
  );
}
