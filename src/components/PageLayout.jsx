import { AppIcon } from './ui/AppIcon';
import { IconRail } from './IconRail';
import { backendConfig, isRemoteBackendEnabled } from '../services/backend';

export function ThemeSwitch({ theme, toggleTheme }) {
  const items = [
    { id: 'light', label: 'Light', icon: 'themeLight' },
    { id: 'dark', label: 'Dark', icon: 'themeDark' },
  ];

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-slate-950/70 p-1 shadow-[0_10px_30px_rgba(2,8,23,0.25)]">
      {items.map(item => {
        const active = theme === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => !active && toggleTheme()}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? 'border border-violet-400/50 bg-violet-500/20 text-violet-100'
                : 'border border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AppIcon name={item.icon} className="h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export function UserChip({ user, onClick }) {
  const name = user?.name || 'Convidado';
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/70 py-1.5 pl-1.5 pr-3 text-left shadow-[0_10px_30px_rgba(2,8,23,0.25)] transition hover:border-white/20"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 via-rose-400 to-violet-500 text-sm font-bold text-white">
        {initial}
      </span>
      <span className="text-sm font-semibold text-slate-100">{name.split(' ')[0]}</span>
      <AppIcon name="down" className="h-4 w-4 text-slate-500" />
    </button>
  );
}

export function PageLayout({ active, icon = 'module', title, subtitle, onNavigate, theme, toggleTheme, user, onUserClick, children }) {
  return (
    <div className="techsim-shell flex h-screen overflow-hidden">
      <IconRail active={active} onNavigate={onNavigate} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="panel-glass mx-4 mt-4 flex flex-wrap items-center justify-between gap-4 rounded-[24px] px-5 py-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-500/30 to-indigo-500/20 text-white shadow-[0_0_30px_rgba(124,58,237,0.22)]">
              <AppIcon name={icon} className="h-6 w-6" />
            </div>
            <div>
              <div className="eyebrow">Techsim Platform</div>
              <div className="font-display text-lg font-semibold text-slate-100">{title}</div>
              {subtitle && <div className="mt-0.5 text-xs text-slate-500">{subtitle}</div>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-400">
              {isRemoteBackendEnabled() ? 'API remota' : 'Modo local'}
            </span>
            <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-400">{backendConfig.appName}</span>
            <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />
            <UserChip user={user} onClick={onUserClick} />
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-4 pt-4">
          {children}
        </div>
      </div>
    </div>
  );
}
