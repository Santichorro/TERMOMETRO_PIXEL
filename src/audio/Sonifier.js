// ==========================================================
// EFECTOS DE SONIDO (Web Audio API, sintetizados: sin archivos).
// No hay sonido de ambiente: solo efectos cortos cuando el usuario hace algo.
// - nota(valor): al seleccionar un año. Más caliente → más aguda y áspera.
// - clic(): al presionar botones.
// - hover(): al pasar el mouse sobre algo seleccionable.
// - logro(): al completar una misión.
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
    this.ultimaNota = 0;
    this.ultimoHover = 0;
  }

  get activo() {
    return Boolean(this.ctx) && this.ctx.state === 'running';
  }

  // Llamar desde un clic (los navegadores lo exigen)
  async iniciar() {
    if (this.ctx) {
      await this.ctx.resume();
      return;
    }
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.7;
    this.master.connect(ctx.createDynamicsCompressor()).connect(ctx.destination);
  }

  async pausar() {
    await this.ctx?.suspend();
  }

  // Tono corto genérico: frecuencia, duración, tipo de onda, volumen, paneo
  tono(freq, { dur = 0.08, tipo = 'square', vol = 0.06, pan = 0, desliza = 0 } = {}) {
    if (!this.activo) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = tipo;
    o.frequency.setValueAtTime(freq, t);
    if (desliza) o.frequency.exponentialRampToValueAtTime(freq * desliza, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    const p = ctx.createStereoPanner();
    p.pan.value = Math.max(-1, Math.min(1, pan));
    o.connect(g).connect(p).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.02);
    o.onended = () => p.disconnect();
  }

  // Al seleccionar un año. pan: -1 izquierda … 1 derecha
  nota(valor, pan = 0) {
    if (!this.activo) return;
    const t = this.ctx.currentTime;
    if (t - this.ultimaNota < 0.04) return;
    this.ultimaNota = t;
    const calor = clamp01((valor - MIN_V) / (MAX_V - MIN_V));
    this.tono(valorAFrecuencia(valor), {
      dur: 0.3 + (1 - calor) * 0.25,
      tipo: calor > 0.7 ? 'square' : 'triangle',
      vol: 0.1 + calor * 0.05,
      pan,
    });
  }

  // Botón presionado: "clic" de 8 bits que baja de tono
  clic() {
    this.tono(880, { dur: 0.06, tipo: 'square', vol: 0.05, desliza: 0.6 });
  }

  // Pasar el mouse sobre algo seleccionable: "tic" muy suave
  hover() {
    if (!this.activo) return;
    const t = this.ctx.currentTime;
    if (t - this.ultimoHover < 0.05) return;
    this.ultimoHover = t;
    this.tono(1320, { dur: 0.03, tipo: 'triangle', vol: 0.025 });
  }

  // Misión completada: arpegio corto
  logro() {
    if (!this.activo) return;
    [72, 76, 79, 84].forEach((m, i) => setTimeout(() => this.tono(midiAHz(m), { dur: 0.22, vol: 0.06 }), i * 70));
  }

  cerrar() {
    this.ctx?.close();
    this.ctx = null;
  }
}
