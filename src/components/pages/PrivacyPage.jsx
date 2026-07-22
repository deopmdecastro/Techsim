import { AppIcon } from '../ui/AppIcon';
import { InfoPageShell } from '../InfoPageShell';

const SECTIONS = [
  { title: '1. Que dados recolhemos', body: 'Dados de conta (nome, email), os projetos e presets que crias, e informação técnica básica de utilização (por exemplo, qual disciplina abriste) para melhorar a plataforma.' },
  { title: '2. Como usamos os dados', body: 'Para autenticar a tua conta, guardar e sincronizar os teus projetos entre sessões, e perceber quais módulos e funcionalidades são mais usados para priorizar melhorias.' },
  { title: '3. Partilha com terceiros', body: 'Não vendemos os teus dados. Só partilhamos informação com fornecedores estritamente necessários para operar o serviço (por exemplo, alojamento e infraestrutura), sujeitos a obrigações de confidencialidade.' },
  { title: '4. Onde os teus dados ficam guardados', body: 'Os projetos e dados de conta ficam guardados na infraestrutura do Techsim (local ou remota, consoante a configuração do workspace), com o objetivo de estarem disponíveis sempre que voltares a entrar.' },
  { title: '5. Os teus direitos', body: 'Podes pedir a exportação ou eliminação dos teus dados e projetos a qualquer momento através da página de contacto.' },
  { title: '6. Alterações a esta política', body: 'Esta política pode ser atualizada à medida que a plataforma evolui. Alterações relevantes serão assinaladas na plataforma.' },
];

export function PrivacyPage({ onNavigate, onLogin, onRegister }) {
  return (
    <InfoPageShell
      eyebrow="Legal"
      title="Política de privacidade"
      description="Última atualização: julho de 2026."
      onNavigate={onNavigate}
      onLogin={onLogin}
      onRegister={onRegister}
    >
      <div className="flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3.5">
        <AppIcon name="info" className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        <p className="text-sm leading-6 text-amber-100/90">
          Este texto é um modelo genérico, pensado para um produto em fase de desenvolvimento. Não substitui aconselhamento jurídico — antes de operar com utilizadores reais, revê e adapta este conteúdo (incluindo conformidade com RGPD e legislação aplicável) com apoio legal qualificado.
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
        Queres exercer algum destes direitos? <button type="button" onClick={() => onNavigate('contact')} className="text-violet-300 underline decoration-violet-400/40 underline-offset-4 hover:text-violet-200">Fala connosco</button>.
      </p>
    </InfoPageShell>
  );
}
