import { AppIcon } from './ui/AppIcon';
import { Footer } from './Footer';

export function InfoPageShell({ eyebrow, title, description, onNavigate, onLogin, onRegister, children }) {
  return (
    <div className="techsim-shell relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      <nav className="techsim-nav-shell sticky top-0 z-[100] border-b border-white/8 px-5 backdrop-blur-xl sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 py-4">
          <button type="button" onClick={() => onNavigate('landing')} className="flex items-center gap-3 text-left">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-500/35 to-indigo-500/25 text-white shadow-[0_0_24px_rgba(139,92,246,0.26)]">
              <AppIcon name="module" className="h-5 w-5" />
            </span>
            <span>
              <span className="font-display block text-base font-semibold tracking-[0.18em] text-white">TECHSIM</span>
              <span className="mono block text-[10px] tracking-[0.3em] text-[var(--text-dim)]">INDUSTRIAL DESIGN SYSTEM</span>
            </span>
          </button>

          <button type="button" onClick={() => onNavigate('landing')} className="ts-btn ts-btn-ghost hidden items-center gap-2 rounded-full px-4 py-2 text-[10px] sm:inline-flex">
            <AppIcon name="back" className="h-3.5 w-3.5" />
            VOLTAR AO INÍCIO
          </button>

          <div className="flex items-center gap-2.5">
            <button type="button" onClick={onLogin} className="ts-btn ts-btn-ghost rounded-full px-5 py-2 text-[10px]">ENTRAR</button>
            <button type="button" onClick={onRegister} className="ts-btn ts-btn-primary rounded-full px-5 py-2 text-[10px]">CRIAR CONTA</button>
          </div>
        </div>
      </nav>

      <main className="relative z-[1] mx-auto flex max-w-[1320px] flex-col gap-6 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        <div className="max-w-2xl">
          {eyebrow && <div className="eyebrow mb-3">{eyebrow}</div>}
          <h1 className="font-display text-[clamp(28px,3.6vw,42px)] font-semibold leading-tight tracking-tight text-white">{title}</h1>
          {description && <p className="mt-3 text-[15px] leading-8 text-[var(--text-soft)]">{description}</p>}
        </div>
        {children}
      </main>

      <Footer onNavigate={onNavigate} onLogin={onLogin} onRegister={onRegister} />
    </div>
  );
}
