import { useMemo, useState } from 'react';
import { hexToRgba } from '../constants';
import { MODS_ALL } from '../data/modules';
import { AppIcon } from './ui/AppIcon';
import { EmptyState, FilterChip, SectionHero } from './ui/WorkspacePrimitives';

const moduleMeta = id => MODS_ALL.find(m => m.id === id);

export function DataPage({ recentProjects, onOpenModule }) {
  const [query, setQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const filtered = useMemo(() => recentProjects
    .filter(project => moduleFilter === 'all' || project.moduleId === moduleFilter)
    .filter(project => `${project.name} ${project.summary || ''}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)), [recentProjects, moduleFilter, query]);

  return (
    <div className="flex flex-col gap-5">
      <SectionHero
        eyebrow="Dados"
        title="Projetos guardados"
        description="Pesquisa, filtra e reabre qualquer base salva em todos os módulos do workspace."
        aside={<div className="panel-glass rounded-[24px] p-4 text-left"><div className="text-sm font-semibold text-[var(--text)]">{filtered.length} resultados</div><div className="mt-1 text-xs text-[var(--text-dim)]">ordenados por atualização</div></div>}
      />

      <section className="panel-glass rounded-[28px] p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative">
            <AppIcon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-dim)]" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Procurar por nome ou resumo..." className="techsim-input py-3 pl-10 pr-4 text-sm" />
          </div>
          <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} className="techsim-input max-w-[240px] py-3 text-sm">
            <option value="all">Todos os módulos</option>
            {MODS_ALL.map(module => <option key={module.id} value={module.id}>{module.label}</option>)}
          </select>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <FilterChip active={moduleFilter === 'all'} onClick={() => setModuleFilter('all')}>Todos</FilterChip>
          {MODS_ALL.map(module => <FilterChip key={module.id} active={moduleFilter === module.id} onClick={() => setModuleFilter(module.id)} color={module.color}>{module.label}</FilterChip>)}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        {filtered.length === 0 && <EmptyState icon="data" title="Nenhum projeto encontrado" description="Ajuste os filtros ou crie novos projetos para alimentar esta biblioteca de dados." />}
        {filtered.map(project => {
          const module = moduleMeta(project.moduleId);
          return (
            <button key={project.id} type="button" onClick={() => onOpenModule(project.moduleId, project.id)} className="ts-card flex flex-wrap items-center justify-between gap-4 rounded-[24px] p-4 text-left" style={{ borderColor: hexToRgba(module?.color || '#8b5cf6', 0.2) }}>
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: hexToRgba(module?.color || '#8b5cf6', 0.15), color: module?.color || '#c4b5fd' }}>
                  <AppIcon icon={module?.iconify} className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[var(--text)]">{project.name || 'Sem nome'}</div>
                  <div className="truncate text-xs text-[var(--text-soft)]">{project.summary || module?.label}</div>
                  <div className="mt-1 text-xs text-[var(--text-dim)]">{project.updatedAt ? new Date(project.updatedAt).toLocaleString('pt-BR') : '—'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="ts-pill" style={{ color: module?.color, borderColor: hexToRgba(module?.color || '#8b5cf6', 0.3), background: hexToRgba(module?.color || '#8b5cf6', 0.12) }}>{module?.label || project.moduleId}</span>
                <AppIcon name="edit" className="h-4 w-4 text-[var(--text-dim)]" />
              </div>
            </button>
          );
        })}
      </section>
    </div>
  );
}
