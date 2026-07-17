import { backendRequest, isRemoteBackendEnabled } from "./backend";

const PROJECTS_KEY = "techsim.projects.records";

const wait = (ms = 180) => new Promise(resolve => setTimeout(resolve, ms));

function readProjects() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(PROJECTS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeProjects(items) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(items));
}

function normalizedRecord(record) {
  return {
    id: record.id,
    name: record.name,
    moduleId: record.moduleId,
    summary: record.summary || "Projeto salvo localmente",
    updatedAt: record.updatedAt || new Date().toISOString(),
    viewMode: record.viewMode || "3d",
    userEmail: record.userEmail || "",
    source: record.source || (isRemoteBackendEnabled() ? "remote" : "local"),
    data: record.data,
  };
}

export async function saveProjectRecord({ name, moduleId, summary, viewMode, userEmail, data }) {
  if (isRemoteBackendEnabled()) {
    const payload = await backendRequest("/projects", {
      method: "POST",
      body: JSON.stringify({ name, moduleId, summary, viewMode, userEmail, data }),
    });
    return normalizedRecord(payload.project || payload);
  }

  await wait();
  const records = readProjects();
  const id = `prj_${moduleId}_${Date.now()}`;
  const record = normalizedRecord({
    id,
    name,
    moduleId,
    summary,
    viewMode,
    userEmail,
    updatedAt: new Date().toISOString(),
    source: "local",
    data,
  });
  const next = [record, ...records.filter(item => item.id !== id)].slice(0, 60);
  writeProjects(next);
  return record;
}

export async function listProjectRecords(userEmail = "") {
  if (isRemoteBackendEnabled()) {
    const payload = await backendRequest(`/projects?user=${encodeURIComponent(userEmail)}`);
    return (payload.projects || payload || []).map(normalizedRecord);
  }

  await wait(80);
  const records = readProjects();
  return records
    .filter(item => !userEmail || item.userEmail === userEmail)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map(normalizedRecord);
}

export async function loadProjectRecord(projectId) {
  if (isRemoteBackendEnabled()) {
    const payload = await backendRequest(`/projects/${projectId}`);
    return normalizedRecord(payload.project || payload);
  }

  await wait(80);
  const record = readProjects().find(item => item.id === projectId);
  if (!record) throw new Error("Projeto não encontrado.");
  return normalizedRecord(record);
}
