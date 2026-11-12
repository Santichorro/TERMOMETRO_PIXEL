import { useEffect, useRef } from 'react';

// Transición tramada (dither) del paisaje a las secciones de lectura
export default function Dither({ color = '#eef4f1' }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c.getContext('2d');
    const W = c.width;
    const H = c.height;
    let s = 97;
    const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    ctx.fillStyle = color;
    for (let y = 0; y < H; y++) {
      const densidad = (y / H) ** 1.6;
      for (let x = 0; x < W; x++) if (rnd() < densidad) ctx.fillRect(x, y, 1, 1);
    }
  }, [color]);
  return <canvas ref={ref} width={384} height={28} className="dither" aria-hidden="true" />;
}
