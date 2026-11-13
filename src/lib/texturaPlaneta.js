// ==========================================================
// Texturas del planeta, optimizadas:
// - Los continentes vienen PRE-DIBUJADOS en una imagen pequeña
//   (src/assets/tierra-sprite.png, ~21 KB, 3 bandas: tierra, contornos, retícula;
//   hoy se usan la tierra y la retícula punteada).
//   Así no se descarga ni se procesa el mapa vectorial en el navegador.
// - El campo de anomalías se calcula a 128×64 con tablas precalculadas
//   (vectores por píxel, factores fijos y paleta de 512 colores).
// ==========================================================

export const TEX_W = 512;
export const TEX_H = 256;
const FW = 128;
const FH = 64;

// Escala de color de los mapas de NASA GISTEMP (°C respecto a 1951–1980)
export const ESCALA_NASA = [
  [-4, [27, 42, 143]], [-2, [47, 111, 224]], [-1, [124, 200, 240]], [-0.5, [200, 236, 248]],
  [-0.2, [255, 255, 255]], [0.2, [255, 255, 255]], [0.5, [255, 243, 160]], [1, [255, 224, 46]],
  [2, [255, 154, 31]], [3, [227, 38, 28]], [4, [122, 10, 10]],
];
function colorNasa(v) {
  if (v <= ESCALA_NASA[0][0]) return ESCALA_NASA[0][1];
  for (let i = 1; i < ESCALA_NASA.length; i++) {
    const [b, cb] = ESCALA_NASA[i];
    if (v <= b) {
      const [a, ca] = ESCALA_NASA[i - 1];
      const t = (v - a) / (b - a);
      return [ca[0] + (cb[0] - ca[0]) * t, ca[1] + (cb[1] - ca[1]) * t, ca[2] + (cb[2] - ca[2]) * t];
    }
  }
  return ESCALA_NASA.at(-1)[1];
}
// Paleta precalculada: 512 pasos entre −4 y +4 °C, empaquetada como RGBA de 32 bits
const PASOS = 512;
const PALETA = new Uint32Array(PASOS);
for (let i = 0; i < PASOS; i++) {
  const [r, g, b] = colorNasa(-4 + (8 * i) / (PASOS - 1));
  PALETA[i] = (255 << 24) | (Math.round(b) << 16) | (Math.round(g) << 8) | Math.round(r); // little-endian
}

// Manchas regionales ilustrativas (semilla fija): centro, radio, deriva por año
const MANCHAS = Array.from({ length: 18 }, (_, i) => {
  const r = n => { const x = Math.sin((i + 1) * 9301 + n * 49297) * 233280; return x - Math.floor(x); };
  return { lat: -60 + r(1) * 130, lon: -180 + r(2) * 360, k: 1 / ((0.18 + r(3) * 0.32) * 0.18), vel: (r(4) - 0.5) * 9, signo: r(5) < 0.5 ? -1 : 1, fase: r(6) * 6.28 };
});

// Tablas por píxel del campo (se llenan una vez)
const VX = new Float32Array(FW * FH);
const VY = new Float32Array(FW * FH);
const VZ = new Float32Array(FW * FH);
const FIJO = new Float32Array(FW * FH); // 1 + Ártico − austral + tierra
for (let j = 0; j < FH; j++) {
  const lat = ((90 - ((j + 0.5) / FH) * 180) * Math.PI) / 180;
  for (let i = 0; i < FW; i++) {
    const lon = ((-180 + ((i + 0.5) / FW) * 360) * Math.PI) / 180;
    const k = j * FW + i;
    VX[k] = Math.cos(lat) * Math.cos(lon);
    VY[k] = Math.cos(lat) * Math.sin(lon);
    VZ[k] = Math.sin(lat);
  }
}

// ---------- Sprite de continentes ----------
// Convierte cada banda gris del sprite en una máscara con transparencia.
export function prepararCapas(img) {
  const banda = n => {
    const c = document.createElement('canvas');
    c.width = TEX_W;
    c.height = TEX_H;
    const x = c.getContext('2d', { willReadFrequently: n === 0 });
    x.drawImage(img, 0, n * TEX_H, TEX_W, TEX_H, 0, 0, TEX_W, TEX_H);
    const d = x.getImageData(0, 0, TEX_W, TEX_H);
    for (let i = 0; i < d.data.length; i += 4) { d.data[i + 3] = d.data[i]; d.data[i] = d.data[i + 1] = d.data[i + 2] = 255; }
    x.putImageData(d, 0, 0);
    return c;
  };
  const tierra = banda(0);
  const reticula = banda(2);

  // Factor fijo del campo: más calor en el Ártico y en tierra firme
  const chica = document.createElement('canvas');
  chica.width = FW;
  chica.height = FH;
  const cx = chica.getContext('2d', { willReadFrequently: true });
  cx.drawImage(tierra, 0, 0, FW, FH);
  const a = cx.getImageData(0, 0, FW, FH).data;
  for (let j = 0; j < FH; j++) {
    const lat = 90 - ((j + 0.5) / FH) * 180;
    const artico = Math.max(0, (lat - 45) / 45);
    const austral = Math.max(0, (-lat - 50) / 40);
    for (let i = 0; i < FW; i++) {
      const k = j * FW + i;
      FIJO[k] = 1 + 2.2 * artico - 0.6 * austral + 0.55 * (a[k * 4 + 3] / 255);
    }
  }

  // Capa del mapa (se calcula una vez): tierra firme con un tinte muy suave, sin
  // bordes, para reconocer los continentes + retícula punteada. Sin contornos continuos.
  const mapa = document.createElement('canvas');
  mapa.width = TEX_W;
  mapa.height = TEX_H;
  const mx = mapa.getContext('2d');
  mx.globalAlpha = 0.45;
  mx.drawImage(reticula, 0, 0);
  mx.globalAlpha = 1;
  mx.globalCompositeOperation = 'source-in';
  mx.fillStyle = '#13212c';
  mx.fillRect(0, 0, TEX_W, TEX_H);
  mx.globalCompositeOperation = 'source-over';
  mx.globalAlpha = 0.09;
  const tinteTierra = document.createElement('canvas');
  tinteTierra.width = TEX_W;
  tinteTierra.height = TEX_H;
  const tx = tinteTierra.getContext('2d');
  tx.drawImage(tierra, 0, 0);
  tx.globalCompositeOperation = 'source-in';
  tx.fillStyle = '#13212c';
  tx.fillRect(0, 0, TEX_W, TEX_H);
  mx.drawImage(tinteTierra, 0, 0);
  mx.globalAlpha = 1;

  const campo = document.createElement('canvas');
  campo.width = FW;
  campo.height = FH;
  const campoCtx = campo.getContext('2d');
  const campoImg = campoCtx.createImageData(FW, FH);

  const tinte = document.createElement('canvas'); // para colorear tierra y contornos
  tinte.width = TEX_W;
  tinte.height = TEX_H;

  return { tierra, mapa, campo, campoCtx, campoImg, campo32: new Uint32Array(campoImg.data.buffer), tinte, tinteCtx: tinte.getContext('2d') };
}

// g = anomalía global respecto a 1951–1980; anio = posición en el tiempo (decimal)
function pintarCampo(capas, g, anio) {
  const n = MANCHAS.length;
  const cx = new Float32Array(n), cy = new Float32Array(n), cz = new Float32Array(n), amp = new Float32Array(n), kk = new Float32Array(n);
  MANCHAS.forEach((m, i) => {
    const la = (m.lat * Math.PI) / 180;
    const lo = ((m.lon + m.vel * (anio - 1926) * 0.35) * Math.PI) / 180;
    cx[i] = Math.cos(la) * Math.cos(lo); cy[i] = Math.cos(la) * Math.sin(lo); cz[i] = Math.sin(la);
    amp[i] = m.signo * (0.55 + 0.45 * Math.sin(anio * 0.9 + m.fase)) * (0.45 + 0.25 * Math.abs(g));
    kk[i] = m.k;
  });
  const salida = capas.campo32;
  const escala = (PASOS - 1) / 8;
  for (let p = 0; p < FW * FH; p++) {
    const x = VX[p], y = VY[p], z = VZ[p];
    let v = g * FIJO[p];
    for (let i = 0; i < n; i++) {
      const d = 1 - (x * cx[i] + y * cy[i] + z * cz[i]);
      if (d < 0.6) v += amp[i] * Math.exp(-d * kk[i]); // lejos de la mancha no aporta
    }
    let idx = ((v + 4) * escala) | 0;
    if (idx < 0) idx = 0; else if (idx >= PASOS) idx = PASOS - 1;
    salida[p] = PALETA[idx];
  }
  capas.campoCtx.putImageData(capas.campoImg, 0, 0);
}

function colorear(capas, origen, color) {
  const x = capas.tinteCtx;
  x.globalCompositeOperation = 'copy';
  x.drawImage(origen, 0, 0);
  x.globalCompositeOperation = 'source-in';
  x.fillStyle = color;
  x.fillRect(0, 0, TEX_W, TEX_H);
  return capas.tinte;
}

export function pintarTextura(ctx, vista, c, capas, mezcla) {
  if (vista === 'mapa') {
    pintarCampo(capas, c.nasa, c.anio);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(capas.campo, 0, 0, TEX_W, TEX_H);
    ctx.drawImage(capas.mapa, 0, 0); // tinte de continentes + retícula, precalculados
    return;
  }
  const t = Math.max(0, Math.min(1, c.valor / 1.5));
  ctx.fillStyle = mezcla('#3d86c6', '#a8503a', t); // océano
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  ctx.drawImage(colorear(capas, capas.tierra, mezcla('#79b35a', '#d9a24a', t)), 0, 0);
  // Casquetes polares (decorativos; no representan datos de hielo)
  ctx.fillStyle = mezcla('#f4f8fb', '#f6e2d6', t);
  ctx.fillRect(0, 0, TEX_W, TEX_H * 0.045);
  ctx.fillRect(0, TEX_H * 0.94, TEX_W, TEX_H * 0.06);
}
