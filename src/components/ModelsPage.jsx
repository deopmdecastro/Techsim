import { useMemo, useState } from 'react';
import { hexToRgba } from '../constants';
import { MODS_ALL, MODULE_PRESETS } from '../data/modules';
import { AppIcon } from './ui/AppIcon';
import { EmptyState, FilterChip, SectionHero } from './ui/WorkspacePrimitives';

export function ModelsPage({ onUsePreset }) {
  const [moduleFilter, setModuleFilter] = useState('all');

  const entries = useMemo(() => {
    const list = [];
    MODS_ALL.forEach(module => (MODULE_PRESETS[module.id] || []).forEach(preset => list.push({ module, preset })));
    return moduleFilter === 'all' ? list : list.filter(entry => entry.module.id === moduleFilter);
  }, [moduleFilter]);

  return (
    <div className="flex flex-col gap-5">
      <SectionHero eyebrow="Modelos" title="Templates prontos para começar mais rápido" description="Filtre por disciplina e abra circuitos-base já preparados para evolução no editor." aside={<div className="panel-glass rounded-[24px] p-4 text-left"><div className="text-sm font-semibold text-[var(--text)]">{entries.length} modelos</div><div className="mt-1 text-xs text-[var(--text-dim)]">disponíveis com um clique</div></div>} />

      <section className="panel-glass rounded-[28px] p-5">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={moduleFilter === 'all'} onClick={() => setModuleFilter('all')}>Todos</FilterChip>
          {MODS_ALL.map(module => <FilterChip key={module.id} active={moduleFilter === module.id} onClick={() => setModuleFilter(module.id)} color={module.color}>{module.label}</FilterChip>)}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {entries.length === 0 && <EmptyState icon="models" title="Ainda não há modelos neste filtro" description="Troque o módulo selecionado ou adicione novos presets à biblioteca." />}
        {entries.map(({ module, preset }) => (
          <div key={preset.id} className="ts-card flex flex-col gap-3 rounded-[24px] p-5" style={{ borderColor: hexToRgba(module.color, 0.2) }}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: hexToRgba(module.color, 0.15), color: module.color }}>
                <AppIcon icon={module.iconify} className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-[var(--text)]">{preset.title}</div>
                <span className="ts-pill mt-1 inline-block" style={{ color: module.color, borderColor: hexToRgba(module.color, 0.3), background: hexToRgba(module.color, 0.12) }}>{module.label}</span>
              </div>
            </div>
            <p className="text-sm leading-7 text-[var(--text-soft)]">{preset.description}</p>
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
