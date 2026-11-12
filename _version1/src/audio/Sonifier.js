// ==========================================================
// SONIDO de acompañamiento (Web Audio API, sintetizado: sin archivos).
// - nota(valor): más caliente → más aguda y más áspera (onda cuadrada tipo 8 bits).
// - fondo(valor): un tono grave que se tensa al acercarse a +1,5 °C.
// ==========================================================

const ESCALA = [0, 3, 5, 7, 10]; // pentatónica menor
const MIN_V = -0.4;
const MAX_V = 1.8;
const MIN_MIDI = 52;
const MAX_MIDI = 86;

const clamp01 = x => Math.min(1, Math.max(0, x));
const midiAHz = m => 440 * 2 ** ((m - 69) / 12);

function cuantizar(midi) {
  const oct = Math.floor(midi / 12);
  const pc = midi - oct * 12;
  const cerca = ESCALA.reduce((b, s) => (Math.abs(s - pc) < Math.abs(b - pc) ? s : b), ESCALA[0]);
  return oct * 12 + cerca;
}

export function valorAFrecuencia(valor) {
  const t = clamp01((valor - MIN_V) / (MAX_V - MIN_V));
  return midiAHz(cuantizar(Math.round(MIN_MIDI + t * (MAX_MIDI - MIN_MIDI))));
}

export default class Sonifier {
  constructor() {
    this.ctx = null;
    this.ultima = 0;
  }

  get activo() {
    return Boolean(this.ctx) && this.ctx.state === 'running';
  }

  // Llamar desde un clic (los navegadores lo exigen)
  async iniciar() {
    if (this.ctx) {
      await this.ctx.resume();
      this.master.gain.setTargetAtTime(0.7, this.ctx.currentTime, 0.1);
      return;
    }
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.7;
    this.master.connect(ctx.createDynamicsCompressor()).connect(ctx.destination);

    this.filtroFondo = ctx.createBiquadFilter();
    this.filtroFondo.type = 'lowpass';
    this.filtroFondo.frequency.value = 260;
    this.gananciaFondo = ctx.createGain();
    this.gananciaFondo.gain.value = 0;
    this.filtroFondo.connect(this.gananciaFondo).connect(this.master);
    this.osc = [55, 82.5].map(f => {
      const o = ctx.createOscillator();
      o.type = 'triangle';
      o.frequency.value = f;
      o.connect(this.filtroFondo);
      o.start();
      return o;
    });
  }

  async pausar() {
    if (!this.ctx) return;
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);
    setTimeout(() => this.ctx?.suspend(), 250);
  }

  fondo(valor) {
    if (!this.activo) return;
    const t = this.ctx.currentTime;
    const tension = clamp01(valor / 1.5);
    this.filtroFondo.frequency.setTargetAtTime(200 + tension ** 2 * 1400, t, 0.3);
    this.osc[1].frequency.setTargetAtTime(82.5 + tension ** 2 * 6, t, 0.3); // batimiento
    this.gananciaFondo.gain.setTargetAtTime(0.04 + tension * 0.05, t, 0.3);
  }

  // pan: -1 izquierda … 1 derecha (posición de la columna en pantalla)
  nota(valor, pan = 0) {
    if (!this.activo) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    if (t - this.ultima < 0.04) return;
    this.ultima = t;
    const calor = clamp01((valor - MIN_V) / (MAX_V - MIN_V));

    const o = ctx.createOscillator();
    o.type = calor > 0.7 ? 'square' : 'triangle';
    o.frequency.value = valorAFrecuencia(valor);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 900 + calor * 3500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.12 + calor * 0.06, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0008, t + 0.35 + (1 - calor) * 0.4);
    const p = ctx.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, pan));
    o.connect(f).connect(g).connect(p).connect(this.master);
    o.start(t);
    o.stop(t + 0.9);
    o.onended = () => p.disconnect();
  }

  // Pequeño acorde de logro (misión completada)
  logro() {
    if (!this.activo) return;
    const t = this.ctx.currentTime;
    [72, 76, 79, 84].forEach((m, i) => {
      const o = this.ctx.createOscillator();
      o.type = 'square';
      o.frequency.value = midiAHz(m);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, t + i * 0.07);
      g.gain.linearRampToValueAtTime(0.06, t + i * 0.07 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0008, t + i * 0.07 + 0.25);
      o.connect(g).connect(this.master);
      o.start(t + i * 0.07);
      o.stop(t + i * 0.07 + 0.3);
    });
  }

  cerrar() {
    this.ctx?.close();
    this.ctx = null;
  }
}
