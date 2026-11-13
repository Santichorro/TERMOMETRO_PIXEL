# Genera src/assets/fuentes/pixelify-cinco-{500,600}.woff2: un "5" pixel propio
# para Pixelify Sans (el original se confunde con la S).
# Se parte de la fuente ORIGINAL completa (para conservar todas sus tablas y que
# Windows/DirectWrite la acepte), se cambia solo el dibujo del 5 y se recorta
# al carácter 5 con fontTools.subset.
# Uso: pip install fonttools brotli  →  python scripts/generar-cinco.py
# Para cambiar el dibujo, edita MAPA (5 columnas × 7 filas, fila superior primero).
from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools import subset
from fontTools.ttLib.tables import ttProgram

MAPA = [
  '#####',
  '#....',
  '####.',
  '....#',
  '....#',
  '#...#',
  '.###.',
]

# Grosor (trazo vertical de borde, barra horizontal) medido en el 5 original de Pixelify
GROSOR = {'500': (111, 113), '600': (118, 125)}

for peso in ['500', '600']:
  fuente = TTFont(f'node_modules/@fontsource/pixelify-sans/files/pixelify-sans-latin-{peso}-normal.woff2')
  glyf = fuente['glyf']
  viejo = glyf['five']
  viejo.recalcBounds(glyf)
  # Caja del 5 original (misma posición y tamaño que los otros dígitos)
  x0, y0, x1, y1 = viejo.xMin, viejo.yMin, viejo.xMax, viejo.yMax
  # Pixelify no usa una cuadrícula pareja: sus trazos de borde son más gruesos
  # que los pixeles interiores. Grosores medidos en el 5 original de cada peso:
  borde_v, barra_h = GROSOR[peso]
  # Columnas: las de los bordes llevan el grosor del trazo; las 3 interiores se reparten el resto
  interior = (x1 - x0 - 2 * borde_v) / 3
  anchos = [borde_v, interior, interior, interior, borde_v]
  # Filas: las que son barras (4 o más pixeles llenos) llevan el grosor de barra
  barras = [fila.count('#') >= 4 for fila in MAPA]
  resto = (y1 - y0 - barras.count(True) * barra_h) / barras.count(False)
  altos = [barra_h if b else resto for b in barras]
  xs = [x0]
  for w in anchos: xs.append(xs[-1] + w)
  ys = [y1]
  for h in altos: ys.append(ys[-1] - h)
  pen = TTGlyphPen(fuente.getGlyphSet())
  for fila, linea in enumerate(MAPA):
    yt = round(ys[fila]); yb = round(ys[fila + 1])
    c = 0
    while c < 5:
      if linea[c] == '#':
        ini = c
        while c < 5 and linea[c] == '#': c += 1
        xa = round(xs[ini]); xb = round(xs[c])
        pen.moveTo((xa, yb)); pen.lineTo((xa, yt)); pen.lineTo((xb, yt)); pen.lineTo((xb, yb)); pen.closePath()
      else:
        c += 1
  nuevo = pen.glyph()
  nuevo.recalcBounds(glyf)
  glyf['five'] = nuevo
  ancho, _ = fuente['hmtx']['five']
  fuente['hmtx']['five'] = (ancho, nuevo.xMin)
  # Sin instrucciones de hinting (no aplican al dibujo nuevo)
  nuevo.program = ttProgram.Program()
  nuevo.program.fromBytecode(b'')

  opciones = subset.Options()
  opciones.flavor = 'woff2'
  opciones.layout_features = []
  opciones.name_IDs = ['*']
  opciones.notdef_outline = True
  s = subset.Subsetter(opciones)
  s.populate(unicodes=[0x35])
  s.subset(fuente)
  fuente.flavor = 'woff2'
  fuente.save(f'src/assets/fuentes/pixelify-cinco-{peso}.woff2')
  print('listo', peso)
