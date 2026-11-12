# Design System: Termómetro de la Tierra (pixel)

## 1. Visual Theme & Atmosphere
Noche pixel al estilo de Codédex: un juego de construcción visto de lado. Un paisaje 2D (cielo en bandas, estrellas, montañas, pinos) sostiene un diorama de bloques con volumen donde cada columna es un año de datos de NASA. Densidad media, composición fija de una pantalla, movimiento corto y con propósito. El calor de los datos tiñe el aire del paisaje.

## 2. Color Palette & Roles
- **Noche** (#020617): fondo de página y texto sobre botones amarillos.
- **Panel** (#0B1226) / **Panel alto** (#111A33): HUD, misiones, interruptor.
- **Borde** (#2A3657) / **Borde luz** (#3B4A73): marco escalonado de paneles (luz arriba).
- **Texto** (#E2E8F0) · **Texto suave** (#94A3B8) · **Texto fuerte** (#F8FAFC).
- **Amarillo** (#EAB308) con **sombra** (#A16207) y **claro** (#FDE047): acción principal, asas, selección, cifra grande, borde de +1,5 °C.
- **Verde** (#84CC16): misión completada.
- **Rojo** (#EF4444): cambio/calor.
- **Hielo** (#7DD3FC): vidrios de París, enlaces de explicación.
- **Escala de datos**: divergente #2B5C8A → #F1EEE9 → #B23A26 (solo para codificar temperatura).
- **Suelo**: césped #3F7A2C / #1B3A1F, tierra #4A2F1D / #3A2416.

## 3. Typography Rules
- **Display / cifras / botones:** Press Start 2P (OFL, @fontsource local). Nunca en párrafos.
- **Texto:** Mulish 400/600/800 (OFL, @fontsource local).
- Español con coma decimal (+1,43 °C).

## 4. Component Stylings
- **Panel:** fondo Panel, borde 2px, esquinas escalonadas 4px por clip-path, luz interior arriba y sombra interior abajo (sin sombras externas: el clip las corta).
- **Botón principal:** amarillo, borde 2px casi negro, bisel inferior 4px más oscuro, baja 3px al presionar.
- **Chip:** píldora oscura; activo en azul cielo (#082F49 / #0EA5E9 / #7DD3FC), como los filtros de Codédex.
- **Interruptor de referencia:** dos segmentos dentro de un riel oscuro; el activo es un botón amarillo.
- **Misión:** tarjeta oscura con casilla pixel; completa = borde verde y casilla verde con check pixel.
- **Barra de XP:** 20 celdas cuadradas, llenas en amarillo con bisel.
- **Íconos:** mapas de 8×8 dibujados a mano (PixelIcon), sin emojis ni librerías.

## 5. Layout Principles
Escritorio: barra superior; fila central HUD (250–300px) · diorama (fluido) · misiones (250–300px); línea de tiempo de borde a borde; créditos. ≤1100px: misiones bajan a fila completa. ≤720px: una columna en orden diorama → línea de tiempo → HUD → misiones (plegables). Todo el pixel art se dibuja en canvas de baja resolución y se escala con `image-rendering: pixelated`.

## 6. Motion & Interaction
Firma: recorrer los años arrastrando sobre la línea o el diorama (columna activa iluminada, etiqueta flotante, nota sonora, aire que se calienta). Las columnas crecen desde el suelo al cambiar de período (escalonado de izquierda a derecha, ease-out cúbico). Al cambiar de referencia el suelo se desliza 0,22 °C. Aviso de logro con ease-out expo. Respeta prefers-reduced-motion.

## 7. Anti-Patterns (Banned)
Sin esquinas redondeadas en paneles, sin degradados en texto, sin emojis como íconos, sin sombras suaves genéricas, sin cifras inventadas (todo sale del CSV), sin meses aislados como conclusión, sin fuentes cargadas desde CDN.
