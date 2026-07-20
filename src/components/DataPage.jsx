import { useMemo, useState } from 'react';
import { hexToRgba } from '../constants';
import { MODS_ALL } from '../data/modules';
import { AppIcon } from './ui/AppIcon';

const moduleMeta = id => MODS_ALL.find(m => m.id === id);

export function DataPage({ recentProjects, onOpenModule }) {
  const [query, setQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const filtered = useMemo(() => {
    return recentProjects
      .filter(p => moduleFilter === 'all' || p.moduleId === moduleFilter)
      .filter(p => `${p.name} ${p.summary || ''}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  }, [recentProjects, moduleFilter, query]);

  return (
    <div className="flex flex-col gap-5">
      <section className="panel-glass rounded-[24px] p-6">
        <div className="eyebrow">Dados</div>
        <h1 className="font-display text-xl font-semibold text-slate-100">Projetos guardados</h1>
        <p className="mt-1 text-sm text-slate-400">Consulta, filtra e abre qualquer projeto guardado nos teus módulos.</p>

        <div className="mt-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <AppIcon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Procurar por nome ou resumo..."
              className="w-full rounded-2xl border border-white/8 bg-slate-950/70 py-2.5 pl-10 pr-4 text-sm text-slate-100 outline-none focus:border-violet-400/50"
            />
          </div>
          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            className="rounded-2xl border border-white/8 bg-slate-950/70 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-violet-400/50"
          >
            <option value="all">Todos os módulos</option>
            {MODS_ALL.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="ts-card flex flex-col items-center gap-2 p-10 text-center text-slate-500">
            <AppIcon name="data" className="h-8 w-8 opacity-40" />
            <div className="text-sm">Nenhum projeto encontrado.</div>
          </div>
        )}
        {filtered.map(project => {
          const module = moduleMeta(project.moduleId);
          return (
            <button
              key={project.id}
              type="button"
              onClick={() => onOpenModule(project.moduleId, project.id)}
              className="ts-card flex items-center justify-between gap-4 p-4 text-left"
              style={{ borderColor: hexToRgba(module?.color || '#8b5cf6', 0.2) }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: hexToRgba(module?.color || '#8b5cf6', 0.15), color: module?.color || '#c4b5fd' }}
                >
                  <AppIcon icon={module?.iconify} className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-100">{project.name || 'Sem nome'}</div>
                  <div className="truncate text-[11px] text-slate-500">{project.summary || module?.label}</div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="ts-pill" style={{ color: module?.color, borderColor: hexToRgba(module?.color || '#8b5cf6', 0.3), background: hexToRgba(module?.color || '#8b5cf6', 0.12) }}>
                  {module?.label || project.moduleId}
                </span>
                <span className="hidden text-[11px] text-slate-500 sm:inline">
                  {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('pt-PT') : '—'}
                </span>
                <AppIcon name="edit" className="h-4 w-4 text-slate-500" />
              </div>
            </button>
          );
        })}
      </section>
    </div>
  );
}
