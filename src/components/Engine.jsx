import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { G, INIT, SN, TOOL_GLYPHS, hexToRgba, shiftHex, uid } from '../constants';
import { MODS_ALL } from '../data/modules';
import { hRed } from '../core/history';
import { solve } from '../core/solvers';
import { boundsInsideRect, componentBounds, distanceToWire, wireBounds } from '../core/topology';
import { drawComp, drawGrid, drawWire } from '../canvas/shapes';
import { PropertiesPanel } from './PropertiesPanel';
import { Toolbar } from './Toolbar';
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
    const observer = new ResizeObserver(() => { cv.width = cv.parentElement.offsetWidth; cv.height = cv.parentElement.offsetHeight; });
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
    drawGrid(ctx, W, H, pan, zoom);
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
  }, [visibleComps, visibleWires, selection, running, modColor, tick, sd, pan, zoom, wStart, mouse, ortho, wireColor, viewMode, collaboratorList, activePageId, comps]);

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
  const saveProjectSnapshot = useCallback(async () => { if (!onSaveProject) return; const name = window.prompt('Nome do projeto:', `${moduleMeta?.label || modId} · ${userName || 'Projeto'}`); if (!name) return; const summary = `${comps.length} componentes · ${wires.length} fios · ${selection.length} selecionados`; const saved = await onSaveProject({ id: activeProjectId || undefined, moduleId: modId, name, summary, viewMode, data: buildProjectData() }); if (saved?.id) setActiveProjectId(saved.id); setStatus('Projeto salvo'); }, [onSaveProject, moduleMeta, modId, userName, comps.length, wires.length, selection.length, activeProjectId, viewMode, buildProjectData, setStatus]);
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

  useEffect(() => { const handler = event => { if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return; const ctrl = event.ctrlKey || event.metaKey; if (ctrl && event.key === 'z') { event.preventDefault(); dispatch({ type: 'UNDO' }); } else if (ctrl && event.key === 'y') { event.preventDefault(); dispatch({ type: 'REDO' }); } else if (ctrl && event.key.toLowerCase() === 'd') { event.preventDefault(); duplicateSelected(); } else if (ctrl && event.key.toLowerCase() === 'g') { event.preventDefault(); groupSelection(); } else if (ctrl && event.shiftKey && event.key.toLowerCase() === 'g') { event.preventDefault(); ungroupSelection(); } else if (event.key === 'Delete') { deleteSelection(); } else if (event.key === 'F9') { event.preventDefault(); calc(); } else if (event.key === 'F5') { event.preventDefault(); toggleSim(); } else if (event.key === 'Escape') { setWStart(null); setSelectionState([]); setMarquee(null); } }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler); }, [duplicateSelected, groupSelection, ungroupSelection, deleteSelection, calc, toggleSim, setSelectionState]);

  return (
    <div className="techsim-editor" style={{ display: 'flex', flex: 1, overflow: 'hidden', height: '100%', fontFamily: "'Courier New','Consolas',monospace" }}>
      <div className="editor-scroll" style={{ width: 180, background: '#040d18', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column', padding: '10px 8px', gap: 8, overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ fontSize: 7, color: '#1e3a5f', textAlign: 'center', letterSpacing: 2 }}>TOOLS</div>
        {[{ t: 'select', lbl: 'Selecionar', sym: TOOL_GLYPHS.select, color: '#fb7185' }, { t: 'wire', lbl: 'Conectar', sym: TOOL_GLYPHS.wire, color: '#94a3b8' }, { t: 'delete', lbl: 'Excluir', sym: TOOL_GLYPHS.delete, color: '#f87171' }].map(button => <button key={button.t} className="editor-btn-hover" onClick={() => setTool(button.t)} style={{ background: tool === button.t ? `${button.color}16` : '#050e1a', border: `1px solid ${tool === button.t ? button.color : '#1e293b'}`, color: tool === button.t ? button.color : '#475569', borderRadius: 10, padding: '8px 5px', cursor: 'pointer' }}>{button.sym} {button.lbl}</button>)}
        <div style={{ display: 'grid', gap: 6 }}>
          <button className="editor-btn-hover" onClick={groupSelection} style={{ background: '#071020', border: '1px solid #1e293b', color: '#a78bfa', borderRadius: 8, padding: '6px 8px' }}>⧉ Agrupar</button>
          <button className="editor-btn-hover" onClick={ungroupSelection} style={{ background: '#071020', border: '1px solid #1e293b', color: '#94a3b8', borderRadius: 8, padding: '6px 8px' }}>↯ Desagrupar</button>
        </div>
        <div className="editor-section-label" style={{ fontSize: 8, color: '#1e3a5f', textAlign: 'center', letterSpacing: 2 }}>PÁGINAS</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{pages.map(page => <button key={page.id} className="editor-btn-hover" onClick={() => switchPage(page.id)} style={{ background: page.id === activePageId ? `${modColor}18` : '#071020', border: `1px solid ${page.id === activePageId ? modColor : '#1e293b'}`, color: page.id === activePageId ? modColor : '#64748b', borderRadius: 999, padding: '4px 8px', fontSize: 7 }}>{page.name}</button>)}<button className="editor-btn-hover" onClick={addPage} style={{ background: '#071020', border: '1px dashed #334155', color: '#94a3b8', borderRadius: 999, padding: '4px 8px', fontSize: 7 }}>+ Página</button></div>
        <div className="editor-section-label" style={{ fontSize: 8, color: '#1e3a5f', textAlign: 'center', letterSpacing: 2 }}>CAMADAS</div>
        <button className="editor-btn-hover" onClick={addLayer} style={{ background: '#071020', border: '1px dashed #334155', color: '#94a3b8', borderRadius: 8, padding: '6px 8px' }}>+ Camada</button>
        {(activePage?.layers || []).map(layer => <div key={layer.id} style={{ background: layer.id === currentLayerId ? `${modColor}12` : '#050e1a', border: `1px solid ${layer.id === currentLayerId ? modColor : '#1e293b'}`, borderRadius: 8, padding: 6 }}><div style={{ display: 'flex', gap: 4, alignItems: 'center' }}><button onClick={() => updateActivePageMeta(page => ({ ...page, currentLayerId: layer.id }))} style={{ flex: 1, background: 'transparent', border: 'none', color: layer.id === currentLayerId ? modColor : '#cbd5e1', textAlign: 'left' }}>{layer.name}</button><button onClick={() => toggleLayer(layer.id, 'visible')} style={{ background: 'transparent', border: 'none', color: '#94a3b8' }}>{layer.visible === false ? '🙈' : '👁'}</button><button onClick={() => toggleLayer(layer.id, 'locked')} style={{ background: 'transparent', border: 'none', color: layer.locked ? '#f87171' : '#22c55e' }}>{layer.locked ? '🔒' : '🔓'}</button></div><button className="editor-btn-hover" onClick={() => moveSelectionToLayer(layer.id)} style={{ width: '100%', marginTop: 4, background: '#071020', border: '1px solid #1e293b', color: '#64748b', borderRadius: 6, padding: '3px 6px', fontSize: 7 }}>Mover seleção</button></div>)}
        <div className="editor-section-label" style={{ fontSize: 8, color: '#1e3a5f', textAlign: 'center', letterSpacing: 2 }}>GRUPOS</div>
        {(activePage?.groups || []).length ? (activePage?.groups || []).map(group => <button key={group.id} className="editor-btn-hover" onClick={() => setSelectionState(group.memberIds, group.memberIds[0])} style={{ background: '#071020', border: '1px solid #1e293b', color: '#a78bfa', borderRadius: 8, padding: '6px 8px', textAlign: 'left' }}>{group.name}<div style={{ color: '#64748b', fontSize: 6 }}>{group.memberIds.length} itens</div></button>) : <div className="editor-empty-hint">Sem grupos. Selecione componentes e use Ctrl+G.</div>}
        <div className="editor-section-label" style={{ fontSize: 8, color: '#1e3a5f', textAlign: 'center', letterSpacing: 2 }}>PRESETS</div>
        {modulePresets.length ? modulePresets.map(preset => <button key={preset.id} className="editor-btn-hover" onClick={() => applyProjectState(preset.project, `Preset carregado: ${preset.title}`)} style={{ background: '#071020', border: `1px solid ${hexToRgba(modColor, 0.22)}`, borderRadius: 10, padding: '8px 8px', textAlign: 'left' }}><div style={{ fontSize: 8, color: modColor, fontWeight: 700 }}>{preset.title}</div><div style={{ fontSize: 6.5, color: '#64748b' }}>{preset.description}</div></button>) : <div className="editor-empty-hint">Sem presets para este módulo.</div>}
        <div className="editor-section-label" style={{ fontSize: 8, color: '#1e3a5f', textAlign: 'center', letterSpacing: 2 }}>PROJETOS</div>
        {savedProjects.length ? savedProjects.slice(0, 6).map(project => <button key={project.id} className="editor-btn-hover" onClick={() => loadSavedProject(project.id)} disabled={loadingProjectId === project.id} style={{ background: '#050e1a', border: '1px solid #1e293b', borderRadius: 10, padding: '8px 8px', textAlign: 'left' }}><div style={{ fontSize: 7.8, color: modColor, fontWeight: 700 }}>{project.name}</div><div style={{ fontSize: 6.2, color: '#475569' }}>{project.summary}</div><div style={{ fontSize: 5.8, color: '#334155' }}>{prettyDate(project.updatedAt)}</div></button>) : <div className="editor-empty-hint">Nenhum projeto salvo neste módulo ainda.</div>}
        <div className="editor-section-label" style={{ fontSize: 8, color: '#1e3a5f', textAlign: 'center', letterSpacing: 2 }}>COMPONENTES</div>
        <input value={paletteFilter} onChange={event => setPaletteFilter(event.target.value)} placeholder="buscar componente" style={{ background: '#071020', border: '1px solid #1e293b', color: '#cbd5e1', padding: '6px 8px', borderRadius: 8, fontSize: 10 }} />
        {filteredLib.length ? filteredLib.map(item => <button key={item.t} className="editor-btn-hover" draggable onDragStart={event => event.dataTransfer.setData('text/plain', item.t)} onClick={() => setTool(item.t)} style={{ background: tool === item.t ? `${item.col}18` : '#050e1a', border: `1px solid ${tool === item.t ? item.col : '#1e293b'}`, color: tool === item.t ? item.col : '#94a3b8', borderRadius: 10, padding: '8px 6px' }}>{item.sym} {item.lbl}</button>) : <div className="editor-empty-hint">Nenhum componente corresponde à busca.</div>}
      </div>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: viewMode === '3d' ? 'radial-gradient(circle at top, #082033 0%, #020b14 55%)' : '#020b14' }} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); const type = event.dataTransfer.getData('text/plain'); if (!type) return; const rect = cvRef.current.getBoundingClientRect(); placeComponent(type, worldFromCanvas(event.clientX - rect.left, event.clientY - rect.top, true)); }}>
        <canvas ref={cvRef} style={{ display: 'block', width: '100%', height: '100%', cursor: isPan.current ? 'grabbing' : tool === 'wire' ? 'crosshair' : 'default' }} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onContextMenu={event => { event.preventDefault(); isPan.current = false; }} />
        {marquee && <div style={{ position: 'absolute', left: (Math.min(marquee.x1, marquee.x2) * zoom) + pan.x, top: (Math.min(marquee.y1, marquee.y2) * zoom) + pan.y, width: Math.abs(marquee.x2 - marquee.x1) * zoom, height: Math.abs(marquee.y2 - marquee.y1) * zoom, border: '1px dashed #38bdf8', background: 'rgba(56,189,248,0.08)', pointerEvents: 'none' }} />}
        <Toolbar tool={tool} setTool={setTool} sel={primaryId} selComp={selComp} selWire={selWire} modColor={modColor} running={running} snap={snap} ortho={ortho} zoom={zoom} hist={hist} comps={comps} wires={wires} push={push} dispatch={dispatch} setSel={id => setSelectionState(id ? [id] : [], id)} setSnap={setSnap} setOrtho={setOrtho} setZoom={setZoom} setPan={setPan} doRot={rotateSelected} calc={calc} toggleSim={toggleSim} saveJSON={saveJSON} fileRef={fileRef} clearAll={clearAll} autoLayout={() => push({ comps: comps.map((component, index) => ({ ...component, x: G * 3 + (index % 5) * G * 3, y: G * 3 + Math.floor(index / 5) * G * 3 })), wires })} modId={modId} wireColor={wireColor} setWireColor={setWireColor} viewMode={viewMode} setViewMode={setViewMode} exportPNG={exportPNG} exportSVG={exportSVG} duplicateSelected={duplicateSelected} fitView={fitView} saveProjectSnapshot={saveProjectSnapshot} />
        <input ref={fileRef} type="file" accept=".json" onChange={loadJSON} style={{ display: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#040d18cc', borderTop: '1px solid #1e293b', padding: '4px 12px', display: 'flex', gap: 10, fontSize: 8, color: '#334155', alignItems: 'center' }}><span style={{ color: status.startsWith('✅') ? '#22c55e' : status.startsWith('⚠️') || status.startsWith('❌') ? '#f87171' : '#3a5a70', minWidth: 220 }}>{status}</span><span>C:{comps.length}</span><span>F:{wires.length}</span><span>SEL:{selection.length}</span><span>LAYER:{currentLayerId}</span><span>COLAB:{collaboratorList.length}</span></div>
      </div>
      <div style={{ width: 292, background: '#040d18', borderLeft: '1px solid #1e293b', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #1e293b' }}><div style={{ fontSize: 11, fontWeight: 700, color: modColor }}>{moduleMeta?.label}</div><div style={{ fontSize: 8, color: '#475569' }}>{moduleMeta?.desc}</div><div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>{collaboratorList.map(item => <span key={item.socketId} style={{ padding: '2px 8px', borderRadius: 999, background: '#071020', border: '1px solid #1e293b', color: '#22d3ee', fontSize: 7 }}>{item.userName || 'Colab.'}</span>)}</div></div>
        <PropertiesPanel comp={selComp} lib={lib} modColor={modColor} comps={comps} wires={wires} push={push} setSel={id => setSelectionState(id ? [id] : [], id)} sd={sd} onCalc={calc} onToggleSim={toggleSim} running={running} hist={hist} />
      </div>
    </div>
  );
}
