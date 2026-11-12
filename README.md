# Termómetro de la Tierra · boceto pixel art

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
| Modelo 3D (columnas, isla, vidrios de París, zoom) | `src/components/Modelo3D.jsx` |
| Paisaje de día → atardecer | `src/components/Cielo.jsx` |
| Objetos interactivos del paisaje | `src/config/objetos.js` + `src/components/Sprites.jsx` |
| Secciones de lectura (anomalía, París, décadas, escuchar, datos) | `src/components/secciones/` |
| Línea de tiempo / selector de período | `src/components/LineaTiempo.jsx` |
| Sonido | `src/audio/Sonifier.js` |
| Datos y cálculos (línea base, ventanas) | `src/lib/gistemp.js` |

## Cómo poner los assets

1. Copia los PNG en `public/assets/fondo/` o `public/assets/decoracion/`.
2. Escribe la ruta en `src/config/assets.js` (por ejemplo `cielo: '/assets/fondo/cielo.png'`).
3. Mientras una ruta esté en `null`, se usa el paisaje provisional.

Recomendado: PNG transparentes a resolución nativa (por ejemplo 320×180); se escalan sin suavizado.

## Recursos libres

React, Vite, Three.js (MIT) · Pixelify Sans y Mulish (SIL Open Font License, servidas localmente con @fontsource) · sonido sintetizado con Web Audio API · datos NASA (dominio público).

La versión anterior del boceto está en `_version1/`.
