import { useEffect, useMemo, useRef, useState } from 'react';
import useGistemp from './lib/useGistemp.js';
import { compareWindows, buildPathItems, annualMeans, average } from './lib/gistemp.js';
import Sonifier from './audio/Sonifier.js';
import Fondo from './components/Fondo.jsx';
import Diorama from './components/Diorama.jsx';
import LineaTiempo from './components/LineaTiempo.jsx';
import Referencia from './components/Referencia.jsx';
import Misiones from './components/Misiones.jsx';
import PixelIcon from './components/PixelIcon.jsx';
import { TEXTOS, plantilla } from './config/textos.js';
import { MISIONES } from './config/misiones.js';
import './App.css';

// Formato español: +1,43
const fmt = (v, d = 2) => {
  if (!Number.isFinite(v)) return '—';
  if (Number(v.toFixed(d)) === 0) return (0).toFixed(d).replace('.', ',');
  return `${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(d).replace('.', ',')}`;
};

export default function App() {
  const datos = useGistemp();
  const series = useMemo(() => datos.series ?? [], [datos.series]);
  const offset = datos.baselineOffset ?? -0.218;

  const anios = useMemo(() => annualMeans(series), [series]);
  const primero = anios[0]?.year;
  const ultimo = anios.at(-1)?.year;

  const [rangoElegido, setRangoElegido] = useState(null);
  const rango = useMemo(
    () => rangoElegido ?? (anios.length ? [primero, ultimo] : [0, 0]),
    [rangoElegido, anios.length, primero, ultimo],
  );
  const [referencia, setReferencia] = useState('pre');
  const [piso, setPiso] = useState(0);
  const [claveActiva, setClaveActiva] = useState(null);
  const [sonido, setSonido] = useState(false);
  const [completas, setCompletas] = useState({});
  const [datosLogro, setDatosLogro] = useState({});
  const [aviso, setAviso] = useState(null);
  const [misionesAbiertas, setMisionesAbiertas] = useState(false);
  const audio = useRef(null);
  const avisoTimer = useRef(null);

  // ---------- Datos del período elegido ----------
  const filtrada = useMemo(
    () => series.filter(d => d.year >= rango[0] && d.year <= rango[1]),
    [series, rango],
  );
  const ventanas = useMemo(() => compareWindows(filtrada), [filtrada]);
  const { unit: unidad, items } = useMemo(() => buildPathItems(filtrada), [filtrada]);
  const indiceActivo = (() => {
    const i = items.findIndex(it => it.key === claveActiva);
    return i === -1 ? items.length - 1 : i;
  })();
  const activo = items[indiceActivo];

  // Primer año completo por encima de +1 °C (para la misión "buscar")
  const anioObjetivo = useMemo(() => {
    const m = MISIONES.find(x => x.tipo === 'buscar');
    return anios.find(a => a.complete && a.value >= (m?.umbral ?? 1))?.year;
  }, [anios]);

  // ---------- Animación del suelo al cambiar de referencia ----------
  const pisoRef = useRef(0);
  useEffect(() => {
    const destino = referencia === 'nasa' ? -offset : 0;
    let id;
    const paso = () => {
      const actual = pisoRef.current;
      const siguiente = Math.abs(destino - actual) < 0.002 ? destino : actual + (destino - actual) * 0.14;
      pisoRef.current = siguiente;
      setPiso(siguiente);
      if (siguiente !== destino) id = requestAnimationFrame(paso);
    };
    id = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(id);
  }, [referencia, offset]);

  useEffect(() => () => audio.current?.cerrar(), []);

  // ---------- Misiones ----------
  const completar = (id, extra) => {
    if (completas[id]) return;
    setCompletas(c => ({ ...c, [id]: true }));
    if (extra) setDatosLogro(d => ({ ...d, [id]: extra }));
    const m = MISIONES.find(x => x.id === id);
    audio.current?.logro();
    clearTimeout(avisoTimer.current);
    setAviso(`+${m.xp} XP · ${m.titulo}`);
    avisoTimer.current = setTimeout(() => setAviso(null), 2600);
  };

  // ---------- Acciones ----------
  const sonar = (item, i) => {
    if (!item || !audio.current) return;
    audio.current.nota(item.value, (i / Math.max(1, items.length - 1)) * 2 - 1);
    audio.current.fondo(item.value);
  };

  const activarIndice = i => {
    const item = items[i];
    if (!item || item.key === activo?.key) return;
    setClaveActiva(item.key);
    sonar(item, i);
    if (unidad === 'year' && item.year === anioObjetivo) completar('buscar', { anio: item.year });
  };

  const recorrerAnio = y => {
    const i = items.findIndex(it => it.year === y);
    if (i !== -1) activarIndice(i);
  };

  const cambiarRango = r => {
    setRangoElegido(r);
    setClaveActiva(null);
    if (r[0] !== primero || r[1] !== ultimo) completar('rango');
  };

  const cambiarReferencia = r => {
    if (r === referencia) return;
    setReferencia(r);
    completar('referencia');
  };

  const alternarSonido = async () => {
    if (!audio.current) audio.current = new Sonifier();
    if (sonido) {
      await audio.current.pausar();
      setSonido(false);
    } else {
      await audio.current.iniciar();
      setSonido(true);
      if (activo) audio.current.fondo(activo.value);
    }
  };

  const adivinar = estimacion => {
    const real = average(series.slice(-12).map(d => d.anomalyPreindustrial));
    completar('adivinar', { real: fmt(real), tuyo: fmt(estimacion) });
  };

  // ---------- Textos derivados ----------
  const enRef = v => (referencia === 'nasa' ? v + offset : v); // valor en la referencia elegida
  const estado = activo
    ? activo.value >= 2
      ? TEXTOS.cifra.encima2
      : activo.value >= 1.5
        ? plantilla(TEXTOS.cifra.encima, { d: fmt(activo.value - 1.5) })
        : plantilla(TEXTOS.cifra.lejos, { d: (1.5 - activo.value).toFixed(2).replace('.', ',') })
    : '';

  return (
    <div className="app">
      <Fondo calor={activo?.value ?? 0} />

      <header className="barra">
        <h1 className="marca">
          <PixelIcon nombre="termometro" tamano={20} color="var(--rojo)" />
          {TEXTOS.titulo}
        </h1>
        <button type="button" className={`boton-sonido ${sonido ? 'activo' : ''}`} onClick={alternarSonido} aria-pressed={sonido}>
          <PixelIcon nombre={sonido ? 'sonido' : 'silencio'} tamano={16} />
          <span>{sonido ? TEXTOS.sonido.silenciar : TEXTOS.sonido.activar}</span>
        </button>
      </header>

      <main className="escenario">
        <section className="hud panel" aria-live="polite">
          {datos.estado === 'error' ? (
            <p className="error">No se pudieron leer los datos ({datos.error}). Verifica que GLB.Ts+dSST.csv esté en public/data/.</p>
          ) : (
            <>
              <p className="hud-etiqueta">{unidad === 'year' ? TEXTOS.cifra.etiquetaAnual : TEXTOS.cifra.etiquetaMensual}</p>
              <p className="hud-fecha">{activo?.label ?? '····'}</p>
              <p className="hud-valor">{activo ? fmt(enRef(activo.value)) : '···'}<small>°C</small></p>
              <p className="hud-estado">
                {estado}
                {activo && unidad === 'year' && activo.months < 12 && ` · ${plantilla(TEXTOS.cifra.parcial, { m: activo.months })}`}
                {referencia === 'nasa' && <span className="hud-nota">{TEXTOS.cifra.notaParis}</span>}
              </p>

              <dl className="comparacion">
                <div><dt>{TEXTOS.comparacion.inicio}</dt><dd>{fmt(enRef(ventanas?.firstAvg))}</dd></div>
                <div><dt>{TEXTOS.comparacion.final}</dt><dd>{fmt(enRef(ventanas?.lastAvg))}</dd></div>
                <div className="cambio"><dt>{TEXTOS.comparacion.cambio}</dt><dd>{fmt(ventanas?.change)}</dd></div>
              </dl>

              <Referencia valor={referencia} onCambiar={cambiarReferencia} />
            </>
          )}
        </section>

        <Diorama items={items} activo={indiceActivo} piso={piso} unidad={unidad} onActivar={activarIndice}
          formatoValor={v => `${fmt(enRef(v))} °C`} />

        <Misiones
          completas={completas}
          datosLogro={datosLogro}
          onAdivinar={adivinar}
          abierto={misionesAbiertas}
          onAlternar={() => setMisionesAbiertas(a => !a)}
        />
      </main>

      <LineaTiempo
        anios={anios}
        rango={rango}
        onRango={cambiarRango}
        anioActivo={activo?.year}
        onRecorrer={recorrerAnio}
      />

      <footer className="creditos">{TEXTOS.creditos}</footer>

      {aviso && <div className="aviso" role="status">{aviso}</div>}
    </div>
  );
}
