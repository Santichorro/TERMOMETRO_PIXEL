// ==========================================================
// ASSETS — pon tus imágenes pixel art en /public/assets/ y escribe la ruta.
// Si una ruta es null se usa la versión provisional dibujada por código.
// Recomendado: PNG con fondo transparente, a resolución nativa (ej. 320×180)
// para que se escale sin suavizado.
// ==========================================================

export const ASSETS = {
  fondo: {
    // Capas de atrás hacia adelante. Ej.: '/assets/fondo/cielo.png'
    cielo: null,
    montanas: null,
    arboles: null,
  },
  decoracion: {
    // Elementos sueltos sobre el paisaje (nubes, animales, edificios…)
    // Ej.: [{ src: '/assets/decoracion/nube.png', x: 10, y: 8, ancho: 48 }]  (x, y, ancho en % de la pantalla)
    elementos: [],
  },
  // Personaje o mascota que acompaña las misiones (opcional)
  mascota: null,
};
