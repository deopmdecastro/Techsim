import { backendConfig, isRemoteBackendEnabled } from '../services/backend';
import { AppIcon } from './ui/AppIcon';
import { ThemeSwitch } from './PageLayout';

export function SettingsPage({ user, theme, toggleTheme, onLogout, onOpenAdmin }) {
  return (
    <div className="flex flex-col gap-5">
      <section className="panel-glass rounded-[24px] p-6">
        <div className="eyebrow">Configurações</div>
        <h1 className="font-display text-xl font-semibold text-slate-100">Preferências da conta</h1>
        <p className="mt-1 text-sm text-slate-400">Gere a tua conta, aparência e acesso ao painel de administração.</p>
      </section>

      <section className="ts-card flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 via-rose-400 to-violet-500 text-lg font-bold text-white">
            {(user?.name || '?').trim().charAt(0).toUpperCase()}
          </span>
          <div>
            <div className="text-sm font-semibold text-slate-100">{user?.name || 'Convidado'}</div>
            <div className="text-xs text-slate-500">{user?.email || 'sem email'}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
        >
          <AppIcon name="back" className="h-4 w-4" />
          Terminar sessão
        </button>
      </section>

      <section className="ts-card flex flex-wrap items-center justify-between gap-4 p-6">
        <div>
          <div className="text-sm font-semibold text-slate-100">Aparência</div>
          <div className="text-xs text-slate-500">Escolhe entre modo claro e escuro.</div>
        </div>
        <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />
      </section>

      <section className="ts-card flex flex-col gap-3 p-6">
        <div className="text-sm font-semibold text-slate-100">Sistema</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/8 bg-slate-950/60 p-4">
            <div className="text-[11px] uppercase tracking-widest text-slate-500">Backend</div>
            <div className="mt-1 text-sm text-slate-200">{isRemoteBackendEnabled() ? 'API remota' : 'Modo local'}</div>
          </div>
          <div className="rounded-xl border border-white/8 bg-slate-950/60 p-4">
            <div className="text-[11px] uppercase tracking-widest text-slate-500">Aplicação</div>
            <div className="mt-1 text-sm text-slate-200">{backendConfig.appName}</div>
          </div>
        </div>
        {onOpenAdmin && (
          <button
            type="button"
            onClick={onOpenAdmin}
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/15 px-4 py-2 text-xs font-semibold text-violet-100 transition hover:bg-violet-500/25"
          >
            <AppIcon name="settings" className="h-4 w-4" />
            Abrir painel de administração
          </button>
        )}
      </section>
    </div>
  );
}
