import { AppIcon } from './AppIcon';

export function SectionHero({ eyebrow, title, description, actions, aside, className = '' }) {
  return (
    <section className={`panel-glass techsim-hero-card relative overflow-hidden rounded-[26px] p-4 sm:p-5 ${className}`}>
      <div className="techsim-orb techsim-orb-violet" aria-hidden="true" />
      <div className="techsim-orb techsim-orb-cyan" aria-hidden="true" />
      <div className="relative z-[1] grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
        <div>
          {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
          <h1 className="font-display text-xl font-semibold leading-tight tracking-tight text-[var(--text)] sm:text-[26px]">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[var(--text-soft)] sm:text-sm">{description}</p>}
          {actions && <div className="mt-4 flex flex-wrap gap-2.5">{actions}</div>}
        </div>
        {aside ? (
          <div className="relative z-[1] lg:border-l lg:border-[var(--border)] lg:pl-5">
            {aside}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function MetricCard({ icon, label, value, hint, color = 'var(--accent)', compact = false }) {
  return (
    <div
      className={`techsim-stat-card group relative overflow-hidden rounded-2xl border p-3.5 ${compact ? 'min-h-[92px]' : 'min-h-[138px]'}`}
      style={{ borderColor: `color-mix(in srgb, ${color} 26%, var(--border))` }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `color-mix(in srgb, ${color} 30%, transparent)` }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className={`flex items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-105 ${compact ? 'h-9 w-9' : 'h-11 w-11'}`} style={{ color, borderColor: `color-mix(in srgb, ${color} 35%, transparent)`, background: `color-mix(in srgb, ${color} 15%, transparent)` }}>
          <AppIcon name={icon} className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
        </div>
        {!compact && <span className="techsim-kicker">live</span>}
      </div>
      <div className={`relative font-display font-semibold tracking-tight text-[var(--text)] tabular-nums ${compact ? 'mt-3 text-xl' : 'mt-5 text-2xl'}`}>{value}</div>
      <div className={`relative font-medium text-[var(--text-soft)] ${compact ? 'mt-0.5 text-xs' : 'mt-1 text-sm'}`}>{label}</div>
      {hint && !compact ? <div className="relative mt-3 text-xs leading-6 text-[var(--text-dim)]">{hint}</div> : null}
    </div>
  );
}

export function FilterChip({ active, onClick, children, color }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ts-pill cursor-pointer transition ${active ? 'shadow-[0_10px_24px_rgba(15,23,42,0.16)]' : 'opacity-90 hover:opacity-100'}`}
      style={active ? { color: color || 'var(--accent)', borderColor: `color-mix(in srgb, ${color || 'var(--accent)'} 36%, transparent)`, background: `color-mix(in srgb, ${color || 'var(--accent)'} 16%, transparent)` } : {}}
    >
      {children}
    </button>
  );
}

export function EmptyState({ icon = 'info', title, description, action }) {
  return (
    <div className="techsim-empty rounded-[24px] border border-dashed border-[var(--border)] bg-[color:var(--surface)]/70 p-10 text-center">
      <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-[color:var(--accent-soft)] text-[var(--accent)]">
        <div className="pointer-events-none absolute inset-0 -z-[1] rounded-2xl opacity-40 blur-lg" style={{ background: 'var(--accent)' }} />
        <AppIcon name={icon} className="h-6 w-6" />
      </div>
      <div className="mt-5 text-base font-semibold text-[var(--text)]">{title}</div>
      <div className="mx-auto mt-2 max-w-xl text-sm leading-7 text-[var(--text-soft)]">{description}</div>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ModuleBadge({ color, icon, label, meta }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3.5 py-3 transition-colors duration-200 hover:border-white/14">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border" style={{ color, borderColor: `color-mix(in srgb, ${color} 36%, transparent)`, background: `color-mix(in srgb, ${color} 15%, transparent)` }}>
        <AppIcon icon={icon} className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-[var(--text)]">{label}</div>
        {meta ? <div className="truncate text-xs text-[var(--text-dim)]">{meta}</div> : null}
      </div>
    </div>
  );
}
