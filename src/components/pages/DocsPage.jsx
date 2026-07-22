import { AppIcon } from '../ui/AppIcon';
import { InfoPageShell } from '../InfoPageShell';

const STEPS = [
  { step: '01', title: 'Escolhe a disciplina', copy: 'No dashboard, abre um dos 9 módulos (corrente contínua, pneumática, PLC, etc.). Cada módulo abre com a sua própria biblioteca de componentes e cores de sinal.' },
  { step: '02', title: 'Monta o diagrama', copy: 'Arrasta componentes da doca inferior para o canvas, liga-os com fios, organiza em camadas e páginas, e usa os presets prontos como ponto de partida.' },
  { step: '03', title: 'Calcula e simula', copy: 'Prime F9 para calcular o circuito ou F5 para iniciar a simulação em tempo real e ver estados energizados diretamente no diagrama.' },
  { step: '04', title: 'Exporta e retoma', copy: 'Guarda o projeto a qualquer momento, exporta em PNG, SVG ou JSON, e retoma exatamente do ponto onde ficaste da próxima vez que abrires.' },
];

const SHORTCUTS = [
  ['Ctrl/Cmd + Z', 'Desfazer'],
  ['Ctrl/Cmd + Y', 'Refazer'],
  ['Ctrl/Cmd + S', 'Salvar projeto'],
  ['Ctrl/Cmd + D', 'Duplicar seleção'],
  ['Ctrl/Cmd + G', 'Agrupar seleção'],
  ['Ctrl/Cmd + Shift + G', 'Desagrupar'],
  ['Delete', 'Excluir seleção'],
  ['F9', 'Calcular circuito'],
  ['F5', 'Iniciar/parar simulação'],
  ['/', 'Focar busca de componentes'],
  ['Esc', 'Cancelar ação / limpar seleção'],
  ['?', 'Abrir/fechar ajuda no editor'],
];

const FAQ = [
  { q: 'Preciso de criar conta para experimentar?', a: 'Sim — a conta guarda os teus projetos, presets e histórico entre sessões. A criação é gratuita e imediata a partir do botão "Criar conta".' },
  { q: 'Os meus projetos ficam guardados automaticamente?', a: 'O Techsim guarda o projeto quando premes "Salvar" (Ctrl/Cmd + S) no editor. Recomendamos guardar com frequência, sobretudo antes de fechar o separador.' },
  { q: 'Posso trocar de disciplina sem perder o projeto atual?', a: 'Sim. Cada módulo mantém o seu próprio conjunto de projetos guardados — trocar de disciplina no seletor "Projeto atual" não apaga o trabalho feito noutro módulo.' },
  { q: 'Que formatos posso exportar?', a: 'PNG e SVG para documentação visual, e JSON para retomar o projeto ou integrar com outras ferramentas.' },
];

export function DocsPage({ onNavigate, onLogin, onRegister }) {
  return (
    <InfoPageShell
      eyebrow="Documentação"
      title="Tudo o que precisas para começar a montar diagramas no Techsim."
      description="Um guia rápido sobre o fluxo de trabalho, os atalhos de teclado do editor e as dúvidas mais comuns."
      onNavigate={onNavigate}
      onLogin={onLogin}
      onRegister={onRegister}
    >
      <section>
        <div className="mb-4">
          <div className="eyebrow mb-2">Fluxo de trabalho</div>
          <h2 className="font-display text-2xl font-semibold text-white">Do módulo em branco ao projeto exportado</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {STEPS.map(item => (
            <div key={item.step} className="ts-card rounded-[22px] p-4">
              <span className="mono inline-block rounded-xl border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-200">{item.step}</span>
              <div className="mt-3 text-sm font-semibold text-white">{item.title}</div>
              <div className="mt-1.5 text-xs leading-6 text-[var(--text-soft)]">{item.copy}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="atalhos" className="panel-glass scroll-mt-24 rounded-[28px] p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04] text-violet-200">
            <AppIcon name="shortcut" className="h-5 w-5" />
          </div>
          <div>
            <div className="eyebrow">Referência rápida</div>
            <h2 className="font-display text-xl font-semibold text-white">Atalhos de teclado do editor</h2>
          </div>
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(268px, 1fr))' }}>
          {SHORTCUTS.map(([key, desc]) => (
            <div key={key} className="ts-card flex items-center gap-3 rounded-[20px] px-4 py-3.5">
              <kbd className="mono shrink-0 rounded-xl border border-violet-400/22 bg-violet-500/10 px-2.5 py-1.5 text-[11px] text-violet-200">{key}</kbd>
              <span className="min-w-0 flex-1 text-sm leading-6 text-[var(--text-soft)]">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4">
          <div className="eyebrow mb-2">Perguntas frequentes</div>
          <h2 className="font-display text-2xl font-semibold text-white">Dúvidas comuns</h2>
        </div>
        <div className="grid gap-3">
          {FAQ.map(item => (
            <div key={item.q} className="ts-card rounded-[22px] p-5">
              <div className="flex items-start gap-3">
                <AppIcon name="bulb" className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                <div>
                  <div className="text-sm font-semibold text-white">{item.q}</div>
                  <div className="mt-1.5 text-sm leading-7 text-[var(--text-soft)]">{item.a}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </InfoPageShell>
  );
}
