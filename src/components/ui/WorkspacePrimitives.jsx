import { AppIcon } from './AppIcon';

export function SectionHero({ eyebrow, title, description, actions, aside, className = '' }) {
  return (
    <section className={`panel-glass techsim-hero-card relative overflow-hidden rounded-[30px] p-6 sm:p-7 ${className}`}>
      <div className="techsim-orb techsim-orb-violet" aria-hidden="true" />
      <div className="techsim-orb techsim-orb-cyan" aria-hidden="true" />
      <div className="relative z-[1] grid gap-7 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
        <div>
          {eyebrow && <div className="eyebrow mb-3">{eyebrow}</div>}
          <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-[var(--text)] sm:text-3xl">{title}</h1>
          {description && <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-soft)] sm:text-[15px]">{description}</p>}
          {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
        </div>
        {aside ? (
          <div className="relative z-[1] lg:border-l lg:border-[var(--border)] lg:pl-6">
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
      className={`techsim-stat-card group relative overflow-hidden rounded-[24px] border p-4 ${compact ? 'min-h-[120px]' : 'min-h-[138px]'}`}
      style={{ borderColor: `color-mix(in srgb, ${color} 26%, var(--border))` }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `color-mix(in srgb, ${color} 30%, transparent)` }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-105" style={{ color, borderColor: `color-mix(in srgb, ${color} 35%, transparent)`, background: `color-mix(in srgb, ${color} 15%, transparent)` }}>
          <AppIcon name={icon} className="h-5 w-5" />
        </div>
        <span className="techsim-kicker">live</span>
      </div>
      <div className="relative mt-5 font-display text-2xl font-semibold tracking-tight text-[var(--text)] tabular-nums">{value}</div>
      <div className="relative mt-1 text-sm font-medium text-[var(--text-soft)]">{label}</div>
      {hint ? <div className="relative mt-3 text-xs leading-6 text-[var(--text-dim)]">{hint}</div> : null}
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
