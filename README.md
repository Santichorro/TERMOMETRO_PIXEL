# 1 point 5 · Termómetro de la Tierra (pixel art)

Explorador interactivo de las anomalías de temperatura global (NASA GISTEMP v4), estética pixel art tipo Codédex.
Proyecto 3.3 · Arquitectura de Sistemas Multimedia (UAO).

```bash
npm install
npm run dev
```

## Dónde editar cada cosa

| Quieres cambiar… | Archivo |
|---|---|
| Textos de la página | `src/config/textos.js` |
| Misiones, XP y niveles | `src/config/misiones.js` |
| Imágenes pixel art (fondo, decoración, mascota) | `src/config/assets.js` + `public/assets/` |
| Colores, fuentes y medidas | `src/styles/tokens.css` |
| Distribución de la pantalla | `src/App.css` |
| Planeta 3D (vistas Mapa / Planeta, edificios, zoom) | `src/components/Planeta.jsx` |
| Paisaje de día → atardecer | `src/components/Cielo.jsx` |
| Objetos interactivos del paisaje | `src/config/objetos.js` + `src/components/Sprites.jsx` |
| Secciones de lectura (anomalía, París, décadas, escuchar, datos) | `src/components/secciones/` |
| Gráfica 2D de barras / selector de período | `src/components/Grafica.jsx` |
| Franjas bajo el planeta (mismo período y año que la gráfica) | `src/components/Franjas.jsx` |
| Aviso de logro (estilo Xbox, 3 s) | `src/components/Logro.jsx` |
| Objetos 3D del planeta (fábrica, estación, boya, glaciar, arrecife, termómetro) | `src/lib/objetos3d.js` · ubicación y textos en `src/config/objetos.js` |
| Ficha de un objeto | `src/components/Objetos.jsx` |
| Tabla mes a mes, descargar JSON, cargar otro CSV | `src/components/secciones/Tabla.jsx` |
| Sonido | `src/audio/Sonifier.js` |
| Datos y cálculos (línea base, ventanas) | `src/lib/gistemp.js` |

## Cómo poner los assets

1. Copia los PNG en `public/assets/fondo/` o `public/assets/decoracion/`.
2. Escribe la ruta en `src/config/assets.js` (por ejemplo `cielo: '/assets/fondo/cielo.png'`).
3. Mientras una ruta esté en `null`, se usa el paisaje provisional.

Recomendado: PNG transparentes a resolución nativa (por ejemplo 320×180); se escalan sin suavizado.

## Recursos libres

React, Vite, Three.js (MIT) · Pixelify Sans y Mulish (SIL Open Font License, servidas localmente con @fontsource) · sonido sintetizado con Web Audio API · datos NASA (dominio público).

Versiones anteriores del boceto: `_version1/` (diorama) y `_version2/` (columnas 3D + línea de tiempo).

Contornos de continentes: `world-atlas` (Natural Earth, dominio público) leídos con `topojson-client`.

## Rendimiento

- El planeta 3D (Three.js, ~142 KB comprimido) se carga aparte con `React.lazy`: la página se pinta primero y mientras tanto se ve un planeta de espera del mismo tamaño.
- Los continentes vienen pre-dibujados en `src/assets/tierra-sprite.png` (21 KB). Se regenera con `scripts/generar-sprite.mjs` solo si cambia el mapa.
- El campo de colores del mapa se calcula a 128×64 con tablas precalculadas; la textura es de 512×256.
- El planeta se dibuja a 1/3 de resolución y a ~30 cuadros por segundo; el planeta y el cielo se pausan fuera de pantalla o con la pestaña oculta.
- Edificios con `InstancedMesh` (3 llamadas de dibujo); las piezas fijas de cada objeto 3D se funden en una sola malla. Todo el planeta: unas 17 llamadas de dibujo.
- La textura del planeta se repinta como máximo ~30 veces por segundo durante las transiciones; las secciones de lectura usan `memo` y no se redibujan al recorrer los años.
- En celular el planeta se dibuja menos pixelado (1/1,5 de la resolución en vez de 1/3).
- Fuentes: solo alfabeto latino y los pesos usados. El CSV de NASA se precarga desde `index.html`.

## Fuente: el "5" pixel

El 5 de Pixelify Sans se confunde con la S. `src/assets/fuentes/pixelify-cinco-*.woff2` son la Pixelify original con el 5 redibujado y recortadas a ese único carácter (~660 bytes). `src/styles/cinco.css` las declara como la familia 'Pixelify Cinco', que va primero en `--display` (tokens.css): el navegador la usa solo para el 5 y para lo demás sigue con Pixelify Sans. Para cambiar el dibujo: edita `MAPA` en `scripts/generar-cinco.py` y ejecútalo (`pip install fonttools brotli`).
