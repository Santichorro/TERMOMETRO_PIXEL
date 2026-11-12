import { MISIONES, NIVELES } from '../config/misiones.js';

// XP, nivel y misiones completadas
export function progreso(completas) {
  const xp = MISIONES.filter(m => completas[m.id]).reduce((s, m) => s + m.xp, 0);
  const total = MISIONES.reduce((s, m) => s + m.xp, 0);
  const nivel = [...NIVELES].reverse().find(n => xp >= n.xp);
  return { xp, total, nivel, nivelNum: NIVELES.indexOf(nivel) + 1, hechas: MISIONES.filter(m => completas[m.id]).length };
}
