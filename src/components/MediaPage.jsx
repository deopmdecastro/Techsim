import { useEffect, useState } from 'react';
import { SYMBOL_LIBRARY, symbolAssetUrl } from '../data/symbolLibrary';
import { getSymbolOverrides } from '../services/symbolOverrides';
import { AppIcon } from './ui/AppIcon';

export function MediaPage({ onOpenAdmin }) {
  const [overrides, setOverrides] = useState(() => getSymbolOverrides());

  useEffect(() => {
    const onChange = () => setOverrides(getSymbolOverrides());
    window.addEventListener('techsim-symbols-changed', onChange);
    return () => window.removeEventListener('techsim-symbols-changed', onChange);
  }, []);

  const builtin = Object.entries(SYMBOL_LIBRARY).map(([id, meta]) => ({ id, src: symbolAssetUrl(meta.file), source: meta.source }));
  const custom = Object.entries(overrides).map(([id, meta]) => ({ id, src: meta.dataUrl, source: meta.source }));
  const all = [...builtin, ...custom.filter(c => !builtin.some(b => b.id === c.id))];

  return (
    <div className="flex flex-col gap-5">
      <section className="panel-glass rounded-[24px] p-6">
        <div className="eyebrow">Mídia</div>
        <h1 className="font-display text-xl font-semibold text-slate-100">Biblioteca de símbolos SVG</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">
          Todos os símbolos SVG reais usados nos componentes do editor. Para adicionar ou substituir um símbolo
          (por exemplo com ficheiros do QElectroTech ou do Wikimedia Commons), usa o painel de administração.
        </p>
        {onOpenAdmin && (
          <button
            type="button"
            onClick={onOpenAdmin}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-500/20 px-4 py-2 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/30"
          >
            <AppIcon name="media" className="h-4 w-4" />
            Gerir símbolos no Admin
          </button>
        )}
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {all.map(item => (
          <div key={item.id} className="ts-card flex flex-col items-center gap-2 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-950/70">
              <img src={item.src} alt={item.id} width={30} height={30} style={{ filter: 'invert(1) brightness(1.5)' }} />
            </div>
            <div className="w-full truncate text-center text-[11px] font-medium text-slate-300">{item.id}</div>
            <div className="w-full truncate text-center text-[9px] text-slate-600">{item.source}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
