// Formato español con signo y coma decimal: +1,43 · −0,22 · 0,00
export function fmt(v, decimales = 2) {
  if (!Number.isFinite(v)) return '—';
  if (Number(v.toFixed(decimales)) === 0) return (0).toFixed(decimales).replace('.', ',');
  return `${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(decimales).replace('.', ',')}`;
}
