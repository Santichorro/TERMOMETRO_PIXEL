// Escala divergente frío → cálido para codificar anomalías de temperatura.
const COLD = [43, 92, 138];     // #2B5C8A
const NEUTRAL = [241, 238, 233]; // #F1EEE9
const WARM = [178, 58, 38];     // #B23A26

function mix(a, b, t) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t));
}

export function stripeColor(value, min = -0.3, max = 1.5) {
  const mid = 0.5 * (min + max) - 0.15; // el neutro queda cerca de +0.45 °C
  if (value <= mid) {
    const t = Math.min(1, Math.max(0, (value - min) / (mid - min)));
    return `rgb(${mix(COLD, NEUTRAL, t).join(',')})`;
  }
  const t = Math.min(1, Math.max(0, (value - mid) / (max - mid)));
  return `rgb(${mix(NEUTRAL, WARM, t).join(',')})`;
}

