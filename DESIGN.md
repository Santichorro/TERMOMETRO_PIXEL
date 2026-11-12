# Design System: Termómetro de la Tierra

## 1. Visual Theme & Atmosphere
Un paisaje pixel art que es el termómetro: de día (cielo celeste, nubes, pinos, sol alto) en los primeros años y atardecer rojo-morado a medida que la anomalía crece; el sol baja al horizonte. Sobre el paisaje flota un modelo 3D de bloques (un año por columna, filas por década) que se gira y se acerca dentro de una ventana con bordes difuminados. Debajo, una transición tramada lleva a secciones de lectura claras sobre retícula pixel tenue. Referencias del equipo: Quiet Place (paisaje de día, botones coral), Maxim Esipov (atardecer pixel, transición tramada), CyberKongz (tipografía pixel, retícula). Densidad media, variación media (explorador 5/12 + 7/12), movimiento fluido y con propósito.

## 2. Color Palette & Roles
- **Tinta** (#13212C) — texto, bordes de 2 px de paneles y botones.
- **Tinta suave** (#3F5563) — texto secundario (contraste AA sobre papel).
- **Papel** (#EEF4F1) / **Papel 2** (#E2ECE7) — fondo de secciones de lectura (bandas alternas), con retícula rgba(19,33,44,0.06) cada 24 px.
- **Panel** (#FFFFFF) con **bisel** (#C7D5CF) — paneles y botones claros.
- **Coral** (#E05A47) / **coral oscuro** (#A83A2B) / **coral claro** (#FBE3DE) — único acento: acción principal, cifra activa, selección, límite +1,5 °C, datos destacados.
- **Verde** (#4D8B3C) / **verde claro** (#DCEFD3) — misión completada.
- **Azul hielo** (#2F7EA8) — +2,0 °C y notas sobre la referencia.
- **Paisaje** (se interpola por calor, de día → atardecer): cielo #7EC4EC→#3A1846 arriba, #EEF5E6→#F6B45A en el horizonte; montañas #A9C9C9→#7A3654; pinos #4F7F58→#2E1830; pasto #88B860→#3D2236; sol #FFF3B0→#FF7A3D.
- **Escala de datos**: #2B5C8A → #F1EEE9 → #B23A26 (solo codifica temperatura).

## 3. Typography Rules
- **Display y cifras:** Pixelify Sans 500/600 (OFL, servida localmente) — títulos, navegación, botones, valores.
- **Texto:** Mulish 400/600/800 (OFL, local) — 17 px, interlineado 1,65, máximo ~62 caracteres.
- Español con coma decimal y signo (+1,43 °C, −0,22 °C, 0,00 °C) vía `lib/formato.js`.

## 4. Component Stylings
- **Panel:** blanco, borde 2 px tinta, esquinas escalonadas de 4 px (clip-path), bisel inferior interno.
- **Botón principal:** coral, borde tinta, bisel inferior coral oscuro; se hunde 2 px al presionar.
- **Chip de período:** píldora blanca con borde; activo en tinta con texto blanco.
- **Interruptor de referencia:** dos segmentos en riel papel; activo coral.
- **Objetos del paisaje:** sprites 16×16 dibujados a mano (Sprites.jsx) con etiqueta; flotan suave; al tocarlos abren una ficha.
- **Misiones:** cajón lateral derecho; tarjeta blanca por misión, casilla pixel, botón "Pista", completada en verde claro; barra de XP de 24 celdas.
- **Íconos:** mapas 8×8 (PixelIcon.jsx), sin emojis ni librerías.

## 5. Layout Principles
Navegación fija arriba. Explorador: columna de texto y lectura (5/12) + modelo 3D (7/12); fila de objetos; línea de tiempo de franjas de borde a borde del contenedor (1200 px). Secciones de lectura en zig-zag de dos columnas (texto / visual). ≤1100 px se oculta la navegación por secciones; ≤900 px todo a una columna; ≤640 px objetos en cuadrícula 2×2 y fichas como hoja inferior.

## 6. Motion & Interaction
Firma: recorrer los años (línea de tiempo, clic en columnas, "Escuchar el período") → columna activa resaltada, sol que baja, cielo que se enrojece, nota sonora. Modelo: arrastrar para girar; zoom con rueda solo tras hacer clic en el modelo (no roba el scroll), botones + / − / reiniciar, pellizco en táctil; bordes con máscara de desvanecido. Flotación continua del modelo y de los objetos; nubes que se desplazan. Easing ease-out exponencial; el cajón de misiones usa curva tipo iOS. Respeta prefers-reduced-motion.

## 7. Anti-Patterns (Banned)
Sin emojis, sin degradados en texto, sin sombras difusas genéricas, sin esquinas redondeadas en paneles (solo los chips son píldora), sin cifras inventadas (todo sale del CSV de NASA), sin meses aislados como conclusión, sin fuentes desde CDN, sin héroe centrado.
