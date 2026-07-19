import { G } from '../constants';

const SNAP_TOLERANCE = Math.max(14, G * 0.45);
const SOURCE_TYPES = new Set(['vdc', 'vac', 'idc', 'psu', 'comp', 'pump', 'qg', 's71200', 's71500', 'logo', 'ab', 'schneider', 'omron', 'plc']);
const SINK_TYPES = new Set(['gnd', 'gnde', 'lamp', 'led', 'coil', 'cont', 'mote', 'motor1p', 'motor3p', 'dcmotor', 'servo', 'cyl', 'cylse', 'cylh', 'tom', 'lum', 'ar', 'out']);

const roundPoint = value => Math.round(value / SNAP_TOLERANCE) * SNAP_TOLERANCE;
const pointKey = (x, y) => `${roundPoint(x)}:${roundPoint(y)}`;
const distance = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

const ensureNode = (nodes, key, x, y) => {
  if (!nodes.has(key)) nodes.set(key, { key, x, y, neighbors: new Set(), wires: new Set(), comps: new Set() });
  return nodes.get(key);
};

function componentAnchors(component) {
  const anchors = [{ x: component.x, y: component.y }];
  const horizontal = (component.r || 0) % 180 === 0;
  const delta = G;
  if (!['gnd', 'gnde', 'manm', 'prs', 'tc', 'osc', 'mtr', 'watt', 'phasem', 'pump', 'comp', 'cyl', 'cylse', 'cylh'].includes(component.t)) {
    anchors.push(horizontal ? { x: component.x - delta, y: component.y } : { x: component.x, y: component.y - delta });
    anchors.push(horizontal ? { x: component.x + delta, y: component.y } : { x: component.x, y: component.y + delta });
  }
  return anchors;
}

export function buildTopology(comps = [], wires = []) {
  const nodes = new Map();
  const componentNodeKeys = new Map();

  wires.forEach(wire => {
    const aKey = pointKey(wire.x1, wire.y1);
    const bKey = pointKey(wire.x2, wire.y2);
    const a = ensureNode(nodes, aKey, wire.x1, wire.y1);
    const b = ensureNode(nodes, bKey, wire.x2, wire.y2);
    a.neighbors.add(bKey);
    b.neighbors.add(aKey);
    a.wires.add(wire.id);
    b.wires.add(wire.id);
  });

  comps.forEach(component => {
    const keys = [];
    componentAnchors(component).forEach(anchor => {
      const key = pointKey(anchor.x, anchor.y);
      const node = ensureNode(nodes, key, anchor.x, anchor.y);
      node.comps.add(component.id);
      keys.push(key);
    });
    componentNodeKeys.set(component.id, keys);
    for (let index = 1; index < keys.length; index += 1) {
      const prev = ensureNode(nodes, keys[index - 1], component.x, component.y);
      const next = ensureNode(nodes, keys[index], component.x, component.y);
      prev.neighbors.add(next.key);
      next.neighbors.add(prev.key);
    }
  });

  const components = [];
  const seen = new Set();
  nodes.forEach((node, key) => {
    if (seen.has(key)) return;
    const queue = [key];
    const group = { nodeKeys: [], wires: new Set(), comps: new Set() };
    seen.add(key);
    while (queue.length) {
      const currentKey = queue.shift();
      const current = nodes.get(currentKey);
      if (!current) continue;
      group.nodeKeys.push(currentKey);
      current.wires.forEach(id => group.wires.add(id));
      current.comps.forEach(id => group.comps.add(id));
      current.neighbors.forEach(neighborKey => {
        if (seen.has(neighborKey)) return;
        seen.add(neighborKey);
        queue.push(neighborKey);
      });
    }
    components.push({
      nodeKeys: group.nodeKeys,
      wireIds: [...group.wires],
      compIds: [...group.comps],
    });
  });

  const componentById = new Map(comps.map(component => [component.id, component]));
  const wireById = new Map(wires.map(wire => [wire.id, wire]));

  return { nodes, components, componentNodeKeys, componentById, wireById };
}

export function analyzeConnectivity(modId, comps = [], wires = []) {
  const topology = buildTopology(comps, wires);
  const { components } = topology;
  const sourceIds = comps.filter(component => SOURCE_TYPES.has(component.t)).map(component => component.id);
  const sinkIds = comps.filter(component => SINK_TYPES.has(component.t)).map(component => component.id);

  const energizedCompIds = new Set();
  const energizedWireIds = new Set();
  const diagnostics = [];

  components.forEach(group => {
    const hasSource = group.compIds.some(id => sourceIds.includes(id));
    const hasSink = group.compIds.some(id => sinkIds.includes(id));
    if (hasSource) {
      group.compIds.forEach(id => energizedCompIds.add(id));
      group.wireIds.forEach(id => energizedWireIds.add(id));
    }
    if (hasSource && !hasSink && group.compIds.length > 1) {
      diagnostics.push({
        severity: 'warning',
        code: 'floating-energy',
        message: 'Existe uma malha energizada sem retorno/carga final claramente conectada.',
        ids: group.compIds,
      });
    }
  });

  const orphanComponents = comps.filter(component => {
    const keys = topology.componentNodeKeys.get(component.id) || [];
    return !keys.some(key => topology.nodes.get(key)?.wires?.size || topology.nodes.get(key)?.neighbors?.size > 1);
  });

  orphanComponents.forEach(component => {
    diagnostics.push({
      severity: 'warning',
      code: 'orphan-component',
      message: `${component.n || component.t} está sem interligação útil.`,
      ids: [component.id],
    });
  });

  const openWireIds = wires.filter(wire => {
    const a = topology.nodes.get(pointKey(wire.x1, wire.y1));
    const b = topology.nodes.get(pointKey(wire.x2, wire.y2));
    const aConnected = (a?.comps?.size || 0) > 0 || (a?.wires?.size || 0) > 1;
    const bConnected = (b?.comps?.size || 0) > 0 || (b?.wires?.size || 0) > 1;
    return !aConnected || !bConnected;
  }).map(wire => wire.id);

  if (openWireIds.length) {
    diagnostics.push({
      severity: 'warning',
      code: 'open-wire',
      message: `${openWireIds.length} ligação(ões) com extremidade aberta detectada(s).`,
      ids: openWireIds,
    });
  }

  if (['dc', 'ac', 'cmd', 'install'].includes(modId)) {
    const hasSource = comps.some(component => SOURCE_TYPES.has(component.t));
    if (!hasSource) {
      diagnostics.push({ severity: 'error', code: 'missing-source', message: 'Falta uma fonte/entrada principal de energia.', ids: [] });
    }
    if (!sinkIds.length) {
      diagnostics.push({ severity: 'warning', code: 'missing-load', message: 'Não foram encontradas cargas, saídas ou retornos na malha.', ids: [] });
    }
  }

  return {
    topology,
    energizedCompIds,
    energizedWireIds,
    diagnostics,
    summary: {
      islands: topology.components.length,
      energizedComponents: energizedCompIds.size,
      energizedWires: energizedWireIds.size,
      orphanComponents: orphanComponents.length,
      openWires: openWireIds.length,
    },
  };
}

export function componentBounds(component) {
  return {
    left: component.x - 36,
    right: component.x + 36,
    top: component.y - 30,
    bottom: component.y + 36,
  };
}

export function wireBounds(wire) {
  return {
    left: Math.min(wire.x1, wire.x2) - 8,
    right: Math.max(wire.x1, wire.x2) + 8,
    top: Math.min(wire.y1, wire.y2) - 8,
    bottom: Math.max(wire.y1, wire.y2) + 8,
  };
}

export function boundsInsideRect(bounds, rect) {
  return bounds.left >= rect.left && bounds.right <= rect.right && bounds.top >= rect.top && bounds.bottom <= rect.bottom;
}

export function distanceToWire(point, wire) {
  const dx = wire.x2 - wire.x1;
  const dy = wire.y2 - wire.y1;
  const lenSq = dx * dx + dy * dy;
  if (!lenSq) return distance(point.x, point.y, wire.x1, wire.y1);
  const t = Math.max(0, Math.min(1, ((point.x - wire.x1) * dx + (point.y - wire.y1) * dy) / lenSq));
  const px = wire.x1 + t * dx;
  const py = wire.y1 + t * dy;
  return distance(point.x, point.y, px, py);
}
