import { AppIcon } from '../ui/AppIcon';
import { InfoPageShell } from '../InfoPageShell';

const SECTIONS = [
  { title: '1. Aceitação dos termos', body: 'Ao criar uma conta ou usar o Techsim, concordas com estes termos de uso. Se não concordares, não deves utilizar a plataforma.' },
  { title: '2. A tua conta', body: 'És responsável por manter a confidencialidade das tuas credenciais e por toda a atividade realizada na tua conta. Contacta-nos imediatamente se suspeitares de acesso não autorizado.' },
  { title: '3. Os teus projetos e dados', body: 'Os diagramas, presets e ficheiros que crias no Techsim pertencem-te. Guardamo-los para que possas retomar o trabalho entre sessões, mas não reclamamos propriedade sobre o conteúdo técnico que produzes.' },
  { title: '4. Uso aceitável', body: 'O Techsim destina-se a fins de simulação, aprendizagem e documentação técnica. Não deves usar a plataforma para carregar conteúdo ilegal, tentar comprometer a segurança do serviço, ou revender acesso sem autorização.' },
  { title: '5. Disponibilidade do serviço', body: 'O Techsim está em desenvolvimento ativo. Funcionalidades podem mudar, e não garantimos disponibilidade contínua ou ausência total de erros. Fazemos o possível por comunicar alterações relevantes com antecedência.' },
  { title: '6. Alterações a estes termos', body: 'Podemos atualizar estes termos à medida que o produto evolui. Alterações materiais serão assinaladas na plataforma.' },
];

export function TermsPage({ onNavigate, onLogin, onRegister }) {
  return (
    <InfoPageShell
      eyebrow="Legal"
      title="Termos de uso"
      description="Última atualização: julho de 2026."
      onNavigate={onNavigate}
      onLogin={onLogin}
      onRegister={onRegister}
    >
      <div className="flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3.5">
        <AppIcon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        <p className="text-sm leading-6 text-amber-100/90">
          Este texto é um modelo genérico, pensado para um produto em fase de desenvolvimento. Não substitui aconselhamento jurídico — antes de operar com utilizadores reais, revê e adapta este conteúdo com apoio legal qualificado.
        </p>
      </div>

      <section className="panel-glass rounded-[28px] p-6 sm:p-8">
        <div className="space-y-6">
          {SECTIONS.map(section => (
            <div key={section.title}>
              <h2 className="text-base font-semibold text-white">{section.title}</h2>
              <p className="mt-2 text-sm leading-7 text-[var(--text-soft)]">{section.body}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-sm text-[var(--text-dim)]">
        Tens dúvidas sobre estes termos? <button type="button" onClick={() => onNavigate('contact')} className="text-violet-300 underline decoration-violet-400/40 underline-offset-4 hover:text-violet-200">Fala connosco</button>.
      </p>
    </InfoPageShell>
  );
}
