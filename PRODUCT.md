# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite (confirmado por el equipo). Se reutilizan los módulos de datos de los prototipos anteriores (`gistemp.js`, escala de color, sonificación con Web Audio API). Sin backend.

## Users

Cualquier ciudadano sin formación técnica que entra desde el celular, la tableta o el computador y nunca ha oído "anomalía térmica". Se le ofrece una forma de participación activa (retos, preguntas, descubrimientos) en lugar de lectura pasiva.

Audiencia secundaria confirmada por el contexto: el profesor y el grupo de Arquitectura de Sistemas Multimedia (UAO), que evalúan el prototipo y la propuesta teórica.

## Product Purpose

Definición del problema (aprobada por el equipo):

> Para la mayoría de las personas el calentamiento global sigue siendo una idea abstracta: los registros existen, pero se publican como tablas de anomalías difíciles de interpretar.
>
> Se identifica la necesidad de desarrollar una página web informativa e interactiva, accesible desde celulares, tabletas y computadores, que permita a cualquier ciudadano explorar la evolución de las anomalías térmicas globales desde 1926 hasta la actualidad (NASA GISTEMP v4), seleccionar el período que le interese y percibir la magnitud de las variaciones mediante gráficos interactivos y señales sonoras.
>
> La página deberá explicar qué significa una anomalía y ubicar los registros frente a los umbrales de 1,5 °C y 2,0 °C del Acuerdo de París, usando como referencia preindustrial el promedio 1880–1900 y comparando promedios de ventanas de tiempo en lugar de meses aislados.

Éxito: una persona sin formación técnica sale sabiendo (1) qué es una anomalía, (2) cuánto se ha calentado el planeta en el período que eligió, y (3) qué tan cerca está de +1,5 °C, porque lo descubrió interactuando.

## Positioning

Explorador de los datos reales de NASA GISTEMP v4 donde los conceptos (anomalía, línea base, ventanas, umbrales de París) se aprenden manipulándolos y superando retos, no leyendo un artículo.

## Operating Context

- Proyecto 3.3 de Arquitectura de Sistemas Multimedia, UAO (Cali). Entrega: propuesta teórica (50 %) + prototipo (50 %), con evaluación entre pares. Plazo del prototipo: menos de una semana.
- Se presentará en clase (proyector) y se probará en celulares.
- Fase actual: boceto editable; el equipo entregará después los assets de decoración pixel art.

## Capabilities and Constraints

- Datos: `GLB.Ts+dSST.csv` de NASA GISTEMP v4, servido localmente (NASA no permite CORS). Serie mensual 1880–actualidad; se visualiza desde 1926.
- Línea base preindustrial: promedio 1880–1900 de la misma serie (≈ −0,22 °C respecto a 1951–1980). Ese período no se visualiza.
- Comparaciones entre extremos del rango: promedios de ventanas (12 meses), nunca meses aislados.
- Los valores `***` son datos faltantes: se omiten, nunca se convierten en 0.
- Señales sonoras obligatorias que indiquen la magnitud de las anomalías; en esta versión el sonido acompaña, no es protagonista.
- Sin AR ni VR. Experiencia de una sola pantalla tipo explorador desde el inicio.
- Software y recursos multimedia libres y gratuitos o propios (fuentes, sonidos, imágenes, iconografía).

## Brand Commitments

- Nombre: Termómetro de la Tierra.
- Dirección visual fijada por el equipo: estética tipo Codédex (codedex.io): arte pixel art; las gráficas en pixel art con volumen (3D/isométrico) sobre un fondo 2D. Los assets decorativos definitivos los aporta el equipo.
- Créditos visibles: "Datos: NASA GISS/GISTEMP v4".

## Evidence on Hand

- `public/data/GLB.Ts+dSST.csv` (copia de NASA GISTEMP v4, datos hasta 2026-09).
- Cifras verificadas con esos datos: offset 1880–1900 = −0,218 °C; rango 1926-01 → 2026-09: primeros 12 meses +0,11 °C, últimos 12 meses +1,43 °C, cambio +1,32 °C; mes más cálido: septiembre 2023 (+1,70 °C).
- Ausente: assets pixel art definitivos (los entrega el equipo), sonidos grabados (se sintetizan).

## Product Principles

1. Cada cifra sale del CSV de NASA; nada se inventa ni se redondea para impresionar.
2. Los conceptos se descubren haciendo: cada interacción enseña una idea del enunciado.
3. Ningún mes aislado se presenta como conclusión; las comparaciones usan ventanas.
4. Funciona igual de bien con el dedo en un celular que con el mouse en el proyector.

## Accessibility & Inclusion

- Toda señal sonora tiene equivalente visual y textual (el sonido puede silenciarse).
- Navegable con teclado; respeta `prefers-reduced-motion`.
- Texto en español, lenguaje sin tecnicismos o con el tecnicismo explicado.
