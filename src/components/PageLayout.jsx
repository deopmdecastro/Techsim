import { AppIcon } from './ui/AppIcon';
import { IconRail } from './IconRail';
import { backendConfig, isRemoteBackendEnabled } from '../services/backend';

export function ThemeSwitch({ theme, toggleTheme }) {
  const items = [
    { id: 'light', label: 'Light', icon: 'themeLight' },
    { id: 'dark', label: 'Dark', icon: 'themeDark' },
  ];

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 shadow-[0_10px_30px_rgba(2,8,23,0.2)]">
      {items.map(item => {
        const active = theme === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => !active && toggleTheme()}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? 'border border-violet-400/45 bg-violet-500/18 text-violet-100'
                : 'border border-transparent text-[var(--text-dim)] hover:text-[var(--text)]'
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
  const firstName = name.split(' ')[0];
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-3 text-left shadow-[0_10px_30px_rgba(2,8,23,0.2)] transition hover:border-white/20"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 via-rose-400 to-violet-500 text-sm font-bold text-white shadow-[0_8px_24px_rgba(244,114,182,0.25)]">
        {initial}
      </span>
      <span>
        <span className="block text-sm font-semibold text-[var(--text)]">{firstName}</span>
        <span className="block text-[11px] text-[var(--text-dim)]">{user?.role === 'admin' ? 'Administrador' : 'Workspace ativo'}</span>
      </span>
      <AppIcon name="down" className="h-4 w-4 text-[var(--text-dim)]" />
    </button>
  );
}

export function PageLayout({ active, icon = 'module', title, subtitle, onNavigate, theme, toggleTheme, user, onUserClick, children }) {
  return (
    <div className="techsim-shell flex h-screen overflow-hidden">
      <IconRail active={active} onNavigate={onNavigate} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden px-4 pb-4 pt-4">
        <header className="panel-glass techsim-hero-card relative overflow-hidden rounded-[30px] px-5 py-5 sm:px-6">
          <div className="techsim-orb techsim-orb-violet" aria-hidden="true" />
          <div className="relative z-[1] flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-violet-400/25 bg-gradient-to-br from-violet-500/28 to-indigo-500/18 text-white shadow-[0_0_32px_rgba(124,58,237,0.16)]">
                <AppIcon name={icon} className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <div className="eyebrow">Techsim Platform</div>
                <div className="font-display truncate text-xl font-semibold text-[var(--text)]">{title}</div>
                {subtitle && <div className="mt-1 text-sm text-[var(--text-soft)]">{subtitle}</div>}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <span className="techsim-kicker">{isRemoteBackendEnabled() ? 'API remota' : 'Modo local'}</span>
              <span className="techsim-kicker">{backendConfig.appName}</span>
              <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />
              <UserChip user={user} onClick={onUserClick} />
            </div>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-auto pt-4">
          {children}
        </div>
      </div>
    </div>
  );
}
