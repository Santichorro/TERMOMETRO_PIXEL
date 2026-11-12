import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { stripeColor } from '../lib/colors.js';
import { TEXTOS } from '../config/textos.js';

// ==========================================================
// DIORAMA pixel art con volumen (proyección oblicua tipo juego).
// Cada columna = un año (o un mes en rangos cortos).
// Se dibuja en un canvas de baja resolución y se escala sin suavizado,
// así todo queda en pixeles reales.
// ==========================================================

const ALTO = 200;            // resolución interna (px de pixel art)
const MAX_GRADOS = 2.15;     // la escala llega un poco por encima de +2,0 °C
const PARIS = [1.5, 2.0];

function rgb(str) {
  const m = str.match(/\d+/g).map(Number);
  return { r: m[0], g: m[1], b: m[2] };
}
function tono({ r, g, b }, f) {
  const c = v => Math.max(0, Math.min(255, Math.round(f > 1 ? v + (255 - v) * (f - 1) : v * f)));
  return `rgb(${c(r)},${c(g)},${c(b)})`;
}

// Geometría compartida por el dibujo, las etiquetas y el puntero
function calcularGeo(W, n) {
  const H = ALTO;
  const izq = 10;
  const der = 14;
  const slot = (W - izq - der) / Math.max(1, n);
  const barra = slot >= 3 ? Math.max(1, Math.floor(slot * 0.72)) : Math.max(1, Math.floor(slot));
  const prof = Math.max(1, Math.min(7, Math.round(slot * 0.55)));
  const subir = Math.ceil(prof / 2);
  const sueloBase = H - 34;                       // dónde queda 0 °C preindustrial
  const k = (sueloBase - 22) / MAX_GRADOS;        // px por °C
  const yDe = v => Math.round(sueloBase - v * k);
  return { W, H, n, izq, der, slot, barra, prof, subir, yDe };
}

export default function Diorama({ items, activo, piso, onActivar, unidad, formatoValor }) {
  const contRef = useRef(null);
  const canvasRef = useRef(null);
  const [ancho, setAncho] = useState(480);
  const crecer = useRef({ inicio: 0, items: null });
  const geo = useMemo(() => calcularGeo(ancho, items.length), [ancho, items.length]);

  // Ajusta el ancho interno a la proporción del contenedor
  useEffect(() => {
    const el = contRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (width && height) setAncho(Math.max(240, Math.round((ALTO * width) / height)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Al cambiar el período, las columnas vuelven a crecer desde el suelo
  useEffect(() => {
    crecer.current = { inicio: performance.now(), items };
  }, [items]);

  const dibujar = useCallback(ahora => {
    const canvas = canvasRef.current;
    if (!canvas || !items.length) return false;
    const ctx = canvas.getContext('2d');
    const { W, H, n, izq, der, slot, barra, prof, subir, yDe } = geo;
    ctx.clearRect(0, 0, W, H);
    const ySuelo = yDe(piso);

    // ---- Suelo: losa de tierra con césped pixel ----
    const xIni = izq - 4;
    const xFin = W - der + prof + 2;
    ctx.fillStyle = '#1b3a1f';                       // cara superior (césped lejano)
    for (let j = 0; j < subir + 1; j++) ctx.fillRect(xIni + j * 2, ySuelo - j, xFin - xIni, 1);
    ctx.fillStyle = '#3f7a2c';                       // borde de césped
    ctx.fillRect(xIni, ySuelo, xFin - xIni, 2);
    ctx.fillStyle = '#4a2f1d';                       // tierra
    ctx.fillRect(xIni, ySuelo + 2, xFin - xIni, H - ySuelo - 2);
    ctx.fillStyle = '#3a2416';
    for (let y = ySuelo + 5; y < H; y += 4)
      for (let x = xIni + ((y / 4) % 2) * 3; x < xFin; x += 7) ctx.fillRect(x, y, 2, 1);
    ctx.fillStyle = '#6a4a30';
    for (let x = xIni + 2; x < xFin; x += 11) ctx.fillRect(x, ySuelo + 3, 1, 1);

    // ---- Líneas de referencia ----
    const linea = (v, color, guion, hueco) => {
      const y = yDe(v);
      ctx.fillStyle = color;
      for (let x = izq; x < W - der + prof; x += guion + hueco) ctx.fillRect(x, y, guion, 1);
    };
    linea(0.218, 'rgba(148,163,184,0.75)', 3, 2);   // cero de NASA (1951–1980)
    if (piso > 0.01) linea(0, 'rgba(148,163,184,0.35)', 1, 3); // cero preindustrial bajo el suelo

    // ---- Columnas ----
    const t = ahora - crecer.current.inicio;
    let animando = false;
    items.forEach((it, i) => {
      const crece = Math.min(1, Math.max(0, (t - i * (500 / n)) / 380));
      if (crece < 1) animando = true;
      const facil = 1 - (1 - crece) ** 3;
      const valor = piso + (it.value - piso) * facil;
      const x = Math.round(izq + i * slot);
      const yTop = yDe(valor);
      const arriba = Math.min(yTop, ySuelo);
      const alto = Math.max(1, Math.abs(ySuelo - yTop));
      const base = rgb(stripeColor(it.value));
      const esActivo = i === activo;

      ctx.fillStyle = tono(base, esActivo ? 1.18 : 1);
      ctx.fillRect(x, arriba, barra, alto);                         // cara frontal
      ctx.fillStyle = tono(base, 0.62);
      for (let j = 0; j < prof; j++)                                 // cara lateral
        ctx.fillRect(x + barra + j, arriba - Math.ceil(j / 2) - (j ? 0 : 0), 1, alto);
      if (valor >= piso) {
        ctx.fillStyle = tono(base, 1.35);
        for (let j = 0; j < subir; j++)                              // cara superior
          ctx.fillRect(x + j * 2 + 1, yTop - j - 1, barra, 1);
      }
      if (barra >= 3) {                                              // brillo pixel
        ctx.fillStyle = tono(base, 1.5);
        ctx.fillRect(x, arriba, 1, Math.min(alto, 3));
      }
      if (esActivo) {
        ctx.fillStyle = '#fde047';
        const yF = Math.min(yTop, ySuelo) - subir - 3;
        ctx.fillRect(x + Math.floor(barra / 2) - 1, yF - 3, 3, 1);   // flecha
        ctx.fillRect(x + Math.floor(barra / 2), yF - 2, 1, 2);
      }
    });

    // ---- Vidrios del Acuerdo de París (losas translúcidas) ----
    PARIS.forEach(v => {
      const y = yDe(v);
      ctx.fillStyle = v === 1.5 ? 'rgba(125,211,252,0.20)' : 'rgba(125,211,252,0.10)';
      for (let j = 0; j < subir + 1; j++) ctx.fillRect(izq + j * 2, y - j, W - izq - der, 1);
      ctx.fillStyle = v === 1.5 ? 'rgba(253,224,71,0.95)' : 'rgba(253,224,71,0.5)';
      ctx.fillRect(izq, y, W - izq - der, 1);
    });

    return animando;
  }, [items, activo, piso, geo]);

  // Bucle de dibujo (solo corre mientras hay animación)
  useEffect(() => {
    let id;
    const paso = ahora => {
      if (dibujar(ahora)) id = requestAnimationFrame(paso);
    };
    id = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(id);
  }, [dibujar]);

  // Etiquetas en HTML (texto nítido) sobre el canvas, en % del canvas
  const overlay = useMemo(() => {
    const it = items[activo];
    const pct = y => (y / geo.H) * 100;
    return {
      x: it ? ((geo.izq + (activo + 0.5) * geo.slot) / geo.W) * 100 : 0,
      y: it ? pct(Math.min(geo.yDe(it.value), geo.yDe(piso)) - geo.subir - 6) : 0,
      p15: pct(geo.yDe(1.5)),
      p20: pct(geo.yDe(2.0)),
      nasa: pct(geo.yDe(0.218)),
    };
  }, [items, activo, piso, geo]);

  const elegir = e => {
    const g = geo;
    const r = e.currentTarget.getBoundingClientRect();
    const xInt = ((e.clientX - r.left) / r.width) * g.W;
    const i = Math.floor((xInt - g.izq) / g.slot);
    if (i >= 0 && i < g.n) onActivar(i);
  };

  const it = items[activo];

  return (
    <div className="diorama" ref={contRef}>
      <canvas
        ref={canvasRef}
        width={ancho}
        height={ALTO}
        className="diorama-canvas"
        onPointerMove={e => (e.pointerType === 'mouse' || e.buttons) && elegir(e)}
        onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); elegir(e); }}
        role="img"
        aria-label={`Columnas de temperatura por ${unidad === 'year' ? 'año' : 'mes'}; ${it ? `seleccionado ${it.label}` : ''}`}
      />
      {items.length > 0 && (
        <>
          <span className="vidrio-label" style={{ top: `${overlay.p15}%` }}>{TEXTOS.vidrios.p15}</span>
          <span className="vidrio-label tenue" style={{ top: `${overlay.p20}%` }}>{TEXTOS.vidrios.p20}</span>
          <span className="nasa-label" style={{ top: `${overlay.nasa}%` }}>cero NASA</span>
          {it && (
            <span className="activo-label" style={{ left: `${overlay.x}%`, top: `${overlay.y}%` }}>
              {it.label}
              {formatoValor && <strong>{formatoValor(it.value)}</strong>}
            </span>
          )}
        </>
      )}
    </div>
  );
}
