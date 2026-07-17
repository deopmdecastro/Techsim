import { backendConfig, backendRequest, isRemoteBackendEnabled } from "./backend";

const AUTH_KEY = "techsim.auth.user";
const USERS_KEY = "techsim.auth.users";

const wait = (ms = 240) => new Promise(resolve => setTimeout(resolve, ms));

function readJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeUser(user) {
  const name = user?.name?.trim() || user?.email?.split("@")[0] || "Engenheiro";
  return {
    id: user?.id || `usr_${String(name).toLowerCase().replace(/\W+/g, "_")}`,
    name,
    email: user?.email || "",
    role: user?.role || "user",
    provider: user?.provider || backendConfig.authMode || "local",
    createdAt: user?.createdAt || new Date().toISOString(),
  };
}

async function loginRemote(credentials) {
  return backendRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

async function registerRemote(payload) {
  return backendRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function loginLocal({ email, password }) {
  await wait();
  const users = readJson(USERS_KEY, []);
  const found = users.find(user => user.email.toLowerCase() === String(email).toLowerCase());
  if (!found) {
    throw new Error("Usuário não encontrado. Crie uma conta para continuar.");
  }
  if (found.password !== password) {
    throw new Error("Senha inválida.");
  }
  const safeUser = normalizeUser(found);
  writeJson(AUTH_KEY, safeUser);
  return safeUser;
}

async function registerLocal({ name, email, password }) {
  await wait();
  const users = readJson(USERS_KEY, []);
  if (users.some(user => user.email.toLowerCase() === String(email).toLowerCase())) {
    throw new Error("Já existe uma conta com este e-mail.");
  }
  const newUser = normalizeUser({ name, email, role: "user", provider: "local" });
  users.push({ ...newUser, password });
  writeJson(USERS_KEY, users);
  writeJson(AUTH_KEY, newUser);
  return newUser;
}

export async function login(credentials) {
  const payload = isRemoteBackendEnabled() ? await loginRemote(credentials) : await loginLocal(credentials);
  const user = normalizeUser(payload.user || payload);
  writeJson(AUTH_KEY, user);
  return user;
}

export async function register(payload) {
  const result = isRemoteBackendEnabled() ? await registerRemote(payload) : await registerLocal(payload);
  const user = normalizeUser(result.user || result);
  writeJson(AUTH_KEY, user);
  return user;
}

export async function logout() {
  await wait(120);
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_KEY);
  }
}

export function getCurrentUser() {
  const user = readJson(AUTH_KEY, null);
  return user?.email ? normalizeUser(user) : null;
}

export function hasCurrentUser() {
  const user = readJson(AUTH_KEY, null);
  return Boolean(user?.email);
}
