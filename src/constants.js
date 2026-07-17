export const G = 48;
export const SN = v => Math.round(v / G) * G;
let _uid = 1;
export const uid = () => `e${_uid++}`;
export const WIRE_COLORS = ['#38bdf8', '#22c55e', '#f59e0b', '#f43f5e', '#a78bfa', '#fb923c', '#ffffff', '#fbbf24', '#4ade80', '#c084fc'];
export const MODULE_GLYPHS = { dc: '⎓', ac: '∿', pneum: '⬡', hidro: '◉', logic: '⊞', cmd: '⌬', install: '⟂', ladder: '⇄', plc: 'PLC' };
export const TOOL_GLYPHS = { select: '◎', wire: '∿', delete: '⨯', multi: '▣' };
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const hexToRgba = (hex, alpha = 1) => {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return `rgba(148,163,184,${alpha})`;
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map(ch => ch + ch).join('');
  const n = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(n)) return `rgba(148,163,184,${alpha})`;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
};
export const shiftHex = (hex, amt = 0) => {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return hex || '#94a3b8';
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map(ch => ch + ch).join('');
  const n = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(n)) return hex;
  const f = amt >= 0 ? 255 * amt : 0;
  const m = Math.abs(amt);
  const mix = c => Math.round(c + (f - c) * m);
  const r = clamp(mix((n >> 16) & 255), 0, 255).toString(16).padStart(2, '0');
  const g = clamp(mix((n >> 8) & 255), 0, 255).toString(16).padStart(2, '0');
  const b = clamp(mix(n & 255), 0, 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
};
export const createEmptyProjectData = () => ({
  pages: [{ id: 'page-1', name: 'Página 1', layers: [{ id: 'layer-1', name: 'Base', locked: false, visible: true }], comps: [], wires: [] }],
  activePageId: 'page-1',
  favorites: [],
  templates: [],
  settings: { snap: true, grid: true },
  viewMode: '3d',
});
export const INIT = { comps: [], wires: [] };
