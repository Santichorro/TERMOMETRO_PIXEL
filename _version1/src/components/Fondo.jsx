import { useEffect, useRef } from 'react';
import { ASSETS } from '../config/assets.js';

// ==========================================================
// FONDO 2D pixel art.
// Si en config/assets.js hay imágenes, se usan esas capas.
// Si no, se dibuja un paisaje provisional por código (320×180 px, escalado sin suavizado).
// El tinte de "aire caliente" se aplica encima en ambos casos.
// ==========================================================

const W = 320;
const H = 180;

// Generador pseudoaleatorio fijo: el paisaje sale igual en cada carga
function semilla(s) {
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dibujarPaisaje(ctx) {
  const rnd = semilla(7);
  // Cielo en bandas (degradado escalonado, sin suavizar)
  const bandas = ['#060b24', '#0a1233', '#101a44', '#172255', '#1f2a63', '#2b2f6e', '#3b3577', '#4c3a7b'];
  const alto = Math.ceil(110 / bandas.length);
  bandas.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(0, i * alto, W, alto);
    // tramado entre bandas
    if (i < bandas.length - 1) {
      ctx.fillStyle = bandas[i + 1];
      for (let x = (i % 2); x < W; x += 2) ctx.fillRect(x, i * alto + alto - 1, 1, 1);
    }
  });
  // Estrellas
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(rnd() * W);
    const y = Math.floor(rnd() * 80);
    ctx.fillStyle = rnd() > 0.85 ? '#fde68a' : '#cbd5e1';
    ctx.fillRect(x, y, 1, 1);
  }
  // Luna
  ctx.fillStyle = '#f1f5f9';
  [[0, 2, 6], [1, 1, 8], [2, 0, 10], [3, 0, 10], [4, 0, 10], [5, 0, 10], [6, 0, 10], [7, 1, 8], [8, 2, 6]]
    .forEach(([dy, dx, w]) => ctx.fillRect(262 + dx, 22 + dy, w, 1));
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(265, 25, 2, 2);
  ctx.fillRect(268, 28, 1, 1);

  // Montañas: tres capas escalonadas
  const capas = [
    { base: 118, amp: 34, color: '#2a2f63', paso: 3, ruido: 0.9 },
    { base: 128, amp: 26, color: '#1d2350', paso: 2, ruido: 0.7 },
    { base: 140, amp: 16, color: '#141a3d', paso: 2, ruido: 0.5 },
  ];
  capas.forEach((c, k) => {
    ctx.fillStyle = c.color;
    for (let x = 0; x < W; x += c.paso) {
      const pico = Math.sin((x + k * 57) / (38 - k * 6)) * c.amp * 0.6 + Math.sin((x + k * 13) / 17) * c.amp * 0.25;
      const y = Math.round(c.base - Math.abs(pico) - rnd() * c.ruido * 3);
      ctx.fillRect(x, y, c.paso, H - y);
    }
    // nieve en la capa de atrás
    if (k === 0) {
      ctx.fillStyle = '#5b5f9a';
      for (let x = 0; x < W; x += 3) {
        const pico = Math.sin(x / 38) * c.amp * 0.6 + Math.sin((x + 0) / 17) * c.amp * 0.25;
        if (Math.abs(pico) > c.amp * 0.6) ctx.fillRect(x, Math.round(c.base - Math.abs(pico)), 3, 2);
      }
    }
  });
  // Pinos
  for (let i = 0; i < 46; i++) {
    const x = Math.floor(rnd() * W);
    const h = 6 + Math.floor(rnd() * 8);
    const base = 150 + Math.floor(rnd() * 6);
    ctx.fillStyle = rnd() > 0.5 ? '#0d2a2a' : '#0f3330';
    for (let j = 0; j < h; j++) {
      const ancho = Math.max(1, Math.round((j / h) * 5));
      ctx.fillRect(x - Math.floor(ancho / 2), base - h + j, ancho, 1);
    }
    ctx.fillStyle = '#1a1206';
    ctx.fillRect(x, base, 1, 2);
  }
  // Suelo lejano
  ctx.fillStyle = '#0b1a1c';
  ctx.fillRect(0, 154, W, H - 154);
}

export default function Fondo({ calor = 0 }) {
  const ref = useRef(null);
  const capas = Object.values(ASSETS.fondo).filter(Boolean);
  const usarAssets = capas.length > 0;

  useEffect(() => {
    if (usarAssets || !ref.current) return;
    const ctx = ref.current.getContext('2d');
    dibujarPaisaje(ctx);
  }, [usarAssets]);

  // calor 0 → noche fría · 1 → aire rojo (anomalía cercana a +1,5 °C)
  const t = Math.max(0, Math.min(1, calor / 1.5));

  return (
    <div className="fondo" aria-hidden="true">
      {usarAssets
        ? capas.map(src => <img key={src} src={src} alt="" className="fondo-capa pixel-img" />)
        : <canvas ref={ref} width={W} height={H} className="fondo-capa" />}
      {ASSETS.decoracion.elementos.map((d, i) => (
        <img key={i} src={d.src} alt="" className="fondo-deco pixel-img"
          style={{ left: `${d.x}%`, top: `${d.y}%`, width: `${d.ancho}%` }} />
      ))}
      <div className="fondo-calor" style={{ opacity: t * 0.55 }} />
    </div>
  );
}
