import { useEffect, useMemo, useState } from 'react';
import { SYMBOL_LIBRARY, symbolAssetUrl } from '../data/symbolLibrary';
import { getSymbolOverrides } from '../services/symbolOverrides';
import { AppIcon } from './ui/AppIcon';
import { MetricCard, SectionHero } from './ui/WorkspacePrimitives';

export function MediaPage({ onOpenAdmin }) {
  const [overrides, setOverrides] = useState(() => getSymbolOverrides());

  useEffect(() => {
    const onChange = () => setOverrides(getSymbolOverrides());
    window.addEventListener('techsim-symbols-changed', onChange);
    return () => window.removeEventListener('techsim-symbols-changed', onChange);
  }, []);

  const builtin = useMemo(() => Object.entries(SYMBOL_LIBRARY).map(([id, meta]) => ({ id, src: symbolAssetUrl(meta.file), source: meta.source, type: 'builtin' })), []);
  const custom = Object.entries(overrides).map(([id, meta]) => ({ id, src: meta.dataUrl, source: meta.source, type: 'custom' }));
  const all = [...builtin, ...custom.filter(item => !builtin.some(base => base.id === item.id))];

  return (
    <div className="flex flex-col gap-5">
      <SectionHero
        eyebrow="Mídia"
        title="Biblioteca de símbolos SVG"
        description="Todos os símbolos reais usados pelo editor, agora organizados num catálogo visual mais claro para auditoria, manutenção e expansão da base gráfica."
        actions={onOpenAdmin ? <button type="button" onClick={onOpenAdmin} className="ts-btn ts-btn-primary rounded-full px-5 py-3 text-[10px]">GERIR SÍMBOLOS NO ADMIN</button> : null}
        aside={<MetricCard icon="media" label="Símbolos disponíveis" value={String(all.length)} hint={`${custom.length} personalizados · ${builtin.length} nativos`} color="#22d3ee" compact />}
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <MetricCard icon="module" label="Biblioteca nativa" value={String(builtin.length)} hint="disponível por padrão" color="#8b5cf6" compact />
        <MetricCard icon="settings" label="Overrides" value={String(custom.length)} hint="fontes adicionadas manualmente" color="#f59e0b" compact />
        <MetricCard icon="overview" label="Cobertura" value="SVG" hint="icons reais para o editor" color="#4ade80" compact />
      </section>

      <section className="panel-glass rounded-[28px] p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-[var(--text)]">Catálogo visual</div>
            <div className="text-sm text-[var(--text-soft)]">Pré-visualização uniforme para símbolos de sistema e personalizados.</div>
          </div>
          <span className="techsim-kicker">{all.length} itens</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {all.map(item => (
            <div key={item.id} className="ts-card flex flex-col items-center gap-3 rounded-[24px] p-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/8 bg-black/15">
                <img src={item.src} alt={item.id} width={34} height={34} style={{ filter: 'invert(1) brightness(1.6)' }} />
              </div>
              <div className="w-full truncate text-sm font-medium text-[var(--text)]">{item.id}</div>
              <div className="w-full truncate text-[11px] text-[var(--text-dim)]">{item.source}</div>
              <span className="ts-pill">{item.type === 'custom' ? 'custom' : 'builtin'}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
