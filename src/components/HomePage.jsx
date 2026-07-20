import { useMemo } from 'react';
import { hexToRgba } from '../constants';
import { MODS_ALL } from '../data/modules';
import { AppIcon } from './ui/AppIcon';
import { MetricCard, SectionHero } from './ui/WorkspacePrimitives';

export function HomePage({ user, recentProjects, onOpenModule, onOpenDashboard }) {
  const stats = useMemo(() => {
    const byModule = new Map();
    recentProjects.forEach(project => byModule.set(project.moduleId, (byModule.get(project.moduleId) || 0) + 1));
    const mostUsed = [...byModule.entries()].sort((a, b) => b[1] - a[1])[0];
    return {
      total: recentProjects.length,
      modules: byModule.size,
      mostUsed: mostUsed ? MODS_ALL.find(m => m.id === mostUsed[0])?.label : '—',
    };
  }, [recentProjects]);

  const firstName = (user?.name || 'Convidado').split(' ')[0];

  return (
    <div className="flex flex-col gap-5">
      <SectionHero
        eyebrow="Início"
        title={`Olá, ${firstName}.`}
        description="Este é o novo ponto de partida do Techsim: acesso rápido aos seus módulos, métricas de atividade e caminhos mais curtos para retomar projetos."
        actions={<button type="button" onClick={onOpenDashboard} className="ts-btn ts-btn-primary rounded-full px-5 py-3 text-[10px]">VER TODOS OS PROJETOS</button>}
        aside={<MetricCard icon="reports" label="Módulo mais usado" value={stats.mostUsed || '—'} hint="baseado nos projetos já guardados" color="#22d3ee" compact />}
      />

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <MetricCard icon="projects" label="Projetos guardados" value={String(stats.total)} hint="bases persistidas na conta" color="#8b5cf6" compact />
        <MetricCard icon="module" label="Módulos em uso" value={String(stats.modules)} hint="disciplinas já exploradas" color="#22d3ee" compact />
        <MetricCard icon="overview" label="Workspace" value="Pronto" hint="editor, dashboards e relatórios alinhados" color="#4ade80" compact />
      </section>

      <section className="panel-glass rounded-[28px] p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="eyebrow mb-2">Acesso rápido aos módulos</div>
            <h2 className="font-display text-2xl font-semibold text-[var(--text)]">Abra qualquer disciplina em um clique</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {MODS_ALL.map(module => (
            <button key={module.id} type="button" onClick={() => onOpenModule(module.id)} className="ts-card group flex items-center gap-4 rounded-[24px] p-4 text-left" style={{ borderColor: hexToRgba(module.color, 0.2) }}>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border" style={{ background: `linear-gradient(180deg, ${hexToRgba(module.color, 0.3)}, ${hexToRgba(module.color, 0.06)})`, borderColor: hexToRgba(module.color, 0.34), color: module.color }}>
                <AppIcon icon={module.iconify} className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold" style={{ color: module.color }}>{module.label}</div>
                <div className="mt-1 text-xs leading-6 text-[var(--text-soft)]">{module.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
