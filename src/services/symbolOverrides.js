// Overrides de símbolos SVG geridos a partir do Admin.
// Guardados localmente (localStorage) — cada override é { dataUrl, source, addedAt }.
// Isto permite ao admin adicionar/substituir o SVG de qualquer componente (por id),
// por exemplo com ficheiros extraídos manualmente do QElectroTech ou do Wikimedia
// Commons, sem precisar de alterar código.

const KEY = 'techsim_symbol_overrides_v1';

export function getSymbolOverrides() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setSymbolOverride(id, { dataUrl, source }) {
  const all = getSymbolOverrides();
  all[id] = { dataUrl, source: source || 'Adicionado manualmente pelo Admin', addedAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event('techsim-symbols-changed'));
  return all;
}

export function removeSymbolOverride(id) {
  const all = getSymbolOverrides();
  delete all[id];
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event('techsim-symbols-changed'));
  return all;
}

export function readSvgFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file || file.type !== 'image/svg+xml' && !file.name.endsWith('.svg')) {
      reject(new Error('Por favor seleciona um ficheiro .svg'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Falha a ler o ficheiro'));
    reader.readAsDataURL(file);
  });
}
