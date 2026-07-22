import { AppIcon } from './ui/AppIcon';

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const COLUMNS = [
  {
    title: 'Produto',
    links: [
      { label: 'Disciplinas e módulos', action: 'scroll', target: 'modules' },
      { label: 'Como funciona', action: 'scroll', target: 'workflow' },
      { label: 'Criar conta', action: 'register' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: 'Documentação', action: 'page', target: 'docs' },
      { label: 'Atalhos de teclado', action: 'page', target: 'docs', hash: 'atalhos' },
      { label: 'Entrar no workspace', action: 'login' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre o Techsim', action: 'page', target: 'about' },
      { label: 'Contacto', action: 'page', target: 'contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Termos de uso', action: 'page', target: 'terms' },
      { label: 'Política de privacidade', action: 'page', target: 'privacy' },
    ],
  },
];

export function Footer({ onNavigate, onLogin, onRegister }) {
  const handleLink = link => {
    if (link.action === 'scroll') { scrollToId(link.target); return; }
    if (link.action === 'login') { onLogin(); return; }
    if (link.action === 'register') { onRegister(); return; }
    if (link.action === 'page') { onNavigate(link.target, link.hash); }
  };

  return (
    <footer className="relative z-[1] mx-auto max-w-[1320px] px-5 pb-8 pt-2 sm:px-8 lg:px-12">
      <div className="panel-glass rounded-[28px] px-6 py-8 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <button type="button" onClick={() => onNavigate('landing')} className="flex items-center gap-3 text-left">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-500/35 to-indigo-500/25 text-white shadow-[0_0_24px_rgba(139,92,246,0.26)]">
                <AppIcon name="module" className="h-5 w-5" />
              </span>
              <span>
                <span className="font-display block text-base font-semibold tracking-[0.18em] text-white">TECHSIM</span>
                <span className="mono block text-[10px] tracking-[0.3em] text-[var(--text-dim)]">INDUSTRIAL DESIGN SYSTEM</span>
              </span>
            </button>
            <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--text-soft)]">
              Editor visual e motor de simulação para projetos elétricos, pneumáticos, hidráulicos e de automação — do esquema ao cálculo, num único cockpit.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="techsim-kicker">9 módulos</span>
              <span className="techsim-kicker">2D + 3D</span>
              <span className="techsim-kicker">engine live</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {COLUMNS.map(column => (
              <div key={column.title}>
                <div className="eyebrow mb-3">{column.title}</div>
                <ul className="space-y-2.5">
                  {column.links.map(link => (
                    <li key={link.label}>
                      <button
                        type="button"
                        onClick={() => handleLink(link)}
                        className="text-left text-sm text-[var(--text-soft)] transition-colors hover:text-[var(--text)]"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/8 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-[var(--text-dim)]">© {new Date().getFullYear()} Techsim. Plataforma de simulação industrial.</div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--text-dim)]">
            <button type="button" onClick={() => onNavigate('terms')} className="transition-colors hover:text-[var(--text-soft)]">Termos</button>
            <button type="button" onClick={() => onNavigate('privacy')} className="transition-colors hover:text-[var(--text-soft)]">Privacidade</button>
            <button type="button" onClick={() => onNavigate('contact')} className="transition-colors hover:text-[var(--text-soft)]">Contacto</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
