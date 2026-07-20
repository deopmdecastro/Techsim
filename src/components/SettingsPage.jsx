import { backendConfig, isRemoteBackendEnabled } from '../services/backend';
import { AppIcon } from './ui/AppIcon';
import { ThemeSwitch } from './PageLayout';
import { MetricCard, SectionHero } from './ui/WorkspacePrimitives';

export function SettingsPage({ user, theme, toggleTheme, onLogout, onOpenAdmin }) {
  return (
    <div className="flex flex-col gap-5">
      <SectionHero
        eyebrow="Configurações"
        title="Preferências da conta"
        description="Conta, aparência e contexto do sistema organizados em um painel mais limpo, com foco em leitura e ações rápidas."
        actions={<button type="button" onClick={onLogout} className="ts-btn rounded-full border border-rose-400/30 bg-rose-500/10 px-5 py-3 text-[10px] text-rose-200">TERMINAR SESSÃO</button>}
        aside={<MetricCard icon="settings" label="Tema atual" value={theme === 'dark' ? 'Dark' : 'Light'} hint="altere a aparência sem sair do fluxo" color="#8b5cf6" compact />}
      />

      <section className="grid gap-4 lg:grid-cols-3">
        <MetricCard icon="user" label="Conta" value={user?.role === 'admin' ? 'Admin' : 'Usuário'} hint={user?.email || 'sem e-mail'} color="#22d3ee" compact />
        <MetricCard icon="module" label="Backend" value={isRemoteBackendEnabled() ? 'Remoto' : 'Local'} hint="contexto atual da aplicação" color="#4ade80" compact />
        <MetricCard icon="overview" label="Aplicação" value={backendConfig.appName} hint="identidade do ambiente" color="#f59e0b" compact />
      </section>

      <section className="panel-glass rounded-[28px] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 via-rose-400 to-violet-500 text-xl font-bold text-white shadow-[0_12px_34px_rgba(244,114,182,0.25)]">{(user?.name || '?').trim().charAt(0).toUpperCase()}</span>
            <div>
              <div className="text-lg font-semibold text-[var(--text)]">{user?.name || 'Convidado'}</div>
              <div className="text-sm text-[var(--text-soft)]">{user?.email || 'sem email'}</div>
            </div>
          </div>
          <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />
        </div>
      </section>

      <section className="panel-glass rounded-[28px] p-6">
        <div className="mb-4 text-lg font-semibold text-[var(--text)]">Sistema</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
            <div className="text-[11px] uppercase tracking-widest text-[var(--text-dim)]">Backend</div>
            <div className="mt-2 text-sm text-[var(--text)]">{isRemoteBackendEnabled() ? 'API remota' : 'Modo local'}</div>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
            <div className="text-[11px] uppercase tracking-widest text-[var(--text-dim)]">Aplicação</div>
            <div className="mt-2 text-sm text-[var(--text)]">{backendConfig.appName}</div>
          </div>
        </div>
        {onOpenAdmin && (
          <button type="button" onClick={onOpenAdmin} className="ts-btn mt-4 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/15 px-4 py-3 text-[10px] text-violet-100 transition hover:bg-violet-500/25">
            <AppIcon name="settings" className="h-4 w-4" />
            ABRIR PAINEL DE ADMINISTRAÇÃO
          </button>
        )}
      </section>
    </div>
  );
}
