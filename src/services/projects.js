import { backendRequest, isRemoteBackendEnabled } from './backend';

const PROJECTS_KEY = 'techsim.projects.records';
const wait = (ms = 120) => new Promise(resolve => setTimeout(resolve, ms));

function readProjects() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(PROJECTS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeProjects(items) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(items));
}

function normalizePayload(record = {}) {
  const data = record.data || record.payload || record;
  const pages = Array.isArray(data.pages) && data.pages.length
    ? data.pages.map((page, index) => ({
        ...page,
        layers: Array.isArray(page.layers) && page.layers.length ? page.layers : [{ id: `layer-${index + 1}`, name: 'Base', locked: false, visible: true }],
        currentLayerId: page.currentLayerId || page.layers?.[0]?.id || `layer-${index + 1}`,
        groups: Array.isArray(page.groups) ? page.groups : [],
      }))
    : [{ id: 'page-1', name: 'Página 1', layers: [{ id: 'layer-1', name: 'Base', locked: false, visible: true }], currentLayerId: 'layer-1', groups: [], comps: data.comps || [], wires: data.wires || [] }];

  return {
    pages,
    activePageId: data.activePageId || record.activePageId || pages[0]?.id || 'page-1',
    favorites: Array.isArray(data.favorites) ? data.favorites : [],
    templates: Array.isArray(data.templates) ? data.templates : [],
    settings: data.settings || {},
    viewMode: data.viewMode || record.viewMode || '3d',
  };
}

function normalizedRecord(record) {
  return {
    id: record.id,
    name: record.name,
    moduleId: record.moduleId,
    summary: record.summary || 'Projeto salvo localmente',
    updatedAt: record.updatedAt || new Date().toISOString(),
    createdAt: record.createdAt || record.updatedAt || new Date().toISOString(),
    viewMode: record.viewMode || '3d',
    userEmail: record.userEmail || '',
    source: record.source || (isRemoteBackendEnabled() ? 'remote' : 'local'),
    data: normalizePayload(record),
  };
}

export async function saveProjectRecord({ id, name, moduleId, summary, viewMode, userEmail, data }) {
  const payload = {
    name,
    moduleId,
    summary,
    viewMode,
    userEmail,
    data: normalizePayload({ data, viewMode }),
  };

  if (isRemoteBackendEnabled()) {
    const response = id
      ? await backendRequest(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
      : await backendRequest('/projects', { method: 'POST', body: JSON.stringify(payload) });
    return normalizedRecord(response.project || response);
  }

  await wait();
  const records = readProjects();
  const record = normalizedRecord({
    id: id || `prj_${moduleId}_${Date.now()}`,
    name,
    moduleId,
    summary,
    viewMode,
    userEmail,
    updatedAt: new Date().toISOString(),
    source: 'local',
    data: payload.data,
  });
  const next = [record, ...records.filter(item => item.id !== record.id)].slice(0, 120);
  writeProjects(next);
  return record;
}

export async function listProjectRecords(userEmail = '') {
  if (isRemoteBackendEnabled()) {
    const payload = await backendRequest('/projects');
    return (payload.projects || []).map(normalizedRecord);
  }

  await wait(60);
  return readProjects()
    .filter(item => !userEmail || item.userEmail === userEmail)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map(normalizedRecord);
}

export async function loadProjectRecord(projectId) {
  if (isRemoteBackendEnabled()) {
    const payload = await backendRequest(`/projects/${projectId}`);
    return normalizedRecord(payload.project || payload);
  }

  await wait(60);
  const record = readProjects().find(item => item.id === projectId);
  if (!record) throw new Error('Projeto não encontrado.');
  return normalizedRecord(record);
}

export async function listProjectVersions(projectId) {
  if (isRemoteBackendEnabled()) {
    const payload = await backendRequest(`/projects/${projectId}/versions`);
    return payload.versions || [];
  }
  return [];
}

export async function listProjectComments(projectId) {
  if (isRemoteBackendEnabled()) {
    const payload = await backendRequest(`/projects/${projectId}/comments`);
    return payload.comments || [];
  }
  return [];
}

export async function createProjectComment(projectId, body, pageId = null) {
  if (!isRemoteBackendEnabled()) return null;
  const payload = await backendRequest(`/projects/${projectId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body, pageId }),
  });
  return payload.comment || payload;
}
