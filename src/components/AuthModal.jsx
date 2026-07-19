import { useEffect, useState } from "react";

// Contas de demonstração criadas pelo seed (backend/src/db/seed.js).
// Só aparecem em build de desenvolvimento — nunca em produção.
const DEMO_ACCOUNTS = [
  { role: "user", label: "Utilizador", email: "user@techsim.dev", password: "User@123", color: "#22d3ee" },
  { role: "admin", label: "Admin", email: "admin@techsim.dev", password: "Admin@123", color: "#f43f5e" },
];
const SHOW_DEMO_ACCOUNTS = import.meta.env.DEV;

function Field({ label, children }) {
  return (
    <div className="mb-3">
      <div className="mono mb-1.5 text-[9px] tracking-[0.18em] text-[var(--text-dim)]">{label}</div>
      {children}
    </div>
  );
}

export function AuthModal({ mode, onClose, onSubmit }) {
  const [tab, setTab] = useState(mode || "login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setTab(mode || "login"), [mode]);
  useEffect(() => {
    const onKey = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError("Preencha e-mail e senha.");
      return;
    }
    if (tab === "register" && !form.name.trim()) {
      setError("Informe seu nome.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onSubmit(tab, form);
    } catch (err) {
      setError(err?.message || "Não foi possível concluir a autenticação.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = account => {
    setForm(current => ({ ...current, email: account.email, password: account.password }));
    setError("");
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] grid place-items-center p-4"
      style={{ background: "rgba(2,3,8,0.72)", backdropFilter: "blur(8px)" }}
    >
      <div
        onClick={event => event.stopPropagation()}
        className="ts-card w-[420px] max-w-full p-7"
        style={{ background: "linear-gradient(180deg, var(--panel-2), var(--surface))" }}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-xl text-lg" style={{ background: "rgba(139,92,246,0.14)", border: "1px solid rgba(139,92,246,0.32)" }}>
              ⚡
            </div>
            <div className="font-display text-base font-bold tracking-[0.16em] text-violet-300">TECHSIM PRO</div>
            <div className="mt-1 text-[9px] text-[var(--text-dim)]">Base pronta para autenticação local ou backend real</div>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="text-xl text-[var(--text-dim)] transition hover:text-[var(--text)]">×</button>
        </div>

        <div className="mb-5 flex rounded-xl border border-[var(--border)] bg-[var(--bg)] p-1">
          {[
            { id: "login", label: "ENTRAR" },
            { id: "register", label: "CRIAR CONTA" },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`ts-btn flex-1 rounded-lg px-3 py-2.5 text-[10px] ${
                tab === item.id ? "ts-btn-primary" : "bg-transparent text-[var(--text-dim)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "login" && SHOW_DEMO_ACCOUNTS && (
          <div className="mb-4">
            <div className="mono mb-2 text-[8px] tracking-[0.16em] text-[var(--text-dim)]">PREENCHER COM CONTA DE TESTE</div>
            <div className="flex gap-2">
              {DEMO_ACCOUNTS.map(account => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => fillDemoAccount(account)}
                  className="ts-btn flex-1 rounded-lg px-2.5 py-2.5 text-[9px]"
                  style={{ background: `${account.color}18`, border: `1px solid ${account.color}55`, color: account.color }}
                >
                  {account.label === "Admin" ? "🛡️" : "👤"} {account.label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-[10px] text-rose-300">
            {error}
          </div>
        )}

        {tab === "register" && (
          <Field label="NOME">
            <input
              value={form.name}
              onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
              placeholder="Seu nome completo"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-[11px] text-[var(--text)] outline-none transition focus:border-violet-400/50"
            />
          </Field>
        )}

        <Field label="E-MAIL">
          <input
            type="email"
            value={form.email}
            onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
            placeholder="voce@empresa.com"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-[11px] text-[var(--text)] outline-none transition focus:border-violet-400/50"
          />
        </Field>

        <div className="mb-5">
          <Field label="SENHA">
            <input
              type="password"
              value={form.password}
              onChange={event => setForm(current => ({ ...current, password: event.target.value }))}
              onKeyDown={event => event.key === "Enter" && handleSubmit()}
              placeholder="••••••••"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 text-[11px] text-[var(--text)] outline-none transition focus:border-violet-400/50"
            />
          </Field>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`ts-btn w-full rounded-xl px-4 py-3.5 text-[11px] ${loading ? "cursor-wait bg-[var(--surface-3)] text-[var(--text-dim)]" : "ts-btn-primary"}`}
        >
          {loading ? "PROCESSANDO..." : tab === "login" ? "ENTRAR →" : "CRIAR CONTA →"}
        </button>

        <div className="mt-4 text-center text-[9px] text-[var(--text-dim)]">
          {tab === "login" ? "Ainda não tem conta? " : "Já possui acesso? "}
          <span onClick={() => setTab(tab === "login" ? "register" : "login")} className="cursor-pointer text-violet-300 hover:text-violet-200">
            {tab === "login" ? "Criar conta" : "Entrar"}
          </span>
        </div>
      </div>
    </div>
  );
}
