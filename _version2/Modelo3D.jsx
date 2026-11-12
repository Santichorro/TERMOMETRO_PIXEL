import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { stripeColor } from '../lib/colors.js';
import { TEXTOS } from '../config/textos.js';
import PixelIcon from './PixelIcon.jsx';

// ==========================================================
// MODELO 3D FLOTANTE (Three.js) con look pixel art:
// se dibuja a baja resolución y se escala sin suavizado.
// - Cada columna = un año (filas = décadas) o un mes (filas = años).
// - Girar: arrastrar. Acercar: rueda (tras hacer clic en el modelo) o botones.
// - La ventana tiene bordes difuminados: el modelo nunca invade la página.
// ==========================================================

const PIX = 3;              // tamaño de cada pixel en pantalla
const ESCALA = 2.2;         // unidades 3D por °C
const SUELO = -0.45;        // °C donde queda la superficie de la isla (bajo cualquier dato)
const yDe = v => (v - SUELO) * ESCALA;
const PARIS = [1.5, 2.0];
const LADO = 0.78;          // ancho de cada columna

function posicion(item, primero, unidad) {
  if (unidad === 'year') {
    return { col: item.year % 10, fila: Math.floor(item.year / 10) - Math.floor(primero.year / 10) };
  }
  return { col: item.month - 1, fila: item.year - primero.year };
}

export default function Modelo3D({ items, activo, piso, unidad, onActivar, onInteraccion, onSobreColumna, etiquetaValor }) {
  const ventanaRef = useRef(null);
  const canvasRef = useRef(null);
  const motor = useRef(null);
  const [enfocado, setEnfocado] = useState(false);
  const etiquetas = useRef({});
  const filasRef = useRef([]);
  const props = useRef({});
  useEffect(() => {
    props.current = { onActivar, onInteraccion, onSobreColumna };
  });

  // ---------- Montaje de Three.js (una sola vez) ----------
  useEffect(() => {
    const ventana = ventanaRef.current;
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
    camera.position.set(15, 10, 17);

    scene.add(new THREE.HemisphereLight(0xfff8ec, 0x6b5b4a, 1.7));
    const sol = new THREE.DirectionalLight(0xffffff, 1.6);
    sol.position.set(6, 12, 8);
    scene.add(sol);

    const flotante = new THREE.Group();   // todo lo que sube y baja
    scene.add(flotante);
    const mundo = new THREE.Group();      // lo que depende de los datos
    flotante.add(mundo);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.enableZoom = false;          // se activa al hacer clic en el modelo
    controls.minDistance = 7;
    controls.maxDistance = 38;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = 1.38;
    controls.rotateSpeed = 0.7;
    controls.target.set(0, 3, 0);
    controls.addEventListener('start', () => props.current.onInteraccion?.('girar'));

    const raycaster = new THREE.Raycaster();
    const puntero = new THREE.Vector2();
    const proyectar = new THREE.Vector3();
    const reloj = new THREE.Clock();
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ajustar = () => {
      const { clientWidth: w, clientHeight: h } = ventana;
      if (!w || !h) return;
      renderer.setSize(Math.ceil(w / PIX), Math.ceil(h / PIX), false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(ajustar);
    ro.observe(ventana);
    ajustar();

    const estado = { renderer, scene, camera, controls, flotante, mundo, columnas: null, resaltado: null, planoCero: null, raycaster, puntero, proyectar, datos: [], arrastre: null };
    motor.current = estado;

    renderer.setAnimationLoop(() => {
      const t = reloj.getElapsedTime();
      flotante.position.y = reducido ? 0 : Math.sin(t * 0.9) * 0.12;
      controls.update();
      renderer.render(scene, camera);

      // Etiquetas HTML pegadas a puntos 3D
      const w = ventana.clientWidth;
      const h = ventana.clientHeight;
      const ubicar = (el, x, y, z) => {
        if (!el) return;
        proyectar.set(x, y + flotante.position.y, z).project(camera);
        const visible = proyectar.z < 1;
        el.style.transform = `translate(${((proyectar.x + 1) / 2) * w}px, ${((1 - proyectar.y) / 2) * h}px)`;
        el.style.opacity = visible ? '' : '0';
      };
      const g = estado.geo;
      if (g) {
        ubicar(etiquetas.current.p15, g.xMin, yDe(1.5), g.zMin);
        ubicar(etiquetas.current.p20, g.xMin, yDe(2.0), g.zMin);
        ubicar(etiquetas.current.cero, g.xMax + 0.6, estado.yCero ?? 0, g.zMax);
        filasRef.current.forEach((el, i) => g.filas[i] && ubicar(el, g.xMin - 0.9, 0.2, g.filas[i].z));
        if (estado.activoPos) ubicar(etiquetas.current.activo, estado.activoPos.x, estado.activoPos.y + 0.5, estado.activoPos.z);
      }
    });

    // Selección por clic (sin arrastre) y cursor al pasar
    const indiceBajo = e => {
      if (!estado.columnas) return -1;
      const r = canvas.getBoundingClientRect();
      puntero.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(puntero, camera);
      const hit = raycaster.intersectObject(estado.columnas)[0];
      return hit ? hit.instanceId : -1;
    };
    const abajo = e => { estado.arrastre = { x: e.clientX, y: e.clientY }; };
    const arriba = e => {
      const a = estado.arrastre;
      estado.arrastre = null;
      if (a && Math.hypot(e.clientX - a.x, e.clientY - a.y) < 6) {
        const i = indiceBajo(e);
        if (i >= 0) props.current.onActivar(i);
      }
    };
    let sobre = -1;
    const mover = e => {
      if (e.buttons) return;
      const i = indiceBajo(e);
      canvas.style.cursor = i >= 0 ? 'pointer' : 'grab';
      if (i >= 0 && i !== sobre && e.pointerType === 'mouse') props.current.onSobreColumna?.(i);
      sobre = i;
    };
    canvas.addEventListener('pointerdown', abajo);
    canvas.addEventListener('pointerup', arriba);
    canvas.addEventListener('pointermove', mover);

    return () => {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      controls.dispose();
      canvas.removeEventListener('pointerdown', abajo);
      canvas.removeEventListener('pointerup', arriba);
      canvas.removeEventListener('pointermove', mover);
      scene.traverse(o => {
        o.geometry?.dispose();
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m?.dispose());
      });
      renderer.dispose();
    };
  }, []);

  // ---------- Construcción del modelo según los datos ----------
  useEffect(() => {
    const m = motor.current;
    if (!m || !items.length) return;
    m.mundo.traverse(o => {
      if (o === m.mundo) return;
      o.geometry?.dispose();
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(x => x?.dispose());
    });
    m.mundo.clear();

    const primero = items[0];
    const pos = items.map(it => posicion(it, primero, unidad));
    const cols = unidad === 'year' ? 10 : 12;
    const filas = Math.max(...pos.map(p => p.fila)) + 1;
    const pasoX = 1;
    const pasoZ = 1.15;
    const x0 = -((cols - 1) * pasoX) / 2;
    const z0 = -((filas - 1) * pasoZ) / 2;
    // Las filas recientes van atrás: el modelo sube como una escalera y nada tapa a los años viejos
    const xyz = pos.map(p => ({ x: x0 + p.col * pasoX, z: z0 + (filas - 1 - p.fila) * pasoZ }));
    const ancho = cols * pasoX + 1.2;
    const fondo = filas * pasoZ + 1.2;

    // Isla flotante: césped, tierra y escalones de roca por debajo
    const caja = (w, h, d, color, x, y, z) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color }));
      mesh.position.set(x, y, z);
      m.mundo.add(mesh);
      return mesh;
    };
    caja(ancho, 0.3, fondo, 0x6aa84f, 0, -0.15, 0);
    caja(ancho, 0.8, fondo, 0x7a5232, 0, -0.7, 0);
    caja(ancho - 1.4, 0.7, fondo - 1.2, 0x5e3f27, 0, -1.45, 0);
    caja(ancho - 3.2, 0.6, Math.max(0.6, fondo - 2.8), 0x4a3220, 0, -2.1, 0);
    caja(Math.max(0.8, ancho - 5.6), 0.5, Math.max(0.5, fondo - 4.2), 0x3a2618, 0, -2.6, 0);

    // Columnas (una sola malla instanciada)
    const columnas = new THREE.InstancedMesh(
      new THREE.BoxGeometry(LADO, 1, LADO),
      new THREE.MeshLambertMaterial(),
      items.length,
    );
    const color = new THREE.Color();
    items.forEach((it, i) => columnas.setColorAt(i, color.set(stripeColor(it.value))));
    columnas.instanceColor.needsUpdate = true;
    m.mundo.add(columnas);
    m.columnas = columnas;

    // Resaltado de la columna activa
    m.resaltado = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(LADO + 0.12, 1, LADO + 0.12)),
      new THREE.LineBasicMaterial({ color: 0x13212c }),
    );
    m.mundo.add(m.resaltado);

    // Plano del cero (se desliza al cambiar de referencia)
    m.planoCero = new THREE.Mesh(
      new THREE.BoxGeometry(ancho - 0.4, 0.04, fondo - 0.4),
      new THREE.MeshBasicMaterial({ color: 0x13212c, transparent: true, opacity: 0.18, depthWrite: false }),
    );
    m.mundo.add(m.planoCero);

    // Vidrios del Acuerdo de París
    PARIS.forEach(v => {
      const vidrio = new THREE.Mesh(
        new THREE.BoxGeometry(ancho - 0.2, 0.04, fondo - 0.2),
        new THREE.MeshBasicMaterial({ color: 0x9fd3f0, transparent: true, opacity: v === 1.5 ? 0.22 : 0.1, depthWrite: false }),
      );
      vidrio.position.y = yDe(v);
      m.mundo.add(vidrio);
      const borde = new THREE.LineSegments(
        new THREE.EdgesGeometry(vidrio.geometry),
        new THREE.LineBasicMaterial({ color: v === 1.5 ? 0xe05a47 : 0x2f7ea8 }),
      );
      borde.position.y = yDe(v);
      m.mundo.add(borde);
    });

    m.datos = { items, xyz };
    m.geo = {
      xMin: x0 - 0.6, xMax: x0 + (cols - 1) * pasoX + 0.6,
      zMin: z0 - 0.6, zMax: z0 + (filas - 1) * pasoZ + 0.6,
      filas: Array.from({ length: filas }, (_, f) => ({ z: z0 + (filas - 1 - f) * pasoZ })),
    };

    // Encuadre según el tamaño del modelo
    const distancia = Math.max(16, Math.max(ancho, fondo) * 2.15);
    const dir = m.camera.position.clone().sub(m.controls.target).normalize();
    m.controls.target.set(0, 2.6, 0);
    m.camera.position.copy(m.controls.target).add(dir.multiplyScalar(distancia));
    m.controls.maxDistance = distancia * 1.8;
  }, [items, unidad]);

  // ---------- Alturas (cambian con la referencia) y columna activa ----------
  useEffect(() => {
    const m = motor.current;
    if (!m?.columnas || m.datos.items !== items) return;
    const mat = new THREE.Matrix4();
    const yCero = yDe(piso);
    items.forEach((it, i) => {
      const yTop = yDe(it.value);
      const alto = Math.max(0.05, Math.abs(yTop - yCero));
      const { x, z } = m.datos.xyz[i];
      const sube = i === activo ? 0.06 : 0;
      mat.compose(
        new THREE.Vector3(x, Math.min(yTop, yCero) + alto / 2 + sube, z),
        new THREE.Quaternion(),
        new THREE.Vector3(1, alto, 1),
      );
      m.columnas.setMatrixAt(i, mat);
    });
    m.columnas.instanceMatrix.needsUpdate = true;
    m.columnas.computeBoundingSphere();
    m.planoCero.position.y = yCero;
    m.yCero = yCero;

    const it = items[activo];
    if (it) {
      const { x, z } = m.datos.xyz[activo];
      const yTop = yDe(it.value);
      const alto = Math.max(0.05, Math.abs(yTop - yCero)) + 0.12;
      m.resaltado.position.set(x, Math.min(yTop, yCero) + alto / 2 - 0.06, z);
      m.resaltado.scale.set(1, alto, 1);
      m.activoPos = { x, y: Math.max(yTop, yCero), z };
    }
  }, [items, activo, piso]);

  // ---------- Zoom: solo con el modelo enfocado (no roba el scroll de la página) ----------
  useEffect(() => {
    const m = motor.current;
    if (!m) return;
    m.controls.enableZoom = enfocado;
    if (!enfocado) return;
    const fuera = e => { if (!ventanaRef.current.contains(e.target)) setEnfocado(false); };
    const tecla = e => { if (e.key === 'Escape') setEnfocado(false); };
    const rueda = () => props.current.onInteraccion?.('zoom');
    const canvas = canvasRef.current;
    document.addEventListener('pointerdown', fuera);
    document.addEventListener('keydown', tecla);
    canvas.addEventListener('wheel', rueda, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', fuera);
      document.removeEventListener('keydown', tecla);
      canvas.removeEventListener('wheel', rueda);
    };
  }, [enfocado]);

  const zoom = factor => {
    const m = motor.current;
    if (!m) return;
    const { camera, controls } = m;
    const d = camera.position.distanceTo(controls.target);
    const nueva = THREE.MathUtils.clamp(d * factor, controls.minDistance, controls.maxDistance);
    camera.position.sub(controls.target).setLength(nueva).add(controls.target);
    props.current.onInteraccion?.('zoom');
  };
  const reiniciar = () => {
    const m = motor.current;
    if (!m) return;
    const d = m.camera.position.distanceTo(m.controls.target);
    m.camera.position.set(14, 11, 16).sub(m.controls.target).setLength(d).add(m.controls.target);
  };

  const filasEtiquetas = (() => {
    if (!items.length) return [];
    const nombres = [];
    const vistos = new Set();
    items.forEach(it => {
      const k = unidad === 'year' ? `${Math.floor(it.year / 10) * 10}s` : String(it.year);
      if (!vistos.has(k)) { vistos.add(k); nombres.push(k); }
    });
    return nombres;
  })();

  const it = items[activo];

  return (
    <div className={`modelo ${enfocado ? 'enfocado' : ''}`}>
      <div className="modelo-ventana" ref={ventanaRef} onPointerDown={() => setEnfocado(true)}>
        <canvas ref={canvasRef} className="modelo-canvas" aria-label={TEXTOS.modelo.aria} role="img" />
        <div className="modelo-etiquetas" aria-hidden="true">
          <span ref={el => (etiquetas.current.p15 = el)} className="m-etq m-paris">{TEXTOS.vidrios.p15}</span>
          <span ref={el => (etiquetas.current.p20 = el)} className="m-etq m-paris2">{TEXTOS.vidrios.p20}</span>
          <span ref={el => (etiquetas.current.cero = el)} className="m-etq m-cero">{piso > 0.05 ? TEXTOS.modelo.ceroNasa : TEXTOS.modelo.ceroPre}</span>
          {filasEtiquetas.map((n, i) => (
            <span key={n} ref={el => (filasRef.current[i] = el)} className="m-etq m-fila"
              hidden={i % Math.ceil(filasEtiquetas.length / 6) !== 0 && i !== filasEtiquetas.length - 1}>{n}</span>
          ))}
          {it && (
            <span ref={el => (etiquetas.current.activo = el)} className="m-etq m-activo">
              {it.label} <strong>{etiquetaValor(it.value)}</strong>
            </span>
          )}
        </div>
      </div>
      <div className="modelo-controles">
        <button type="button" onClick={() => zoom(0.8)} aria-label="Acercar"><PixelIcon nombre="mas" tamano={16} /></button>
        <button type="button" onClick={() => zoom(1.25)} aria-label="Alejar"><PixelIcon nombre="menos" tamano={16} /></button>
        <button type="button" onClick={reiniciar} aria-label="Volver a la vista inicial"><PixelIcon nombre="girar" tamano={16} /></button>
      </div>
      <p className="modelo-ayuda">
        <span className="ayuda-raton">{enfocado ? TEXTOS.modelo.ayudaActivo : TEXTOS.modelo.ayuda}</span>
        <span className="ayuda-tactil">{TEXTOS.modelo.ayudaTactil}</span>
      </p>
    </div>
  );
}
