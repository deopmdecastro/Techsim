import { useMemo } from 'react';
import { hexToRgba } from '../constants';
import { MODS_ALL } from '../data/modules';
import { AppIcon } from './ui/AppIcon';

export function ReportsPage({ recentProjects }) {
  const byModule = useMemo(() => {
    const counts = new Map();
    recentProjects.forEach(p => counts.set(p.moduleId, (counts.get(p.moduleId) || 0) + 1));
    const rows = MODS_ALL.map(m => ({ module: m, count: counts.get(m.id) || 0 }));
    const max = Math.max(1, ...rows.map(r => r.count));
    return { rows, max };
  }, [recentProjects]);

  const latest = useMemo(
    () => [...recentProjects].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)).slice(0, 6),
    [recentProjects]
  );

  return (
    <div className="flex flex-col gap-5">
      <section className="panel-glass rounded-[24px] p-6">
        <div className="eyebrow">Relatórios</div>
        <h1 className="font-display text-xl font-semibold text-slate-100">Visão geral da atividade</h1>
        <p className="mt-1 text-sm text-slate-400">Distribuição dos teus projetos por módulo e atividade recente.</p>
      </section>

      <section className="ts-card p-6">
        <div className="mb-4 text-sm font-semibold text-slate-200">Projetos por módulo</div>
        <div className="flex flex-col gap-3">
          {byModule.rows.map(({ module, count }) => (
            <div key={module.id} className="flex items-center gap-3">
              <div className="w-36 shrink-0 truncate text-xs text-slate-400">{module.label}</div>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(count / byModule.max) * 100}%`, background: `linear-gradient(90deg, ${hexToRgba(module.color, 0.6)}, ${module.color})` }}
                />
              </div>
              <div className="w-6 shrink-0 text-right text-xs font-semibold text-slate-300">{count}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="ts-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-200">Atividade recente</div>
          <AppIcon name="timer" className="h-4 w-4 text-slate-500" />
        </div>
        {latest.length === 0 ? (
          <div className="text-sm text-slate-500">Sem projetos guardados ainda.</div>
        ) : (
          <div className="flex flex-col divide-y divide-white/5">
            {latest.map(project => {
              const module = MODS_ALL.find(m => m.id === project.moduleId);
              return (
                <div key={project.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: hexToRgba(module?.color || '#8b5cf6', 0.15), color: module?.color }}>
                      <AppIcon icon={module?.iconify} className="h-4 w-4" />
                    </div>
                    <div className="truncate text-sm text-slate-200">{project.name || 'Sem nome'}</div>
                  </div>
                  <div className="shrink-0 text-xs text-slate-500">
                    {project.updatedAt ? new Date(project.updatedAt).toLocaleString('pt-PT') : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
