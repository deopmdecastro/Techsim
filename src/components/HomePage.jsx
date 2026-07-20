import { useMemo } from 'react';
import { hexToRgba } from '../constants';
import { MODS_ALL } from '../data/modules';
import { AppIcon } from './ui/AppIcon';

export function HomePage({ user, recentProjects, onOpenModule, onOpenDashboard }) {
  const stats = useMemo(() => {
    const byModule = new Map();
    recentProjects.forEach(p => byModule.set(p.moduleId, (byModule.get(p.moduleId) || 0) + 1));
    const mostUsed = [...byModule.entries()].sort((a, b) => b[1] - a[1])[0];
    return {
      total: recentProjects.length,
      modules: byModule.size,
      mostUsed: mostUsed ? MODS_ALL.find(m => m.id === mostUsed[0])?.label : '—',
    };
  }, [recentProjects]);

  const firstName = (user?.name || 'Convidado').split(' ')[0];

  return (
    <div className="flex flex-col gap-6">
      <section className="panel-glass rounded-[24px] p-6">
        <div className="eyebrow">Bem-vindo</div>
        <h1 className="font-display text-2xl font-semibold text-slate-100">Olá, {firstName} 👋</h1>
        <p className="mt-1 max-w-xl text-sm text-slate-400">
          Este é o teu ponto de partida no Techsim Platform. Continua um projeto, explora um módulo novo ou consulta os teus dados e relatórios.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onOpenDashboard}
            className="inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-500/20 px-4 py-2 text-sm font-semibold text-violet-100 transition hover:bg-violet-500/30"
          >
            <AppIcon name="projects" className="h-4 w-4" />
            Ver todos os projetos
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          ['Projetos guardados', stats.total, 'projects'],
          ['Módulos em uso', stats.modules, 'module'],
          ['Módulo mais usado', stats.mostUsed || '—', 'reports'],
        ].map(([label, value, icon]) => (
          <div key={label} className="ts-card flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-400/25 bg-violet-500/15 text-violet-200">
              <AppIcon name={icon} className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-100">{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Acesso rápido aos módulos</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODS_ALL.map(module => (
            <button
              key={module.id}
              type="button"
              onClick={() => onOpenModule(module.id)}
              className="ts-card group flex items-center gap-3 p-4 text-left"
              style={{ borderColor: hexToRgba(module.color, 0.2) }}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                style={{
                  background: `linear-gradient(180deg, ${hexToRgba(module.color, 0.3)}, ${hexToRgba(module.color, 0.04)})`,
                  border: `1px solid ${hexToRgba(module.color, 0.36)}`,
                  color: module.color,
                }}
              >
                <AppIcon icon={module.iconify} className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold" style={{ color: module.color }}>{module.label}</div>
                <div className="truncate text-[11px] text-slate-500">{module.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
