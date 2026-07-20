import { useMemo } from 'react';
import { hexToRgba } from '../constants';
import { MODS_ALL } from '../data/modules';
import { AppIcon } from './ui/AppIcon';
import { EmptyState, MetricCard, SectionHero } from './ui/WorkspacePrimitives';

export function ReportsPage({ recentProjects }) {
  const byModule = useMemo(() => {
    const counts = new Map();
    recentProjects.forEach(project => counts.set(project.moduleId, (counts.get(project.moduleId) || 0) + 1));
    const rows = MODS_ALL.map(module => ({ module, count: counts.get(module.id) || 0 }));
    const max = Math.max(1, ...rows.map(row => row.count));
    return { rows, max };
  }, [recentProjects]);

  const latest = useMemo(() => [...recentProjects].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)).slice(0, 6), [recentProjects]);

  return (
    <div className="flex flex-col gap-5">
      <SectionHero
        eyebrow="Relatórios"
        title="Visão geral da atividade"
        description="Distribuição de projetos por módulo, ritmo de atualização e leitura mais clara do uso real do workspace."
        aside={<MetricCard icon="projects" label="Projetos monitorados" value={String(recentProjects.length)} hint="atividade consolidada no dashboard" color="#8b5cf6" compact />}
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <MetricCard icon="module" label="Módulos com uso" value={String(byModule.rows.filter(row => row.count > 0).length)} hint="disciplinas já ativadas" color="#22d3ee" compact />
        <MetricCard icon="reports" label="Maior concentração" value={String(Math.max(0, ...byModule.rows.map(row => row.count)))} hint="projetos em um único módulo" color="#f59e0b" compact />
        <MetricCard icon="timer" label="Atividade recente" value={String(latest.length)} hint="últimos projetos atualizados" color="#4ade80" compact />
      </section>

      <section className="panel-glass rounded-[28px] p-6">
        <div className="mb-4 text-lg font-semibold text-[var(--text)]">Projetos por módulo</div>
        <div className="flex flex-col gap-3">
          {byModule.rows.map(({ module, count }) => (
            <div key={module.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-[var(--text)]">{module.label}</div>
                <div className="mono text-sm" style={{ color: module.color }}>{count}</div>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full" style={{ width: `${(count / byModule.max) * 100}%`, background: `linear-gradient(90deg, ${hexToRgba(module.color, 0.6)}, ${module.color})` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-glass rounded-[28px] p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-lg font-semibold text-[var(--text)]">Atividade recente</div>
          <AppIcon name="timer" className="h-4 w-4 text-[var(--text-dim)]" />
        </div>
        {latest.length === 0 ? (
          <EmptyState icon="timer" title="Sem atividade recente" description="Assim que os projetos forem salvos e atualizados, este painel passa a resumir a movimentação do workspace." />
        ) : (
          <div className="flex flex-col gap-3">
            {latest.map(project => {
              const module = MODS_ALL.find(item => item.id === project.moduleId);
              return (
                <div key={project.id} className="ts-card flex items-center justify-between gap-3 rounded-[22px] px-4 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl" style={{ background: hexToRgba(module?.color || '#8b5cf6', 0.15), color: module?.color }}>
                      <AppIcon icon={module?.iconify} className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[var(--text)]">{project.name || 'Sem nome'}</div>
                      <div className="text-xs text-[var(--text-dim)]">{module?.label || project.moduleId}</div>
                    </div>
                  </div>
                  <div className="text-xs text-[var(--text-dim)]">{project.updatedAt ? new Date(project.updatedAt).toLocaleString('pt-BR') : '—'}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
