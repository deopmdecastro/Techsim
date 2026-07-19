import { useState } from "react";
import { WIRE_COLORS, hexToRgba } from "../constants";

export function Toolbar({
  tool, setTool, sel, selComp, selWire, modColor, running, snap, ortho, zoom, hist,
  comps, wires, push, dispatch, setSel, setSnap, setOrtho, setZoom, setPan,
  doRot, calc, toggleSim, saveJSON, fileRef, clearAll, autoLayout,
  wireColor, setWireColor, viewMode, setViewMode, exportPNG, exportSVG,
  duplicateSelected, fitView, saveProjectSnapshot, showGrid, setShowGrid,
}) {
  const [showWireColors, setShowWireColors] = useState(false);

  const buttonStyle = (color, bg = "#071020", active = false) => ({
    background:active ? `${color}20` : bg,
    border:`1px solid ${active ? color : `${color}33`}`,
    color,
    borderRadius:8,
    padding:"5px 10px",
    cursor:"pointer",
    fontSize:10,
    fontFamily:"'Courier New',monospace",
    transition:"all 0.15s",
    whiteSpace:"nowrap",
    letterSpacing:0.5,
    boxShadow:active ? `0 0 0 1px ${hexToRgba(color, 0.15)} inset, 0 0 16px ${hexToRgba(color, 0.16)}` : "inset 0 1px 0 #ffffff08",
  });

  const separator = <div style={{width:1, height:22, background:"#1e293b", margin:"0 2px", flexShrink:0}} />;

  return (
    <div style={{position:"absolute", top:8, left:8, right:8, display:"flex", gap:4, alignItems:"center", background:"#040d18ee", borderRadius:10, padding:"6px 10px", border:`1px solid ${hexToRgba(modColor, 0.16)}`, flexWrap:"wrap", zIndex:100, backdropFilter:"blur(8px)", boxShadow:"0 10px 34px #0008"}}>
      <button onClick={() => dispatch({ type:"UNDO" })} disabled={!hist.past.length} title="Desfazer Ctrl+Z" style={buttonStyle(hist.past.length ? "#94a3b8" : "#1e293b")}>↩</button>
      <button onClick={() => dispatch({ type:"REDO" })} disabled={!hist.future.length} title="Refazer Ctrl+Y" style={buttonStyle(hist.future.length ? "#94a3b8" : "#1e293b")}>↪</button>
      {separator}

      {selComp && (
        <>
          <button onClick={() => doRot(-90)} title="Girar -90°" style={buttonStyle("#94a3b8")}>↺ −90°</button>
          <button onClick={() => doRot(90)} title="Girar +90°" style={buttonStyle("#94a3b8")}>↻ +90°</button>
          <button onClick={duplicateSelected} title="Duplicar selecionado" style={buttonStyle(modColor)}>⧉ Duplicar</button>
          {separator}
        </>
      )}

      {tool === "wire" && (
        <div style={{position:"relative"}}>
          <button onClick={() => setShowWireColors(open => !open)} title="Cor do fio" style={{...buttonStyle("#94a3b8"), display:"flex", alignItems:"center", gap:5}}>
            <div style={{width:10, height:10, borderRadius:"50%", background:wireColor || "#38bdf8"}} /> Cor do fio
          </button>
          {showWireColors && (
            <div style={{position:"absolute", top:34, left:0, background:"#071020", border:"1px solid #1e3a5f", borderRadius:8, padding:8, display:"flex", gap:5, flexWrap:"wrap", width:140, zIndex:200, boxShadow:"0 4px 20px #000c"}}>
              {WIRE_COLORS.map(color => (
                <div key={color} onClick={() => { setWireColor(color); setShowWireColors(false); }} style={{width:20, height:20, borderRadius:"50%", background:color, border:`2px solid ${wireColor === color ? "#fff" : "#1e3a5f"}`, cursor:"pointer"}} />
              ))}
            </div>
          )}
        </div>
      )}

      {selWire && (
        <>
          <div style={{position:"relative"}}>
            <button onClick={() => setShowWireColors(open => !open)} style={buttonStyle("#94a3b8")}>
              <div style={{width:10, height:10, borderRadius:"50%", background:selWire.color || "#38bdf8", display:"inline-block", marginRight:4}} /> Cor do fio
            </button>
            {showWireColors && (
              <div style={{position:"absolute", top:34, left:0, background:"#071020", border:"1px solid #1e3a5f", borderRadius:8, padding:8, display:"flex", gap:5, flexWrap:"wrap", width:140, zIndex:200, boxShadow:"0 4px 20px #000c"}}>
                {WIRE_COLORS.map(color => (
                  <div key={color} onClick={() => { push({ comps, wires:wires.map(wire => wire.id === selWire.id ? { ...wire, color } : wire) }); setShowWireColors(false); }} style={{width:20, height:20, borderRadius:"50%", background:color, border:`2px solid ${(selWire.color || "#38bdf8") === color ? "#fff" : "#1e3a5f"}`, cursor:"pointer"}} />
                ))}
              </div>
            )}
          </div>
          <button onClick={() => { push({ comps, wires:wires.filter(wire => wire.id !== sel) }); setSel(null); }} style={buttonStyle("#f87171")}>🗑 Fio</button>
          {separator}
        </>
      )}

      <button onClick={toggleSim} title="F5" style={buttonStyle(running ? "#22c55e" : "#64748b", running ? "#052e16" : "#071020", running)}>{running ? "⏸ Parar" : "▶ Simular"}</button>
      <button onClick={calc} title="F9" style={{...buttonStyle(modColor), fontWeight:700}}>⚡ Calcular</button>
      {separator}

      <button onClick={saveProjectSnapshot} title="Salvar projeto" style={buttonStyle("#22d3ee")}>🗂 Salvar</button>
      <button onClick={saveJSON} title="Exportar JSON" style={buttonStyle("#64748b")}>💾 JSON</button>
      <button onClick={() => fileRef.current?.click()} title="Abrir JSON" style={buttonStyle("#64748b")}>📂 Abrir</button>
      <button onClick={exportPNG} title="Exportar PNG" style={buttonStyle("#64748b")}>🖼 PNG</button>
      <button onClick={exportSVG} title="Exportar SVG" style={buttonStyle("#64748b")}>🧭 SVG</button>
      <button onClick={autoLayout} title="Auto Layout" style={buttonStyle("#64748b")}>✨ Layout</button>
      <button onClick={clearAll} title="Limpar" style={buttonStyle("#f87171")}>🗑 Limpar</button>
      {separator}

      <button onClick={() => setZoom(value => Math.min(value * 1.2, 5))} title="Zoom +" style={buttonStyle("#64748b")}>+</button>
      <button onClick={() => setZoom(value => Math.max(value * 0.8, 0.15))} title="Zoom -" style={buttonStyle("#64748b")}>−</button>
      <button onClick={fitView} title="Ajustar à área útil" style={buttonStyle("#64748b")}>◎ Fit</button>
      <button onClick={() => { setZoom(1); setPan({ x:0, y:0 }); }} style={{...buttonStyle("#64748b"), minWidth:48, fontSize:9}}>{(zoom * 100).toFixed(0)}%</button>
      <button onClick={() => setSnap(value => !value)} style={buttonStyle(snap ? "#22c55e" : "#475569", snap ? "#052e16" : "#071020", snap)}>{snap ? "Snap" : "Snap"}</button>
      {setShowGrid && <button onClick={() => setShowGrid(value => !value)} style={buttonStyle(showGrid ? "#22d3ee" : "#475569", showGrid ? "#06303a" : "#071020", showGrid)}>Grade</button>}
      <button onClick={() => setOrtho(value => !value)} style={buttonStyle(ortho ? "#22d3ee" : "#475569", ortho ? "#06303a" : "#071020", ortho)}>{ortho ? "ORTHO✓" : "ORTHO"}</button>
      {separator}
      <div style={{display:"flex", borderRadius:8, overflow:"hidden", border:"1px solid #1e293b"}}>
        <button onClick={() => setViewMode("2d")} style={{...buttonStyle(viewMode === "2d" ? "#38bdf8" : "#475569", viewMode === "2d" ? "#082f49" : "#071020", viewMode === "2d"), border:"none", borderRadius:0}}>2D</button>
        <button onClick={() => setViewMode("3d")} style={{...buttonStyle(viewMode === "3d" ? "#a78bfa" : "#475569", viewMode === "3d" ? "rgba(139,92,246,0.16)" : "#071020", viewMode === "3d"), border:"none", borderRadius:0}}>3D</button>
      </div>

      {running && <span style={{fontSize:9, color:"#22c55e", padding:"3px 10px", background:"#052e16", borderRadius:999, border:"1px solid #22c55e44", marginLeft:4, display:"flex", alignItems:"center", gap:5}}><span style={{width:6,height:6,borderRadius:"50%",background:"#22c55e",display:"inline-block"}}/> AO VIVO</span>}
    </div>
  );
}
