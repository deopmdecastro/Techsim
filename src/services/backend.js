const env = typeof import.meta !== 'undefined' ? import.meta.env || {} : {};

const AUTH_TOKEN_KEY = 'techsim.auth.token';

export const backendConfig = {
  baseUrl: env.VITE_API_URL || '',
  authMode: env.VITE_AUTH_MODE || 'local',
  projectMode: env.VITE_PROJECT_MODE || 'local',
  realtimeUrl: env.VITE_REALTIME_URL || '',
  appName: env.VITE_APP_NAME || 'Techsim Platform',
};

export const isRemoteBackendEnabled = () => Boolean(backendConfig.baseUrl);

export function getAuthToken() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(AUTH_TOKEN_KEY) || '';
}

export function setAuthToken(token) {
  if (typeof window === 'undefined') return;
  if (!token) window.localStorage.removeItem(AUTH_TOKEN_KEY);
  else window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export async function backendRequest(path, options = {}) {
  if (!isRemoteBackendEnabled()) {
    throw new Error('Backend remoto não configurado.');
  }

  const token = getAuthToken();
  const response = await fetch(`${backendConfig.baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => ({}))
    : await response.text().catch(() => '');

  if (!response.ok) {
    const message = typeof payload === 'string' ? payload : payload.message;
    throw new Error(message || `Erro HTTP ${response.status}`);
  }

  return payload;
}
