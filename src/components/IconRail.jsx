import { useMemo, useState } from 'react';
import { AppIcon } from './ui/AppIcon';

const RAIL_ITEMS = [
  { id: 'home', icon: 'home', label: 'Início' },
  { id: 'projects', icon: 'projects', label: 'Projetos' },
  { id: 'edit', icon: 'edit', label: 'Editor' },
  { id: 'data', icon: 'data', label: 'Dados' },
  { id: 'models', icon: 'models', label: 'Modelos' },
  { id: 'reports', icon: 'reports', label: 'Relatórios' },
  { id: 'media', icon: 'media', label: 'Mídia' },
];

const railButtonClass = isActive => `group relative flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all duration-200 ${
  isActive
    ? 'border-violet-400/55 bg-violet-500/16 text-violet-100 shadow-[0_10px_24px_rgba(139,92,246,0.18)]'
    : 'border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.03] hover:text-white'
}`;

export function getRailIcon(name, className = 'h-5 w-5') {
  return <AppIcon name={name} className={className} />;
}

function MobileRail({ active, onNavigate }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-[160] px-3 lg:hidden">
      <nav className="pointer-events-auto mx-auto flex max-w-[760px] items-center justify-between gap-1 rounded-[26px] border border-white/10 bg-[#070a12]/92 p-2 shadow-[0_24px_60px_rgba(2,8,23,0.45)] backdrop-blur-2xl">
        {RAIL_ITEMS.map(item => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onNavigate?.(item.id)}
              className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 text-center transition-all duration-200 ${isActive ? 'bg-violet-500/16 text-violet-100 shadow-[0_10px_24px_rgba(139,92,246,0.18)]' : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'}`}
            >
              {isActive && <span className="absolute inset-x-5 top-0 h-px rounded-full bg-gradient-to-r from-transparent via-violet-300 to-transparent" />}
              <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${isActive ? 'bg-violet-500/18 text-violet-200' : 'bg-white/[0.03]'}`}>
                {getRailIcon(item.icon, 'h-4 w-4')}
              </span>
              <span className="truncate text-[10px] font-semibold tracking-[0.14em] uppercase">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export function IconRail({ active = 'edit', onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const activeItem = useMemo(() => RAIL_ITEMS.find(item => item.id === active), [active]);

  return (
    <>
      <MobileRail active={active} onNavigate={onNavigate} />

      {collapsed ? (
        <aside className="techsim-nav-shell hidden h-full w-[84px] shrink-0 flex-col items-center gap-4 border-r border-white/8 px-3 py-4 lg:flex">
          <button
            type="button"
            onClick={() => onNavigate?.('home')}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-500/35 to-indigo-500/25 text-white shadow-[0_0_24px_rgba(124,58,237,0.24)]"
            title="Techsim"
          >
            <AppIcon name="module" className="h-5 w-5" />
          </button>
          <button
            type="button"
            title="Expandir navegação"
            aria-label="Expandir navegação"
            onClick={() => setCollapsed(false)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-300 transition hover:border-violet-400/40 hover:text-violet-200"
          >
            <AppIcon name="collapse" className="h-4 w-4 rotate-180" />
          </button>
          <div className="flex flex-1 flex-col items-center gap-2 pt-2">
            {RAIL_ITEMS.map(item => {
              const isActive = item.id === active;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={item.label}
                  aria-label={item.label}
                  onClick={() => onNavigate?.(item.id)}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-2xl border transition ${isActive ? 'border-violet-400/55 bg-violet-500/16 text-violet-100' : 'border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.03] hover:text-white'}`}
                >
                  {isActive && <span className="absolute -left-3 h-7 w-1 rounded-full bg-violet-400" />}
                  {getRailIcon(item.icon)}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            title="Configurações"
            aria-label="Configurações"
            onClick={() => onNavigate?.('settings')}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-transparent text-slate-400 transition hover:border-white/10 hover:bg-white/[0.03] hover:text-white"
          >
            {getRailIcon('settings')}
          </button>
        </aside>
      ) : (
        <aside className="techsim-nav-shell hidden h-full w-[112px] shrink-0 flex-col border-r border-white/8 px-3 py-4 transition-[width] duration-200 lg:flex xl:w-[196px]">
          <button type="button" onClick={() => onNavigate?.('home')} className="rounded-[24px] border border-violet-400/28 bg-gradient-to-br from-violet-500/28 to-indigo-500/18 px-3 py-3 text-left shadow-[0_0_26px_rgba(124,58,237,0.18)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/12 bg-white/[0.05] text-white">
                <AppIcon name="module" className="h-5 w-5" />
              </div>
              <div className="hidden min-w-0 xl:block">
                <div className="font-display text-sm font-semibold tracking-[0.18em] text-white">TECHSIM</div>
                <div className="mono text-[9px] tracking-[0.24em] text-slate-500">CONTROL</div>
              </div>
            </div>
          </button>

          <div className="mt-4 rounded-[24px] border border-white/8 bg-white/[0.03] px-3 py-3 text-left">
            <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Vista ativa</div>
            <div className="mt-1.5 text-sm font-semibold text-white">{activeItem?.label || 'Editor'}</div>
          </div>

          <div className="editor-scroll mt-4 flex min-h-0 flex-1 flex-col justify-center gap-2 overflow-y-auto pr-1">
            {RAIL_ITEMS.map(item => {
              const isActive = item.id === active;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={item.label}
                  aria-label={item.label}
                  onClick={() => onNavigate?.(item.id)}
                  className={railButtonClass(isActive)}
                >
                  {isActive && <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-violet-400" />}
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${isActive ? 'bg-violet-500/16 text-violet-200' : 'bg-white/[0.03] text-slate-400 group-hover:text-white'}`}>
                    {getRailIcon(item.icon)}
                  </span>
                  <span className="hidden text-sm font-medium xl:block">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto flex flex-col gap-2 border-t border-white/8 pt-3">
            <button type="button" onClick={() => onNavigate?.('settings')} className={railButtonClass(active === 'settings')}>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${active === 'settings' ? 'bg-violet-500/16 text-violet-200' : 'bg-white/[0.03] text-slate-400'}`}>
                {getRailIcon('settings')}
              </span>
              <span className="hidden text-sm font-medium xl:block">Configurações</span>
            </button>
            <button
              type="button"
              title="Recolher menu"
              aria-label="Recolher menu"
              onClick={() => setCollapsed(true)}
              className="flex h-11 w-full items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-slate-400 transition hover:border-white/15 hover:text-white"
            >
              <AppIcon name="collapse" className="h-4 w-4" />
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
