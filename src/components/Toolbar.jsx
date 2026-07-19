import { useMemo, useState } from 'react';
import { WIRE_COLORS, hexToRgba } from '../constants';
import { AppIcon } from './ui/AppIcon';

function ToolButton({ icon, label, onClick, active = false, tone = 'default', disabled = false, compact = false, children }) {
  const tones = {
    default: active
      ? 'border-violet-400/60 bg-violet-500/20 text-violet-100 shadow-[0_0_18px_rgba(139,92,246,0.2)]'
      : 'border-white/10 bg-slate-950/70 text-slate-300 hover:border-white/20 hover:text-white',
    success: active
      ? 'border-emerald-400/60 bg-emerald-500/18 text-emerald-100'
      : 'border-emerald-400/20 bg-emerald-500/8 text-emerald-200 hover:border-emerald-400/40',
    danger: 'border-rose-400/20 bg-rose-500/8 text-rose-200 hover:border-rose-400/40',
    neutral: 'border-white/10 bg-slate-950/70 text-slate-300 hover:border-white/20 hover:text-white',
    brand: 'border-cyan-400/20 bg-cyan-500/8 text-cyan-200 hover:border-cyan-400/40',
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${compact ? 'min-w-[42px] justify-center px-2.5' : ''} ${tones[tone] || tones.default}`}
    >
      {icon && <AppIcon name={icon} className="h-4 w-4" />}
      {children || label}
    </button>
  );
}

export function Toolbar({
  tool, setTool, sel, selComp, selWire, modColor, running, snap, ortho, zoom, hist,
  comps, wires, push, dispatch, setSel, setSnap, setOrtho, setZoom, setPan,
  doRot, calc, toggleSim, saveJSON, fileRef, clearAll, autoLayout,
  wireColor, setWireColor, viewMode, setViewMode, exportPNG, exportSVG,
  duplicateSelected, fitView, saveProjectSnapshot, showGrid, setShowGrid,
}) {
  const [showWireColors, setShowWireColors] = useState(false);
  const zoomLabel = useMemo(() => `${(zoom * 100).toFixed(0)}%`, [zoom]);

  return (
    <div className="panel-glass editor-scroll relative z-[100] overflow-x-auto rounded-2xl px-3 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <ToolButton icon="rotateLeft" compact disabled={!hist.past.length} onClick={() => dispatch({ type: 'UNDO' })} />
        <ToolButton icon="rotateRight" compact disabled={!hist.future.length} onClick={() => dispatch({ type: 'REDO' })} />

        <div className="mx-1 h-7 w-px bg-white/8" />

        {selComp && (
          <>
            <ToolButton icon="rotateLeft" label="−90°" onClick={() => doRot(-90)} />
            <ToolButton icon="rotateRight" label="+90°" onClick={() => doRot(90)} />
            <ToolButton icon="duplicate" label="Duplicar" tone="brand" onClick={duplicateSelected} />
            <div className="mx-1 h-7 w-px bg-white/8" />
          </>
        )}

        {(tool === 'wire' || selWire) && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowWireColors(open => !open)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-white/20"
            >
              <span className="h-3 w-3 rounded-full border border-white/20" style={{ background: selWire?.color || wireColor || '#38bdf8' }} />
              Cor do fio
            </button>
            {showWireColors && (
              <div className="panel-glass absolute left-0 top-12 z-[200] grid w-[168px] grid-cols-5 gap-2 rounded-2xl p-3">
                {WIRE_COLORS.map(color => {
                  const selectedColor = (selWire?.color || wireColor || '#38bdf8') === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        if (selWire) push({ comps, wires: wires.map(wire => wire.id === selWire.id ? { ...wire, color } : wire) });
                        else setWireColor(color);
                        setShowWireColors(false);
                      }}
                      className={`h-7 w-7 rounded-full border-2 transition ${selectedColor ? 'border-white scale-105' : 'border-slate-700'}`}
                      style={{ background: color }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {selWire && (
          <>
            <ToolButton icon="delete" label="Excluir fio" tone="danger" onClick={() => { push({ comps, wires: wires.filter(wire => wire.id !== sel) }); setSel(null); }} />
            <div className="mx-1 h-7 w-px bg-white/8" />
          </>
        )}

        <ToolButton icon={running ? 'pause' : 'play'} label={running ? 'Parar' : 'Simular'} tone="success" active={running} onClick={toggleSim} />
        <ToolButton icon="calculate" label="Calcular" tone="brand" onClick={calc} />

        <div className="mx-1 h-7 w-px bg-white/8" />

        <ToolButton icon="save" label="Salvar" tone="brand" onClick={saveProjectSnapshot} />
        <ToolButton icon="json" label="JSON" onClick={saveJSON} />
        <ToolButton icon="folder" label="Abrir" onClick={() => fileRef.current?.click()} />
        <ToolButton icon="png" label="PNG" onClick={exportPNG} />
        <ToolButton icon="svg" label="SVG" onClick={exportSVG} />
        <ToolButton icon="layout" label="Layout" onClick={autoLayout} />
        <ToolButton icon="clear" label="Limpar" tone="danger" onClick={clearAll} />

        <div className="mx-1 h-7 w-px bg-white/8" />

        <ToolButton icon="zoomOut" compact onClick={() => setZoom(value => Math.max(value * 0.8, 0.15))} />
        <button
          type="button"
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-white/20"
        >
          {zoomLabel}
        </button>
        <ToolButton icon="zoomIn" compact onClick={() => setZoom(value => Math.min(value * 1.2, 5))} />
        <ToolButton icon="fit" label="Fit" onClick={fitView} />
        <ToolButton icon="snap" label="Snap" tone={snap ? 'success' : 'neutral'} active={snap} onClick={() => setSnap(value => !value)} />
        <ToolButton icon="grid" label="Grade" tone={showGrid ? 'brand' : 'neutral'} active={showGrid} onClick={() => setShowGrid(value => !value)} />
        <ToolButton icon="ortho" label="Ortho" tone={ortho ? 'brand' : 'neutral'} active={ortho} onClick={() => setOrtho(value => !value)} />

        <div className="inline-flex overflow-hidden rounded-xl border border-white/10 bg-slate-950/80">
          <button
            type="button"
            onClick={() => setViewMode('2d')}
            className={`px-3 py-2 text-sm font-semibold transition ${viewMode === '2d' ? 'bg-cyan-500/15 text-cyan-200' : 'text-slate-400 hover:text-slate-200'}`}
          >
            2D
          </button>
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`px-3 py-2 text-sm font-semibold transition ${viewMode === '3d' ? 'bg-violet-500/18 text-violet-200' : 'text-slate-400 hover:text-slate-200'}`}
          >
            3D
          </button>
        </div>

        {running && (
          <div className="ml-auto inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
            <span className="status-dot h-2 w-2 rounded-full bg-emerald-400" />
            AO VIVO
          </div>
        )}
      </div>
    </div>
  );
}
