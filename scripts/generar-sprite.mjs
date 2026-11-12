// Genera src/assets/tierra-sprite.png (tierra, contornos y retícula pre-dibujados).
// Solo hace falta si cambias el mapa. Requiere: npm i -D playwright && npx playwright install chromium
// Luego: node scripts/generar-sprite.mjs (y reducir a 512×768 en 16 grises con Pillow o un editor).
import { feature } from 'topojson-client';
import fs from 'fs';
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const tierra = JSON.parse(fs.readFileSync('node_modules/world-atlas/land-110m.json'));
const geo = feature(tierra, tierra.objects.land);
const anillos = [];
for (const f of geo.features) { const g = f.geometry; const polis = g.type === 'Polygon' ? [g.coordinates] : g.coordinates; for (const p of polis) for (const a of p) anillos.push(a.map(([x,y]) => [+x.toFixed(2), +y.toFixed(2)])); }
const b = await chromium.launch(); const p = await b.newPage();
const url = await p.evaluate((anillos) => {
  const W = 1024, H = 512;
  const c = document.createElement('canvas'); c.width = W; c.height = H * 3; const x = c.getContext('2d');
  const xy = ([lon, lat]) => [((lon + 180) / 360) * W, ((90 - lat) / 180) * H];
  const trazar = (oy) => { x.beginPath(); for (const a of anillos) { let ant = null; a.forEach((pt, i) => { const [px, py] = xy(pt); if (i === 0 || (ant && Math.abs(px - ant) > W / 2)) x.moveTo(px, py + oy); else x.lineTo(px, py + oy); ant = px; }); } };
  // banda 0: tierra rellena (blanco opaco)
  // Relleno: se "desenvuelven" las longitudes para que los polígonos que cruzan
  // el meridiano 180° no dejen franjas, y se dibujan también desplazados ±360°.
  x.fillStyle = '#fff';
  x.beginPath();
  for (const a of anillos) {
    const lon = [a[0][0]];
    for (let i = 1; i < a.length; i++) { let l = a[i][0]; while (l - lon[i - 1] > 180) l -= 360; while (l - lon[i - 1] < -180) l += 360; lon.push(l); }
    for (const d of [-360, 0, 360]) a.forEach((pt, i) => { const [px, py] = xy([lon[i] + d, pt[1]]); if (i === 0) x.moveTo(px, py); else x.lineTo(px, py); });
  }
  x.fill('evenodd');
  // La Antártida llega al polo: se cierra el borde inferior
  x.fillRect(0, H - 4, W, 4);
  // banda 1: contornos de continentes
  x.strokeStyle = '#fff'; x.lineWidth = 2.5; x.lineJoin = 'round'; trazar(H); x.stroke();
  // banda 2: retícula punteada cada 30°
  x.lineWidth = 1.5; x.setLineDash([6, 6]);
  for (let lon = -180; lon <= 180; lon += 30) { const [px] = xy([lon, 0]); x.beginPath(); x.moveTo(px, 2*H); x.lineTo(px, 3*H); x.stroke(); }
  for (let lat = -60; lat <= 60; lat += 30) { const [, py] = xy([0, lat]); x.beginPath(); x.moveTo(0, py + 2*H); x.lineTo(W, py + 2*H); x.stroke(); }
  return c.toDataURL('image/png');
}, anillos);
fs.mkdirSync('src/assets', { recursive: true });
fs.writeFileSync('src/assets/tierra-sprite.png', Buffer.from(url.split(',')[1], 'base64'));
await b.close();
