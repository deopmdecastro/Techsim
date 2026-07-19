import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { G, INIT, SN, TOOL_GLYPHS, hexToRgba, shiftHex, uid } from '../constants';
import { MODS_ALL } from '../data/modules';
import { hRed } from '../core/history';
import { solve } from '../core/solvers';
import { boundsInsideRect, componentBounds, distanceToWire, wireBounds } from '../core/topology';
import { drawComp, drawGrid, drawWire } from '../canvas/shapes';
import { PropertiesPanel } from './PropertiesPanel';
import { Toolbar } from './Toolbar';
import { AppIcon } from './ui/AppIcon';
import SymbolIcon from './SymbolIcon';
import { publishEditorPresence, publishEditorSelection, publishEditorSnapshot, publishSimulationState, subscribeToProject } from '../services/realtime';

const deepClone = value => JSON.parse(JSON.stringify(value));
const createLayer = (id, name) => ({ id, name, locked: false, visible: true });
const createPage = (id, index = 1) => ({ id, name: `Página ${index}`, layers: [createLayer(`layer-${index}`, 'Base')], currentLayerId: `layer-${index}`, groups: [], comps: [], wires: [] });

function normalizePages(rawData = {}, fallbackViewMode = '3d') {
  const base = rawData?.data || rawData || {};
  const sourcePages = Array.isArray(base.pages) && base.pages.length ? base.pages : [createPage('page-1', 1)];
  const pages = sourcePages.map((page, index) => {
    const defaultLayerId = page.currentLayerId || page.layers?.[0]?.id || `layer-${index + 1}`;
    return {
      id: page.id || `page-${index + 1}`,
      name: page.name || `Página ${index + 1}`,
      layers: Array.isArray(page.layers) && page.layers.length ? page.layers.map(layer => ({ ...layer, visible: layer.visible !== false, locked: Boolean(layer.locked) })) : [createLayer(defaultLayerId, 'Base')],
      currentLayerId: defaultLayerId,
      groups: Array.isArray(page.groups) ? deepClone(page.groups) : [],
      comps: deepClone(page.comps || base.comps || []),
      wires: deepClone(page.wires || base.wires || []),
    };
  });
  const activePageId = base.activePageId || pages[0]?.id || 'page-1';
  const activePage = pages.find(page => page.id === activePageId) || pages[0];
  return {
    pages,
    activePageId: activePage.id,
    comps: deepClone(activePage.comps || []),
    wires: deepClone(activePage.wires || []),
    viewMode: base.viewMode || rawData?.viewMode || fallbackViewMode,
  };
}

function prettyDate(value) {
  try { return new Date(value).toLocaleString('pt-BR'); } catch { return value || ''; }
}

function relativeTime(timestamp, now) {
  if (!timestamp) return null;
  const diffSec = Math.max(0, Math.round((now - timestamp) / 1000));
  if (diffSec < 5) return 'agora mesmo';
  if (diffSec < 60) return `há ${diffSec}s`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `há ${diffHr}h`;
  return `há ${Math.round(diffHr / 24)}d`;
}

export function Engine({ modId, modColor, lib, userName, modulePresets = [], savedProjects = [], onSaveProject, onLoadProject, initialProject, initialProjectKey = 'default' }) {
  const cvRef = useRef();
  const fileRef = useRef();
  const animRef = useRef();
  const tickRef = useRef(0);
  const isPan = useRef(false);
  const panStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });
  const sessionId = useRef(`sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
  const suppressRealtime = useRef(false);
  const dragSelection = useRef(null);
  const selectionChangedByDrag = useRef(false);
  const paletteSearchRef = useRef(null);

  const [hist, dispatch] = useReducer(hRed, { past: [], present: INIT, future: [] });
  const { comps, wires } = hist.present;
  const push = useCallback(snapshot => dispatch({ type: 'PUSH', p: snapshot }), []);

  const [tool, setTool] = useState('select');
  const [selection, setSelection] = useState([]);
  const [primarySelectionId, setPrimarySelectionId] = useState(null);
  const [wStart, setWStart] = useState(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [running, setRunning] = useState(false);
  const [snap, setSnap] = useState(true);
  const [ortho, setOrtho] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [viewMode, setViewMode] = useState('3d');
  const [paletteFilter, setPaletteFilter] = useState('');
  const [sd, setSd] = useState(null);
  const [tick, setTick] = useState(0);
  const [status, setStatusState] = useState('Selecione uma ferramenta e clique no canvas');
  const [wireColor, setWireColor] = useState('#38bdf8');
  const [loadingProjectId, setLoadingProjectId] = useState('');
  const [pages, setPages] = useState([createPage('page-1', 1)]);
  const [activePageId, setActivePageId] = useState('page-1');
  const [activeProjectId, setActiveProjectId] = useState(initialProject?.id || '');
  const [marquee, setMarquee] = useState(null);
  const [collaborators, setCollaborators] = useState({});
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [dirtySinceSave, setDirtySinceSave] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 15000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => { setDirtySinceSave(true); }, [comps, wires]);

  const moduleMeta = MODS_ALL.find(item => item.id === modId);
  const activePage = useMemo(() => pages.find(page => page.id === activePageId) || pages[0], [pages, activePageId]);
  const layerMap = useMemo(() => new Map((activePage?.layers || []).map(layer => [layer.id, layer])), [activePage]);
  const visibleLayerIds = useMemo(() => new Set((activePage?.layers || []).filter(layer => layer.visible !== false).map(layer => layer.id)), [activePage]);
  const primaryId = selection.includes(primarySelectionId) ? primarySelectionId : selection[0] || null;
  const selComp = comps.find(component => component.id === primaryId) || null;
  const selWire = wires.find(wire => wire.id === primaryId) || null;
  const filteredLib = useMemo(() => {
    const query = paletteFilter.trim().toLowerCase();
    if (!query) return lib;
    return lib.filter(item => `${item.lbl} ${item.sym} ${item.tip} ${item.k}`.toLowerCase().includes(query));
  }, [lib, paletteFilter]);
  const visibleComps = useMemo(() => comps.filter(component => visibleLayerIds.has(component.layerId || activePage?.layers?.[0]?.id || 'layer-1')), [comps, visibleLayerIds, activePage]);
  const visibleWires = useMemo(() => wires.filter(wire => visibleLayerIds.has(wire.layerId || activePage?.layers?.[0]?.id || 'layer-1')), [wires, visibleLayerIds, activePage]);
  const collaboratorList = useMemo(() => Object.values(collaborators).filter(item => item.action !== 'leave'), [collaborators]);

  const setStatus = useCallback(message => {
    setStatusState(message);
    window.clearTimeout(setStatus.timeoutId);
    setStatus.timeoutId = window.setTimeout(() => setStatusState('Pronto'), 2400);
  }, []);

  const worldFromCanvas = useCallback((cx, cy, useSnap = snap) => {
    const x = (cx - pan.x) / zoom;
    const y = (cy - pan.y) / zoom;
    return useSnap ? { x: SN(x), y: SN(y) } : { x, y };
  }, [pan, zoom, snap]);

  const currentLayerId = activePage?.currentLayerId || activePage?.layers?.[0]?.id || 'layer-1';
  const buildProjectData = useCallback(() => ({
    activePageId,
    viewMode,
    pages: pages.map(page => page.id === activePageId ? { ...page, currentLayerId, comps: deepClone(comps), wires: deepClone(wires) } : page),
  }), [activePageId, currentLayerId, viewMode, pages, comps, wires]);
  const setSelectionState = useCallback((ids, primary = null) => {
    const next = [...new Set(ids)].filter(Boolean);
    setSelection(next);
    setPrimarySelectionId(primary || next[0] || null);
  }, []);

  const updateActivePageMeta = useCallback(updater => {
    setPages(current => current.map(page => page.id === activePageId ? (typeof updater === 'function' ? updater(page) : { ...page, ...updater }) : page));
  }, [activePageId]);

  const applyProjectState = useCallback((payload, label = 'Projeto carregado') => {
    const formatted = normalizePages(payload, '3d');
    dispatch({ type: 'RESET', p: { comps: formatted.comps, wires: formatted.wires } });
    setPages(formatted.pages);
    setActivePageId(formatted.activePageId);
    setViewMode(formatted.viewMode || '3d');
    setActiveProjectId(payload?.id || '');
    setSelection([]);
    setPrimarySelectionId(null);
    setWStart(null);
    setRunning(false);
    setSd(null);
    setStatus(label);
  }, [setStatus]);

  useEffect(() => {
    if (initialProject) applyProjectState(initialProject, 'Projeto inicial carregado');
    else {
      dispatch({ type: 'RESET', p: INIT });
      setPages([createPage('page-1', 1)]);
      setActivePageId('page-1');
      setSelection([]);
      setPrimarySelectionId(null);
      setActiveProjectId('');
      setViewMode('3d');
      setSd(null);
    }
  }, [initialProject, initialProjectKey, applyProjectState]);

  useEffect(() => {
    updateActivePageMeta(page => ({ ...page, comps: deepClone(comps), wires: deepClone(wires), groups: (page.groups || []).map(group => ({ ...group, memberIds: group.memberIds.filter(id => comps.some(item => item.id === id) || wires.some(item => item.id === id)) })).filter(group => group.memberIds.length) }));
  }, [comps, wires, updateActivePageMeta]);

  useEffect(() => {
    if (!running) { cancelAnimationFrame(animRef.current); return undefined; }
    const frame = () => { tickRef.current += 1; setTick(current => current + 1); animRef.current = requestAnimationFrame(frame); };
    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
  }, [running]);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return undefined;
    const observer = new ResizeObserver(() => { cv.width = cv.parentElement.offsetWidth; cv.height = cv.parentElement.offsetHeight; setCanvasSize({ w: cv.width, h: cv.height }); });
    observer.observe(cv.parentElement);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!activeProjectId) return undefined;
    const unsub = subscribeToProject(activeProjectId, {
      onSnapshot: payload => {
        if (payload?.senderId === sessionId.current || !payload?.snapshot) return;
        suppressRealtime.current = true;
        applyProjectState({ ...payload.snapshot, id: activeProjectId }, `Atualizado por ${payload.userName || 'colaborador'}`);
      },
      onPresence: payload => {
        if (!payload?.socketId || payload.socketId === sessionId.current) return;
        setCollaborators(current => ({ ...current, [payload.socketId]: payload }));
      },
      onSelection: payload => {
        if (!payload?.socketId || payload.socketId === sessionId.current) return;
        setCollaborators(current => ({ ...current, [payload.socketId]: { ...(current[payload.socketId] || {}), ...payload } }));
      },
      onSimulation: payload => {
        if (payload?.senderId === sessionId.current || !payload?.solution) return;
        setSd(payload.solution);
      },
    }, userName || 'Operador');
    publishEditorPresence({ projectId: activeProjectId, userName, senderId: sessionId.current, action: 'join', pageId: activePageId });
    return () => unsub();
  }, [activeProjectId, activePageId, applyProjectState, userName]);

  useEffect(() => {
    if (!activeProjectId) return undefined;
    if (suppressRealtime.current) { suppressRealtime.current = false; return undefined; }
    const timer = window.setTimeout(() => publishEditorSnapshot({ projectId: activeProjectId, senderId: sessionId.current, userName, snapshot: buildProjectData() }), 220);
    return () => window.clearTimeout(timer);
  }, [activeProjectId, userName, buildProjectData]);

  useEffect(() => {
    if (!activeProjectId) return;
    publishEditorSelection({ projectId: activeProjectId, senderId: sessionId.current, userName, selectedIds: selection, pageId: activePageId });
  }, [activeProjectId, activePageId, selection, userName]);

  useEffect(() => {
    if (!activeProjectId || !sd) return;
    publishSimulationState({ projectId: activeProjectId, senderId: sessionId.current, userName, solution: sd });
  }, [activeProjectId, sd, userName]);

  const energizedWireIds = sd?.live?.energizedWireIds || [];
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const { width: W, height: H } = cv;
    ctx.clearRect(0, 0, W, H);
    if (showGrid) drawGrid(ctx, W, H, pan, zoom);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    visibleWires.forEach(wire => drawWire(ctx, wire, selection.includes(wire.id), running || energizedWireIds.includes(wire.id), modColor, tickRef.current, viewMode));
    if (wStart && tool === 'wire') {
      let ex = (mouse.x - pan.x) / zoom; let ey = (mouse.y - pan.y) / zoom;
      if (ortho) { if (Math.abs(ex - wStart.x) > Math.abs(ey - wStart.y)) ey = wStart.y; else ex = wStart.x; }
      ctx.strokeStyle = wireColor; ctx.lineWidth = 2.2; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(wStart.x, wStart.y); ctx.lineTo(ex, ey); ctx.stroke(); ctx.setLineDash([]);
    }
    visibleComps.forEach(component => drawComp(ctx, component, selection.includes(component.id), sd?.live?.byComp?.[component.id] || (running ? { tick: tickRef.current } : null), modColor, viewMode));
    collaboratorList.forEach(item => {
      if (item.pageId !== activePageId || !item.selectedIds?.length) return;
      item.selectedIds.forEach(id => {
        const component = comps.find(entry => entry.id === id);
        if (!component) return;
        ctx.strokeStyle = hexToRgba('#22d3ee', 0.5); ctx.lineWidth = 1.4; ctx.setLineDash([3, 3]); ctx.strokeRect(component.x - 42, component.y - 34, 84, 72); ctx.setLineDash([]);
      });
    });
    ctx.restore();
  }, [visibleComps, visibleWires, selection, running, modColor, tick, sd, pan, zoom, wStart, mouse, ortho, wireColor, viewMode, collaboratorList, activePageId, comps, showGrid]);

  const hitComp = useCallback((wx, wy) => visibleComps.find(component => Math.abs(component.x - wx) < G && Math.abs(component.y - wy) < G && layerMap.get(component.layerId || currentLayerId)?.locked !== true), [visibleComps, layerMap, currentLayerId]);
  const hitWire = useCallback((wx, wy) => visibleWires.find(wire => distanceToWire({ x: wx, y: wy }, wire) < 10 / zoom && layerMap.get(wire.layerId || currentLayerId)?.locked !== true), [visibleWires, zoom, layerMap, currentLayerId]);

  const placeComponent = useCallback((type, pos) => {
    const item = lib.find(entry => entry.t === type); if (!item) return;
    const count = comps.filter(component => component.t === type).length + 1;
    const baseName = item.sym.replace(/[^A-Za-z0-9]/g, '').slice(0, 3) || item.lbl.slice(0, 2);
    push({ comps: [...comps, { id: uid(), t: type, x: pos.x, y: pos.y, v: item.dv, n: `${baseName}${count}`, r: 0, layerId: currentLayerId }], wires });
    setStatus(`${baseName}${count} adicionado`);
  }, [lib, comps, wires, currentLayerId, push, setStatus]);

  const calc = useCallback(() => { const solution = solve(modId, comps, wires); setSd(solution); setStatus(solution.ok ? '✅ Cálculo concluído' : '⚠️ Ajuste o circuito e tente novamente'); }, [modId, comps, wires, setStatus]);
  const toggleSim = useCallback(() => setRunning(current => { if (!current) setSd(solve(modId, comps, wires)); return !current; }), [modId, comps, wires]);
  const rotateSelected = useCallback(delta => { if (!selection.length) return; push({ comps: comps.map(component => selection.includes(component.id) ? { ...component, r: (((component.r || 0) + delta) % 360 + 360) % 360 } : component), wires }); }, [selection, comps, wires, push]);
  const duplicateSelected = useCallback(() => {
    const clones = comps.filter(component => selection.includes(component.id)).map((component, index) => ({ ...component, id: uid(), x: component.x + G, y: component.y + G, n: `${component.n || component.t}_copy${index ? index + 1 : ''}` }));
    if (!clones.length) return;
    push({ comps: [...comps, ...clones], wires });
    setSelectionState(clones.map(item => item.id), clones[0].id);
  }, [selection, comps, wires, push, setSelectionState]);
  const deleteSelection = useCallback(() => { if (!selection.length) return; push({ comps: comps.filter(component => !selection.includes(component.id)), wires: wires.filter(wire => !selection.includes(wire.id)) }); setSelectionState([]); }, [selection, comps, wires, push, setSelectionState]);
  const groupSelection = useCallback(() => {
    if (selection.length < 2) return;
    const group = { id: `group-${Date.now()}`, name: `Grupo ${((activePage?.groups || []).length) + 1}`, memberIds: selection };
    updateActivePageMeta(page => ({ ...page, groups: [...(page.groups || []).filter(item => !item.memberIds.some(id => selection.includes(id))), group] }));
    setStatus(`${group.name} criado`);
  }, [selection, activePage, updateActivePageMeta, setStatus]);
  const ungroupSelection = useCallback(() => { updateActivePageMeta(page => ({ ...page, groups: (page.groups || []).filter(group => !group.memberIds.some(id => selection.includes(id))) })); setStatus('Agrupamento removido'); }, [selection, updateActivePageMeta, setStatus]);
  const addLayer = useCallback(() => { const name = window.prompt('Nome da camada:', `Camada ${(activePage?.layers?.length || 0) + 1}`); if (!name) return; const layer = createLayer(`layer-${Date.now()}`, name); updateActivePageMeta(page => ({ ...page, layers: [...page.layers, layer], currentLayerId: layer.id })); setStatus('Camada criada'); }, [activePage, updateActivePageMeta, setStatus]);
  const toggleLayer = useCallback((layerId, key) => updateActivePageMeta(page => ({ ...page, layers: page.layers.map(layer => layer.id === layerId ? { ...layer, [key]: !layer[key] } : layer) })), [updateActivePageMeta]);
  const moveSelectionToLayer = useCallback(layerId => { push({ comps: comps.map(component => selection.includes(component.id) ? { ...component, layerId } : component), wires: wires.map(wire => selection.includes(wire.id) ? { ...wire, layerId } : wire) }); updateActivePageMeta(page => ({ ...page, currentLayerId: layerId })); setStatus('Seleção movida para outra camada'); }, [selection, comps, wires, push, updateActivePageMeta, setStatus]);
  const fitView = useCallback(() => {
    const cv = cvRef.current; if (!cv || (!visibleComps.length && !visibleWires.length)) { setZoom(1); setPan({ x: 0, y: 0 }); return; }
    const xs = [...visibleComps.flatMap(component => [component.x - 64, component.x + 64]), ...visibleWires.flatMap(wire => [wire.x1, wire.x2])];
    const ys = [...visibleComps.flatMap(component => [component.y - 64, component.y + 64]), ...visibleWires.flatMap(wire => [wire.y1, wire.y2])];
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const spanX = Math.max(200, maxX - minX + 160), spanY = Math.max(200, maxY - minY + 160), nextZoom = Math.min(2.2, Math.max(0.18, Math.min(cv.width / spanX, cv.height / spanY)));
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2; setZoom(nextZoom); setPan({ x: cv.width / 2 - cx * nextZoom, y: cv.height / 2 - cy * nextZoom });
  }, [visibleComps, visibleWires]);
  const saveJSON = useCallback(() => { const data = JSON.stringify({ version: '4.1', modId, ...buildProjectData() }, null, 2); const anchor = document.createElement('a'); anchor.href = `data:application/json;charset=utf-8,${encodeURIComponent(data)}`; anchor.download = `techsim_${modId}_${Date.now()}.json`; anchor.click(); setStatus('JSON exportado'); }, [buildProjectData, modId, setStatus]);
  const exportPNG = useCallback(() => { const anchor = document.createElement('a'); anchor.href = cvRef.current?.toDataURL('image/png'); anchor.download = `techsim_${modId}_${viewMode}_${Date.now()}.png`; anchor.click(); }, [modId, viewMode]);
  const exportSVG = useCallback(() => { const cv = cvRef.current; if (!cv) return; const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cv.width}" height="${cv.height}" viewBox="0 0 ${cv.width} ${cv.height}"><image href="${cv.toDataURL('image/png')}" width="${cv.width}" height="${cv.height}"/></svg>`; const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `techsim_${modId}_${Date.now()}.svg`; anchor.click(); URL.revokeObjectURL(url); }, [modId]);
  const clearAll = useCallback(() => { if (!window.confirm('Limpar circuito atual?')) return; dispatch({ type: 'RESET', p: INIT }); setSelectionState([]); setSd(null); setRunning(false); }, [setSelectionState]);
  const loadJSON = useCallback(event => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = e => { try { applyProjectState(JSON.parse(e.target.result), 'Projeto JSON carregado'); } catch { setStatus('❌ Arquivo JSON inválido'); } }; reader.readAsText(file); event.target.value = ''; }, [applyProjectState, setStatus]);
  const saveProjectSnapshot = useCallback(async () => { if (!onSaveProject) return; const name = window.prompt('Nome do projeto:', `${moduleMeta?.label || modId} · ${userName || 'Projeto'}`); if (!name) return; const summary = `${comps.length} componentes · ${wires.length} fios · ${selection.length} selecionados`; const saved = await onSaveProject({ id: activeProjectId || undefined, moduleId: modId, name, summary, viewMode, data: buildProjectData() }); if (saved?.id) setActiveProjectId(saved.id); setLastSavedAt(Date.now()); setDirtySinceSave(false); setStatus('✅ Projeto salvo'); }, [onSaveProject, moduleMeta, modId, userName, comps.length, wires.length, selection.length, activeProjectId, viewMode, buildProjectData, setStatus]);
  const loadSavedProject = useCallback(async projectId => { if (!onLoadProject) return; setLoadingProjectId(projectId); try { applyProjectState(await onLoadProject(projectId), 'Projeto carregado'); } finally { setLoadingProjectId(''); } }, [onLoadProject, applyProjectState]);
  const switchPage = useCallback(pageId => { const target = pages.find(page => page.id === pageId); if (!target) return; setActivePageId(pageId); dispatch({ type: 'RESET', p: { comps: deepClone(target.comps || []), wires: deepClone(target.wires || []) } }); setSelectionState([]); setSd(null); }, [pages, setSelectionState]);
  const addPage = useCallback(() => { const page = createPage(`page-${Date.now()}`, pages.length + 1); setPages(current => [...current.map(item => item.id === activePageId ? { ...item, comps: deepClone(comps), wires: deepClone(wires) } : item), page]); setActivePageId(page.id); dispatch({ type: 'RESET', p: INIT }); setSelectionState([]); }, [pages.length, activePageId, comps, wires, setSelectionState]);

  const onWheel = useCallback(event => { event.preventDefault(); const rect = cvRef.current.getBoundingClientRect(); const cx = event.clientX - rect.left, cy = event.clientY - rect.top, factor = event.deltaY < 0 ? 1.12 : 0.9, nextZoom = Math.min(5, Math.max(0.1, zoom * factor)); setPan(current => ({ x: cx - (cx - current.x) * (nextZoom / zoom), y: cy - (cy - current.y) * (nextZoom / zoom) })); setZoom(nextZoom); }, [zoom]);
  useEffect(() => { const cv = cvRef.current; if (!cv) return undefined; cv.addEventListener('wheel', onWheel, { passive: false }); return () => cv.removeEventListener('wheel', onWheel); }, [onWheel]);
  const onDown = useCallback(event => {
    const rect = cvRef.current.getBoundingClientRect(); const cx = event.clientX - rect.left, cy = event.clientY - rect.top; panStart.current = { mx: cx, my: cy, px: pan.x, py: pan.y }; if (event.button === 1 || event.button === 2) { isPan.current = true; return; }
    const raw = worldFromCanvas(cx, cy, false); const pos = worldFromCanvas(cx, cy, true);
    if (tool === 'select') {
      const component = hitComp(raw.x, raw.y); const wire = component ? null : hitWire(raw.x, raw.y); const hitId = component?.id || wire?.id;
      if (hitId) {
        const nextSelection = event.shiftKey ? (selection.includes(hitId) ? selection.filter(id => id !== hitId) : [...selection, hitId]) : (selection.includes(hitId) ? selection : [hitId]);
        setSelectionState(nextSelection, hitId); const idsForDrag = nextSelection.length ? nextSelection : [hitId]; dragSelection.current = { from: { comps: deepClone(comps), wires: deepClone(wires) }, world: pos, ids: idsForDrag }; selectionChangedByDrag.current = false; return;
      }
      if (event.shiftKey) { setMarquee({ x1: raw.x, y1: raw.y, x2: raw.x, y2: raw.y, keep: true }); return; }
      isPan.current = true; setSelectionState([]); return;
    }
    if (tool === 'wire') {
      if (!wStart) { setWStart(pos); setStatus('Clique no destino do fio'); } else { let ex = pos.x, ey = pos.y; if (ortho) { if (Math.abs(ex - wStart.x) > Math.abs(ey - wStart.y)) ey = wStart.y; else ex = wStart.x; } push({ comps, wires: [...wires, { id: uid(), x1: wStart.x, y1: wStart.y, x2: ex, y2: ey, color: wireColor, layerId: currentLayerId }] }); setWStart({ x: ex, y: ey }); }
      return;
    }
    if (tool === 'delete') { const component = hitComp(raw.x, raw.y); const wire = component ? null : hitWire(raw.x, raw.y); if (component || wire) { const ids = selection.length && selection.includes((component || wire).id) ? selection : [(component || wire).id]; push({ comps: comps.filter(item => !ids.includes(item.id)), wires: wires.filter(item => !ids.includes(item.id)) }); setSelectionState([]); } return; }
    placeComponent(tool, pos);
  }, [pan, worldFromCanvas, tool, hitComp, hitWire, selection, setSelectionState, comps, wires, ortho, wStart, wireColor, currentLayerId, push, setStatus, placeComponent]);
  const onMove = useCallback(event => { const rect = cvRef.current.getBoundingClientRect(); const cx = event.clientX - rect.left, cy = event.clientY - rect.top; setMouse({ x: cx, y: cy }); if (isPan.current) { setPan({ x: panStart.current.px + cx - panStart.current.mx, y: panStart.current.py + cy - panStart.current.my }); return; } if (marquee) { const raw = worldFromCanvas(cx, cy, false); setMarquee(current => current ? { ...current, x2: raw.x, y2: raw.y } : null); return; } if (dragSelection.current) { const pos = worldFromCanvas(cx, cy, true); const dx = pos.x - dragSelection.current.world.x, dy = pos.y - dragSelection.current.world.y; if (!dx && !dy) return; selectionChangedByDrag.current = true; dispatch({ type: 'SET', p: { comps: dragSelection.current.from.comps.map(item => dragSelection.current.ids.includes(item.id) ? { ...item, x: item.x + dx, y: item.y + dy } : item), wires: dragSelection.current.from.wires.map(item => dragSelection.current.ids.includes(item.id) ? { ...item, x1: item.x1 + dx, y1: item.y1 + dy, x2: item.x2 + dx, y2: item.y2 + dy } : item) } }); } }, [marquee, worldFromCanvas]);
  const onUp = useCallback(() => { isPan.current = false; if (marquee) { const rect = { left: Math.min(marquee.x1, marquee.x2), right: Math.max(marquee.x1, marquee.x2), top: Math.min(marquee.y1, marquee.y2), bottom: Math.max(marquee.y1, marquee.y2) }; const ids = [...visibleComps.filter(component => boundsInsideRect(componentBounds(component), rect)).map(component => component.id), ...visibleWires.filter(wire => boundsInsideRect(wireBounds(wire), rect)).map(wire => wire.id)]; setSelectionState(marquee.keep ? [...selection, ...ids] : ids, ids[0]); setMarquee(null); } if (dragSelection.current) { if (selectionChangedByDrag.current) dispatch({ type: 'COMMIT', from: dragSelection.current.from }); dragSelection.current = null; } }, [marquee, visibleComps, visibleWires, setSelectionState, selection]);

  useEffect(() => {
    const handler = event => {
      const inField = ['INPUT', 'TEXTAREA'].includes(event.target.tagName);
      const ctrl = event.ctrlKey || event.metaKey;
      if (ctrl && event.key.toLowerCase() === 's') { event.preventDefault(); saveProjectSnapshot(); return; }
      if (!inField && event.key === '/') { event.preventDefault(); paletteSearchRef.current?.focus(); return; }
      if (!inField && event.key === '?') { event.preventDefault(); setShowShortcuts(value => !value); return; }
      if (inField) return;
      if (ctrl && event.key === 'z') { event.preventDefault(); dispatch({ type: 'UNDO' }); }
      else if (ctrl && event.key === 'y') { event.preventDefault(); dispatch({ type: 'REDO' }); }
      else if (ctrl && event.key.toLowerCase() === 'd') { event.preventDefault(); duplicateSelected(); }
      else if (ctrl && event.key.toLowerCase() === 'g') { event.preventDefault(); groupSelection(); }
      else if (ctrl && event.shiftKey && event.key.toLowerCase() === 'g') { event.preventDefault(); ungroupSelection(); }
      else if (event.key === 'Delete') { deleteSelection(); }
      else if (event.key === 'F9') { event.preventDefault(); calc(); }
      else if (event.key === 'F5') { event.preventDefault(); toggleSim(); }
      else if (event.key === 'Escape') { setWStart(null); setSelectionState([]); setMarquee(null); setShowShortcuts(false); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [duplicateSelected, groupSelection, ungroupSelection, deleteSelection, calc, toggleSim, setSelectionState, saveProjectSnapshot]);
  return (
    <div className="techsim-editor flex h-full overflow-hidden rounded-[28px] border border-white/8 bg-[#060913] shadow-[0_30px_90px_rgba(2,8,23,0.45)]">
      <aside className="editor-scroll flex w-[286px] min-h-0 shrink-0 flex-col gap-4 overflow-y-auto overflow-x-hidden border-r border-white/6 bg-[#090d18] px-4 py-4">
        <div className="workspace-card rounded-[24px] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-white shadow-[0_0_24px_rgba(139,92,246,0.18)]" style={{ background: `linear-gradient(135deg, ${hexToRgba(modColor, 0.28)}, rgba(99,102,241,0.15))` }}>
              <AppIcon icon={moduleMeta?.iconify} className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-slate-100">{moduleMeta?.label || 'Editor'}</div>
              <div className="mt-1 text-xs text-slate-500">Editor visual de lógica e simulação</div>
            </div>
          </div>
          {moduleMeta?.wiki && (
            <a
              href={moduleMeta.wiki}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-violet-400/30 hover:text-violet-200"
            >
              <AppIcon name="wiki" className="h-4 w-4" />
              Wikipedia do módulo
            </a>
          )}
        </div>

        <div className="space-y-2">
          {[
            { t: 'select', lbl: 'Selecionar', icon: 'select' },
            { t: 'wire', lbl: 'Conectar', icon: 'wire' },
            { t: 'delete', lbl: 'Excluir', icon: 'delete' },
          ].map(button => {
            const active = tool === button.t;
            return (
              <button
                key={button.t}
                type="button"
                onClick={() => setTool(button.t)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all duration-150 active:scale-[0.98] ${
                  active
                    ? 'border-violet-400/60 bg-violet-500/18 text-violet-100 shadow-[0_0_22px_rgba(139,92,246,0.18)]'
                    : 'border-white/8 bg-slate-950/60 text-slate-300 hover:border-white/15 hover:text-white'
                }`}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? 'bg-violet-500/18 text-violet-200' : 'bg-white/5 text-slate-400'}`}>
                  <AppIcon name={button.icon} className="h-4 w-4" />
                </span>
                {button.lbl}
              </button>
            );
          })}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button type="button" onClick={groupSelection} className="rounded-2xl border border-white/8 bg-slate-950/60 px-3 py-3 text-sm font-medium text-violet-200 transition hover:border-violet-400/30">
              Agrupar
            </button>
            <button type="button" onClick={ungroupSelection} className="rounded-2xl border border-white/8 bg-slate-950/60 px-3 py-3 text-sm font-medium text-slate-300 transition hover:border-white/15 hover:text-white">
              Desagrupar
            </button>
          </div>
        </div>

        <section className="workspace-card rounded-[24px] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Páginas</div>
              <div className="mt-1 text-sm text-slate-300">Gerencie áreas de projeto</div>
            </div>
            <button type="button" onClick={addPage} className="flex h-9 w-9 items-center justify-center rounded-xl border border-dashed border-white/12 bg-slate-950/60 text-slate-300 transition hover:border-violet-400/30 hover:text-violet-200">
              <AppIcon name="plus" className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2">
            {pages.map(page => {
              const active = page.id === activePageId;
              return (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => switchPage(page.id)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${active ? 'border-violet-400/50 bg-violet-500/15' : 'border-white/8 bg-slate-950/60 hover:border-white/15'}`}
                >
                  <span className={`text-sm font-medium ${active ? 'text-violet-100' : 'text-slate-300'}`}>{page.name}</span>
                  <AppIcon name="page" className={`h-4 w-4 ${active ? 'text-violet-200' : 'text-slate-500'}`} />
                </button>
              );
            })}
          </div>
        </section>

        <section className="workspace-card rounded-[24px] p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Camadas</div>
              <div className="mt-1 text-sm text-slate-300">Controle de visibilidade</div>
            </div>
            <button type="button" onClick={addLayer} className="rounded-xl border border-dashed border-white/12 bg-slate-950/60 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-violet-400/30 hover:text-violet-200">
              + Camada
            </button>
          </div>
          <div className="space-y-3">
            {(activePage?.layers || []).map(layer => {
              const active = layer.id === currentLayerId;
              return (
                <div key={layer.id} className={`rounded-2xl border p-3 ${active ? 'border-violet-400/45 bg-violet-500/12' : 'border-white/8 bg-slate-950/60'}`}>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => updateActivePageMeta(page => ({ ...page, currentLayerId: layer.id }))} className={`flex-1 text-left text-sm font-medium ${active ? 'text-violet-100' : 'text-slate-200'}`}>
                      {layer.name}
                    </button>
                    <button type="button" onClick={() => toggleLayer(layer.id, 'visible')} className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/8 bg-black/20 text-slate-300 transition hover:border-white/15">
                      <AppIcon name={layer.visible === false ? 'hidden' : 'visible'} className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => toggleLayer(layer.id, 'locked')} className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/8 bg-black/20 transition hover:border-white/15">
                      <AppIcon name={layer.locked ? 'lock' : 'unlock'} className={`h-4 w-4 ${layer.locked ? 'text-amber-300' : 'text-emerald-300'}`} />
                    </button>
                  </div>
                  <button type="button" onClick={() => moveSelectionToLayer(layer.id)} className="mt-3 w-full rounded-xl border border-white/8 bg-slate-950/70 px-3 py-2 text-sm text-slate-300 transition hover:border-violet-400/30 hover:text-violet-200">
                    Mover seleção
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="workspace-card rounded-[24px] p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Macros</div>
          <div className="mt-3 space-y-2">
            {(activePage?.groups || []).length ? (activePage?.groups || []).map(group => (
              <button
                key={group.id}
                type="button"
                onClick={() => setSelectionState(group.memberIds, group.memberIds[0])}
                className="w-full rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-left transition hover:border-violet-400/30"
              >
                <div className="text-sm font-medium text-violet-200">{group.name}</div>
                <div className="mt-1 text-xs text-slate-500">{group.memberIds.length} itens</div>
              </button>
            )) : <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/50 px-4 py-5 text-sm leading-6 text-slate-500">Sem macros no momento. Selecione componentes e use Agrupar.</div>}
          </div>
        </section>

        <section className="workspace-card rounded-[24px] p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Presets</div>
          <div className="mt-3 space-y-2">
            {modulePresets.length ? modulePresets.map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyProjectState(preset.project, `Preset carregado: ${preset.title}`)}
                className="w-full rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-left transition hover:border-violet-400/30"
              >
                <div className="text-sm font-medium" style={{ color: modColor }}>{preset.title}</div>
                <div className="mt-1 text-xs leading-5 text-slate-500">{preset.description}</div>
              </button>
            )) : <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/50 px-4 py-5 text-sm leading-6 text-slate-500">Sem presets para este módulo.</div>}
          </div>
        </section>

        <section className="workspace-card rounded-[24px] p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Projetos</div>
          <div className="mt-3 space-y-2">
            {savedProjects.length ? savedProjects.slice(0, 6).map(project => (
              <button
                key={project.id}
                type="button"
                onClick={() => loadSavedProject(project.id)}
                disabled={loadingProjectId === project.id}
                className="w-full rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-left transition hover:border-violet-400/30 disabled:opacity-50"
              >
                <div className="text-sm font-medium" style={{ color: modColor }}>{project.name}</div>
                <div className="mt-1 text-xs leading-5 text-slate-500">{project.summary}</div>
                <div className="mt-2 text-[11px] text-slate-600">{prettyDate(project.updatedAt)}</div>
              </button>
            )) : <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/50 px-4 py-5 text-sm leading-6 text-slate-500">Nenhum projeto salvo neste módulo ainda.</div>}
          </div>
        </section>

        <section className="workspace-card rounded-[24px] p-4">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Componentes</div>
          <div className="relative mb-3">
            <AppIcon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              ref={paletteSearchRef}
              value={paletteFilter}
              onChange={event => setPaletteFilter(event.target.value)}
              placeholder="Buscar componente (atalho: /)"
              className="w-full rounded-2xl border border-white/8 bg-slate-950/70 py-3 pl-10 pr-4 text-sm text-slate-100 outline-none transition-all duration-150 focus:border-violet-400/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)]"
            />
          </div>
          <div className="space-y-2">
            {filteredLib.length ? filteredLib.map(item => {
              const active = tool === item.t;
              return (
                <button
                  key={item.t}
                  type="button"
                  draggable
                  onDragStart={event => event.dataTransfer.setData('text/plain', item.t)}
                  onClick={() => setTool(item.t)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all duration-150 active:scale-[0.98] ${active ? 'bg-white/8 shadow-[0_0_18px_rgba(255,255,255,0.04)]' : 'bg-slate-950/60 hover:border-white/15 hover:bg-slate-950/80'} `}
                  style={{ borderColor: active ? item.col : 'rgba(255,255,255,0.08)' }}
                >
                  <div>
                    <div className="text-sm font-medium" style={{ color: active ? item.col : '#e2e8f0' }}>{item.lbl}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.tip || item.k}</div>
                  </div>
                  <SymbolIcon item={item} size={22} />
                </button>
              );
            }) : <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/50 px-4 py-5 text-sm leading-6 text-slate-500">Nenhum componente corresponde à busca.</div>}
          </div>
        </section>
      </aside>

      <main className={`relative flex min-w-0 flex-1 flex-col overflow-hidden ${viewMode === '3d' ? 'bg-[#050814]' : 'bg-[#060914]'}`}>
        {/* Toolbar row — sits above the canvas in normal flow, never overlapping it */}
        <div className="relative z-[100] shrink-0 border-b border-white/6 bg-[#070a12]/60 px-3 py-3 backdrop-blur-xl">
          <Toolbar tool={tool} setTool={setTool} sel={primaryId} selComp={selComp} selWire={selWire} modColor={modColor} running={running} snap={snap} ortho={ortho} zoom={zoom} hist={hist} comps={comps} wires={wires} push={push} dispatch={dispatch} setSel={id => setSelectionState(id ? [id] : [], id)} setSnap={setSnap} setOrtho={setOrtho} setZoom={setZoom} setPan={setPan} doRot={rotateSelected} calc={calc} toggleSim={toggleSim} saveJSON={saveJSON} fileRef={fileRef} clearAll={clearAll} autoLayout={() => push({ comps: comps.map((component, index) => ({ ...component, x: G * 3 + (index % 5) * G * 3, y: G * 3 + Math.floor(index / 5) * G * 3 })), wires })} modId={modId} wireColor={wireColor} setWireColor={setWireColor} viewMode={viewMode} setViewMode={setViewMode} exportPNG={exportPNG} exportSVG={exportSVG} duplicateSelected={duplicateSelected} fitView={fitView} saveProjectSnapshot={saveProjectSnapshot} showGrid={showGrid} setShowGrid={setShowGrid} />
          <input ref={fileRef} type="file" accept=".json" onChange={loadJSON} style={{ display: 'none' }} />
        </div>

        {/* Canvas row — fully independent area below the toolbar, sized to exactly what's left */}
        <div
          className="workspace-grid relative min-h-0 flex-1 overflow-hidden"
          onDragOver={event => event.preventDefault()}
          onDrop={event => {
            event.preventDefault();
            const type = event.dataTransfer.getData('text/plain');
            if (!type) return;
            const rect = cvRef.current.getBoundingClientRect();
            placeComponent(type, worldFromCanvas(event.clientX - rect.left, event.clientY - rect.top, true));
          }}
        >
          <canvas
            ref={cvRef}
            style={{ display: 'block', width: '100%', height: '100%', cursor: isPan.current ? 'grabbing' : tool === 'wire' ? 'crosshair' : 'default' }}
            onMouseDown={onDown}
            onMouseMove={onMove}
            onMouseUp={onUp}
            onContextMenu={event => { event.preventDefault(); isPan.current = false; }}
          />
          {showGrid && canvasSize.w > 0 && (() => {
            const cell = G * zoom;
            if (cell < 6) return null;
            const startCol = Math.floor(-pan.x / cell) - 1;
            const endCol = Math.ceil((canvasSize.w - pan.x) / cell) + 1;
            const startRow = Math.floor(-pan.y / cell) - 1;
            const endRow = Math.ceil((canvasSize.h - pan.y) / cell) + 1;
            const cols = []; for (let i = startCol; i <= endCol; i++) cols.push(i);
            const rows = []; for (let i = startRow; i <= endRow; i++) rows.push(i);
            const rowLabel = i => { const n = ((i % 26) + 26) % 26; return String.fromCharCode(65 + n); };
            return (
              <>
                <div className="canvas-ruler pointer-events-none absolute left-0 right-0 top-0 z-[5] h-6 overflow-hidden border-b border-white/8">
                  {cols.map(i => (
                    <span key={`c${i}`} style={{ position: 'absolute', left: pan.x + i * cell, top: 4, transform: 'translateX(-50%)' }} className="mono text-[10px] text-slate-500">
                      {i + 1}
                    </span>
                  ))}
                </div>
                <div className="canvas-ruler pointer-events-none absolute bottom-0 left-0 top-6 z-[5] w-6 overflow-hidden border-r border-white/8">
                  {rows.map(i => (
                    <span key={`r${i}`} style={{ position: 'absolute', top: pan.y + i * cell, left: 0, right: 0, textAlign: 'center', transform: 'translateY(-50%)' }} className="mono text-[10px] text-slate-500">
                      {rowLabel(i)}
                    </span>
                  ))}
                </div>
              </>
            );
          })()}
          {marquee && <div style={{ position: 'absolute', left: (Math.min(marquee.x1, marquee.x2) * zoom) + pan.x, top: (Math.min(marquee.y1, marquee.y2) * zoom) + pan.y, width: Math.abs(marquee.x2 - marquee.x1) * zoom, height: Math.abs(marquee.y2 - marquee.y1) * zoom, border: '1px dashed #8b5cf6', background: 'rgba(139,92,246,0.12)', pointerEvents: 'none' }} />}

          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[80] border-t border-white/8 bg-[#070a12]/90 px-4 py-2 backdrop-blur-xl">
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className={`min-w-[220px] font-medium ${status.startsWith('✅') ? 'text-emerald-300' : status.startsWith('⚠️') || status.startsWith('❌') ? 'text-rose-300' : 'text-slate-400'}`}>{status}</span>
              <span className="mono">C:{comps.length}</span>
              <span className="mono">F:{wires.length}</span>
              <span className="mono">SEL:{selection.length}</span>
              <span className="mono">LAYER:{currentLayerId}</span>
              <span className="mono">COL:A-1</span>
              <span className="flex-1" />
              <button
                type="button"
                onClick={() => setShowShortcuts(true)}
                className="pointer-events-auto mono rounded-full border border-white/8 bg-slate-950/60 px-3 py-1 text-slate-400 transition hover:border-violet-400/30 hover:text-violet-200"
                title="Ver atalhos de teclado (?)"
              >
                ?
              </button>
              {lastSavedAt ? (
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${dirtySinceSave ? 'border-amber-400/20 bg-amber-500/8 text-amber-200' : 'border-emerald-400/15 bg-emerald-500/8 text-emerald-200'}`}>
                  <span className={`status-dot h-2 w-2 rounded-full ${dirtySinceSave ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  {dirtySinceSave ? 'Alterações não salvas · último salvamento ' : 'Salvo '}
                  {relativeTime(lastSavedAt, nowTick)}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-slate-500" />
                  Ainda não salvo
                </span>
              )}
            </div>
          </div>

          {showShortcuts && (
            <div
              className="absolute inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={() => setShowShortcuts(false)}
            >
              <div
                className="panel-glass editor-scroll max-h-[80%] w-[min(420px,90%)] overflow-y-auto rounded-[24px] p-6"
                onClick={event => event.stopPropagation()}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Atalhos de teclado</div>
                  <button type="button" onClick={() => setShowShortcuts(false)} className="rounded-lg border border-white/10 bg-slate-950/70 px-2 py-1 text-xs text-slate-400 hover:text-white">
                    Fechar
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    ['Ctrl/Cmd + Z', 'Desfazer'],
                    ['Ctrl/Cmd + Y', 'Refazer'],
                    ['Ctrl/Cmd + S', 'Salvar projeto'],
                    ['Ctrl/Cmd + D', 'Duplicar seleção'],
                    ['Ctrl/Cmd + G', 'Agrupar seleção'],
                    ['Ctrl/Cmd + Shift + G', 'Desagrupar'],
                    ['Delete', 'Excluir seleção'],
                    ['F9', 'Calcular circuito'],
                    ['F5', 'Iniciar/parar simulação'],
                    ['/', 'Focar busca de componentes'],
                    ['Esc', 'Cancelar ação / limpar seleção'],
                    ['?', 'Abrir/fechar esta ajuda'],
                  ].map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between rounded-xl border border-white/6 bg-slate-950/50 px-3 py-2">
                      <span className="text-slate-300">{label}</span>
                      <kbd className="mono rounded-lg border border-violet-400/25 bg-violet-500/10 px-2 py-1 text-xs text-violet-200">{key}</kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Componentes row — sits below the canvas in normal flow, just like the toolbar row above it, never overlapping it */}
        {filteredLib.length > 0 && (
          <div className="editor-scroll relative z-[100] shrink-0 overflow-x-auto border-t border-white/6 bg-[#070a12]/60 px-3 py-3 backdrop-blur-xl">
            <div className="flex gap-3">
              {filteredLib.map(item => {
                const active = tool === item.t;
                return (
                  <button
                    key={`dock-${item.t}`}
                    type="button"
                    draggable
                    onDragStart={event => event.dataTransfer.setData('text/plain', item.t)}
                    onClick={() => setTool(item.t)}
                    title={item.tip || item.lbl}
                    className={`flex min-w-[100px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border px-4 py-3 transition ${active ? 'bg-white/10 shadow-[0_0_18px_rgba(255,255,255,0.06)]' : 'bg-slate-950/50 hover:border-white/15'}`}
                    style={{ borderColor: active ? item.col : 'rgba(255,255,255,0.08)' }}
                  >
                    <SymbolIcon item={item} size={26} />
                    <span className="text-xs font-semibold" style={{ color: active ? item.col : '#e2e8f0' }}>{item.lbl}</span>
                    {item.tip && <span className="text-[10px] text-slate-500">{item.tip}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <aside className="flex w-[344px] min-h-0 shrink-0 flex-col overflow-hidden border-l border-white/6 bg-[#090d18]">
        <div className="border-b border-white/6 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-white" style={{ background: `linear-gradient(135deg, ${hexToRgba(modColor, 0.28)}, rgba(99,102,241,0.15))` }}>
              <AppIcon icon={moduleMeta?.iconify} className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-100">{moduleMeta?.label}</div>
              <div className="mt-1 text-xs leading-5 text-slate-500">{moduleMeta?.desc}</div>
              {collaboratorList.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {collaboratorList.map(item => (
                    <span key={item.socketId} className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-medium text-cyan-200">
                      <span className="h-2 w-2 rounded-full bg-cyan-300" />
                      {item.userName || 'Colab.'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <PropertiesPanel comp={selComp} lib={lib} modColor={modColor} comps={comps} wires={wires} push={push} setSel={id => setSelectionState(id ? [id] : [], id)} sd={sd} onCalc={calc} onToggleSim={toggleSim} running={running} hist={hist} />
      </aside>
    </div>
  );
}
