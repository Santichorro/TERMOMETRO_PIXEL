---
version: 1
slug: "src-app-jsx"
primary_target: "src/App.jsx"
related_targets: []
---

## Scope

Pantalla principal (única) del Termómetro de la Tierra: explorador interactivo. Modo: Experience. Boceto editable; los assets pixel art decorativos los entregará el equipo y reemplazan los provisionales.

## Audience and job

Ciudadano sin formación técnica, en celular o en el proyector de clase. Descubre qué es una anomalía, cuánto se calentó el planeta en el período que elige y qué tan cerca está de +1,5 °C, cumpliendo misiones.

## Direction contract

THESIS: La serie de NASA es un diorama isométrico de juego de construcción: cada año es una columna de bloques pixel cuya altura y color son su anomalía, levantada sobre un terreno pixel frente a un paisaje 2D. Rechaza la página de gráfica de líneas con tarjetas debajo y la landing de héroe + botón.

OWN-WORLD: Noche pixel de Codédex: fondo azul noche #020617, cielo y montañas en pixel art 2D, terreno isométrico de bloques; columnas con caras clara/oscura en la escala frío→cálido de las franjas; vidrios de +1,5/+2,0 como losas translúcidas con borde ámbar; HUD de juego: paneles oscuros con borde escalonado, botón amarillo #EAB308 con sombra inferior, títulos en Press Start 2P, texto en Mulish.

STORY: Ve el siglo como un paisaje que crece, arrastra la línea de tiempo para elegir su período, cambia la referencia NASA⇄preindustrial y ve moverse el suelo, completa misiones que le enseñan cada concepto y se va sabiendo cuánto y qué tan cerca.

FIRST VIEWPORT: Diorama a sangre ocupando ~70 % del alto; HUD superior con cifra actual grande (Press Start 2P), distancia a +1,5 y botón de sonido; panel de misiones a la derecha con barra de XP; línea de tiempo de franjas con dos asas abajo, de lado a lado; interruptor de referencia junto a la cifra. Acción principal: arrastrar la línea de tiempo.

FORM: Diorama isométrico de juego de construcción, posición 4 de la lista propia ordenada (asignada por el sorteo, degradado sin retadores); seed:5c20c95541a55975.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature interaction

Arrastrar sobre la línea de tiempo: el cursor recorre los años, la columna activa se ilumina y sube un bloque, el cielo se calienta de azul a rojo y suena una nota según la anomalía. El interruptor de referencia desliza todo el diorama 0,22 °C hacia arriba o abajo mientras las columnas no cambian de tamaño relativo.

## Unresolved

- Assets pixel art definitivos (fondo, terreno, decoración, íconos): pendientes del equipo; los actuales son provisionales dibujados por código.
- Retos finales: la primera versión trae cuatro misiones; el equipo puede ajustar textos y cantidad.
