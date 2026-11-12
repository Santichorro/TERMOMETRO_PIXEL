import { useEffect, useRef } from 'react';
import { ASSETS } from '../config/assets.js';

// ==========================================================
// PAISAJE pixel 2D: de día (calor 0) a atardecer rojo (calor ≥ 1,5 °C).
// El sol baja hacia el horizonte y las nubes se mueven despacio.
// Si en config/assets.js hay capas propias, se usan esas y se tiñen igual.
// ==========================================================

const W = 384;
const H = 216;

// Paletas: [día, atardecer]
const CIELO = [
  ['#7ec4ec', '#3a1846'],
  ['#8fcdee', '#5a1f4c'],
  ['#a2d6f0', '#82254a'],
  ['#b5def1', '#a83140'],
  ['#c7e6f1', '#c9442f'],
  ['#d6ecef', '#e2652c'],
  ['#e3f1ec', '#f08c3a'],
  ['#eef5e6', '#f6b45a'],
];
const MONTANA_LEJOS = ['#a9c9c9', '#7a3654'];
const MONTANA_CERCA = ['#8db59a', '#5a2a48'];
const COLINA = ['#7fae6b', '#46233c'];
const PINO = ['#4f7f58', '#2e1830'];
const PINO_LUZ = ['#6b9c6a', '#4a2240'];
const PASTO = ['#88b860', '#3d2236'];
const NUBE = ['#ffffff', '#ffc9a0'];
const NUBE_SOMBRA = ['#dbe9ef', '#e88a6a'];

function mezcla(par, t) {
  const a = parseInt(par[0].slice(1), 16);
  const b = parseInt(par[1].slice(1), 16);
  const c = s => Math.round(((a >> s) & 255) + (((b >> s) & 255) - ((a >> s) & 255)) * t);
  return `rgb(${c(16)},${c(8)},${c(0)})`;
}

function semilla(s) {
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const NUBES = (() => {
  const r = semilla(11);
  return Array.from({ length: 7 }, () => ({ x: r() * W, y: 18 + r() * 60, w: 26 + r() * 40, v: 2 + r() * 4 }));
})();
const PINOS = (() => {
  const r = semilla(23);
  return Array.from({ length: 26 }, (_, i) => ({ x: (i / 26) * W + r() * 12, h: 18 + Math.floor(r() * 18) }));
})();

function dibujar(ctx, t, tiempo) {
  // Cielo en bandas con tramado entre bandas
  const alto = Math.ceil(150 / CIELO.length);
  CIELO.forEach((par, i) => {
    ctx.fillStyle = mezcla(par, t);
    ctx.fillRect(0, i * alto, W, alto);
    if (i < CIELO.length - 1) {
      ctx.fillStyle = mezcla(CIELO[i + 1], t);
      for (let x = i % 2; x < W; x += 2) ctx.fillRect(x, i * alto + alto - 1, 1, 1);
    }
  });

  // Sol: baja y se vuelve más grande y rojo con el calor
  const solY = Math.round(34 + t * 92);
  const solX = 290;
  const radio = Math.round(10 + t * 6);
  ctx.fillStyle = mezcla(['#fff3b0', '#ff7a3d'], t);
  for (let dy = -radio; dy <= radio; dy++) {
    const w = Math.round(Math.sqrt(radio * radio - dy * dy));
    ctx.fillRect(solX - w, solY + dy, w * 2, 1);
  }
  ctx.fillStyle = mezcla(['#ffe27a', '#e8452e'], t);
  for (let dy = -radio + 3; dy <= radio - 3; dy += 3) ctx.fillRect(solX - radio + 4, solY + dy, (radio - 4) * 2, 1);

  // Nubes que se desplazan
  NUBES.forEach(n => {
    const x = Math.round(((n.x + tiempo * n.v) % (W + 80)) - 40);
    const y = Math.round(n.y);
    ctx.fillStyle = mezcla(NUBE_SOMBRA, t);
    ctx.fillRect(x + 2, y + 6, n.w, 4);
    ctx.fillStyle = mezcla(NUBE, t);
    ctx.fillRect(x, y + 3, n.w, 5);
    ctx.fillRect(x + 6, y, n.w * 0.45, 4);
    ctx.fillRect(x + n.w * 0.4, y - 2, n.w * 0.35, 5);
  });

  // Montañas
  const capa = (base, amp, par, f, fase) => {
    ctx.fillStyle = mezcla(par, t);
    for (let x = 0; x < W; x += 2) {
      const y = Math.round(base - Math.abs(Math.sin((x + fase) / f)) * amp - Math.abs(Math.sin((x + fase) / (f * 0.37))) * amp * 0.3);
      ctx.fillRect(x, y, 2, H - y);
    }
  };
  capa(136, 40, MONTANA_LEJOS, 52, 30);
  capa(150, 26, MONTANA_CERCA, 34, 120);
  capa(166, 10, COLINA, 60, 10);

  // Pinos (estilo Quiet Place)
  PINOS.forEach(p => {
    const base = 178;
    for (let j = 0; j < p.h; j++) {
      const ancho = Math.max(1, Math.round((j / p.h) * 9));
      ctx.fillStyle = mezcla(j % 4 === 0 ? PINO_LUZ : PINO, t);
      ctx.fillRect(Math.round(p.x - ancho / 2), base - p.h + j, ancho, 1);
    }
    ctx.fillStyle = mezcla(['#6b4a30', '#24121e'], t);
    ctx.fillRect(Math.round(p.x), base, 1, 3);
  });

  // Suelo donde se apoyan los objetos
  ctx.fillStyle = mezcla(PASTO, t);
  ctx.fillRect(0, 180, W, H - 180);
  ctx.fillStyle = mezcla(['#a6cc76', '#57304a'], t);
  for (let x = 0; x < W; x += 3) ctx.fillRect(x, 180 + ((x * 7) % 5), 1, 1);
}

export default function Cielo({ calor = 0 }) {
  const ref = useRef(null);
  const tObjetivo = useRef(0);
  const capas = Object.values(ASSETS.fondo).filter(Boolean);
  const usarAssets = capas.length > 0;
  const t = Math.max(0, Math.min(1, calor / 1.5));

  useEffect(() => {
    tObjetivo.current = t;
  }, [t]);

  useEffect(() => {
    if (usarAssets || !ref.current) return;
    const ctx = ref.current.getContext('2d');
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let actual = tObjetivo.current;
    let id;
    let ultimo = 0;
    const inicio = performance.now();
    const paso = ahora => {
      id = requestAnimationFrame(paso);
      if (ahora - ultimo < 66) return; // ~15 cuadros por segundo: suficiente para pixel art
      ultimo = ahora;
      actual += (tObjetivo.current - actual) * 0.12;
      dibujar(ctx, actual, reducido ? 0 : (ahora - inicio) / 1000);
    };
    // Solo se anima mientras el paisaje se ve y la pestaña está activa
    let visible = true;
    const reanudar = () => {
      cancelAnimationFrame(id);
      if (visible && !document.hidden) id = requestAnimationFrame(paso);
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; reanudar(); });
    io.observe(ref.current);
    document.addEventListener('visibilitychange', reanudar);
    reanudar();
    return () => {
      cancelAnimationFrame(id);
      io.disconnect();
      document.removeEventListener('visibilitychange', reanudar);
    };
  }, [usarAssets]);

  return (
    <div className="cielo" aria-hidden="true">
      {usarAssets
        ? capas.map(src => <img key={src} src={src} alt="" className="cielo-capa pixel-img" />)
        : <canvas ref={ref} width={W} height={H} className="cielo-capa" />}
      {usarAssets && <div className="cielo-tinte" style={{ opacity: t * 0.6 }} />}
    </div>
  );
}
