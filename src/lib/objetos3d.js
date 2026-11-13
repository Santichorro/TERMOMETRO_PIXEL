import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ==========================================================
// OBJETOS 3D sobre el planeta (fábrica, estación, boya, termómetro).
// Cada uno es un grupo pequeño de cajas y cilindros con colores planos,
// colocado sobre la superficie en un lugar con sentido:
//  - Fábrica de 1890 → Manchester (Revolución Industrial)
//  - Estación meteorológica → Siberia (el Ártico se calienta más rápido)
//  - Glaciar → Himalaya (el hielo de montaña)
//  - Arrecife de coral → Gran Barrera, Australia (se blanquea con el calor)
//  - Boya oceánica → Pacífico ecuatorial (zona de El Niño)
//  - Termómetro gigante → Amazonía, visible en la vista inicial
// La ubicación (lat, lon) de cada uno está en src/config/objetos.js.
//
// Rendimiento: las piezas fijas de cada objeto se funden en UNA sola malla con
// colores por vértice (una llamada de dibujo). Solo las partes animadas
// (marcadas con userData.vivo) quedan aparte.
// ==========================================================

const mat = color => new THREE.MeshLambertMaterial({ color, flatShading: true });
const M = {
  ladrillo: mat(0xb5523b),
  techo: mat(0x5b3a36),
  gris: mat(0x8d9aa3),
  humo: mat(0xe9ece8),
  blanco: mat(0xf4f1ea),
  tinta: mat(0x2b3a46),
  rojo: mat(0xe05a47),
  amarillo: mat(0xf2c14e),
  vidrio: mat(0xdfeef5),
  roca: mat(0x7d8790),
  hielo: mat(0xcfeaf6),
  nieve: mat(0xf7fbfc),
  agua: mat(0x5fb3dd),
  arena: mat(0xe8d39a),
  algas: mat(0x4f9a5a),
  // Opacos a propósito: las piezas transparentes cuestan más en equipos sin GPU dedicada
  marca: new THREE.MeshBasicMaterial({ color: 0xf2c14e, side: THREE.DoubleSide }),
};

const caja = (w, h, d, m, x = 0, y = 0, z = 0) => {
  const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  o.position.set(x, y + h / 2, z);
  return o;
};
const cilindro = (r, h, m, x = 0, y = 0, z = 0, lados = 8) => {
  const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, lados), m);
  o.position.set(x, y + h / 2, z);
  return o;
};

function fabrica() {
  const g = new THREE.Group();
  g.add(caja(0.42, 0.2, 0.26, M.ladrillo));
  // Techo en dientes de sierra
  for (let i = 0; i < 3; i++) {
    const d = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.08, 0.26, 3, 1), M.techo);
    d.rotation.z = Math.PI / 2;
    d.rotation.y = Math.PI / 2;
    d.position.set(-0.14 + i * 0.14, 0.24, 0);
    g.add(d);
  }
  g.add(cilindro(0.035, 0.42, M.gris, 0.12, 0.2, -0.07));
  g.add(cilindro(0.03, 0.32, M.gris, 0.02, 0.2, -0.08));
  // Bocanadas de humo (se animan)
  const humo = [];
  for (let i = 0; i < 3; i++) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), M.humo);
    b.userData.fase = i / 3;
    b.userData.vivo = true;
    g.add(b);
    humo.push(b);
  }
  g.userData.animar = t => humo.forEach(b => {
    const k = (t * 0.35 + b.userData.fase) % 1;
    b.position.set(0.12 + k * 0.08, 0.64 + k * 0.32, -0.07);
    // Crece al salir y se encoge al final (sin transparencia)
    b.scale.setScalar(Math.max(0.01, Math.sin(Math.PI * Math.min(1, k * 1.15)) * 1.6));
  });
  return g;
}

function estacion() {
  const g = new THREE.Group();
  // Abrigo meteorológico sobre patas
  [[-0.07, -0.05], [0.07, -0.05], [-0.07, 0.05], [0.07, 0.05]].forEach(([x, z]) => g.add(caja(0.02, 0.16, 0.02, M.blanco, x, 0, z)));
  g.add(caja(0.2, 0.15, 0.15, M.blanco, 0, 0.16, 0));
  g.add(caja(0.24, 0.03, 0.19, M.tinta, 0, 0.31, 0));
  // Mástil con anemómetro (gira)
  g.add(cilindro(0.012, 0.5, M.gris, 0.2, 0, 0));
  const molino = new THREE.Group();
  molino.userData.vivo = true;
  molino.position.set(0.2, 0.5, 0);
  for (let i = 0; i < 3; i++) {
    const brazo = new THREE.Group();
    brazo.rotation.y = (i * Math.PI * 2) / 3;
    brazo.add(caja(0.12, 0.012, 0.012, M.tinta, 0.06, 0, 0));
    brazo.add(caja(0.035, 0.035, 0.035, M.rojo, 0.12, -0.017, 0));
    molino.add(brazo);
  }
  g.add(molino);
  g.userData.animar = t => { molino.rotation.y = t * 3; };
  return g;
}

function boya() {
  const g = new THREE.Group();
  const cuerpo = new THREE.Group();
  cuerpo.userData.vivo = true;
  cuerpo.add(cilindro(0.11, 0.08, M.rojo, 0, 0, 0, 10));
  cuerpo.add(cilindro(0.09, 0.07, M.blanco, 0, 0.08, 0, 10));
  cuerpo.add(cilindro(0.07, 0.07, M.rojo, 0, 0.15, 0, 10));
  cuerpo.add(cilindro(0.012, 0.22, M.gris, 0, 0.22, 0));
  const luz = caja(0.05, 0.05, 0.05, M.amarillo, 0, 0.44, 0);
  luz.userData.vivo = true;
  cuerpo.add(luz);
  cuerpo.add(caja(0.12, 0.02, 0.02, M.gris, 0, 0.36, 0)); // antena / sensor
  g.add(cuerpo);
  g.userData.animar = t => {
    cuerpo.position.y = Math.sin(t * 2.2) * 0.02;
    cuerpo.rotation.z = Math.sin(t * 1.7) * 0.08;
    luz.visible = Math.sin(t * 4) > -0.2;
  };
  return g;
}

function termometro() {
  const g = new THREE.Group();
  g.add(caja(0.16, 0.05, 0.16, M.tinta));
  g.add(new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), M.rojo).translateY(0.12));
  g.add(cilindro(0.045, 0.62, M.vidrio, 0, 0.14, 0));
  // Columna roja: su altura sigue la anomalía del año activo
  const columna = cilindro(0.028, 1, M.rojo, 0, 0, 0);
  columna.geometry.translate(0, 0.5, 0);
  columna.position.set(0, 0.16, 0);
  columna.userData.vivo = true;
  g.add(columna);
  [0.3, 0.45, 0.6].forEach(y => g.add(caja(0.06, 0.012, 0.012, M.tinta, 0.06, y, 0)));
  g.userData.columna = columna;
  g.userData.calor = v => { columna.scale.y = THREE.MathUtils.clamp(0.08 + (v / 2) * 0.5, 0.05, 0.58); };
  g.userData.calor(0);
  return g;
}

function glaciar() {
  const g = new THREE.Group();
  const pico = (r, h, x, z, m) => {
    const o = new THREE.Mesh(new THREE.ConeGeometry(r, h, 4), m);
    o.position.set(x, h / 2, z);
    o.rotation.y = Math.PI / 4;
    return o;
  };
  g.add(pico(0.2, 0.42, 0, 0, M.roca));
  g.add(pico(0.15, 0.3, 0.17, 0.06, M.roca));
  g.add(pico(0.13, 0.26, -0.16, -0.04, M.roca));
  // Nieve en las cumbres
  const cima = (r, h, x, y, z) => { const o = pico(r, h, x, z, M.nieve); o.position.y = y; return o; };
  g.add(cima(0.09, 0.19, 0, 0.32, 0));
  g.add(cima(0.065, 0.13, 0.17, 0.235, 0.06));
  // Lengua de hielo que baja por la ladera
  const lengua = caja(0.1, 0.03, 0.22, M.hielo, 0.05, 0, 0.14);
  lengua.rotation.x = 0.25;
  g.add(lengua);
  // Gotas de deshielo (se animan)
  const gotas = [];
  for (let i = 0; i < 2; i++) {
    const d = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.03), M.agua);
    d.userData.vivo = true;
    d.userData.fase = i / 2;
    g.add(d);
    gotas.push(d);
  }
  g.userData.animar = t => gotas.forEach(d => {
    const k = (t * 0.6 + d.userData.fase) % 1;
    d.position.set(0.05, 0.1 - k * 0.09, 0.26 + k * 0.05);
    d.scale.setScalar(Math.max(0.01, Math.sin(Math.PI * k)));
  });
  return g;
}

function arrecife() {
  const g = new THREE.Group();
  g.add(cilindro(0.24, 0.04, M.arena, 0, 0, 0, 10));
  g.add(caja(0.05, 0.12, 0.05, M.algas, -0.16, 0.04, 0.08));
  g.add(caja(0.04, 0.09, 0.04, M.algas, 0.18, 0.04, -0.1));
  // Corales: un material propio que pasa de coral a blanco con la anomalía
  const color = new THREE.MeshLambertMaterial({ color: 0xf07a5a, flatShading: true });
  const corales = new THREE.Group();
  corales.userData.vivo = true;
  corales.userData.sinFundir = true; // se recolorean: no se funden con el resto
  const rama = (x, z, h, inclina) => {
    const o = cilindro(0.025, h, color, 0, 0, 0, 5);
    const b = new THREE.Group();
    b.position.set(x, 0.04, z);
    b.rotation.z = inclina;
    b.add(o);
    const punta = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), color);
    punta.position.y = h;
    b.add(punta);
    corales.add(b);
  };
  rama(0, 0, 0.26, 0);
  rama(0.06, 0.02, 0.18, -0.5);
  rama(-0.06, -0.01, 0.2, 0.45);
  rama(0.1, -0.08, 0.14, -0.3);
  rama(-0.09, 0.09, 0.15, 0.35);
  g.add(corales);
  const vivo = new THREE.Color(0xf07a5a);
  const blanco = new THREE.Color(0xf4f2ec);
  // De +0,5 °C en adelante el coral se va blanqueando; a +1,5 °C queda blanco
  g.userData.calor = v => { color.color.copy(vivo).lerp(blanco, THREE.MathUtils.clamp((v - 0.5) / 1, 0, 1)); };
  g.userData.calor(0);
  return g;
}

const MODELOS = { fabrica, estacion, boya, glaciar, arrecife, termometro };

// Material único con color por vértice para las piezas fundidas
const MAT_FUNDIDO = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });

// Funde en una malla todas las piezas fijas que cuelgan de `raiz` (sin cruzar
// a hijos marcados como vivos); luego repite dentro de cada hijo vivo.
function fundir(raiz) {
  raiz.updateMatrixWorld(true);
  const inversa = raiz.matrixWorld.clone().invert();
  const piezas = [];
  const vivos = [];
  const recorrer = nodo => nodo.children.forEach(h => {
    if (h.userData.vivo) { vivos.push(h); return; }
    if (h.isMesh) piezas.push(h);
    recorrer(h);
  });
  recorrer(raiz);
  if (piezas.length > 1) {
    const geos = piezas.map(m => {
      const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
      g.deleteAttribute('uv');
      g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inversa, m.matrixWorld));
      const c = m.material.color;
      const n = g.attributes.position.count;
      const col = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      return g;
    });
    piezas.forEach(m => { m.parent.remove(m); m.geometry.dispose(); });
    // Quitar grupos que quedaron vacíos
    const vaciar = nodo => [...nodo.children].forEach(h => { vaciar(h); if (!h.isMesh && !h.userData.vivo && !h.children.length) nodo.remove(h); });
    vaciar(raiz);
    raiz.add(new THREE.Mesh(mergeGeometries(geos), MAT_FUNDIDO));
    geos.forEach(g => g.dispose());
  }
  vivos.forEach(v => { if (!v.isMesh && !v.userData.sinFundir) fundir(v); });
}

// Pone cada objeto de pie sobre la esfera en (lat, lon)
export function crearObjetos3D(objetos, enEsfera, radio) {
  const arriba = new THREE.Vector3(0, 1, 0);
  return objetos.map(o => {
    const modelo = MODELOS[o.id]();
    fundir(modelo);
    const base = enEsfera(o.lat, o.lon, radio * (o.flota ? 0.995 : 1));
    modelo.position.copy(base);
    modelo.quaternion.setFromUnitVectors(arriba, base.clone().normalize());
    modelo.scale.setScalar(o.escala ?? 1);
    // Aro amarillo en el suelo: indica que se puede tocar
    const aro = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.25, 16), M.marca);
    aro.rotation.x = -Math.PI / 2;
    aro.position.y = 0.01;
    modelo.add(aro);
    modelo.userData.aro = aro;
    modelo.userData.id = o.id;
    modelo.traverse(h => { h.userData.objetoId = o.id; });
    return modelo;
  });
}
