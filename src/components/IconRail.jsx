import { useState } from 'react';
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

const railButtonClass = isActive => `group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-all duration-200 ${
  isActive
    ? 'border-violet-400/70 bg-violet-500/20 text-violet-200 shadow-[0_0_20px_rgba(139,92,246,0.25)]'
    : 'border-transparent bg-transparent text-slate-500 hover:border-slate-700 hover:bg-slate-900/70 hover:text-slate-200'
}`;

export function getRailIcon(name, className = 'h-5 w-5') {
  return <AppIcon name={name} className={className} />;
}

export function IconRail({ active = 'edit', onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <aside className="flex h-full w-[28px] shrink-0 flex-col items-center border-r border-white/5 bg-[#070912] py-4">
        <button
          type="button"
          title="Expandir menu"
          aria-label="Expandir menu"
          onClick={() => setCollapsed(false)}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/8 bg-slate-950/70 text-slate-400 transition hover:border-violet-400/40 hover:text-violet-200"
        >
          <AppIcon name="collapse" className="h-3.5 w-3.5 rotate-180" />
        </button>
      </aside>
    );
  }

  return (
    <aside className="flex h-full w-[74px] shrink-0 flex-col items-center gap-3 overflow-hidden border-r border-white/5 bg-[#070912] px-3 py-4 transition-[width] duration-200">
      <button
        type="button"
        onClick={() => onNavigate?.('home')}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-500/35 to-indigo-500/25 text-white shadow-[0_0_24px_rgba(124,58,237,0.28)]"
        title="Techsim Platform"
      >
        <AppIcon name="module" className="h-5 w-5" />
      </button>

      <div className="editor-scroll mt-1 flex min-h-0 w-full flex-1 flex-col items-center gap-2 overflow-y-auto overflow-x-hidden py-1">
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
              {isActive && <span className="absolute -left-3 h-7 w-1 rounded-full bg-violet-400" />}
              {getRailIcon(item.icon)}
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex shrink-0 flex-col gap-2">
        <button
          type="button"
          title="Configurações"
          aria-label="Configurações"
          onClick={() => onNavigate?.('settings')}
          className={railButtonClass(false)}
        >
          {getRailIcon('settings')}
        </button>
        <button
          type="button"
          title="Recolher menu"
          aria-label="Recolher menu"
          onClick={() => setCollapsed(true)}
          className="flex h-8 w-12 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-slate-950/70 text-slate-500 transition hover:border-slate-700 hover:text-slate-300"
        >
          <AppIcon name="collapse" className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
