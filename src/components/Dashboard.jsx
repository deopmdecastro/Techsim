import { useMemo, useState } from 'react';
import { hexToRgba, shiftHex } from '../constants';
import { MODS_ALL } from '../data/modules';
import { AppIcon } from './ui/AppIcon';
import { EmptyState, FilterChip, MetricCard, SectionHero } from './ui/WorkspacePrimitives';

const MODULES = MODS_ALL.map(module => ({ ...module, docs: module.desc }));

const SHORTCUTS = [
  ['Ctrl/Cmd + Z', 'Desfazer'], ['Ctrl/Cmd + Y', 'Refazer'], ['Ctrl/Cmd + S', 'Salvar projeto'],
  ['Ctrl/Cmd + D', 'Duplicar seleção'], ['Ctrl/Cmd + G', 'Agrupar seleção'], ['Ctrl/Cmd + Shift + G', 'Desagrupar'],
  ['Delete', 'Excluir seleção'], ['F9', 'Calcular circuito'], ['F5', 'Iniciar/parar simulação'],
  ['/', 'Focar busca de componentes'], ['Esc', 'Cancelar ação / limpar seleção'], ['?', 'Ajuda de atalhos no editor'],
];

const TABS = [
  { id: 'modules', icon: 'module', label: 'Módulos' },
  { id: 'projects', icon: 'projects', label: 'Projetos recentes' },
  { id: 'shortcuts', icon: 'shortcut', label: 'Atalhos' },
];

const pluralize = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;

function ModuleCard({ module, presetCount, projectCount, onOpenModule, onOpenPreset }) {
  return (
    <div className="ts-card group relative flex h-full flex-col gap-4 overflow-hidden rounded-[26px] p-5" style={{ borderColor: hexToRgba(module.color, 0.22) }}>
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${module.color}, transparent)` }} />
      <div className="pointer-events-none absolute -right-10 top-0 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" style={{ background: hexToRgba(module.color, 0.28) }} />
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-[26px]" style={{ background: `linear-gradient(180deg, ${hexToRgba(module.color, 0.3)}, ${hexToRgba(module.color, 0.05)})`, borderColor: hexToRgba(module.color, 0.36), color: module.color }}>
            {module.icon}
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-semibold" style={{ color: module.color }}>{module.label}</div>
            <div className="mt-1 text-xs leading-6 text-[var(--text-soft)]">{module.desc}</div>
          </div>
        </div>
        <span className="techsim-kicker">{pluralize(projectCount, 'base', 'bases')}</span>
      </div>

      <p className="min-h-[48px] text-sm leading-7 text-[var(--text-soft)]">{module.docs}</p>

      <div className="flex flex-wrap gap-2">
        <span className="ts-pill" style={{ color: module.color, borderColor: hexToRgba(module.color, 0.28), background: hexToRgba(module.color, 0.12) }}>{pluralize(presetCount, 'preset', 'presets')}</span>
        <span className="ts-pill">{pluralize(projectCount, 'projeto', 'projetos')}</span>
      </div>

      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        <button onClick={() => onOpenModule(module.id)} className="ts-btn rounded-full px-4 py-2.5 text-[10px]" style={{ background: `linear-gradient(135deg, ${module.color}, ${shiftHex(module.color, -0.12)})`, color: '#04030a' }}>ABRIR EDITOR</button>
        <button onClick={() => onOpenPreset(module.id)} className="ts-btn rounded-full border px-4 py-2.5 text-[10px]" style={{ borderColor: hexToRgba(module.color, 0.36), color: module.color, background: hexToRgba(module.color, 0.08) }}>USAR PRESET</button>
        {module.wiki && (
          <a href={module.wiki} target="_blank" rel="noreferrer" className="ts-btn ts-btn-ghost inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[10px]">
            <AppIcon name="wiki" className="h-3.5 w-3.5" />
            WIKI
          </a>
        )}
      </div>
    </div>
  );
}

export function Dashboard({ user, onLogout, onOpenModule, onOpenPreset, onAdmin, presetCatalog = {}, recentProjects = [] }) {
  const [activeTab, setActiveTab] = useState('modules');
  const [search, setSearch] = useState('');
  const isAdmin = user?.role === 'admin';

  const stats = useMemo(() => {
    const presetCount = Object.values(presetCatalog).reduce((sum, list) => sum + (list?.length || 0), 0);
    const byModule = new Set(recentProjects.map(item => item.moduleId));
    return [
      { label: 'Módulos', value: String(MODULES.length), icon: 'module', color: '#22d3ee', hint: 'disciplinas disponíveis' },
      { label: 'Presets', value: String(presetCount), icon: 'preset', color: '#4ade80', hint: 'circuitos de arranque' },
      { label: 'Projetos', value: String(recentProjects.length), icon: 'data', color: '#f59e0b', hint: 'bases persistidas' },
      { label: 'Módulos ativos', value: String(byModule.size), icon: 'overview', color: '#a78bfa', hint: 'utilizados pela conta' },
    ];
  }, [presetCatalog, recentProjects]);

  const projectsByModule = useMemo(() => recentProjects.reduce((acc, item) => {
    acc[item.moduleId] = (acc[item.moduleId] || 0) + 1;
    return acc;
  }, {}), [recentProjects]);

  const filteredModules = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MODULES;
    return MODULES.filter(module => module.label.toLowerCase().includes(q) || module.desc.toLowerCase().includes(q));
  }, [search]);

  const firstName = (user?.name || 'Operador').split(' ')[0];
  const latestProjects = useMemo(() => [...recentProjects].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)).slice(0, 4), [recentProjects]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden" style={{ fontFamily: 'var(--font-body)' }}>
      <SectionHero
        eyebrow="Workspace"
        title={`Bem-vindo de volta, ${firstName}.`}
        description="A nova UI do dashboard prioriza leitura rápida, módulos à frente e atalhos claros para iniciar, retomar e administrar projetos industriais."
        actions={(
          <>
            <button type="button" onClick={() => setActiveTab('modules')} className="ts-btn ts-btn-primary rounded-full px-5 py-3 text-[10px]">ABRIR MÓDULOS</button>
            <button type="button" onClick={() => setActiveTab('projects')} className="ts-btn ts-btn-ghost rounded-full px-5 py-3 text-[10px]">VER PROJETOS</button>
            {isAdmin && <button type="button" onClick={onAdmin} className="ts-btn rounded-full border border-rose-400/30 bg-rose-500/10 px-5 py-3 text-[10px] text-rose-200">PAINEL ADMIN</button>}
          </>
        )}
        aside={(
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {stats.slice(0, 2).map(item => <MetricCard key={item.label} icon={item.icon} label={item.label} value={item.value} hint={item.hint} color={item.color} compact />)}
          </div>
        )}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="panel-glass editor-scroll flex min-h-0 flex-col gap-4 overflow-y-auto rounded-[28px] p-4">
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <div className="eyebrow mb-2">Navegação</div>
            <div className="text-lg font-semibold text-[var(--text)]">Cockpit do Techsim</div>
            <div className="mt-2 text-sm leading-7 text-[var(--text-soft)]">Troque entre módulos, projetos recentes e atalhos sem perder contexto do workspace.</div>
          </div>

          <nav className="flex flex-col gap-2">
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${active ? 'border-violet-400/45 bg-violet-500/16 text-violet-100' : 'border-white/8 bg-white/[0.02] text-[var(--text-soft)] hover:border-white/14 hover:text-[var(--text)]'}`}>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${active ? 'bg-violet-500/16 text-violet-200' : 'bg-white/[0.03] text-[var(--text-dim)]'}`}>
                    <AppIcon name={tab.icon} className="h-4 w-4" />
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="grid gap-3">
            {stats.map(item => <MetricCard key={item.label} icon={item.icon} label={item.label} value={item.value} hint={item.hint} color={item.color} compact />)}
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-[var(--text)]">Atividade mais recente</div>
                <div className="text-xs text-[var(--text-dim)]">Projetos atualizados</div>
              </div>
              <AppIcon name="timer" className="h-4 w-4 text-[var(--text-dim)]" />
            </div>
            <div className="space-y-2">
              {latestProjects.length ? latestProjects.map(project => {
                const module = MODULES.find(item => item.id === project.moduleId);
                return (
                  <button key={project.id} type="button" onClick={() => onOpenModule(project.moduleId, project.id)} className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-black/15 px-3 py-3 text-left transition hover:border-white/14">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: hexToRgba(module?.color || '#8b5cf6', 0.16), color: module?.color || '#c4b5fd' }}>
                      <AppIcon icon={module?.iconify} className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-[var(--text)]">{project.name}</div>
                      <div className="truncate text-xs text-[var(--text-dim)]">{module?.label || project.moduleId}</div>
                    </div>
                  </button>
                );
              }) : <div className="rounded-2xl border border-dashed border-white/10 px-3 py-4 text-sm text-[var(--text-dim)]">Sem atividade recente.</div>}
            </div>
          </div>

          <button onClick={onLogout} className="ts-btn ts-btn-ghost mt-auto flex items-center justify-center gap-2 rounded-full px-4 py-3 text-[10px]">
            <AppIcon name="logout" className="h-4 w-4" />
            SAIR DO WORKSPACE
          </button>
        </aside>

        <main className="dashboard-blueprint panel-glass min-h-0 overflow-y-auto rounded-[28px] p-5 sm:p-6">
          {activeTab === 'modules' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="eyebrow mb-2">Módulos e presets</div>
                  <div className="font-display text-[30px] font-semibold leading-tight text-[var(--text)]">Entre rápido em cada disciplina</div>
                  <div className="mt-2 text-sm text-[var(--text-soft)]">Cada módulo já nasce com presets prontos, ícones próprios e persistência de projeto.</div>
                </div>
                <div className="relative min-w-[260px] max-w-[320px] flex-1">
                  <AppIcon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-dim)]" />
                  <input type="text" placeholder="Pesquisar módulo..." value={search} onChange={event => setSearch(event.target.value)} aria-label="Pesquisar módulo" className="techsim-input py-3 pl-10 pr-4 text-sm" />
                </div>
              </div>

              {filteredModules.length ? (
                <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                  {filteredModules.map(module => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      presetCount={(presetCatalog[module.id] || []).length}
                      projectCount={projectsByModule[module.id] || 0}
                      onOpenModule={onOpenModule}
                      onOpenPreset={onOpenPreset}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState icon="search" title="Nenhum módulo encontrado" description={`Nenhum resultado corresponde a "${search}". Ajuste o termo para continuar.`} />
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-5">
              <div>
                <div className="eyebrow mb-2">Projetos recentes</div>
                <div className="font-display text-[30px] font-semibold text-[var(--text)]">Continue exatamente de onde parou</div>
                <div className="mt-2 text-sm text-[var(--text-soft)]">Lista priorizada por atualização para reabrir bases e continuar a edição sem fricção.</div>
              </div>
              {!recentProjects.length ? (
                <EmptyState icon="projects" title="Ainda não há projetos salvos" description="Abra um módulo, carregue um preset e salve sua primeira base para começar a povoar o dashboard." />
              ) : (
                <div className="grid gap-3">
                  {recentProjects.map(project => {
                    const module = MODULES.find(item => item.id === project.moduleId);
                    return (
                      <button key={project.id} onClick={() => onOpenModule(project.moduleId, project.id)} className="ts-card flex flex-wrap items-center justify-between gap-4 rounded-[24px] px-5 py-4 text-left" style={{ borderColor: hexToRgba(module?.color || '#8b5cf6', 0.18) }}>
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: hexToRgba(module?.color || '#8b5cf6', 0.16), color: module?.color || '#c4b5fd' }}>
                            <AppIcon icon={module?.iconify} className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-[15px] font-semibold text-[var(--text)]">{project.name}</div>
                            <div className="mt-1 truncate text-sm text-[var(--text-soft)]">{project.summary}</div>
                            <div className="mt-2 text-xs text-[var(--text-dim)]">{module?.label || project.moduleId} · {new Date(project.updatedAt).toLocaleString('pt-BR')}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="ts-pill" style={{ color: module?.color, borderColor: hexToRgba(module?.color || '#8b5cf6', 0.28), background: hexToRgba(module?.color || '#8b5cf6', 0.12) }}>{module?.label || project.moduleId}</span>
                          <span className="mono text-xs text-[var(--text-dim)]">ABRIR →</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-5">
              <div>
                <div className="eyebrow mb-2">Atalhos</div>
                <div className="font-display text-[30px] font-semibold text-[var(--text)]">Fluxo de edição veloz</div>
                <div className="mt-2 text-sm text-[var(--text-soft)]">Os comandos mais usados do editor agora ficam visíveis num painel mais limpo e escaneável.</div>
              </div>

              <div className="flex flex-wrap gap-2">
                {TABS.map(tab => <FilterChip key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}>{tab.label}</FilterChip>)}
              </div>

              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                {SHORTCUTS.map(([key, desc]) => (
                  <div key={key} className="ts-card flex items-center gap-3 rounded-[22px] px-4 py-4">
                    <kbd className="mono rounded-xl border border-violet-400/22 bg-violet-500/10 px-2.5 py-1.5 text-[11px] text-violet-200">{key}</kbd>
                    <span className="text-sm text-[var(--text-soft)]">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
