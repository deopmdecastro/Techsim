import { SYMBOL_LIBRARY, symbolAssetUrl } from '../data/symbolLibrary';
import { getSymbolOverrides } from '../services/symbolOverrides';

// Ponte entre a biblioteca de símbolos SVG (usada na galeria "Mídia" e na
// doca de componentes via <SymbolIcon>) e o canvas 2D do editor/simulador.
//
// O canvas desenha os componentes imperativamente (ctx.beginPath/stroke/...),
// por isso não pode simplesmente usar um <img>. Em vez disso, carregamos o
// SVG real para uma HTMLImageElement, "pintamo-lo" da cor do componente para
// uma <canvas> offscreen (via globalCompositeOperation 'source-in') e
// desenhamos esse resultado com ctx.drawImage — assim o mesmo desenho técnico
// que aparece na galeria e na doca passa a aparecer também dentro do circuito.
//
// O loop de animação do editor já corre em requestAnimationFrame contínuo
// (ver Engine.jsx), por isso não precisamos de disparar um redraw manual
// quando uma imagem termina de carregar: o próximo frame já a apanha.

const rawCache = new Map(); // type -> HTMLImageElement | null (sem símbolo)
const tintCache = new Map(); // "type|color|size" -> HTMLCanvasElement

function resolveSrc(type) {
  const override = getSymbolOverrides()[type];
  if (override?.dataUrl) return override.dataUrl;
  const builtin = SYMBOL_LIBRARY[type];
  return builtin ? symbolAssetUrl(builtin.file) : null;
}

function loadRaw(type) {
  if (rawCache.has(type)) return rawCache.get(type);
  const src = resolveSrc(type);
  if (!src) { rawCache.set(type, null); return null; }
  const img = new Image();
  img.onerror = () => rawCache.set(type, null);
  img.src = src;
  rawCache.set(type, img);
  return img;
}

/**
 * Devolve uma <canvas> offscreen com o símbolo SVG real do tipo `type`,
 * já redimensionado (mantendo o aspect ratio dentro de `maxSize`) e pintado
 * na cor `color`. Devolve null enquanto a imagem ainda não carregou ou se
 * não existir símbolo mapeado para este tipo — nesse caso o chamador deve
 * recorrer ao desenho vetorial de fallback.
 */
export function getTintedSymbol(type, color, maxSize = 34) {
  const img = loadRaw(type);
  if (!img || !img.complete || !img.naturalWidth) return null;

  const key = `${type}|${color}|${maxSize}`;
  const cached = tintCache.get(key);
  if (cached) return cached;

  const ratio = img.naturalWidth / img.naturalHeight;
  const w = Math.max(1, Math.round(ratio >= 1 ? maxSize : maxSize * ratio));
  const h = Math.max(1, Math.round(ratio >= 1 ? maxSize / ratio : maxSize));

  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const octx = off.getContext('2d');
  octx.drawImage(img, 0, 0, w, h);
  octx.globalCompositeOperation = 'source-in';
  octx.fillStyle = color;
  octx.fillRect(0, 0, w, h);
  octx.globalCompositeOperation = 'source-over';

  tintCache.set(key, off);
  return off;
}

function invalidate() {
  rawCache.clear();
  tintCache.clear();
}

if (typeof window !== 'undefined') {
  window.addEventListener('techsim-symbols-changed', invalidate);
  window.addEventListener('storage', invalidate);
}
