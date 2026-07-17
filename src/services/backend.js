const env = typeof process !== "undefined" ? process.env || {} : {};

export const backendConfig = {
  baseUrl: env.REACT_APP_API_URL || env.VITE_API_URL || "",
  authMode: env.REACT_APP_AUTH_MODE || env.VITE_AUTH_MODE || "local",
  projectMode: env.REACT_APP_PROJECT_MODE || env.VITE_PROJECT_MODE || "local",
  realtimeUrl: env.REACT_APP_REALTIME_URL || env.VITE_REALTIME_URL || "",
};

export const isRemoteBackendEnabled = () => Boolean(backendConfig.baseUrl);

export async function backendRequest(path, options = {}) {
  if (!isRemoteBackendEnabled()) {
    throw new Error("Backend remoto não configurado.");
  }

  const response = await fetch(`${backendConfig.baseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "Falha inesperada na API.");
    throw new Error(message || `Erro HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}
