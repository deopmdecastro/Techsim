import { useEffect, useMemo, useRef, useState } from 'react';
import { WIRE_COLORS } from '../constants';
import { AppIcon } from './ui/AppIcon';

function ToolButton({ icon, label, title, onClick, active = false, tone = 'default', disabled = false, compact = false, children }) {
  const tones = {
    default: active
      ? 'border-violet-400/60 bg-violet-500/20 text-violet-100 shadow-[0_0_18px_rgba(139,92,246,0.2)]'
      : 'border-white/10 bg-slate-950/70 text-slate-300 hover:border-white/20 hover:text-white',
    success: active
      ? 'border-emerald-400/60 bg-emerald-500/18 text-emerald-100'
      : 'border-emerald-400/20 bg-emerald-500/8 text-emerald-200 hover:border-emerald-400/40',
    danger: 'border-rose-400/20 bg-rose-500/8 text-rose-200 hover:border-rose-400/40',
    neutral: active
      ? 'border-violet-400/50 bg-violet-500/15 text-violet-100'
      : 'border-white/10 bg-slate-950/70 text-slate-300 hover:border-white/20 hover:text-white',
    brand: 'border-cyan-400/20 bg-cyan-500/8 text-cyan-200 hover:border-cyan-400/40',
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={title || label}
      aria-label={title || label}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-35 disabled:active:scale-100 ${compact ? 'min-w-[38px] justify-center px-2.5' : ''} ${tones[tone] || tones.default}`}
    >
      {icon && <AppIcon name={icon} className="h-4 w-4 shrink-0" />}
      {children || (label && <span className="whitespace-nowrap">{label}</span>)}
    </button>
  );
}

/* Visually clusters related controls behind a faint shared surface, so the
   toolbar reads as a handful of purposeful groups instead of one long row. */
function ToolGroup({ children, label }) {
  return (
    <div
      className="flex items-center gap-1.5 rounded-2xl border border-white/5 bg-white/[0.02] p-1"
      role="group"
      aria-label={label}
    >
      {children}
    </div>
  );
}

function Divider() {
  return <div className="mx-0.5 h-7 w-px shrink-0 bg-gradient-to-b from-transparent via-white/12 to-transparent" />;
}

export function Toolbar({
  tool, setTool, sel, selComp, selWire, modColor, running, snap, ortho, zoom, hist,
  comps, wires, push, dispatch, setSel, setSnap, setOrtho, setZoom, setPan,
  doRot, calc, toggleSim, saveJSON, fileRef, clearAll, autoLayout,
  wireColor, setWireColor, viewMode, setViewMode, exportPNG, exportSVG,
  duplicateSelected, fitView, saveProjectSnapshot, showGrid, setShowGrid,
}) {
  const [showWireColors, setShowWireColors] = useState(false);
  const wirePopRef = useRef(null);
  const zoomLabel = useMemo(() => `${(zoom * 100).toFixed(0)}%`, [zoom]);
  const activeWireColor = selWire?.color || wireColor || '#38bdf8';

  useEffect(() => {
    if (!showWireColors) return undefined;
    const onDown = e => {
      if (wirePopRef.current && !wirePopRef.current.contains(e.target)) setShowWireColors(false);
    };
    const onKey = e => { if (e.key === 'Escape') setShowWireColors(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [showWireColors]);

  return (
    <div className="panel-glass editor-scroll relative z-[100] overflow-x-auto rounded-2xl px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <ToolGroup label="Histórico">
          <ToolButton icon="rotateLeft" compact title="Desfazer (Ctrl+Z)" disabled={!hist.past.length} onClick={() => dispatch({ type: 'UNDO' })} />
          <ToolButton icon="rotateRight" compact title="Refazer (Ctrl+Shift+Z)" disabled={!hist.future.length} onClick={() => dispatch({ type: 'REDO' })} />
        </ToolGroup>

        {selComp && (
          <>
            <Divider />
            <ToolGroup label="Componente selecionado">
              <ToolButton icon="rotateLeft" label="−90°" title="Rodar −90°" onClick={() => doRot(-90)} />
              <ToolButton icon="rotateRight" label="+90°" title="Rodar +90°" onClick={() => doRot(90)} />
              <ToolButton icon="duplicate" label="Duplicar" tone="brand" onClick={duplicateSelected} />
            </ToolGroup>
          </>
        )}

        {(tool === 'wire' || selWire) && (
          <>
            <Divider />
            <div className="relative" ref={wirePopRef}>
              <button
                type="button"
                onClick={() => setShowWireColors(open => !open)}
                title="Cor do fio"
                aria-expanded={showWireColors}
                className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.96] ${showWireColors ? 'border-white/25 bg-slate-900/80 text-white' : 'border-white/10 bg-slate-950/70 text-slate-200 hover:border-white/20'}`}
              >
                <span className="h-3 w-3 rounded-full border border-white/25" style={{ background: activeWireColor, boxShadow: `0 0 8px ${activeWireColor}66` }} />
                Cor do fio
                <AppIcon name="rotateRight" className={`h-3 w-3 text-slate-500 transition-transform ${showWireColors ? 'rotate-90' : 'rotate-0'}`} />
              </button>
              {showWireColors && (
                <div className="panel-glass absolute left-0 top-12 z-[200] w-[192px] rounded-2xl p-3">
                  <div className="mb-2 px-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Cor do fio</div>
                  <div className="grid grid-cols-5 gap-2">
                    {WIRE_COLORS.map(color => {
                      const selectedColor = activeWireColor === color;
                      return (
                        <button
                          key={color}
                          type="button"
                          title={color}
                          onClick={() => {
                            if (selWire) push({ comps, wires: wires.map(wire => wire.id === selWire.id ? { ...wire, color } : wire) });
                            else setWireColor(color);
                            setShowWireColors(false);
                          }}
                          className={`relative h-7 w-7 rounded-full border-2 text-[10px] font-bold text-black/70 transition-all duration-150 hover:scale-110 ${selectedColor ? 'border-white scale-110 shadow-[0_0_0_2px_rgba(255,255,255,0.15)]' : 'border-slate-700'}`}
                          style={{ background: color }}
                        >
                          {selectedColor && '✓'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {selWire && (
          <>
            <Divider />
            <ToolButton icon="delete" label="Excluir fio" tone="danger" onClick={() => { push({ comps, wires: wires.filter(wire => wire.id !== sel) }); setSel(null); }} />
          </>
        )}

        <Divider />

        <ToolGroup label="Simulação">
          <ToolButton icon={running ? 'pause' : 'play'} label={running ? 'Parar' : 'Simular'} title={running ? 'Parar simulação' : 'Iniciar simulação'} tone="success" active={running} onClick={toggleSim} />
          <ToolButton icon="calculate" label="Calcular" title="Calcular (F9)" tone="brand" onClick={calc} />
        </ToolGroup>

        <Divider />

        <ToolGroup label="Ficheiro">
          <ToolButton icon="save" label="Salvar" title="Salvar projeto" tone="brand" onClick={saveProjectSnapshot} />
          <ToolButton icon="json" label="JSON" title="Exportar JSON" onClick={saveJSON} />
          <ToolButton icon="folder" label="Abrir" title="Abrir projeto" onClick={() => fileRef.current?.click()} />
          <ToolButton icon="png" label="PNG" title="Exportar imagem PNG" onClick={exportPNG} />
          <ToolButton icon="svg" label="SVG" title="Exportar vetor SVG" onClick={exportSVG} />
        </ToolGroup>

        <ToolGroup label="Organização">
          <ToolButton icon="layout" label="Layout" title="Organizar automaticamente" onClick={autoLayout} />
          <ToolButton icon="clear" label="Limpar" title="Limpar tudo" tone="danger" onClick={clearAll} />
        </ToolGroup>

        <Divider />

        <ToolGroup label="Zoom">
          <ToolButton icon="zoomOut" compact title="Reduzir zoom" onClick={() => setZoom(value => Math.max(value * 0.8, 0.15))} />
          <button
            type="button"
            title="Repor zoom e centrar"
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="mono min-w-[52px] rounded-xl border border-white/10 bg-slate-950/70 px-2 py-2 text-center text-sm font-semibold text-slate-200 transition-all duration-150 hover:border-white/20 active:scale-[0.96]"
          >
            {zoomLabel}
          </button>
          <ToolButton icon="zoomIn" compact title="Aumentar zoom" onClick={() => setZoom(value => Math.min(value * 1.2, 5))} />
          <ToolButton icon="fit" label="Fit" title="Ajustar à janela" onClick={fitView} />
        </ToolGroup>

        <ToolGroup label="Vista">
          <ToolButton icon="snap" label="Snap" title="Alinhar à grade" tone={snap ? 'success' : 'neutral'} active={snap} onClick={() => setSnap(value => !value)} />
          <ToolButton icon="grid" label="Grade" title="Mostrar grade" tone={showGrid ? 'brand' : 'neutral'} active={showGrid} onClick={() => setShowGrid(value => !value)} />
          <ToolButton icon="ortho" label="Ortho" title="Fios ortogonais" tone={ortho ? 'brand' : 'neutral'} active={ortho} onClick={() => setOrtho(value => !value)} />
        </ToolGroup>

        <div className="inline-flex overflow-hidden rounded-xl border border-white/10 bg-slate-950/80">
          <button
            type="button"
            title="Vista 2D"
            onClick={() => setViewMode('2d')}
            className={`px-3 py-2 text-sm font-semibold transition-colors duration-150 ${viewMode === '2d' ? 'bg-cyan-500/15 text-cyan-200' : 'text-slate-400 hover:text-slate-200'}`}
          >
            2D
          </button>
          <button
            type="button"
            title="Vista 3D"
            onClick={() => setViewMode('3d')}
            className={`px-3 py-2 text-sm font-semibold transition-colors duration-150 ${viewMode === '3d' ? 'bg-violet-500/18 text-violet-200' : 'text-slate-400 hover:text-slate-200'}`}
          >
            3D
          </button>
        </div>

        {running && (
          <div className="ml-auto inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
            <span className="status-dot pulse-dot h-2 w-2 rounded-full bg-emerald-400" />
            AO VIVO
          </div>
        )}
      </div>
    </div>
  );
}
