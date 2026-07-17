import { backendConfig, backendRequest, isRemoteBackendEnabled, setAuthToken } from './backend';

const AUTH_KEY = 'techsim.auth.user';
const USERS_KEY = 'techsim.auth.users';

const wait = (ms = 180) => new Promise(resolve => setTimeout(resolve, ms));

function readJson(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function normalizeUser(user) {
  return {
    id: user?.id || `usr_${String(user?.email || user?.name || 'techsim').toLowerCase().replace(/\W+/g, '_')}`,
    name: user?.name?.trim() || user?.email?.split('@')[0] || 'Operador',
    email: user?.email || '',
    role: user?.role || 'user',
    provider: user?.provider || (isRemoteBackendEnabled() ? 'remote' : backendConfig.authMode || 'local'),
    createdAt: user?.createdAt || user?.created_at || new Date().toISOString(),
  };
}

async function loginRemote(credentials) {
  const payload = await backendRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  setAuthToken(payload.token || '');
  return payload.user || payload;
}

async function registerRemote(payload) {
  const result = await backendRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setAuthToken(result.token || '');
  return result.user || result;
}

async function loginLocal({ email, password }) {
  await wait();
  const users = readJson(USERS_KEY, []);
  const found = users.find(user => user.email.toLowerCase() === String(email).toLowerCase());
  if (!found) throw new Error('Utilizador não encontrado.');
  if (found.password !== password) throw new Error('Senha inválida.');
  return normalizeUser(found);
}

async function registerLocal({ name, email, password }) {
  await wait();
  const users = readJson(USERS_KEY, []);
  if (users.some(user => user.email.toLowerCase() === String(email).toLowerCase())) {
    throw new Error('Já existe uma conta com este e-mail.');
  }
  const user = normalizeUser({ name, email, role: 'user', provider: 'local' });
  users.push({ ...user, password });
  writeJson(USERS_KEY, users);
  return user;
}

export async function login(credentials) {
  const user = normalizeUser(isRemoteBackendEnabled() ? await loginRemote(credentials) : await loginLocal(credentials));
  writeJson(AUTH_KEY, user);
  return user;
}

export async function register(payload) {
  const user = normalizeUser(isRemoteBackendEnabled() ? await registerRemote(payload) : await registerLocal(payload));
  writeJson(AUTH_KEY, user);
  return user;
}

export async function logout() {
  await wait(80);
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AUTH_KEY);
  }
  setAuthToken('');
}

export async function refreshCurrentUser() {
  if (!isRemoteBackendEnabled()) return getCurrentUser();
  const payload = await backendRequest('/auth/me');
  const user = normalizeUser(payload.user || payload);
  writeJson(AUTH_KEY, user);
  return user;
}

export function getCurrentUser() {
  const user = readJson(AUTH_KEY, null);
  return user?.email ? normalizeUser(user) : null;
}
