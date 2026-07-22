import { AppIcon } from '../ui/AppIcon';
import { InfoPageShell } from '../InfoPageShell';

const CHANNELS = [
  { icon: 'mail', title: 'Suporte por email', copy: 'Para questões sobre a tua conta, projetos ou problemas técnicos.', action: 'suporte@techsim.app', href: 'mailto:suporte@techsim.app' },
  { icon: 'bulb', title: 'Sugestões e ideias', copy: 'Tens uma disciplina, preset ou funcionalidade que gostavas de ver no Techsim?', action: 'ideias@techsim.app', href: 'mailto:ideias@techsim.app' },
  { icon: 'chat', title: 'Reportar um problema', copy: 'Encontraste um comportamento inesperado no editor ou na simulação?', action: 'bugs@techsim.app', href: 'mailto:bugs@techsim.app' },
];

export function ContactPage({ onNavigate, onLogin, onRegister }) {
  return (
    <InfoPageShell
      eyebrow="Contacto"
      title="Fala connosco."
      description="O Techsim está em desenvolvimento ativo — feedback direto é a forma mais rápida de moldar o que construímos a seguir."
      onNavigate={onNavigate}
      onLogin={onLogin}
      onRegister={onRegister}
    >
      <section className="grid gap-4 md:grid-cols-3">
        {CHANNELS.map(item => (
          <a key={item.title} href={item.href} className="ts-card group rounded-[24px] p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04] text-violet-200">
              <AppIcon name={item.icon} className="h-5 w-5" />
            </div>
            <div className="mt-4 text-base font-semibold text-white">{item.title}</div>
            <div className="mt-2 text-sm leading-7 text-[var(--text-soft)]">{item.copy}</div>
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-violet-300 group-hover:text-violet-200">
              {item.action}
              <AppIcon name="link" className="h-3.5 w-3.5" />
            </div>
          </a>
        ))}
      </section>

      <section className="panel-glass rounded-[28px] p-6 sm:p-8">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="eyebrow mb-2">Antes de escreveres</div>
            <h2 className="font-display text-xl font-semibold text-white">A documentação pode já ter a resposta</h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-[var(--text-soft)]">
              Fluxo de trabalho, atalhos de teclado e as perguntas mais frequentes estão reunidos numa só página — vale a pena espreitar antes de contactares o suporte.
            </p>
          </div>
          <button type="button" onClick={() => onNavigate('docs')} className="ts-btn ts-btn-ghost shrink-0 rounded-full px-6 py-3 text-[10px]">VER DOCUMENTAÇÃO</button>
        </div>
      </section>
    </InfoPageShell>
  );
}
