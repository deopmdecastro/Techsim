import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { G, INIT, SN, TOOL_GLYPHS, hexToRgba, shiftHex, uid } from "../constants";
import { MODS_ALL } from "../data/modules";
import { hRed } from "../core/history";
import { solve } from "../core/solvers";
import { drawComp, drawGrid, drawWire } from "../canvas/shapes";
import { PropertiesPanel } from "./PropertiesPanel";
import { Toolbar } from "./Toolbar";

const deepClone = value => JSON.parse(JSON.stringify(value));

function formatProjectPayload(payload) {
  const data = payload?.data || payload || {};
  return {
    comps: deepClone(data.comps || []),
    wires: deepClone(data.wires || []),
    viewMode: data.viewMode || payload?.viewMode || "3d",
  };
}

function prettyDate(value) {
  try {
    return new Date(value).toLocaleString("pt-BR");
  } catch {
    return value || "";
  }
}

export function Engine({
  modId,
  modColor,
  lib,
  userName,
  modulePresets = [],
  savedProjects = [],
  onSaveProject,
  onLoadProject,
  initialProject,
  initialProjectKey = "default",
}) {
  const cvRef = useRef();
  const animRef = useRef();
  const tickRef = useRef(0);
  const isPan = useRef(false);
  const panStart = useRef({ mx:0, my:0, px:0, py:0 });
  const fileRef = useRef();

  const [hist, dispatch] = useReducer(hRed, { past:[], present:INIT, future:[] });
  const { comps, wires } = hist.present;
  const push = useCallback(snapshot => dispatch({ type:"PUSH", p:snapshot }), []);

  const [tool, setTool] = useState("select");
  const [sel, setSel] = useState(null);
  const [wStart, setWStart] = useState(null);
  const [mouse, setMouse] = useState({ x:0, y:0 });
  const [drag, setDrag] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x:0, y:0 });
  const [running, setRunning] = useState(false);
  const [snap, setSnap] = useState(true);
  const [ortho, setOrtho] = useState(false);
  const [viewMode, setViewMode] = useState("3d");
  const [paletteFilter, setPaletteFilter] = useState("");
  const [sd, setSd] = useState(null);
  const [tick, setTick] = useState(0);
  const [status, setStatusState] = useState("Selecione uma ferramenta e clique no canvas");
  const [wireColor, setWireColor] = useState("#38bdf8");
  const [loadingProjectId, setLoadingProjectId] = useState("");

  const setStatus = useCallback(message => {
    setStatusState(message);
    window.clearTimeout(setStatus.timeoutId);
    setStatus.timeoutId = window.setTimeout(() => setStatusState("Pronto"), 2800);
  }, []);

  const selComp = comps.find(component => component.id === sel);
  const selWire = wires.find(wire => wire.id === sel);
  const moduleMeta = MODS_ALL.find(item => item.id === modId);

  const filteredLib = useMemo(() => {
    const query = paletteFilter.trim().toLowerCase();
    if (!query) return lib;
    return lib.filter(item => `${item.lbl} ${item.sym} ${item.tip} ${item.k}`.toLowerCase().includes(query));
  }, [lib, paletteFilter]);

  const applyProjectState = useCallback((payload, label = "Projeto carregado") => {
    const formatted = formatProjectPayload(payload);
    dispatch({ type:"RESET", p:{ comps:formatted.comps, wires:formatted.wires } });
    setViewMode(formatted.viewMode || "3d");
    setSd(null);
    setSel(null);
    setWStart(null);
    setRunning(false);
    setStatus(label);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const cv = cvRef.current;
        if (!cv) return;
        if (!(formatted.comps.length || formatted.wires.length)) return;
        const xs = [...formatted.comps.flatMap(c => [c.x - 64, c.x + 64]), ...formatted.wires.flatMap(w => [w.x1, w.x2])];
        const ys = [...formatted.comps.flatMap(c => [c.y - 64, c.y + 64]), ...formatted.wires.flatMap(w => [w.y1, w.y2])];
        const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
        const spanX = Math.max(200, maxX - minX + 180), spanY = Math.max(200, maxY - minY + 180);
        const nextZoom = Math.min(2.1, Math.max(0.18, Math.min(cv.width / spanX, cv.height / spanY)));
        const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
        setZoom(nextZoom);
        setPan({ x:cv.width / 2 - cx * nextZoom, y:cv.height / 2 - cy * nextZoom });
      });
    });
  }, [setStatus]);

  useEffect(() => {
    if (initialProject) {
      applyProjectState(initialProject, "Projeto inicial carregado");
    } else {
      dispatch({ type:"RESET", p:INIT });
      setSd(null);
      setSel(null);
      setRunning(false);
      setViewMode("3d");
    }
  }, [initialProjectKey, initialProject, applyProjectState]);

  useEffect(() => {
    if (!running) {
      cancelAnimationFrame(animRef.current);
      return undefined;
    }
    const frame = () => {
      tickRef.current += 1;
      setTick(current => current + 1);
      animRef.current = requestAnimationFrame(frame);
    };
    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
  }, [running]);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return undefined;
    const observer = new ResizeObserver(() => {
      cv.width = cv.parentElement.offsetWidth;
      cv.height = cv.parentElement.offsetHeight;
    });
    observer.observe(cv.parentElement);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const { width:W, height:H } = cv;
    ctx.clearRect(0, 0, W, H);
    drawGrid(ctx, W, H, pan, zoom);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    wires.forEach(wire => drawWire(ctx, wire, sel === wire.id, running, modColor, tickRef.current, viewMode));

    if (wStart && tool === "wire") {
      let ex = (mouse.x - pan.x) / zoom;
      let ey = (mouse.y - pan.y) / zoom;
      if (ortho) {
        if (Math.abs(ex - wStart.x) > Math.abs(ey - wStart.y)) ey = wStart.y;
        else ex = wStart.x;
      }
      if (viewMode === "3d") {
        ctx.strokeStyle = hexToRgba(wireColor, 0.22);
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(wStart.x + 1.5, wStart.y + 2);
        ctx.lineTo(ex + 1.5, ey + 2);
        ctx.stroke();
      }
      ctx.strokeStyle = wireColor;
      ctx.lineWidth = 2.2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(wStart.x, wStart.y);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    comps.forEach(component => {
      let liveData = sd?.live?.byComp?.[component.id] || null;
      if (running) {
        const t = tickRef.current;
        if (["cyl", "cylse", "cylh"].includes(component.t)) {
          const period = 120;
          const raw = (t % period) / period;
          const pct = raw < 0.5 ? raw * 2 : 2 - raw * 2;
          liveData = { ...(liveData || {}), pct };
        }
        if (["osc", "enc", "servo", "flowin", "psu"].includes(component.t)) liveData = { ...(liveData || {}), tick:t };
        if (component.t === "mtr" && sd?.live) {
          const modes = ["V", "mA", "Ω", "AC"];
          const mode = modes[(component.mmode || 0) % 4];
          let meterValue = 0.5;
          if (mode === "V") meterValue = Math.min(1, (sd.live.totalV || 0) / 24);
          else if (mode === "mA") meterValue = Math.min(1, (sd.live.totalI || 0) * 100);
          else if (mode === "Ω") meterValue = 0.3;
          else meterValue = 0.5 + Math.sin(t * 0.08) * 0.3;
          liveData = { ...(liveData || {}), pct:Math.max(0, Math.min(1, meterValue)) };
        }
        if (["manm", "prs", "propv", "preg"].includes(component.t)) liveData = { ...(liveData || {}), pct:0.6 + Math.sin(t * 0.05) * 0.1 };
        if (component.t === "watt" && sd?.live) liveData = { ...(liveData || {}), pct:Math.min(1, ((sd.live.totalV || 0) * (sd.live.totalI || 0)) / 100 || 0.5) };
      }
      drawComp(ctx, component, sel === component.id, liveData, modColor, viewMode);
    });

    ctx.restore();
  }, [comps, wires, sel, wStart, mouse, zoom, pan, tick, sd, running, modColor, tool, ortho, wireColor, viewMode]);

  const toWorld = useCallback((cx, cy) => {
    const x = (cx - pan.x) / zoom;
    const y = (cy - pan.y) / zoom;
    return snap ? { x:SN(x), y:SN(y) } : { x:Math.round(x), y:Math.round(y) };
  }, [pan, zoom, snap]);

  const hitComp = useCallback((wx, wy) => comps.find(component => Math.abs(component.x - wx) < G && Math.abs(component.y - wy) < G), [comps]);
  const hitWire = useCallback((wx, wy) => wires.find(wire => {
    const dx = wire.x2 - wire.x1;
    const dy = wire.y2 - wire.y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (!len) return false;
    const t = ((wx - wire.x1) * dx + (wy - wire.y1) * dy) / (len * len);
    const tc = Math.max(0, Math.min(1, t));
    const dist = Math.sqrt((wx - (wire.x1 + tc * dx)) ** 2 + (wy - (wire.y1 + tc * dy)) ** 2);
    return dist < 10 / zoom;
  }), [wires, zoom]);

  const onWheel = useCallback(event => {
    event.preventDefault();
    const rect = cvRef.current.getBoundingClientRect();
    const cx = event.clientX - rect.left;
    const cy = event.clientY - rect.top;
    const factor = event.deltaY < 0 ? 1.12 : 0.9;
    const nextZoom = Math.min(5, Math.max(0.1, zoom * factor));
    setPan(current => ({ x:cx - (cx - current.x) * (nextZoom / zoom), y:cy - (cy - current.y) * (nextZoom / zoom) }));
    setZoom(nextZoom);
  }, [zoom]);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return undefined;
    cv.addEventListener("wheel", onWheel, { passive:false });
    return () => cv.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  const onDown = useCallback(event => {
    const rect = cvRef.current.getBoundingClientRect();
    const cx = event.clientX - rect.left;
    const cy = event.clientY - rect.top;
    panStart.current = { mx:cx, my:cy, px:pan.x, py:pan.y };
    if (event.button === 1 || event.button === 2) {
      isPan.current = true;
      return;
    }
    if (event.button !== 0) return;

    const pos = toWorld(cx, cy);

    if (tool === "select") {
      const component = hitComp(pos.x, pos.y);
      if (component) {
        setSel(component.id);
        setDrag(component.id);
        return;
      }
      const wire = hitWire(pos.x, pos.y);
      if (wire) {
        setSel(wire.id);
      } else {
        setSel(null);
        isPan.current = true;
      }
      return;
    }

    if (tool === "wire") {
      if (!wStart) {
        setWStart(pos);
        setStatus("Clique no destino do fio · ESC encerra o traçado");
      } else {
        let ex = pos.x;
        let ey = pos.y;
        if (ortho) {
          if (Math.abs(ex - wStart.x) > Math.abs(ey - wStart.y)) ey = wStart.y;
          else ex = wStart.x;
        }
        push({ comps, wires:[...wires, { id:uid(), x1:wStart.x, y1:wStart.y, x2:ex, y2:ey, color:wireColor }] });
        setWStart({ x:ex, y:ey });
        setStatus("Fio adicionado · continue traçando ou pressione ESC");
      }
      return;
    }

    if (tool === "delete") {
      const component = hitComp(pos.x, pos.y);
      if (component) {
        push({ comps:comps.filter(item => item.id !== component.id), wires });
        setStatus("Componente removido");
        return;
      }
      const wire = hitWire(pos.x, pos.y);
      if (wire) {
        push({ comps, wires:wires.filter(item => item.id !== wire.id) });
        setStatus("Fio removido");
      }
      return;
    }

    const libraryItem = lib.find(item => item.t === tool);
    if (libraryItem) {
      const count = comps.filter(component => component.t === tool).length + 1;
      const baseName = libraryItem.sym.replace(/[^A-Za-z0-9]/g, "").slice(0, 3) || libraryItem.lbl.slice(0, 2);
      push({ comps:[...comps, { id:uid(), t:tool, x:pos.x, y:pos.y, v:libraryItem.dv, n:`${baseName}${count}`, r:0 }], wires });
      setStatus(`${baseName}${count} adicionado`);
    }
  }, [tool, pan, toWorld, hitComp, hitWire, wStart, ortho, push, comps, wires, lib, wireColor, setStatus]);

  const onMove = useCallback(event => {
    const rect = cvRef.current.getBoundingClientRect();
    const cx = event.clientX - rect.left;
    const cy = event.clientY - rect.top;
    setMouse({ x:cx, y:cy });
    if (isPan.current) {
      const dx = cx - panStart.current.mx;
      const dy = cy - panStart.current.my;
      setPan({ x:panStart.current.px + dx, y:panStart.current.py + dy });
      return;
    }
    if (drag) {
      const pos = toWorld(cx, cy);
      dispatch({ type:"PUSH", p:{ comps:comps.map(component => component.id === drag ? { ...component, x:pos.x, y:pos.y } : component), wires } });
    }
  }, [drag, comps, wires, toWorld]);

  const onUp = useCallback(() => {
    isPan.current = false;
    setDrag(null);
  }, []);

  const onDoubleClick = useCallback(event => {
    const rect = cvRef.current.getBoundingClientRect();
    const pos = toWorld(event.clientX - rect.left, event.clientY - rect.top);
    const component = hitComp(pos.x, pos.y);
    if (!component) return;
    if (["inp", "cno", "cnf", "sw"].includes(component.t)) {
      push({ comps:comps.map(item => item.id === component.id ? { ...item, v:parseInt(item.v || 0, 10) ? 0 : 1 } : item), wires });
    } else if (component.t === "mtr") {
      push({ comps:comps.map(item => item.id === component.id ? { ...item, mmode:((item.mmode || 0) + 1) % 4 } : item), wires });
    } else {
      setSel(component.id);
    }
  }, [toWorld, hitComp, comps, wires, push]);

  const rotateSelected = useCallback(delta => {
    if (!sel) return;
    push({ comps:comps.map(component => component.id === sel ? { ...component, r:(((component.r || 0) + delta) % 360 + 360) % 360 } : component), wires });
  }, [sel, comps, wires, push]);

  const duplicateSelected = useCallback(() => {
    if (!selComp) return;
    const base = selComp.n || selComp.t.toUpperCase();
    let name = `${base}_copy`;
    let idx = 2;
    while (comps.some(component => component.n === name)) name = `${base}_copy${idx++}`;
    const clone = { ...selComp, id:uid(), x:selComp.x + G, y:selComp.y + G, n:name };
    push({ comps:[...comps, clone], wires });
    setSel(clone.id);
    setStatus(`${name} duplicado`);
  }, [selComp, comps, wires, push, setStatus]);

  const calc = useCallback(() => {
    const solution = solve(modId, comps, wires);
    setSd(solution);
    setStatus(solution.ok ? "✅ Cálculo concluído" : "⚠️ Ajuste o circuito e tente novamente");
  }, [modId, comps, wires, setStatus]);

  const toggleSim = useCallback(() => {
    setRunning(current => {
      if (!current) setSd(solve(modId, comps, wires));
      return !current;
    });
  }, [modId, comps, wires]);

  const clearAll = useCallback(() => {
    if (!window.confirm("Limpar circuito atual?")) return;
    dispatch({ type:"RESET", p:INIT });
    setSd(null);
    setSel(null);
    setRunning(false);
  }, []);

  const exportPNG = useCallback(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const anchor = document.createElement("a");
    anchor.href = cv.toDataURL("image/png");
    anchor.download = `techsim_${modId}_${viewMode}_${Date.now()}.png`;
    anchor.click();
    setStatus("PNG exportado");
  }, [modId, viewMode, setStatus]);

  const saveJSON = useCallback(() => {
    const data = JSON.stringify({ version:"3.0", modId, viewMode, comps, wires }, null, 2);
    const anchor = document.createElement("a");
    anchor.href = `data:application/json;charset=utf-8,${encodeURIComponent(data)}`;
    anchor.download = `techsim_${modId}_${Date.now()}.json`;
    anchor.click();
    setStatus("JSON exportado");
  }, [modId, viewMode, comps, wires, setStatus]);

  const loadJSON = useCallback(event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = loadEvent => {
      try {
        const parsed = JSON.parse(loadEvent.target.result);
        applyProjectState(parsed, "Projeto JSON carregado");
      } catch {
        setStatus("❌ Arquivo JSON inválido");
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }, [applyProjectState, setStatus]);

  const autoLayout = useCallback(() => {
    push({ comps:comps.map((component, index) => ({ ...component, x:G * 3 + Math.floor(index % 5) * G * 3, y:G * 3 + Math.floor(index / 5) * G * 3 })), wires:[] });
    setStatus("Layout aplicado automaticamente");
  }, [comps, push, setStatus]);

  const fitView = useCallback(() => {
    const cv = cvRef.current;
    if (!cv || (!comps.length && !wires.length)) {
      setZoom(1);
      setPan({ x:0, y:0 });
      setStatus("Vista centralizada");
      return;
    }
    const xs = [...comps.flatMap(component => [component.x - 64, component.x + 64]), ...wires.flatMap(wire => [wire.x1, wire.x2])];
    const ys = [...comps.flatMap(component => [component.y - 64, component.y + 64]), ...wires.flatMap(wire => [wire.y1, wire.y2])];
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const spanX = Math.max(200, maxX - minX + 160), spanY = Math.max(200, maxY - minY + 160);
    const nextZoom = Math.min(2.2, Math.max(0.18, Math.min(cv.width / spanX, cv.height / spanY)));
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    setZoom(nextZoom);
    setPan({ x:cv.width / 2 - cx * nextZoom, y:cv.height / 2 - cy * nextZoom });
    setStatus("Área ajustada ao projeto");
  }, [comps, wires, setStatus]);

  const saveProjectSnapshot = useCallback(async () => {
    if (!onSaveProject) return;
    const suggestedName = `${moduleMeta?.label || modId} · ${userName || "Projeto"}`;
    const name = window.prompt("Nome do projeto:", suggestedName);
    if (!name) return;
    const summary = `${comps.length} componentes · ${wires.length} fios · ${viewMode.toUpperCase()}`;
    try {
      await onSaveProject({
        moduleId:modId,
        name,
        summary,
        viewMode,
        data:{ comps, wires, viewMode },
      });
      setStatus("Projeto salvo na base local/API");
    } catch (error) {
      setStatus(`❌ ${error?.message || "Falha ao salvar o projeto"}`);
    }
  }, [onSaveProject, moduleMeta?.label, modId, userName, comps, wires, viewMode, setStatus]);

  const loadPreset = useCallback(preset => {
    if (!preset) return;
    applyProjectState(preset.project, `Preset carregado: ${preset.title}`);
  }, [applyProjectState]);

  const loadSavedProject = useCallback(async projectId => {
    if (!onLoadProject) return;
    try {
      setLoadingProjectId(projectId);
      const project = await onLoadProject(projectId);
      applyProjectState(project, `Projeto carregado: ${project.name || "sem nome"}`);
    } catch (error) {
      setStatus(`❌ ${error?.message || "Não foi possível abrir o projeto"}`);
    } finally {
      setLoadingProjectId("");
    }
  }, [onLoadProject, applyProjectState, setStatus]);

  useEffect(() => {
    const handler = event => {
      if (["INPUT", "TEXTAREA"].includes(event.target.tagName)) return;
      const ctrl = event.ctrlKey || event.metaKey;
      if (ctrl && event.key === "z") {
        event.preventDefault();
        dispatch({ type:"UNDO" });
      } else if (ctrl && event.key === "y") {
        event.preventDefault();
        dispatch({ type:"REDO" });
      } else if (ctrl && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveJSON();
      } else if (ctrl && event.key.toLowerCase() === "o") {
        event.preventDefault();
        fileRef.current?.click();
      } else if (ctrl && event.key.toLowerCase() === "d" && selComp) {
        event.preventDefault();
        duplicateSelected();
      } else if (ctrl && event.key === "ArrowRight") {
        event.preventDefault();
        rotateSelected(90);
      } else if (ctrl && event.key === "ArrowLeft") {
        event.preventDefault();
        rotateSelected(-90);
      } else if (event.key === "F9") {
        event.preventDefault();
        calc();
      } else if (event.key === "F5") {
        event.preventDefault();
        toggleSim();
      } else if (event.key === "Delete" && sel) {
        push({ comps:comps.filter(component => component.id !== sel), wires:wires.filter(wire => wire.id !== sel) });
        setSel(null);
      } else if (event.key === "Escape") {
        setWStart(null);
        setSel(null);
      } else if (!ctrl && !event.altKey) {
        if (event.key === "2") setViewMode("2d");
        else if (event.key === "3") setViewMode("3d");
        else if (event.key.toLowerCase() === "s") setTool("select");
        else if (event.key.toLowerCase() === "w") setTool("wire");
        else if (event.key.toLowerCase() === "d") setTool("delete");
        else {
          const item = lib.find(entry => entry.k === event.key.toUpperCase());
          if (item) setTool(item.t);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [sel, selComp, comps, wires, push, lib, rotateSelected, calc, toggleSim, duplicateSelected, saveJSON]);

  const toolButtons = [
    { t:"select", lbl:"Selecionar", sym:TOOL_GLYPHS.select, color:"#fb7185", key:"S", tip:"Selecionar e mover" },
    { t:"wire", lbl:"Conectar", sym:TOOL_GLYPHS.wire, color:"#94a3b8", key:"W", tip:"Traçar fio" },
    { t:"delete", lbl:"Excluir", sym:TOOL_GLYPHS.delete, color:"#f87171", key:"D", tip:"Apagar componentes e fios" },
  ];

  return (
    <div style={{display:"flex", flex:1, overflow:"hidden", height:"100%", fontFamily:"'Courier New','Consolas',monospace"}}>
      <div style={{width:154, background:"#040d18", borderRight:"1px solid #1e293b", display:"flex", flexDirection:"column", padding:"10px 8px", gap:8, overflowY:"auto", flexShrink:0}}>
        <div style={{fontSize:7, color:"#1e3a5f", textAlign:"center", letterSpacing:2, padding:"2px 0"}}>TOOLS</div>
        {toolButtons.map(button => (
          <button key={button.t} onClick={() => setTool(button.t)} title={button.tip} style={{background:tool === button.t ? `${button.color}16` : "#050e1a", border:`1px solid ${tool === button.t ? button.color : "#1e293b"}`, color:tool === button.t ? button.color : "#475569", borderRadius:10, padding:"8px 5px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:5, fontFamily:"inherit", boxShadow:tool === button.t ? `0 0 16px ${hexToRgba(button.color, 0.18)}` : "inset 0 1px 0 #ffffff08", transition:"all 0.12s"}}>
            <div style={{width:42, height:28, borderRadius:8, display:"grid", placeItems:"center", background:`linear-gradient(180deg, ${hexToRgba(button.color, 0.22)}, #071020)`, border:`1px solid ${hexToRgba(button.color, 0.28)}`}}>
              <span style={{fontSize:16, fontWeight:700, color:button.color}}>{button.sym}</span>
            </div>
            <span style={{fontSize:7}}>{button.lbl}</span>
            <span style={{fontSize:6, border:`1px solid ${tool === button.t ? hexToRgba(button.color, 0.4) : "#1e293b"}`, padding:"1px 5px", borderRadius:999}}>{button.key}</span>
          </button>
        ))}

        <div style={{height:1, background:"#1e293b", margin:"2px 2px"}} />
        <div style={{fontSize:7, color:"#1e3a5f", textAlign:"center", letterSpacing:2}}>PRESETS</div>
        <div style={{display:"grid", gap:6}}>
          {modulePresets.map(preset => (
            <button key={preset.id} onClick={() => loadPreset(preset)} style={{background:"#071020", border:`1px solid ${hexToRgba(modColor, 0.22)}`, borderRadius:10, padding:"8px 8px", textAlign:"left", cursor:"pointer", fontFamily:"inherit"}}>
              <div style={{fontSize:8, color:modColor, fontWeight:700, marginBottom:4}}>{preset.title}</div>
              <div style={{fontSize:6.5, color:"#64748b", lineHeight:1.5}}>{preset.description}</div>
            </button>
          ))}
          {!modulePresets.length && <div style={{fontSize:7, color:"#475569", textAlign:"center", border:"1px dashed #1e293b", borderRadius:10, padding:8}}>Sem presets</div>}
        </div>

        <div style={{height:1, background:"#1e293b", margin:"2px 2px"}} />
        <div style={{fontSize:7, color:"#1e3a5f", textAlign:"center", letterSpacing:2}}>PROJETOS</div>
        <div style={{display:"grid", gap:6}}>
          {savedProjects.slice(0, 6).map(project => (
            <button key={project.id} onClick={() => loadSavedProject(project.id)} disabled={loadingProjectId === project.id} style={{background:"#050e1a", border:"1px solid #1e293b", borderRadius:10, padding:"8px 8px", textAlign:"left", cursor:"pointer", fontFamily:"inherit", opacity:loadingProjectId === project.id ? 0.7 : 1}}>
              <div style={{fontSize:7.8, color:modColor, fontWeight:700, marginBottom:3}}>{project.name}</div>
              <div style={{fontSize:6.2, color:"#475569", lineHeight:1.45}}>{project.summary}</div>
              <div style={{fontSize:5.8, color:"#334155", marginTop:4}}>{prettyDate(project.updatedAt)}</div>
            </button>
          ))}
          {!savedProjects.length && <div style={{fontSize:7, color:"#475569", textAlign:"center", border:"1px dashed #1e293b", borderRadius:10, padding:8}}>Nenhum projeto salvo</div>}
        </div>

        <div style={{height:1, background:"#1e293b", margin:"2px 2px"}} />
        <div style={{fontSize:7, color:"#1e3a5f", textAlign:"center", letterSpacing:2}}>COMP. {filteredLib.length !== lib.length ? `${filteredLib.length}/${lib.length}` : lib.length}</div>
        <input value={paletteFilter} onChange={event => setPaletteFilter(event.target.value)} placeholder="buscar" style={{background:"#071020", border:"1px solid #1e293b", color:"#cbd5e1", padding:"6px 8px", borderRadius:8, fontSize:10, fontFamily:"inherit", outline:"none"}} />
        {filteredLib.map(item => (
          <button key={item.t} onClick={() => setTool(item.t)} title={`${item.lbl} [${item.k}]`} style={{background:tool === item.t ? `${item.col}18` : "#050e1a", border:`1px solid ${tool === item.t ? item.col : "#1e293b"}`, color:tool === item.t ? item.col : "#334155", borderRadius:10, padding:"8px 6px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:4, fontFamily:"inherit", boxShadow:tool === item.t ? `0 0 16px ${hexToRgba(item.col, 0.16)}` : "inset 0 1px 0 #ffffff08"}}>
            <div style={{width:46, minHeight:28, borderRadius:9, display:"grid", placeItems:"center", background:`radial-gradient(circle at 30% 20%, ${hexToRgba(shiftHex(item.col, 0.2), 0.34)} 0%, ${hexToRgba(item.col, 0.12)} 35%, #071020 100%)`, border:`1px solid ${hexToRgba(item.col, 0.30)}`, boxShadow:`inset 0 1px 0 ${hexToRgba("#ffffff", 0.09)}, 0 8px 18px ${hexToRgba(item.col, 0.10)}`}}>
              <span style={{fontSize:12, fontWeight:700, letterSpacing:0.4, color:tool === item.t ? item.col : shiftHex(item.col, 0.08), textShadow:`0 0 18px ${hexToRgba(item.col, 0.24)}`}}>{item.sym}</span>
            </div>
            <span style={{fontSize:6.3, textAlign:"center", lineHeight:1.15, color:tool === item.t ? item.col : "#94a3b8"}}>{item.lbl}</span>
            <span style={{fontSize:5.8, color:tool === item.t ? item.col : "#475569", border:`1px solid ${tool === item.t ? hexToRgba(item.col, 0.4) : "#1e293b"}`, padding:"1px 5px", borderRadius:999}}>{item.k}</span>
          </button>
        ))}
        {!filteredLib.length && <div style={{fontSize:8, color:"#475569", textAlign:"center", padding:"10px 6px", border:"1px dashed #1e293b", borderRadius:8}}>Sem resultados</div>}
      </div>

      <div style={{flex:1, position:"relative", overflow:"hidden", background:viewMode === "3d" ? "radial-gradient(circle at top, #082033 0%, #020b14 55%)" : "#020b14"}}>
        <canvas ref={cvRef} style={{display:"block", width:"100%", height:"100%", cursor:isPan.current ? "grabbing" : drag ? "grabbing" : tool === "wire" ? "crosshair" : tool === "delete" ? "not-allowed" : tool === "select" ? "grab" : "copy"}} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onDoubleClick={onDoubleClick} onContextMenu={event => { event.preventDefault(); isPan.current = false; }} />

        <Toolbar
          tool={tool}
          setTool={setTool}
          sel={sel}
          selComp={selComp}
          selWire={selWire}
          modColor={modColor}
          running={running}
          snap={snap}
          ortho={ortho}
          zoom={zoom}
          hist={hist}
          comps={comps}
          wires={wires}
          push={push}
          dispatch={dispatch}
          setSel={setSel}
          setSnap={setSnap}
          setOrtho={setOrtho}
          setZoom={setZoom}
          setPan={setPan}
          doRot={rotateSelected}
          calc={calc}
          toggleSim={toggleSim}
          saveJSON={saveJSON}
          fileRef={fileRef}
          clearAll={clearAll}
          autoLayout={autoLayout}
          modId={modId}
          wireColor={wireColor}
          setWireColor={setWireColor}
          viewMode={viewMode}
          setViewMode={setViewMode}
          exportPNG={exportPNG}
          duplicateSelected={duplicateSelected}
          fitView={fitView}
          saveProjectSnapshot={saveProjectSnapshot}
        />

        <input ref={fileRef} type="file" accept=".json" onChange={loadJSON} style={{display:"none"}} />

        <div style={{position:"absolute", bottom:0, left:0, right:0, background:"#040d18cc", borderTop:"1px solid #1e293b", padding:"4px 12px", display:"flex", gap:10, fontSize:8, color:"#334155", alignItems:"center"}}>
          <span style={{color:status.startsWith("✅") ? "#22c55e" : status.startsWith("⚠️") || status.startsWith("❌") ? "#f87171" : "#3a5a70", minWidth:240}}>{status}</span>
          <span>C:{comps.length}</span>
          <span>F:{wires.length}</span>
          <span style={{color:viewMode === "3d" ? modColor : "#38bdf8"}}>VIEW:{viewMode.toUpperCase()}</span>
          {running && <span style={{color:"#22c55e"}}>● SIMULANDO</span>}
          <span style={{marginLeft:"auto", opacity:0.5}}>S mover · W fio · D apagar · 2/3 view · Ctrl+D duplicar · F9 calcular · F5 simular</span>
        </div>
      </div>

      <div style={{width:280, background:"#040d18", borderLeft:"1px solid #1e293b", display:"flex", flexDirection:"column", flexShrink:0}}>
        <div style={{padding:"12px 14px", borderBottom:"1px solid #1e293b", display:"flex", alignItems:"center", gap:10}}>
          <div style={{width:42, height:42, borderRadius:12, display:"grid", placeItems:"center", background:`linear-gradient(180deg, ${hexToRgba(modColor, 0.28)}, #071020)`, border:`1px solid ${hexToRgba(modColor, 0.32)}`, color:modColor, fontSize:20}}>{moduleMeta?.icon}</div>
          <div>
            <div style={{fontSize:11, fontWeight:700, color:modColor, letterSpacing:0.5}}>{moduleMeta?.label}</div>
            <div style={{fontSize:8, color:"#475569", lineHeight:1.5}}>{moduleMeta?.desc}</div>
          </div>
        </div>
        <PropertiesPanel comp={selComp} lib={lib} modColor={modColor} comps={comps} wires={wires} push={push} setSel={setSel} sd={sd} onCalc={calc} onToggleSim={toggleSim} running={running} hist={hist} />
      </div>
    </div>
  );
}
