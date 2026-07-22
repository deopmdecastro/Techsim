import { useMemo, useState } from 'react';
import { MODS_ALL } from '../data/modules';
import { AppIcon } from './ui/AppIcon';
import { MetricCard, ModuleBadge } from './ui/WorkspacePrimitives';

const BRAND = '#8b5cf6';
const CYAN = '#22d3ee';

const WORKFLOWS = [
  { step: '01', title: 'Escolha o domínio', copy: 'Abra elétrica, pneumática, hidráulica, PLC ou lógica digital com bibliotecas dedicadas.' },
  { step: '02', title: 'Monte no canvas', copy: 'Use drag-and-drop, presets, camadas, páginas e grids inteligentes para estruturar o diagrama.' },
  { step: '03', title: 'Simule e documente', copy: 'Calcule em tempo real, exporte em PNG/JSON/SVG e retome projetos do ponto exato.' },
];

const HIGHLIGHTS = [
  { icon: 'live', title: 'Simulação em tempo real', copy: 'Feedback imediato de estados energizados, métricas e diagnóstico lógico.' },
  { icon: 'layersPanel', title: 'Projetos escaláveis', copy: 'Camadas, páginas, agrupamentos e colaboração preparados para fluxos maiores.' },
  { icon: 'reports', title: 'Pronto para produção', copy: 'Modo claro/escuro, biblioteca de símbolos industrial e backend próprio, prontos desde o primeiro projeto.' },
];

export function LandingPage({ onLogin, onRegister }) {
  const [hovered, setHovered] = useState(null);

  const modules = useMemo(() => MODS_ALL.map(module => ({
    id: module.id,
    label: module.label,
    desc: module.desc,
    color: module.color,
    icon: module.iconify,
    wiki: module.wiki,
  })), []);

  return (
    <div className="techsim-shell relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      <nav className="techsim-nav-shell sticky top-0 z-[100] border-b border-white/8 px-5 backdrop-blur-xl sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 py-4">
          <button type="button" onClick={onRegister} className="flex items-center gap-3 text-left">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-500/35 to-indigo-500/25 text-white shadow-[0_0_24px_rgba(139,92,246,0.26)]">
              <AppIcon name="module" className="h-5 w-5" />
            </span>
            <span>
              <span className="font-display block text-base font-semibold tracking-[0.18em] text-white">TECHSIM</span>
              <span className="mono block text-[10px] tracking-[0.3em] text-[var(--text-dim)]">INDUSTRIAL DESIGN SYSTEM</span>
            </span>
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 lg:flex">
            <span className="techsim-kicker">9 módulos</span>
            <span className="techsim-kicker">2D + 3D</span>
            <span className="techsim-kicker">engine live</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button type="button" onClick={onLogin} className="ts-btn ts-btn-ghost rounded-full px-5 py-2 text-[10px]">ENTRAR</button>
            <button type="button" onClick={onRegister} className="ts-btn ts-btn-primary rounded-full px-5 py-2 text-[10px]">CRIAR CONTA</button>
          </div>
        </div>
      </nav>

      <main className="relative z-[1] mx-auto flex max-w-[1320px] flex-col gap-6 px-5 py-6 sm:px-8 lg:px-12 lg:py-8">
        <section className="panel-glass techsim-hero-card relative overflow-hidden rounded-[34px] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="techsim-orb techsim-orb-violet" aria-hidden="true" />
          <div className="techsim-orb techsim-orb-cyan" aria-hidden="true" />
          <div className="relative z-[1] grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_500px] xl:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-200">
                <span className="h-2 w-2 rounded-full bg-cyan-300 pulse-dot" />
                Plataforma industrial completa
              </div>
              <h1 className="font-display max-w-2xl text-[clamp(32px,4vw,52px)] font-semibold leading-[1.08] tracking-tight text-white">
                O cockpit visual para <span className="bg-gradient-to-r from-violet-200 via-white to-cyan-200 bg-clip-text text-transparent">projetar, simular e documentar</span> sistemas industriais.
              </h1>
              <p className="mt-5 max-w-2xl text-[15px] leading-8 text-[var(--text-soft)] sm:text-base">
                Monte diagramas elétricos, pneumáticos, hidráulicos e de automação com presets prontos por disciplina, calcule o circuito em tempo real e exporte a documentação — tudo sem sair de um único editor.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button type="button" onClick={onRegister} className="ts-btn ts-btn-primary rounded-full px-7 py-3 text-[11px]">COMEÇAR AGORA</button>
                <button type="button" onClick={onLogin} className="ts-btn ts-btn-ghost rounded-full px-7 py-3 text-[11px]">VER WORKSPACE</button>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <MetricCard icon="module" label="Módulos especializados" value={String(modules.length)} hint="Elétrica, automação, lógica, instalações, pneumática e mais." color={BRAND} compact />
                <MetricCard icon="overview" label="Fluxos de visualização" value="2D / 3D" hint="Alterne entre esquema técnico 2D e vista espacial 3D do painel." color={CYAN} compact />
                <MetricCard icon="save" label="Saídas de projeto" value="PNG · SVG · JSON" hint="Documente, salve e retome o trabalho em qualquer etapa." color="#4ade80" compact />
              </div>
            </div>

            <div className="grid gap-4">
              <div className="ts-card overflow-hidden rounded-[30px] border-white/10 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="eyebrow">Workspace preview</div>
                    <div className="mt-1 text-lg font-semibold text-white">Cockpit de projeto e módulos</div>
                  </div>
                  <span className="techsim-kicker">live engine</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {modules.slice(0, 4).map(module => (
                    <ModuleBadge key={module.id} color={module.color} icon={module.icon} label={module.label} meta={module.desc} />
                  ))}
                </div>
                <div className="mt-4 rounded-[24px] border border-white/8 bg-black/20 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Pipeline de engenharia</span>
                    <span className="text-xs text-[var(--text-dim)]">tempo real</span>
                  </div>
                  <div className="space-y-3">
                    {WORKFLOWS.map(item => (
                      <div key={item.step} className="flex items-start gap-3 rounded-2xl border border-white/7 bg-white/[0.03] px-3.5 py-3">
                        <span className="mono rounded-xl border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-200">{item.step}</span>
                        <div>
                          <div className="text-sm font-semibold text-white">{item.title}</div>
                          <div className="mt-1 text-xs leading-6 text-[var(--text-soft)]">{item.copy}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="panel-glass rounded-[30px] p-6 sm:p-7">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <div className="eyebrow">Disciplinas</div>
                <h2 className="font-display mt-2 text-2xl font-semibold text-white">Cobertura completa do stack de engenharia</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-soft)]">Cada módulo já entra com paleta de componentes própria, presets prontos e wiki de referência — abre e começa a montar em segundos.</p>
              </div>
              <button type="button" onClick={onRegister} className="ts-btn ts-btn-ghost rounded-full px-5 py-2 text-[10px]">ABRIR DASHBOARD</button>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {modules.map((module, index) => {
                const active = hovered === index;
                return (
                  <button
                    key={module.id}
                    type="button"
                    onMouseEnter={() => setHovered(index)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={onRegister}
                    className="ts-card group relative overflow-hidden rounded-[24px] p-4 text-left"
                    style={{ borderColor: active ? `${module.color}66` : undefined }}
                  >
                    <div className="absolute inset-x-0 top-0 h-px opacity-80" style={{ background: `linear-gradient(90deg, transparent, ${module.color}, transparent)` }} />
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border" style={{ color: module.color, borderColor: `${module.color}44`, background: `${module.color}1a` }}>
                        <AppIcon icon={module.icon} className="h-5 w-5" />
                      </div>
                      <span className="techsim-kicker">{String(index + 1).padStart(2, '0')}</span>
                    </div>
                    <div className="mt-4 text-base font-semibold" style={{ color: active ? module.color : 'var(--text)' }}>{module.label}</div>
                    <div className="mt-2 text-sm leading-7 text-[var(--text-soft)]">{module.desc}</div>
                    <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium" style={{ color: module.color }}>
                      Abrir módulo
                      <AppIcon name="link" className="h-3.5 w-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4">
            {HIGHLIGHTS.map(item => (
              <div key={item.title} className="panel-glass rounded-[28px] p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04] text-violet-200">
                  <AppIcon name={item.icon} className="h-5 w-5" />
                </div>
                <div className="mt-4 text-lg font-semibold text-white">{item.title}</div>
                <div className="mt-2 text-sm leading-7 text-[var(--text-soft)]">{item.copy}</div>
              </div>
            ))}
            <div className="panel-glass techsim-hero-card rounded-[28px] p-5">
              <div className="eyebrow">Entrega contínua</div>
              <div className="mt-2 text-xl font-semibold text-white">Construa, teste e exporte sem fricção.</div>
              <div className="mt-2 text-sm leading-7 text-[var(--text-soft)]">A experiência foi desenhada para parecer uma suíte industrial: menos ruído visual, hierarquia mais clara e chamadas de ação mais objetivas.</div>
              <button type="button" onClick={onRegister} className="ts-btn ts-btn-primary mt-5 rounded-full px-6 py-3 text-[10px]">CRIAR CONTA GRÁTIS</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
