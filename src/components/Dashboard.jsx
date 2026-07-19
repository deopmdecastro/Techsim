import { useMemo, useState } from "react";
import { hexToRgba, shiftHex } from "../constants";
import { MODS_ALL } from "../data/modules";
import { AppIcon } from './ui/AppIcon';

const MODULES = MODS_ALL.map(module => ({
  ...module,
  docs: module.desc,
}));

const SHORTCUTS = [
  ["Ctrl/Cmd + Z", "Desfazer"], ["Ctrl/Cmd + Y", "Refazer"], ["Ctrl/Cmd + S", "Salvar projeto"],
  ["Ctrl/Cmd + D", "Duplicar seleção"], ["Ctrl/Cmd + G", "Agrupar seleção"], ["Ctrl/Cmd + Shift + G", "Desagrupar"],
  ["Delete", "Excluir seleção"], ["F9", "Calcular circuito"], ["F5", "Iniciar/parar simulação"],
  ["/", "Focar busca de componentes"], ["Esc", "Cancelar ação / limpar seleção"], ["?", "Ajuda de atalhos no editor"],
];

const TABS = [
  { id: "modules", icon: "module", label: "Módulos" },
  { id: "projects", icon: "projects", label: "Projetos recentes" },
  { id: "shortcuts", icon: "settings", label: "Atalhos" },
];

const pluralize = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;

function ModuleCard({ module, presetCount, projectCount, onOpenModule, onOpenPreset }) {
  return (
    <div
      className="ts-card group relative flex flex-col gap-4 overflow-hidden p-5"
      style={{ borderColor: hexToRgba(module.color, 0.2) }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-14 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: hexToRgba(module.color, 0.35) }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-[26px]"
            style={{
              background: `linear-gradient(180deg, ${hexToRgba(module.color, 0.3)}, ${hexToRgba(module.color, 0.04)})`,
              border: `1px solid ${hexToRgba(module.color, 0.36)}`,
              color: module.color,
              textShadow: `0 0 20px ${hexToRgba(module.color, 0.5)}`,
            }}
          >
            {module.icon}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-bold" style={{ color: module.color }}>{module.label}</div>
            <div className="mt-1 text-[10px] leading-relaxed text-[var(--text-soft)]">{module.desc}</div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span
            className="ts-pill whitespace-nowrap"
            style={{ color: module.color, borderColor: hexToRgba(module.color, 0.3), background: hexToRgba(module.color, 0.12) }}
          >
            {pluralize(presetCount, "preset", "presets")}
          </span>
          <span className="ts-pill whitespace-nowrap">{pluralize(projectCount, "projeto", "projetos")}</span>
        </div>
      </div>

      <p className="min-h-[32px] text-[11px] leading-relaxed text-[var(--text-soft)] opacity-80">{module.docs}</p>

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <button
          onClick={() => onOpenModule(module.id)}
          className="ts-btn px-3.5 py-2.5 text-[10px]"
          style={{ background: `linear-gradient(135deg, ${module.color}, ${shiftHex(module.color, -0.12)})`, color: "#04030a" }}
        >
          ABRIR EDITOR
        </button>
        <button
          onClick={() => onOpenPreset(module.id)}
          className="ts-btn px-3.5 py-2.5 text-[10px]"
          style={{ background: "var(--surface)", color: module.color, border: `1px solid ${hexToRgba(module.color, 0.36)}` }}
        >
          ABRIR PRESET
        </button>
        {module.wiki && (
          <a
            href={module.wiki}
            target="_blank"
            rel="noreferrer"
            className="ts-btn ts-btn-ghost inline-flex items-center gap-1.5 px-3.5 py-2.5 text-[10px]"
          >
            <AppIcon name="wiki" className="h-3.5 w-3.5" />
            WIKIPEDIA
          </a>
        )}
      </div>
    </div>
  );
}

export function Dashboard({ user, onLogout, onOpenModule, onOpenPreset, onAdmin, presetCatalog = {}, recentProjects = [] }) {
  const [activeTab, setActiveTab] = useState("modules");
  const [search, setSearch] = useState("");
  const isAdmin = user?.role === "admin";

  const stats = useMemo(() => {
    const presetCount = Object.values(presetCatalog).reduce((sum, list) => sum + (list?.length || 0), 0);
    return [
      { label: "Módulos", value: String(MODULES.length), icon: "module", color: "#22d3ee" },
      { label: "Presets", value: String(presetCount), icon: "projects", color: "#4ade80" },
      { label: "Projetos", value: String(recentProjects.length), icon: "data", color: "#f59e0b" },
      { label: "Views", value: "2D/3D", icon: "edit", color: "#a78bfa" },
    ];
  }, [presetCatalog, recentProjects.length]);

  const projectsByModule = useMemo(() => {
    return recentProjects.reduce((acc, item) => {
      acc[item.moduleId] = (acc[item.moduleId] || 0) + 1;
      return acc;
    }, {});
  }, [recentProjects]);

  const filteredModules = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MODULES;
    return MODULES.filter(module =>
      module.label.toLowerCase().includes(q) || module.desc.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden" style={{ fontFamily: "var(--font-body)" }}>
      <div className="grid min-h-0 flex-1 grid-cols-[260px_1fr] gap-4 overflow-hidden">
        {/* Sidebar */}
        <aside className="ts-card flex flex-col gap-4 overflow-y-auto p-4">
          <div
            className="rounded-[16px] p-4"
            style={{ background: "linear-gradient(150deg, var(--panel-2), var(--surface))", border: "1px solid var(--border-strong)" }}
          >
            <div className="eyebrow mb-2">Olá, {user.name.split(" ")[0]}</div>
            <div className="mb-1.5 font-display text-lg font-semibold leading-tight text-[var(--text)]">
              Seu laboratório visual está pronto.
            </div>
            <div className="text-[11px] leading-relaxed text-[var(--text-soft)]">
              Abra um módulo do zero ou comece por um projeto pronto por disciplina.
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[11px] font-semibold tracking-wide transition ${
                    active
                      ? "border border-violet-400/40 bg-violet-500/15 text-violet-200 shadow-[0_0_18px_rgba(139,92,246,0.16)]"
                      : "border border-transparent text-[var(--text-soft)] hover:border-[var(--border)] hover:bg-white/[0.03] hover:text-[var(--text)]"
                  }`}
                >
                  <AppIcon name={tab.icon} className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-3">
            {stats.map((item, i) => (
              <div
                key={item.label}
                className={`flex items-center justify-between py-2 ${i < stats.length - 1 ? "border-b border-[var(--border)]" : ""}`}
              >
                <span className="flex items-center gap-2 text-[10px] text-[var(--text-soft)]">
                  <AppIcon name={item.icon} className="h-3.5 w-3.5" />
                  {item.label}
                </span>
                <span className="mono text-[11px] font-bold" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-2">
            {isAdmin && (
              <button
                onClick={onAdmin}
                className="ts-btn flex items-center justify-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2.5 text-[10px] text-rose-300 hover:border-rose-400/50"
              >
                <AppIcon name="admin" className="h-3.5 w-3.5" />
                PAINEL ADMIN
              </button>
            )}
            <button
              onClick={onLogout}
              className="ts-btn ts-btn-ghost flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[10px]"
            >
              <AppIcon name="logout" className="h-3.5 w-3.5" />
              SAIR
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="dashboard-blueprint min-h-0 flex-1 overflow-y-auto rounded-[18px] border border-[var(--border)] bg-[var(--panel)]/40 p-6">
          {activeTab === "modules" && (
            <>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="eyebrow mb-2">Módulos e presets</div>
                  <div className="font-display text-[28px] font-semibold leading-tight text-[var(--text)]">
                    Entre rápido em cada disciplina
                  </div>
                  <div className="mt-1.5 text-[11px] text-[var(--text-soft)]">
                    Cada módulo já nasce com presets prontos e estrutura preparada para projetos persistentes.
                  </div>
                </div>
                <div className="relative">
                  <AppIcon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-dim)]" />
                  <input
                    type="text"
                    placeholder="Pesquisar módulo…"
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    aria-label="Pesquisar módulo"
                    className="w-64 rounded-full border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-10 pr-4 text-[11px] text-[var(--text)] outline-none transition focus:border-violet-400/50"
                  />
                </div>
              </div>

              {filteredModules.length ? (
                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
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
                <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-[11px] leading-relaxed text-[var(--text-soft)]">
                  Nenhum módulo corresponde a "{search}". Tenta outro termo de pesquisa.
                </div>
              )}
            </>
          )}

          {activeTab === "projects" && (
            <div>
              <div className="eyebrow mb-2">Projetos recentes</div>
              <div className="mb-5 font-display text-[28px] font-semibold text-[var(--text)]">Continue de onde parou</div>
              {!recentProjects.length ? (
                <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-[11px] leading-relaxed text-[var(--text-soft)]">
                  Nenhum projeto salvo ainda. Abra um módulo, carregue um preset e salve sua primeira base.
                </div>
              ) : (
                <div className="grid gap-2.5">
                  {recentProjects.map(project => {
                    const module = MODULES.find(item => item.id === project.moduleId);
                    return (
                      <button
                        key={project.id}
                        onClick={() => onOpenModule(project.moduleId, project.id)}
                        className="ts-card flex items-center justify-between gap-4 px-5 py-4 text-left"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-[12px] font-bold" style={{ color: module?.color || "var(--text)" }}>
                            {project.name}
                          </div>
                          <div className="mt-1 truncate text-[10px] text-[var(--text-soft)]">{project.summary}</div>
                          <div className="mt-1.5 text-[9px] text-[var(--text-dim)]">
                            {module?.label || project.moduleId} · {new Date(project.updatedAt).toLocaleString("pt-BR")}
                          </div>
                        </div>
                        <div className="mono shrink-0 text-[10px] tracking-wider" style={{ color: module?.color || "var(--text-soft)" }}>
                          ABRIR →
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "shortcuts" && (
            <div>
              <div className="eyebrow mb-2">Atalhos</div>
              <div className="mb-5 font-display text-[28px] font-semibold text-[var(--text)]">Fluxo de edição veloz</div>
              <div className="grid gap-2.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", maxWidth: 920 }}>
                {SHORTCUTS.map(([key, desc]) => (
                  <div key={key} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-3">
                    <kbd className="mono rounded-md border border-[var(--border)] bg-[var(--panel)] px-2 py-1 text-[9px] text-violet-300">{key}</kbd>
                    <span className="text-[10px] text-[var(--text-soft)]">{desc}</span>
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
