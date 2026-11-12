---
version: 1
slug: "src-app-jsx"
primary_target: "src/App.jsx"
related_targets: []
---

## Scope

Página del Termómetro de la Tierra (React + Vite). Explorador arriba y secciones de lectura debajo. Modo: Experience. Boceto editable; el equipo entregará assets pixel art definitivos.

## Audience and job

Ciudadano sin formación técnica, en celular o en el proyector de clase. Descubre qué es una anomalía, cuánto se calentó el planeta en el período que elige y qué tan cerca está de +1,5 °C, explorando un modelo 3D, tocando objetos del paisaje y cumpliendo misiones.

## Direction contract

THESIS: Un día pixel que se convierte en atardecer rojo a medida que avanzan los años: el paisaje entero es el termómetro. Sobre él flota un modelo 3D de bloques (un año por columna) que se gira y se acerca dentro de su propia ventana difuminada. Rechaza la gráfica plana con tarjetas debajo y el héroe centrado.

OWN-WORLD: Paisaje pixel de referencia Quiet Place / Esipov: cielo celeste con nubes y pinos de día, que vira a naranja, rojo y morado con el calor; sol que baja hacia el horizonte. Transición tramada (dither) hacia secciones de lectura sobre verde-gris pálido con retícula pixel tenue (CyberKongz). Tinta azul noche, acento coral. Títulos en Pixelify Sans, texto en Mulish, cifras en Pixelify Sans. Paneles blancos con borde pixel de 2 px y bisel inferior.

STORY: Llega de día, ve el modelo flotante, arrastra la línea de tiempo y el cielo se enrojece; toca los objetos del paisaje para entender de dónde salen los datos; baja a leer qué es una anomalía, qué dice París y década por década; escucha el siglo; completa misiones.

FIRST VIEWPORT: Barra de navegación. Izquierda (5/12): título, una frase, cifra del año activo, distancia a +1,5 e interruptor de referencia. Derecha (7/12): ventana del modelo 3D con bordes difuminados y controles de zoom. Abajo: franja de objetos interactivos sobre el suelo del paisaje y la línea de tiempo de franjas. Acción principal: arrastrar la línea de tiempo o girar el modelo.

FORM: Paisaje-termómetro de día a atardecer con modelo 3D flotante; dirección fijada por el equipo con referencias (Quiet Place, Maxim Esipov, CyberKongz) sobre la base del diorama asignado; seed:5c20c95541a55975.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Signature interaction

Recorrer los años (línea de tiempo, clic en el modelo o "Escuchar el siglo"): la columna activa se ilumina, el sol baja y el cielo pasa de día a atardecer rojo según la anomalía, suena una nota. El modelo se gira arrastrando y se acerca con la rueda o los botones, sin salirse de su ventana.

## Unresolved

- Assets pixel art definitivos pendientes del equipo; el paisaje y los objetos actuales son provisionales dibujados por código.
