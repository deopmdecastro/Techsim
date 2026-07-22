import { useEffect, useMemo, useState } from 'react';
import { AppIcon } from './ui/AppIcon';

const DEMO_ACCOUNTS = [
  { role: 'user', label: 'Utilizador', email: 'user@techsim.dev', password: 'User@123', color: '#22d3ee' },
  { role: 'admin', label: 'Admin', email: 'admin@techsim.dev', password: 'Admin@123', color: '#f43f5e' },
];
const SHOW_DEMO_ACCOUNTS = import.meta.env.DEV;

function Field({ label, hint, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="mono text-[9px] tracking-[0.18em] text-[var(--text-dim)]">{label}</div>
        {hint ? <div className="text-[10px] text-[var(--text-dim)]">{hint}</div> : null}
      </div>
      {children}
    </div>
  );
}

const inputClass = 'w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text)] outline-none transition hover:border-white/14 focus:border-violet-400/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)]';

export function AuthModal({ mode, onClose, onSubmit }) {
  const [tab, setTab] = useState(mode || 'login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => setTab(mode || 'login'), [mode]);
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const modeMeta = useMemo(() => (
    tab === 'login'
      ? {
          title: 'Entrar no workspace',
          description: 'Retome projetos, presets e colaboração exatamente do ponto em que parou.',
          primary: 'ENTRAR →',
          secondary: 'Ainda não tem conta?',
          switchLabel: 'Criar conta',
        }
      : {
          title: 'Criar conta Techsim',
          description: 'Prepare um acesso novo com fluxo mais direto para começar projetos industriais sem fricção.',
          primary: 'CRIAR CONTA →',
          secondary: 'Já possui acesso?',
          switchLabel: 'Entrar',
        }
  ), [tab]);

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    if (tab === 'register' && !form.name.trim()) {
      setError('Informe seu nome.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await onSubmit(tab, form);
    } catch (err) {
      setError(err?.message || 'Não foi possível concluir a autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = account => {
    setForm(current => ({ ...current, email: account.email, password: account.password }));
    setError('');
    setShowPassword(false);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] grid place-items-center p-4"
      style={{ background: 'rgba(2,3,8,0.72)', backdropFilter: 'blur(10px)' }}
    >
      <div
        onClick={event => event.stopPropagation()}
        className="panel-glass editor-scroll relative w-[min(940px,100%)] overflow-hidden rounded-[30px]"
        style={{ maxHeight: '92vh' }}
      >
        <div className="grid max-h-[92vh] grid-cols-1 overflow-hidden lg:grid-cols-[0.92fr_1.08fr]">
          <aside className="relative hidden overflow-hidden border-r border-white/6 bg-[#070b15] p-7 lg:block">
            <div className="techsim-orb techsim-orb-violet" aria-hidden="true" />
            <div className="techsim-orb techsim-orb-cyan" aria-hidden="true" />
            <div className="relative z-[1] flex h-full flex-col">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-200">
                <span className="h-2 w-2 rounded-full bg-cyan-300 pulse-dot" />
                Techsim Pro
              </div>
              <div className="mt-6 font-display text-[32px] font-semibold leading-tight text-white">Autenticação pronta para operação.</div>
              <div className="mt-4 text-sm leading-7 text-[var(--text-soft)]">
                Fluxo redesenhado para reduzir atrito entre login, retomada de projetos e abertura de presets logo na primeira sessão.
              </div>

              <div className="mt-8 grid gap-3">
                {[
                  ['01', 'Entrar ou criar conta', 'CTA principal, alternância clara de modo e feedback imediato de erro.'],
                  ['02', 'Retomar workspace', 'Projetos recentes e módulos favoritos ficam mais acessíveis depois do acesso.'],
                  ['03', 'Abrir um preset', 'Entrou? Um clique leva o utilizador ao módulo certo com a base pronta.'],
                ].map(([step, title, copy]) => (
                  <div key={step} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start gap-3">
                      <span className="mono rounded-xl border border-violet-400/22 bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold text-violet-200">{step}</span>
                      <div>
                        <div className="text-sm font-semibold text-white">{title}</div>
                        <div className="mt-1 text-xs leading-6 text-[var(--text-soft)]">{copy}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto rounded-[24px] border border-white/8 bg-black/20 p-4">
                <div className="eyebrow">Modo rápido</div>
                <div className="mt-2 text-sm font-semibold text-white">Ideal para testes em dev</div>
                <div className="mt-1 text-xs leading-6 text-[var(--text-soft)]">Contas demo continuam disponíveis, mas agora aparecem mais organizadas e seguras dentro do fluxo.</div>
              </div>
            </div>
          </aside>

          <section className="editor-scroll overflow-y-auto p-5 sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/10 text-violet-200">
                  <AppIcon name="module" className="h-5 w-5" />
                </div>
                <div className="font-display text-2xl font-semibold text-[var(--text)]">{modeMeta.title}</div>
                <div className="mt-2 max-w-xl text-sm leading-7 text-[var(--text-soft)]">{modeMeta.description}</div>
              </div>
              <button onClick={onClose} aria-label="Fechar" className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-[var(--text-dim)] transition hover:border-white/20 hover:text-[var(--text)]">Fechar</button>
            </div>

            <div className="mb-5 flex rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-1.5">
              {[
                { id: 'login', label: 'Entrar' },
                { id: 'register', label: 'Criar conta' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setTab(item.id); setError(''); }}
                  className={`ts-btn flex-1 rounded-xl px-3 py-3 text-[11px] ${tab === item.id ? 'ts-btn-primary' : 'bg-transparent text-[var(--text-dim)]'}`}
                >
                  {item.label.toUpperCase()}
                </button>
              ))}
            </div>

            {tab === 'login' && SHOW_DEMO_ACCOUNTS && (
              <div className="mb-5 rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="mono text-[9px] tracking-[0.18em] text-[var(--text-dim)]">CONTAS DE TESTE</div>
                    <div className="mt-1 text-sm font-semibold text-[var(--text)]">Preencher dados com um clique</div>
                  </div>
                  <span className="techsim-kicker">DEV</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {DEMO_ACCOUNTS.map(account => (
                    <button
                      key={account.role}
                      type="button"
                      onClick={() => fillDemoAccount(account)}
                      className="rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5"
                      style={{ background: `${account.color}12`, borderColor: `${account.color}55`, color: account.color }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold">{account.label}</div>
                        <AppIcon name={account.role === 'admin' ? 'admin' : 'user'} className="h-4 w-4" />
                      </div>
                      <div className="mt-1 text-[11px] opacity-80">{account.email}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </div>
            )}

            <div className="grid gap-4">
              {tab === 'register' && (
                <Field label="NOME" hint="Obrigatório para cadastro">
                  <input
                    value={form.name}
                    onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
                    placeholder="Seu nome completo"
                    className={inputClass}
                  />
                </Field>
              )}

              <Field label="E-MAIL" hint="Usado para identificar projetos">
                <input
                  type="email"
                  value={form.email}
                  onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
                  placeholder="voce@empresa.com"
                  className={inputClass}
                />
              </Field>

              <Field label="SENHA" hint={tab === 'login' ? 'Pressione Enter para continuar' : 'Use uma senha segura'}>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={event => setForm(current => ({ ...current, password: event.target.value }))}
                    onKeyDown={event => event.key === 'Enter' && handleSubmit()}
                    placeholder="••••••••"
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(value => !value)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-[var(--text-dim)] transition hover:border-white/16 hover:text-[var(--text)]"
                  >
                    <AppIcon name={showPassword ? 'hidden' : 'visible'} className="h-4 w-4" />
                  </button>
                </div>
              </Field>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-3">
              <div className="text-xs leading-6 text-[var(--text-dim)]">
                {tab === 'login' ? 'Ao entrar, você cai direto no dashboard com projetos recentes.' : 'Ao criar a conta, o primeiro fluxo já leva para módulos e presets.'}
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`ts-btn min-w-[190px] rounded-2xl px-5 py-3 text-[11px] ${loading ? 'cursor-wait bg-[var(--surface-3)] text-[var(--text-dim)]' : 'ts-btn-primary'}`}
              >
                {loading ? 'PROCESSANDO...' : modeMeta.primary}
              </button>
            </div>

            <div className="mt-5 text-center text-sm text-[var(--text-dim)]">
              {modeMeta.secondary}{' '}
              <span onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }} className="cursor-pointer font-medium text-violet-300 hover:text-violet-200">
                {modeMeta.switchLabel}
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
