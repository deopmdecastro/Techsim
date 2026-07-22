import { AppIcon } from '../ui/AppIcon';
import { InfoPageShell } from '../InfoPageShell';

const PRINCIPLES = [
  { icon: 'target', title: 'Fidelidade técnica primeiro', copy: 'Cada símbolo, unidade e cálculo segue as convenções reais da disciplina — o objetivo é que um diagrama do Techsim se leia como um esquema de engenharia, não como um desenho genérico.' },
  { icon: 'live', title: 'Feedback imediato', copy: 'Simulação e cálculo em tempo real para que o erro apareça no momento em que é cometido, não depois de exportar o projeto.' },
  { icon: 'compass', title: 'Um cockpit, não uma coleção de ferramentas', copy: 'Editor, biblioteca de componentes, presets, dados e relatórios vivem no mesmo espaço, com a mesma identidade visual e o mesmo modelo mental.' },
];

export function AboutPage({ onNavigate, onLogin, onRegister }) {
  return (
    <InfoPageShell
      eyebrow="Sobre o Techsim"
      title="Uma plataforma para pensar em engenharia industrial visualmente."
      description="O Techsim nasceu para resolver um problema concreto: montar, calcular e documentar diagramas técnicos costuma exigir várias ferramentas separadas — um editor genérico, uma folha de cálculo à parte e um programa distinto para gerar a documentação final."
      onNavigate={onNavigate}
      onLogin={onLogin}
      onRegister={onRegister}
    >
      <section className="panel-glass rounded-[28px] p-6 sm:p-8">
        <div className="eyebrow mb-2">O que construímos</div>
        <h2 className="font-display text-2xl font-semibold text-white">Nove disciplinas, um único editor</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-soft)]">
          Corrente contínua, corrente alternada, comandos elétricos, pneumática, hidráulica, PLC/automação, lógica digital, instalações e ladder/CLP partilham o mesmo canvas, o mesmo motor de cálculo e o mesmo sistema de presets — mas cada módulo mantém a biblioteca de componentes, os ícones e as regras próprias da sua disciplina.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {PRINCIPLES.map(item => (
          <div key={item.title} className="ts-card rounded-[24px] p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04] text-violet-200">
              <AppIcon name={item.icon} className="h-5 w-5" />
            </div>
            <div className="mt-4 text-base font-semibold text-white">{item.title}</div>
            <div className="mt-2 text-sm leading-7 text-[var(--text-soft)]">{item.copy}</div>
          </div>
        ))}
      </section>

      <section className="panel-glass techsim-hero-card relative overflow-hidden rounded-[28px] p-6 sm:p-8">
        <div className="techsim-orb techsim-orb-violet" aria-hidden="true" />
        <div className="techsim-orb techsim-orb-cyan" aria-hidden="true" />
        <div className="relative z-[1]">
          <div className="eyebrow mb-2">Estado atual</div>
          <h2 className="font-display text-2xl font-semibold text-white">Em desenvolvimento ativo</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-soft)]">
            O Techsim está em construção contínua: novos presets, disciplinas adicionais e refinamentos de interface são adicionados regularmente. Se encontrares um comportamento estranho ou quiseres sugerir um módulo, a página de <button type="button" onClick={() => onNavigate('contact')} className="text-violet-300 underline decoration-violet-400/40 underline-offset-4 hover:text-violet-200">contacto</button> é o melhor sítio para isso.
          </p>
          <button type="button" onClick={onRegister} className="ts-btn ts-btn-primary mt-6 rounded-full px-6 py-3 text-[10px]">EXPERIMENTAR O TECHSIM</button>
        </div>
      </section>
    </InfoPageShell>
  );
}
