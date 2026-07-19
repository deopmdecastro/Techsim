const CPU_SCAN_BY_TYPE = {
  s71200: 8,
  s71500: 4,
  logo: 18,
  ab: 7,
  schneider: 9,
  omron: 6,
  plc: 10,
};

const ADDRESS_LIMITS = {
  I: 1024,
  Q: 1024,
  M: 4096,
  T: 512,
  C: 512,
  AI: 256,
  AQ: 256,
};

export function parseAddress(address = '') {
  const raw = String(address || '').trim().toUpperCase();
  if (!raw) return null;
  const match = raw.match(/^(AI|AQ|I|Q|M|T|C)(\d+)(?:\.(\d+))?$/);
  if (!match) return { raw, valid: false, reason: 'Formato inválido' };
  const [, area, wordStr, bitStr] = match;
  const word = Number(wordStr);
  const bit = bitStr === undefined ? null : Number(bitStr);
  const limit = ADDRESS_LIMITS[area] ?? 0;
  const validRange = word < limit && (bit === null || bit < 16);
  return {
    raw,
    area,
    word,
    bit,
    valid: validRange,
    reason: validRange ? '' : `Endereço fora da faixa de ${area}`,
    key: `${area}:${word}:${bit ?? '-'}`,
  };
}

function moduleChannels(component) {
  if (component.t === 'di' || component.t === 'do') return Number(component.v || 16);
  if (component.t === 'ai' || component.t === 'ao') return Number(component.v || 4);
  if (component.t === 'remoteio') return Number(component.v || 8);
  return 0;
}

export function buildPlcRuntime(comps = []) {
  const cpus = comps.filter(component => ['s71200', 's71500', 'logo', 'ab', 'schneider', 'omron', 'plc'].includes(component.t));
  const ioModules = comps.filter(component => ['di', 'do', 'ai', 'ao', 'remoteio'].includes(component.t));
  const addressed = comps
    .filter(component => component.addr)
    .map(component => ({ component, parsed: parseAddress(component.addr) }));

  const duplicates = new Map();
  addressed.forEach(({ component, parsed }) => {
    if (!parsed?.valid || !parsed.key) return;
    const list = duplicates.get(parsed.key) || [];
    list.push(component);
    duplicates.set(parsed.key, list);
  });

  const duplicateItems = [...duplicates.entries()].filter(([, list]) => list.length > 1);
  const invalidAddresses = addressed.filter(item => !item.parsed?.valid);

  const capacity = {
    I: ioModules.filter(component => component.t === 'di' || component.t === 'remoteio').reduce((sum, component) => sum + moduleChannels(component), 0),
    Q: ioModules.filter(component => component.t === 'do' || component.t === 'remoteio').reduce((sum, component) => sum + moduleChannels(component), 0),
    AI: ioModules.filter(component => component.t === 'ai').reduce((sum, component) => sum + moduleChannels(component), 0),
    AQ: ioModules.filter(component => component.t === 'ao').reduce((sum, component) => sum + moduleChannels(component), 0),
  };

  const usage = { I: 0, Q: 0, M: 0, T: 0, C: 0, AI: 0, AQ: 0 };
  addressed.forEach(({ parsed }) => {
    if (parsed?.valid && usage[parsed.area] !== undefined) usage[parsed.area] += 1;
  });

  const scanBase = cpus.length
    ? Math.min(...cpus.map(component => CPU_SCAN_BY_TYPE[component.t] || 10))
    : 12;
  const programWeight = comps.filter(component => ['cno', 'cnf', 'coil', 'set', 'rst', 'ton', 'tof', 'ctu', 'cmp', 'di', 'do', 'ai', 'ao'].includes(component.t)).length;
  const scanCycleMs = Number((scanBase + programWeight * 0.35 + ioModules.length * 0.4).toFixed(2));
  const cpuLoadPct = Math.min(97, Number(((programWeight * 2.2 + ioModules.length * 4.5 + cpus.length * 7) / Math.max(1, cpus.length || 1)).toFixed(1)));

  const memoryMap = addressed.reduce((accumulator, { component, parsed }) => {
    if (!parsed?.valid) return accumulator;
    accumulator.push({
      addr: parsed.raw,
      area: parsed.area,
      name: component.n || component.t,
      componentId: component.id,
      type: component.t,
    });
    return accumulator;
  }, []).sort((a, b) => a.addr.localeCompare(b.addr, 'pt-BR'));

  const diagnostics = [];
  if (!cpus.length) diagnostics.push({ severity: 'error', message: 'Nenhuma CPU de PLC foi adicionada ao projeto.' });
  if (!ioModules.length) diagnostics.push({ severity: 'warning', message: 'Não há módulos de I/O declarados para o runtime.' });
  invalidAddresses.forEach(({ component, parsed }) => {
    diagnostics.push({ severity: 'error', message: `${component.n || component.t}: ${parsed?.reason || 'endereço inválido'}.` });
  });
  duplicateItems.forEach(([key, list]) => {
    diagnostics.push({ severity: 'error', message: `Endereço duplicado ${key.replace(/:/g, '.')} em ${list.map(component => component.n || component.t).join(', ')}.` });
  });

  const overCapacity = [
    ['I', capacity.I],
    ['Q', capacity.Q],
    ['AI', capacity.AI],
    ['AQ', capacity.AQ],
  ].filter(([area, total]) => total > 0 && usage[area] > total);
  overCapacity.forEach(([area, total]) => {
    diagnostics.push({ severity: 'error', message: `Uso de ${area} excede a capacidade declarada (${usage[area]}/${total}).` });
  });

  return {
    cpus,
    ioModules,
    memoryMap,
    capacity,
    usage,
    diagnostics,
    scanCycleMs,
    cpuLoadPct,
    summary: {
      cpuCount: cpus.length,
      ioCount: ioModules.length,
      addressedCount: memoryMap.length,
      duplicateCount: duplicateItems.length,
      invalidCount: invalidAddresses.length,
    },
  };
}

export function simulatePlcScan(comps = []) {
  const runtime = buildPlcRuntime(comps);
  const memory = new Map();

  comps.forEach(component => {
    const parsed = parseAddress(component.addr);
    if (!parsed?.valid) return;
    if (['I', 'M', 'AI'].includes(parsed.area)) {
      memory.set(parsed.raw, Number(component.v || 0));
    }
  });

  const outputs = [];
  comps.forEach(component => {
    const parsed = parseAddress(component.addr);
    if (!parsed?.valid) return;
    if (parsed.area === 'Q') {
      const value = Number(component.v || 0);
      memory.set(parsed.raw, value);
      outputs.push({ name: component.n || component.t, addr: parsed.raw, value, componentId: component.id });
    }
  });

  return {
    ...runtime,
    outputs,
    memory,
    live: {
      scanCycleMs: runtime.scanCycleMs,
      cpuLoadPct: runtime.cpuLoadPct,
      outputCount: outputs.length,
    },
  };
}
