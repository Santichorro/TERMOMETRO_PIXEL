import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import spriteTierra from '../assets/tierra-sprite.png';
import { TEX_W, TEX_H, prepararCapas, pintarTextura } from '../lib/texturaPlaneta.js';
import { crearObjetos3D } from '../lib/objetos3d.js';
import { OBJETOS } from '../config/objetos.js';
import { TEXTOS } from '../config/textos.js';
import PixelIcon from './PixelIcon.jsx';

// ==========================================================
// PLANETA 3D (Three.js) con dos vistas:
//  - 'mapa':    blanco con contornos, coloreado con la escala de NASA GISTEMP
//               (azul → blanco → amarillo → rojo), como sus mapas animados.
//  - 'planeta': océano, tierra y edificios minimalistas; se vuelve cálido con el calor.
// Honestidad de datos: el CSV de NASA trae UN valor global por mes. El promedio
// del mapa es ese dato real; la distribución por regiones es ilustrativa.
//
// Rendimiento:
//  - Este componente (y Three.js) se carga aparte, después de pintar la página.
//  - Se dibuja a 1/3 de resolución en PC (look pixel art) y a 1/1,5 en celular
//    (pantallas pequeñas: menos pixelado para que se lea), a ~30 cuadros por segundo.
//  - Se detiene cuando el planeta sale de pantalla o la pestaña está oculta.
//  - Edificios con InstancedMesh: 3 llamadas de dibujo en lugar de ~90.
//  - La textura solo se repinta cuando cambia el año o la vista.
// ==========================================================

const PIX = 3;
const PIX_CELULAR = 1.5;
const RADIO = 3;
const FPS_MS = 1000 / 30;

// Ciudades donde van los edificios minimalistas (lat, lon, altura relativa)
const CIUDADES = [
  [3.45, -76.53, 1.0],   // Cali
  [4.71, -74.07, 1.2],   // Bogotá
  [-23.55, -46.63, 1.3], // São Paulo
  [19.43, -99.13, 1.1],  // Ciudad de México
  [40.71, -74.0, 1.6],   // Nueva York
  [51.5, -0.12, 1.1],    // Londres
  [30.04, 31.23, 0.9],   // El Cairo
  [6.52, 3.37, 1.0],     // Lagos
  [55.75, 37.62, 1.0],   // Moscú
  [28.61, 77.2, 1.2],    // Delhi
  [39.9, 116.4, 1.4],    // Pekín
  [35.68, 139.69, 1.6],  // Tokio
  [-33.87, 151.2, 1.1],  // Sídney
  [-1.29, 36.82, 0.8],   // Nairobi
];

const COLOR_TMP = new THREE.Color();
function mezcla(a, b, t) {
  COLOR_TMP.set(a).lerp(new THREE.Color(b), Math.max(0, Math.min(1, t)));
  return `#${COLOR_TMP.getHexString()}`;
}

// Posición 3D de una latitud/longitud con el mismo mapeo UV de SphereGeometry
function enEsfera(lat, lon, r) {
  const phi = ((lon + 180) * Math.PI) / 180;
  const theta = ((90 - lat) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.cos(phi) * Math.sin(theta), r * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta));
}

// Edificios y árboles como instancias (una geometría por tipo)
function crearCiudades() {
  const edif = [], techos = [], arboles = [];
  const arriba = new THREE.Vector3(0, 1, 0);
  CIUDADES.forEach(([lat, lon, alto], k) => {
    const base = enEsfera(lat, lon, RADIO);
    const q = new THREE.Quaternion().setFromUnitVectors(arriba, base.clone().normalize());
    const local = (dx, dy, dz, sx, sy, sz) =>
      new THREE.Matrix4().compose(base.clone().add(new THREE.Vector3(dx, dy, dz).applyQuaternion(q)), q, new THREE.Vector3(sx, sy, sz));
    [[-0.07, 0, 0.16 * alto], [0.06, 0.05, 0.24 * alto], [0.02, -0.07, 0.12 * alto]].forEach(([dx, dz, h], j) => {
      edif.push(local(dx, h / 2, dz, 0.07, h, 0.07));
      if ((j + k) % 2 === 0) techos.push(local(dx, h + 0.012, dz, 0.08, 0.025, 0.08));
    });
    arboles.push(local(0.13, 0.06, -0.05, 1, 1, 1));
  });
  const caja = new THREE.BoxGeometry(1, 1, 1);
  const grupo = new THREE.Group();
  [[caja, 0xf4f1ea, edif], [caja, 0xe05a47, techos], [new THREE.ConeGeometry(0.04, 0.12, 5), 0x3f7a3a, arboles]].forEach(([geo, color, mats]) => {
    const malla = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color }), mats.length);
    mats.forEach((m, i) => malla.setMatrixAt(i, m));
    grupo.add(malla);
  });
  return grupo;
}

// El sprite de continentes se descarga una sola vez para toda la página
let capasPromesa = null;
function cargarCapas() {
  if (!capasPromesa) {
    const img = new Image();
    img.src = spriteTierra;
    capasPromesa = img.decode().then(() => prepararCapas(img));
  }
  return capasPromesa;
}

export default function Planeta({ valor, valorNasa, anio, etiqueta, onInteraccion, objetoAbierto, onObjeto, onSobreObjeto, ficha, children }) {
  const ventanaRef = useRef(null);
  const canvasRef = useRef(null);
  const motor = useRef(null);
  const [vista, setVista] = useState('mapa');
  const [enfocado, setEnfocado] = useState(false);
  const [listo, setListo] = useState(false);
  const tipRef = useRef(null);
  const [sobre, setSobre] = useState(null);
  const cb = useRef({});
  useEffect(() => {
    cb.current = { onInteraccion, onObjeto, onSobreObjeto };
  });

  // ---------- Montaje ----------
  useEffect(() => {
    const ventana = ventanaRef.current;
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 2.2, 12.5);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xc9d4dc, 2.6));
    const sol = new THREE.DirectionalLight(0xffffff, 1.3);
    sol.position.set(-6, 4, 8);
    scene.add(sol);

    const lienzo = document.createElement('canvas');
    lienzo.width = TEX_W;
    lienzo.height = TEX_H;
    const ctx = lienzo.getContext('2d');
    ctx.fillStyle = '#eef3f6';
    ctx.fillRect(0, 0, TEX_W, TEX_H);
    const textura = new THREE.CanvasTexture(lienzo);
    textura.colorSpace = THREE.SRGBColorSpace;
    textura.generateMipmaps = false; // se ve a baja resolución: no hacen falta
    textura.minFilter = THREE.LinearFilter;

    const globo = new THREE.Group();
    globo.rotation.z = 0.41; // inclinación del eje (23,4°)
    scene.add(globo);
    globo.add(new THREE.Mesh(new THREE.SphereGeometry(RADIO, 40, 28), new THREE.MeshLambertMaterial({ map: textura })));

    // Halo de atmósfera
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(RADIO * 1.07, 24, 16),
      new THREE.MeshBasicMaterial({ color: 0x9fd3f0, transparent: true, opacity: 0.18, side: THREE.BackSide, depthWrite: false }),
    );
    scene.add(halo);

    const ciudad = crearCiudades();
    ciudad.visible = false;
    globo.add(ciudad);

    // Objetos interactivos (fábrica, estación, boya, termómetro)
    const objetos = crearObjetos3D(OBJETOS, enEsfera, RADIO);
    objetos.forEach(o => globo.add(o));

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minDistance = 3.5;
    controls.maxDistance = 20;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.addEventListener('start', () => cb.current.onInteraccion?.('girar'));

    const celular = window.matchMedia('(max-width: 640px)');
    const ajustar = () => {
      const { clientWidth: w, clientHeight: h } = ventana;
      if (!w || !h) return;
      const pix = celular.matches ? PIX_CELULAR : PIX;
      renderer.setSize(Math.ceil(w / pix), Math.ceil(h / pix), false);
      camera.aspect = w / h;
      // Con una ficha abierta en PC el planeta se corre a la izquierda y la ficha va a la derecha
      if (m?.abierto && !celular.matches) camera.setViewOffset(w, h, w * 0.2, 0, w, h);
      else camera.clearViewOffset();
      camera.updateProjectionMatrix();
    };
    let m = null;
    const ro = new ResizeObserver(ajustar);
    ro.observe(ventana);
    ajustar();

    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducido) controls.autoRotate = false;

    // Bucle a ~30 cuadros por segundo, solo mientras se ve
    // ---------- Selección de objetos con el puntero ----------
    const rayo = new THREE.Raycaster();
    const puntero = new THREE.Vector2();
    let punteroNuevo = false;
    let sobreId = null;
    let presion = null;
    const ndc = e => {
      const r = canvas.getBoundingClientRect();
      puntero.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    };
    const tocado = () => {
      rayo.setFromCamera(puntero, camera);
      const hit = rayo.intersectObjects(objetos, true)[0];
      return hit?.object.userData.objetoId ?? null;
    };
    const mover = e => { if (e.pointerType === 'mouse') { ndc(e); punteroNuevo = true; } };
    const salir = () => { punteroNuevo = false; if (sobreId) { sobreId = null; setSobre(null); canvas.style.cursor = ''; } };
    const abajo = e => { presion = { x: e.clientX, y: e.clientY }; };
    const arriba = e => {
      if (!presion || Math.hypot(e.clientX - presion.x, e.clientY - presion.y) > 6) return;
      ndc(e);
      const id = tocado();
      if (id) cb.current.onObjeto?.(id);
    };
    canvas.addEventListener('pointermove', mover);
    canvas.addEventListener('pointerleave', salir);
    canvas.addEventListener('pointerdown', abajo);
    canvas.addEventListener('pointerup', arriba);

    // Etiqueta flotante sobre el objeto señalado (se mueve sin re-renderizar React)
    const proy = new THREE.Vector3();
    const normal = new THREE.Vector3();
    const colocarEtiqueta = id => {
      const el = tipRef.current;
      if (!el) return;
      const o = id && objetos.find(x => x.userData.id === id);
      if (!o) { el.style.opacity = '0'; return; }
      o.getWorldPosition(proy);
      normal.copy(proy).normalize();
      const deFrente = normal.dot(proy.clone().sub(camera.position).normalize().negate()) > 0.15;
      proy.add(normal.multiplyScalar(0.62 * o.scale.x)).project(camera);
      el.style.opacity = deFrente ? '1' : '0';
      el.style.transform = `translate(${((proy.x + 1) / 2) * ventana.clientWidth}px, ${((1 - proy.y) / 2) * ventana.clientHeight}px) translate(-50%, -100%)`;
    };

    const reloj = new THREE.Clock();
    let previo = 0;
    const cuadro = ahora => {
      if (ahora - previo < FPS_MS) return;
      previo = ahora;
      const t = reloj.getElapsedTime();
      globo.position.y = reducido ? 0 : Math.sin(t * 0.9) * 0.06;
      objetos.forEach(o => {
        if (!reducido) o.userData.animar?.(t);
        const s = 1 + (reducido ? 0 : Math.sin(t * 3) * 0.18);
        o.userData.aro.scale.setScalar(o.userData.id === m.abierto ? 0.75 : o.userData.id === sobreId ? 1.35 : s);
      });
      // Girar la cámara hacia el objeto abierto
      const e = m.enfoque;
      if (e) {
        const k = Math.min(1, (ahora - e.t0) / 800);
        const suave = 1 - Math.pow(1 - k, 3);
        camera.position.lerpVectors(e.desde.pos, e.hacia.pos, suave);
        controls.target.lerpVectors(e.desde.target, e.hacia.target, suave);
        if (k >= 1) m.enfoque = null;
      }
      controls.update();
      if (punteroNuevo) {
        punteroNuevo = false;
        const id = tocado();
        if (id !== sobreId) {
          sobreId = id;
          canvas.style.cursor = id ? 'pointer' : '';
          setSobre(id);
          if (id) cb.current.onSobreObjeto?.();
        }
      }
      colocarEtiqueta(sobreId && sobreId !== m.abierto ? sobreId : null);
      renderer.render(scene, camera);
    };
    let enPantalla = true;
    const actualizarBucle = () => renderer.setAnimationLoop(enPantalla && !document.hidden ? cuadro : null);
    const io = new IntersectionObserver(([e]) => { enPantalla = e.isIntersecting; actualizarBucle(); }, { rootMargin: '100px' });
    io.observe(ventana);
    document.addEventListener('visibilitychange', actualizarBucle);
    actualizarBucle();

    m = { renderer, controls, camera, textura, ajustar, ciudad, halo, ctx, objetos, reducido, capas: null, actual: null, tween: 0, abierto: null, enfoque: null };
    motor.current = m;
    let vivo = true;
    cargarCapas().then(capas => {
      if (!vivo) return;
      motor.current.capas = capas;
      setListo(true);
    });

    return () => {
      vivo = false;
      cancelAnimationFrame(motor.current?.tween);
      renderer.setAnimationLoop(null);
      io.disconnect();
      canvas.removeEventListener('pointermove', mover);
      canvas.removeEventListener('pointerleave', salir);
      canvas.removeEventListener('pointerdown', abajo);
      canvas.removeEventListener('pointerup', arriba);
      document.removeEventListener('visibilitychange', actualizarBucle);
      ro.disconnect();
      controls.dispose();
      scene.traverse(o => {
        o.geometry?.dispose();
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m?.dispose());
      });
      textura.dispose();
      renderer.dispose();
    };
  }, []);

  // ---------- Color según el año y la vista (interpolado) ----------
  useEffect(() => {
    const m = motor.current;
    if (!m || !listo || !Number.isFinite(valor)) return;
    const destino = { valor, nasa: Number.isFinite(valorNasa) ? valorNasa : valor - 0.218, anio: anio ?? 1926 };
    const desde = m.actual && m.vista === vista ? m.actual : destino;
    m.vista = vista;
    m.ciudad.visible = vista === 'planeta';
    cancelAnimationFrame(m.tween);
    const t0 = performance.now();
    const DUR = 420;
    const paso = ahora => {
      const k = Math.min(1, (ahora - t0) / DUR);
      // La textura se repinta a ~30 por segundo como máximo (el último paso siempre se pinta)
      if (k < 1 && ahora - (m.ultimaPintura ?? 0) < 32) {
        m.tween = requestAnimationFrame(paso);
        return;
      }
      m.ultimaPintura = ahora;
      const e = 1 - Math.pow(1 - k, 3);
      const c = {
        valor: desde.valor + (destino.valor - desde.valor) * e,
        nasa: desde.nasa + (destino.nasa - desde.nasa) * e,
        anio: desde.anio + (destino.anio - desde.anio) * e,
      };
      m.actual = c;
      pintarTextura(m.ctx, vista, c, m.capas, mezcla);
      m.textura.needsUpdate = true;
      const t = Math.max(0, Math.min(1, c.valor / 1.5));
      m.halo.material.color.set(mezcla('#9fd3f0', '#ff8a5c', t));
      m.halo.material.opacity = 0.16 + t * 0.14;
      m.objetos.forEach(o => o.userData.calor?.(c.valor)); // termómetro y coral
      if (k < 1) m.tween = requestAnimationFrame(paso);
    };
    m.tween = requestAnimationFrame(paso);
  }, [valor, valorNasa, anio, vista, listo]);

  // ---------- Al abrir un objeto: la cámara gira hacia él y se detiene ----------
  useEffect(() => {
    const m = motor.current;
    if (!m) return;
    const anterior = m.abierto;
    m.abierto = objetoAbierto ?? null;
    m.ajustar();
    const desde = { pos: m.camera.position.clone(), target: m.controls.target.clone() };
    const o = objetoAbierto && m.objetos.find(x => x.userData.id === objetoAbierto);
    if (!o) {
      m.controls.autoRotate = !m.reducido;
      // Al cerrar: volver a mirar el planeta entero desde donde estaba la cámara
      if (anterior) {
        const pos = desde.pos.clone().sub(desde.target).normalize().multiplyScalar(12.5);
        m.enfoque = { desde, hacia: { pos, target: new THREE.Vector3() }, t0: performance.now() };
      }
      return;
    }
    m.controls.autoRotate = false;
    // Acercarse al objeto y mirarlo de costado (desde su "sur"), de pie en pantalla
    const punto = o.getWorldPosition(new THREE.Vector3());
    const normal = punto.clone().normalize();
    const arriba = new THREE.Vector3(0, 1, 0);
    const tangente = arriba.sub(normal.clone().multiplyScalar(arriba.dot(normal))).normalize();
    const dir = normal.clone().sub(tangente.multiplyScalar(0.8)).normalize();
    const target = punto.clone().add(normal.clone().multiplyScalar(0.35 * o.scale.x));
    m.enfoque = { desde, hacia: { pos: target.clone().add(dir.multiplyScalar(6.6)), target }, t0: performance.now() };
  }, [objetoAbierto]);

  // ---------- Zoom solo con el planeta enfocado ----------
  useEffect(() => {
    const m = motor.current;
    if (!m) return;
    m.controls.enableZoom = enfocado;
    if (!enfocado) return;
    const fuera = e => { if (!ventanaRef.current.contains(e.target)) setEnfocado(false); };
    const tecla = e => { if (e.key === 'Escape') setEnfocado(false); };
    const rueda = () => cb.current.onInteraccion?.('zoom');
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

  const zoom = f => {
    const m = motor.current;
    if (!m) return;
    const d = m.camera.position.distanceTo(m.controls.target);
    m.camera.position.sub(m.controls.target).setLength(THREE.MathUtils.clamp(d * f, m.controls.minDistance, m.controls.maxDistance)).add(m.controls.target);
    cb.current.onInteraccion?.('zoom');
  };
  const reiniciar = () => {
    const m = motor.current;
    if (!m) return;
    m.enfoque = null;
    m.camera.position.set(0, 2.2, 12.5);
    m.controls.target.set(0, 0, 0);
    m.controls.autoRotate = !m.reducido && !m.abierto;
  };
  const cambiarVista = v => {
    setVista(v);
    cb.current.onInteraccion?.('vista');
  };

  return (
    <div className={`planeta ${enfocado ? 'enfocado' : ''}`}>
      <div className="planeta-vistas" role="radiogroup" aria-label="Vista del planeta">
        {[['mapa', TEXTOS.planeta.vistaMapa], ['planeta', TEXTOS.planeta.vistaPlaneta]].map(([id, nombre]) => (
          <button key={id} type="button" role="radio" aria-checked={vista === id}
            className={vista === id ? 'activo' : ''} onClick={() => cambiarVista(id)}>{nombre}</button>
        ))}
      </div>
      <div className="planeta-ventana" ref={ventanaRef} onPointerDown={() => setEnfocado(true)}>
        <canvas ref={canvasRef} className="planeta-canvas" role="img" aria-label={TEXTOS.planeta.aria} />
        {etiqueta && <span className="planeta-etiqueta">{etiqueta}</span>}
        <span ref={tipRef} className="planeta-tip" aria-hidden="true">
          {OBJETOS.find(o => o.id === sobre)?.nombre}
        </span>
      </div>
      <div className="planeta-controles">
        <button type="button" onClick={() => zoom(0.82)} aria-label="Acercar"><PixelIcon nombre="mas" tamano={16} /></button>
        <button type="button" onClick={() => zoom(1.22)} aria-label="Alejar"><PixelIcon nombre="menos" tamano={16} /></button>
        <button type="button" onClick={reiniciar} aria-label="Volver a la vista inicial"><PixelIcon nombre="girar" tamano={16} /></button>
      </div>
      {/* Acceso por teclado a los objetos del planeta (visibles al recibir foco) */}
      <div className="planeta-puntos" role="group" aria-label={TEXTOS.planeta.puntos}>
        {OBJETOS.map(o => (
          <button key={o.id} type="button" aria-pressed={objetoAbierto === o.id} onClick={() => onObjeto?.(o.id)}>{o.nombre}</button>
        ))}
      </div>
      {ficha}
      <p className="planeta-ayuda">
        <span className="ayuda-raton">{enfocado ? TEXTOS.planeta.ayudaActivo : TEXTOS.planeta.ayuda}</span>
        <span className="ayuda-tactil">{TEXTOS.planeta.ayudaTactil}</span>
      </p>
      {children}
    </div>
  );
}
