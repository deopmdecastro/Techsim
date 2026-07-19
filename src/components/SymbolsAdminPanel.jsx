import { useMemo, useState } from 'react';
import { MODS_ALL, LIBS } from '../data/modules';
import { SYMBOL_LIBRARY, symbolAssetUrl } from '../data/symbolLibrary';
import { getSymbolOverrides, setSymbolOverride, removeSymbolOverride, readSvgFileAsDataUrl } from '../services/symbolOverrides';

// Painel Admin para adicionar/substituir o SVG de qualquer componente da
// biblioteca — por exemplo com ficheiros exportados manualmente do
// QElectroTech (.elmt -> SVG) ou descarregados do Wikimedia Commons
// (depois de verificada a licença de cada ficheiro).
export function SymbolsAdminPanel() {
  const [moduleId, setModuleId] = useState(MODS_ALL[0]?.id || 'dc');
  const [overrides, setOverrides] = useState(() => getSymbolOverrides());
  const [source, setSource] = useState('');
  const [error, setError] = useState('');

  const items = LIBS[moduleId] || [];

  const refresh = () => setOverrides(getSymbolOverrides());

  const handleUpload = async (id, file) => {
    setError('');
    try {
      const dataUrl = await readSvgFileAsDataUrl(file);
      setSymbolOverride(id, { dataUrl, source: source || 'Adicionado manualmente pelo Admin' });
      refresh();
    } catch (e) {
      setError(e.message || 'Falha ao carregar SVG');
    }
  };

  const handleRemove = (id) => {
    removeSymbolOverride(id);
    refresh();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, fontSize: 11, color: 'var(--text-soft)', lineHeight: 1.6 }}>
        Adiciona ou substitui o símbolo SVG de qualquer componente. Credita a fonte (ex: "QElectroTech — CC-BY 3.0" ou
        "Wikimedia Commons — CC0 / verificar ficheiro") no campo abaixo antes de carregar. Os componentes sem SVG
        continuam a mostrar o símbolo de texto original.
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={moduleId} onChange={e => setModuleId(e.target.value)} style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', fontSize: 10 }}>
          {MODS_ALL.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        <input
          value={source}
          onChange={e => setSource(e.target.value)}
          placeholder="Fonte / crédito (ex: QElectroTech CC-BY 3.0)"
          style={{ flex: 1, minWidth: 240, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', fontSize: 10 }}
        />
      </div>

      {error && <div style={{ color: '#f43f5e', fontSize: 10 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12 }}>
        {items.map(item => {
          const override = overrides[item.t];
          const builtin = SYMBOL_LIBRARY[item.t];
          const preview = override ? override.dataUrl : builtin ? symbolAssetUrl(builtin.file) : null;
          return (
            <div key={item.t} style={{ background: 'var(--panel-2)', border: `1px solid ${item.col}33`, borderRadius: 10, padding: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {preview
                  ? <img src={preview} alt={item.lbl} width={26} height={26} style={{ filter: 'invert(1) brightness(1.5)' }} />
                  : <span style={{ fontSize: 11, fontWeight: 700, color: item.col }}>{item.sym}</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#e2e8f0' }}>{item.lbl}</div>
                <div style={{ fontSize: 8, color: 'var(--text-dim)' }}>
                  {override ? `Override: ${override.source}` : builtin ? builtin.source : 'Sem SVG (texto)'}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <label style={{ fontSize: 8, color: '#38bdf8', cursor: 'pointer' }}>
                    Carregar SVG
                    <input type="file" accept=".svg,image/svg+xml" style={{ display: 'none' }} onChange={e => e.target.files[0] && handleUpload(item.t, e.target.files[0])} />
                  </label>
                  {override && (
                    <button onClick={() => handleRemove(item.t)} style={{ fontSize: 8, color: '#f43f5e', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Remover</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
