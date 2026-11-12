import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useGistemp from './lib/useGistemp.js';
import { compareWindows, buildPathItems, annualMeans, decadeMeans, average } from './lib/gistemp.js';
import { stripeColor } from './lib/colors.js';
import { fmt } from './lib/formato.js';
import Sonifier from './audio/Sonifier.js';
import Cielo from './components/Cielo.jsx';
import Modelo3D from './components/Modelo3D.jsx';
import Objetos from './components/Objetos.jsx';
import LineaTiempo from './components/LineaTiempo.jsx';
import Referencia from './components/Referencia.jsx';
import Misiones from './components/Misiones.jsx';
import { progreso } from './lib/progreso.js';
import Dither from './components/Dither.jsx';
import PixelIcon from './components/PixelIcon.jsx';
import Anomalia from './components/secciones/Anomalia.jsx';
import Paris from './components/secciones/Paris.jsx';
import Decadas from './components/secciones/Decadas.jsx';
import Escuchar from './components/secciones/Escuchar.jsx';
import Datos from './components/secciones/Datos.jsx';
import { TEXTOS, plantilla } from './config/textos.js';
import { MISIONES } from './config/misiones.js';
import './App.css';


export default function App() {
  const datos = useGistemp();
  const series = useMemo(() => datos.series ?? [], [datos.series]);
  const offset = datos.baselineOffset ?? -0.218;

  const anios = useMemo(() => annualMeans(series), [series]);
  const decadas = useMemo(() => decadeMeans(series), [series]);
  const primero = anios[0]?.year;
  const ultimo = anios.at(-1)?.year;

  // ---------- Estado ----------
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
  const objetosVistos = useRef(new Set());
  const [decadaSel, setDecadaSel] = useState(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const audio = useRef(null);
  const avisoTimer = useRef(null);
  const interacciones = useRef({});

  // ---------- Datos derivados ----------
  const filtrada = useMemo(() => series.filter(d => d.year >= rango[0] && d.year <= rango[1]), [series, rango]);
  const ventanas = useMemo(() => compareWindows(filtrada), [filtrada]);
  const { unit: unidad, items } = useMemo(() => buildPathItems(filtrada), [filtrada]);
  const indiceActivo = (() => {
    const i = items.findIndex(it => it.key === claveActiva);
    return i === -1 ? 0 : i; // empieza en el primer año: de día
  })();
  const activo = items[indiceActivo];

  const completos = useMemo(() => anios.filter(a => a.complete), [anios]);
  const anioPrimerGrado = useMemo(() => {
    const m = MISIONES.find(x => x.tipo === 'buscar');
    return completos.find(a => a.value >= (m?.umbral ?? 1))?.year;
  }, [completos]);
  const record = useMemo(() => completos.reduce((a, b) => (b.value > a.value ? b : a), completos[0] ?? { value: -Infinity }), [completos]);
  const decadaCalida = useMemo(() => decadas.reduce((a, b) => (b.value > a.value ? b : a), decadas[0] ?? { value: -Infinity }), [decadas]);
  const ultimos12 = useMemo(() => average(series.slice(-12).map(d => d.anomalyPreindustrial)), [series]);
  const ultimos20 = useMemo(() => average(series.slice(-240).map(d => d.anomalyPreindustrial)), [series]);

  const valoresTexto = {
    offset: fmt(offset),
    ultimos12: fmt(ultimos12),
    inicio: series[0]?.date ?? '',
    fin: series.at(-1)?.date ?? '',
    meses: series.length.toLocaleString('es-CO'),
  };

  const ejemplo = useMemo(() => {
    if (!completos.length) return null;
    const elegir = y => completos.find(a => a.year === y) ?? completos.at(-1);
    const serie = [elegir(1930), elegir(1980), record].map(a => ({ etiqueta: String(a.year), valor: a.value, color: stripeColor(a.value) }));
    return { anio: record.year, nasa: fmt(record.value + offset), pre: fmt(record.value), serie };
  }, [completos, record, offset]);

  // ---------- Animación del cero al cambiar de referencia ----------
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

  // Efectos de interfaz: clic en botones y "tic" al pasar sobre algo seleccionable
  useEffect(() => {
    const SELECCIONABLE = 'button, a[href], [role="slider"], input[type="range"], summary';
    const sobre = e => {
      if (e.pointerType !== 'mouse') return;
      const el = e.target.closest?.(SELECCIONABLE);
      if (el && !el.contains(e.relatedTarget)) audio.current?.hover();
    };
    const clic = e => {
      if (e.target.closest?.(SELECCIONABLE)) audio.current?.clic();
    };
    document.addEventListener('pointerover', sobre);
    document.addEventListener('click', clic);
    return () => {
      document.removeEventListener('pointerover', sobre);
      document.removeEventListener('click', clic);
    };
  }, []);

  // ---------- Misiones ----------
  const completasRef = useRef({});
  const completar = useCallback((id, extra) => {
    if (completasRef.current[id]) return;
    completasRef.current = { ...completasRef.current, [id]: true };
    setCompletas(completasRef.current);
    if (extra) setDatosLogro(d => ({ ...d, [id]: extra }));
    const m = MISIONES.find(x => x.id === id);
    audio.current?.logro();
    clearTimeout(avisoTimer.current);
    setAviso(`+${m.xp} XP · ${m.titulo}`);
    avisoTimer.current = setTimeout(() => setAviso(null), 2800);
  }, []);

  // ---------- Acciones ----------
  const activarIndice = useCallback(i => {
    const item = items[i];
    if (!item) return;
    setClaveActiva(item.key);
    audio.current?.nota(item.value, (i / Math.max(1, items.length - 1)) * 2 - 1);
    if (unidad === 'year' && item.months === 12) {
      if (item.year === anioPrimerGrado) completar('buscar', { anio: item.year });
      if (item.year === record.year) completar('record', { anio: item.year, valor: fmt(item.value) });
    }
  }, [items, unidad, anioPrimerGrado, record, completar]);

  const recorrerAnio = y => {
    const i = items.findIndex(it => it.year === y);
    if (i !== -1 && items[i].key !== activo?.key) activarIndice(i);
  };

  const cambiarRango = r => {
    setRangoElegido(r);
    setClaveActiva(null);
    setDecadaSel(null);
    if (r[0] !== primero || r[1] !== ultimo) completar('rango');
  };

  const cambiarReferencia = r => {
    if (r === referencia) return;
    setReferencia(r);
    completar('referencia', { offset: fmt(-offset).replace('+', '') });
  };

  const interaccionModelo = tipo => {
    interacciones.current[tipo] = true;
    if (interacciones.current.girar && interacciones.current.zoom) completar('modelo');
  };

  const abrirObjeto = id => {
    objetosVistos.current.add(id);
    const m = MISIONES.find(x => x.tipo === 'objetos');
    if (objetosVistos.current.size >= (m?.cantidad ?? 3)) completar('objetos');
  };

  const elegirDecada = d => {
    const desde = Math.max(primero, d.decade);
    const hasta = Math.min(ultimo, d.decade + 9);
    setRangoElegido([desde, hasta]);
    setClaveActiva(null);
    setDecadaSel(d.decade);
    if (d.decade === decadaCalida.decade) completar('decada', { decada: `${d.decade}`, valor: fmt(d.value) });
  };

  const alternarSonido = async () => {
    if (!audio.current) audio.current = new Sonifier();
    if (sonido) {
      await audio.current.pausar();
      setSonido(false);
    } else {
      await audio.current.iniciar();
      setSonido(true);
      audio.current.clic();
    }
  };

  const adivinar = estimacion => {
    completar('adivinar', { real: fmt(ultimos12), tuyo: fmt(estimacion) });
  };

  // ---------- Reproducir el período ("Escucha el siglo") ----------
  const activarRef = useRef(activarIndice);
  useEffect(() => { activarRef.current = activarIndice; }, [activarIndice]);
  const indiceRef = useRef(indiceActivo);
  useEffect(() => { indiceRef.current = indiceActivo; }, [indiceActivo]);

  useEffect(() => {
    if (!reproduciendo) return;
    let i = indiceRef.current >= items.length - 1 ? -1 : indiceRef.current;
    const id = setInterval(() => {
      i += 1;
      if (i >= items.length) {
        setReproduciendo(false);
        completar('escuchar');
        return;
      }
      activarRef.current(i);
    }, unidad === 'year' ? 160 : 90);
    return () => clearInterval(id);
  }, [reproduciendo, items.length, unidad, completar]);

  const alternarReproduccion = () => {
    if (!sonido && !reproduciendo) alternarSonido();
    setReproduciendo(r => !r);
  };

  // ---------- Textos derivados ----------
  const enRef = v => (referencia === 'nasa' ? v + offset : v);
  const estado = activo
    ? activo.value >= 2
      ? TEXTOS.cifra.encima2
      : activo.value >= 1.5
        ? plantilla(TEXTOS.cifra.encima, { d: fmt(activo.value - 1.5) })
        : plantilla(TEXTOS.cifra.lejos, { d: (1.5 - activo.value).toFixed(2).replace('.', ',') })
    : '';
  const { hechas } = progreso(completas);

  return (
    <div className="app">
      <header className="nav">
        <a className="marca" href="#explorar">
          <PixelIcon nombre="termometro" tamano={22} color="var(--coral)" />
          <span>{TEXTOS.titulo}</span>
        </a>
        <nav aria-label="Secciones">
          {TEXTOS.nav.map(n => <a key={n.id} href={`#${n.id}`}>{n.texto}</a>)}
        </nav>
        <div className="nav-acciones">
          <button type="button" className={`nav-boton ${sonido ? 'activo' : ''}`} onClick={alternarSonido} aria-pressed={sonido}
            aria-label={sonido ? 'Silenciar' : 'Activar sonido'}>
            <PixelIcon nombre={sonido ? 'sonido' : 'silencio'} tamano={16} />
            <span>{TEXTOS.sonido.activar}</span>
          </button>
          <button type="button" className="nav-boton misiones-boton" onClick={() => setMisionesAbiertas(true)} aria-expanded={misionesAbiertas}>
            <PixelIcon nombre="bandera" tamano={16} />
            <span>{TEXTOS.misiones.abrir}</span>
            <span className="contador">{hechas}/{MISIONES.length}</span>
          </button>
        </div>
      </header>

      <main>
        {/* ---------- Explorador sobre el paisaje ---------- */}
        <section id="explorar" className="escena">
          <Cielo calor={activo?.value ?? 0} />
          <div className="escena-contenido">
            <div className="escena-texto panel" aria-live="polite">
              <h1>{TEXTOS.portada.titulo}</h1>
              <p className="frase">{TEXTOS.portada.frase}</p>

              {datos.estado === 'error' ? (
                <p className="error">No se pudieron leer los datos ({datos.error}). Verifica que GLB.Ts+dSST.csv esté en public/data/.</p>
              ) : (
                <>
                  <div className="lectura">
                    <p className="lectura-etiqueta">{unidad === 'year' ? TEXTOS.cifra.etiquetaAnual : TEXTOS.cifra.etiquetaMensual} <strong>{activo?.label ?? '····'}</strong></p>
                    <p className="lectura-valor">{activo ? fmt(enRef(activo.value)) : '···'}<small> °C</small></p>
                    <p className="lectura-estado">
                      {estado}
                      {activo && unidad === 'year' && activo.months < 12 && ` · ${plantilla(TEXTOS.cifra.parcial, { m: activo.months })}`}
                    </p>
                    {referencia === 'nasa' && <p className="lectura-nota">{TEXTOS.cifra.notaParis}</p>}
                  </div>

                  <dl className="comparacion">
                    <div><dt>{TEXTOS.comparacion.inicio}</dt><dd>{fmt(enRef(ventanas?.firstAvg))}</dd></div>
                    <div><dt>{TEXTOS.comparacion.final}</dt><dd>{fmt(enRef(ventanas?.lastAvg))}</dd></div>
                    <div className="cambio"><dt>{TEXTOS.comparacion.cambio}</dt><dd>{fmt(ventanas?.change)}</dd></div>
                  </dl>

                  <Referencia valor={referencia} onCambiar={cambiarReferencia} />
                </>
              )}
            </div>

            <Modelo3D items={items} activo={indiceActivo} piso={piso} unidad={unidad}
              onActivar={activarIndice} onInteraccion={interaccionModelo} onSobreColumna={() => audio.current?.hover()}
              etiquetaValor={v => `${fmt(enRef(v))} °C`} />
          </div>

          <Objetos datos={valoresTexto} onAbrir={abrirObjeto} />

          <div className="escena-linea panel">
            <LineaTiempo anios={anios} rango={rango} onRango={cambiarRango} anioActivo={activo?.year} onRecorrer={recorrerAnio} />
          </div>
          <Dither />
        </section>

        <Anomalia referencia={referencia} onReferencia={cambiarReferencia} ejemplo={ejemplo} offset={offset} />
        <Paris ultimos12={ultimos12} ultimos20={ultimos20} />
        <Decadas decadas={decadas} seleccion={decadaSel} onElegir={elegirDecada} />
        <Escuchar reproduciendo={reproduciendo} onAlternar={alternarReproduccion}
          progreso={items.length > 1 ? indiceActivo / (items.length - 1) : 0}
          etiqueta={activo ? `${activo.label} ${fmt(enRef(activo.value))} °C` : ''} rango={rango} />
        <Datos valores={valoresTexto} />
      </main>

      <footer className="pie">{TEXTOS.creditos}</footer>

      <Misiones abierto={misionesAbiertas} onCerrar={() => setMisionesAbiertas(false)}
        completas={completas} datosLogro={datosLogro} onAdivinar={adivinar} />
      {misionesAbiertas && <div className="velo" onClick={() => setMisionesAbiertas(false)} aria-hidden="true" />}

      {aviso && <div className="aviso" role="status">{aviso}</div>}
    </div>
  );
}
