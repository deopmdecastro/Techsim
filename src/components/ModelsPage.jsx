import { useMemo, useState } from 'react';
import { hexToRgba } from '../constants';
import { MODS_ALL, MODULE_PRESETS } from '../data/modules';
import { AppIcon } from './ui/AppIcon';
import { EmptyState, FilterChip, SectionHero } from './ui/WorkspacePrimitives';

export function ModelsPage({ onUsePreset }) {
  const [moduleFilter, setModuleFilter] = useState('all');
  const [search, setSearch] = useState('');

  const entries = useMemo(() => {
    const list = [];
    MODS_ALL.forEach(module => (MODULE_PRESETS[module.id] || []).forEach(preset => list.push({ module, preset })));
    const filteredByModule = moduleFilter === 'all' ? list : list.filter(entry => entry.module.id === moduleFilter);
    const query = search.trim().toLowerCase();
    if (!query) return filteredByModule;
    return filteredByModule.filter(({ module, preset }) =>
      `${module.label} ${module.desc} ${preset.title} ${preset.description}`.toLowerCase().includes(query),
    );
  }, [moduleFilter, search]);

  const totalPresets = useMemo(() => Object.values(MODULE_PRESETS).reduce((sum, list) => sum + (list?.length || 0), 0), []);

  return (
    <div className="flex flex-col gap-5">
      <SectionHero
        eyebrow="Modelos"
        title="Templates prontos para começar mais rápido"
        description="Fluxo revisto para descoberta de presets: filtre por disciplina, pesquise por cenário e entre no editor com menos cliques."
        aside={(
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="panel-glass rounded-[24px] p-4 text-left">
              <div className="text-sm font-semibold text-[var(--text)]">{entries.length} resultados</div>
              <div className="mt-1 text-xs text-[var(--text-dim)]">visíveis no filtro atual</div>
            </div>
            <div className="panel-glass rounded-[24px] p-4 text-left">
              <div className="text-sm font-semibold text-[var(--text)]">{totalPresets} presets</div>
              <div className="mt-1 text-xs text-[var(--text-dim)]">catalogados no workspace</div>
            </div>
          </div>
        )}
      />

      <section className="panel-glass rounded-[28px] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterChip active={moduleFilter === 'all'} onClick={() => setModuleFilter('all')}>Todos</FilterChip>
            {MODS_ALL.map(module => (
              <FilterChip key={module.id} active={moduleFilter === module.id} onClick={() => setModuleFilter(module.id)} color={module.color}>
                {module.label}
              </FilterChip>
            ))}
          </div>
          <div className="relative w-full lg:max-w-[340px]">
            <AppIcon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-dim)]" />
            <input
              type="text"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Buscar preset, cenário ou módulo"
              className="techsim-input py-3 pl-10 pr-10 text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Limpar pesquisa"
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-dim)] transition hover:bg-white/10 hover:text-[var(--text)]"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {entries.length === 0 && <EmptyState icon="models" title="Nenhum modelo neste filtro" description="Tente outro módulo ou ajuste a busca para localizar um preset compatível." />}
        {entries.map(({ module, preset }) => (
          <div key={preset.id} className="ts-card group flex flex-col gap-3 rounded-[24px] p-5" style={{ borderColor: hexToRgba(module.color, 0.2) }}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105" style={{ background: hexToRgba(module.color, 0.15), color: module.color }}>
                <AppIcon icon={module.iconify} className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-[var(--text)]">{preset.title}</div>
                <span className="ts-pill mt-1 inline-block" style={{ color: module.color, borderColor: hexToRgba(module.color, 0.3), background: hexToRgba(module.color, 0.12) }}>{module.label}</span>
              </div>
            </div>
            <p className="text-sm leading-7 text-[var(--text-soft)]">{preset.description}</p>
            <div className="rounded-[20px] border border-white/8 bg-black/15 p-3 text-xs leading-6 text-[var(--text-dim)]">
              Entra no editor com a disciplina certa, componentes base carregados e menos etapas até a simulação.
            </div>
            <button type="button" onClick={() => onUsePreset(module.id, preset.id)} className="ts-btn mt-1 inline-flex items-center justify-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/15 px-4 py-3 text-[10px] text-violet-100 transition hover:bg-violet-500/25">
              <AppIcon name="preset" className="h-4 w-4" />
              USAR ESTE MODELO
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
