import { useState, useEffect } from 'react';
import { MODS_ALL } from '../data/modules';

const BRAND = '#8b5cf6';
const BRAND_2 = '#6366f1';
const SIGNAL = '#22d3ee';

export function LandingPage({ onLogin, onRegister }) {
  const [hov, setHov] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(x => (x + 1) % 100), 90);
    return () => clearInterval(t);
  }, []);

  const nodes = [
    { x: 80, y: 95, col: SIGNAL, sym: 'V₁', val: '12V' },
    { x: 210, y: 55, col: '#f59e0b', sym: 'R₁', val: '1kΩ' },
    { x: 340, y: 95, col: '#f59e0b', sym: 'R₂', val: '2.2kΩ' },
    { x: 470, y: 55, col: '#fbbf24', sym: 'LED', val: '2.0V' },
    { x: 570, y: 95, col: '#6ee7b7', sym: '⏚', val: 'GND' },
  ];
  const nodeWires = [[80, 95, 210, 55], [210, 55, 340, 95], [340, 95, 470, 55], [470, 55, 570, 95], [570, 95, 570, 165], [570, 165, 80, 165], [80, 165, 80, 95]];
  const animWire = i => (tick % nodeWires.length) === i;

  const mods = MODS_ALL.map(module => ({ icon: module.icon, label: module.label, col: module.color, desc: module.desc }));

  const features = [
    { icon: '⟳', title: 'Girar Componentes', desc: 'Ctrl+← → ou painel lateral · 4 orientações' },
    { icon: '◌', title: 'Cor dos Fios', desc: '10 cores para organizar circuitos complexos' },
    { icon: '⌁', title: 'Buscar & Duplicar', desc: 'Busca rápida na paleta + Ctrl+D para replicar componentes' },
    { icon: '▣', title: 'Modo 2D / 3D', desc: 'Visual técnico plano ou com profundidade para inspeção' },
    { icon: '⌗', title: 'Endereçamento CLP', desc: 'Defina I0.0, Q0.1, M0.0 em cada componente' },
    { icon: '⬒', title: 'Salvar / PNG / JSON', desc: 'Exportação rápida para projetos portáveis e documentação' },
    { icon: '↩', title: 'Undo/Redo ilimitado', desc: 'Nunca perca trabalho · Ctrl+Z/Y' },
    { icon: '◎', title: 'Ajuste Automático', desc: 'Fit View, auto layout e simulação ao vivo no mesmo canvas' },
  ];

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-body)' }}
    >
      {/* Ambient background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(rgba(139,92,246,0.05) 0, rgba(139,92,246,0.05) 1px, transparent 1px, transparent 48px), repeating-linear-gradient(90deg, rgba(139,92,246,0.05) 0, rgba(139,92,246,0.05) 1px, transparent 1px, transparent 48px)',
        }}
      />
      <div className="pointer-events-none fixed -left-52 -top-72 z-0 h-[700px] w-[700px] rounded-full" style={{ background: `radial-gradient(circle, ${BRAND}1c 0%, transparent 65%)` }} />
      <div className="pointer-events-none fixed -bottom-52 -right-24 z-0 h-[600px] w-[600px] rounded-full" style={{ background: `radial-gradient(circle, ${SIGNAL}14 0%, transparent 65%)` }} />

      {/* ── NAV ─────────────────────────────────────── */}
      <nav className="sticky top-0 z-[100] flex h-16 items-center justify-between border-b border-white/[0.06] px-6 backdrop-blur-xl md:px-12" style={{ background: 'rgba(5,6,13,0.82)' }}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
            style={{ background: `${BRAND}22`, border: `1px solid ${BRAND}44`, boxShadow: `0 0 18px ${BRAND}33` }}
          >
            ⚡
          </div>
          <div>
            <div className="font-display text-sm font-bold tracking-[0.18em]" style={{ color: BRAND, textShadow: `0 0 18px ${BRAND}44` }}>TECHSIM PRO</div>
            <div className="mono text-[8px] tracking-[0.3em] text-[var(--text-dim)]">SIMULADOR DE CIRCUITOS</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={onLogin} className="ts-btn ts-btn-ghost rounded-full px-5 py-2 text-[10px]">
            ENTRAR
          </button>
          <button onClick={onRegister} className="ts-btn ts-btn-primary rounded-full px-5 py-2 text-[10px]">
            CRIAR CONTA
          </button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────── */}
      <section className="relative z-[5] mx-auto grid max-w-[1200px] items-center gap-14 px-6 py-16 md:grid-cols-2 md:px-12 md:py-24">
        <div>
          <div className="eyebrow mb-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5" style={{ borderColor: `${BRAND}40`, background: `${BRAND}14`, color: BRAND }}>
            ⚡ PLATAFORMA PROFISSIONAL · {mods.length} MÓDULOS
          </div>
          <h1 className="font-display mb-5 text-[clamp(34px,4.6vw,60px)] font-semibold leading-[1.05] tracking-tight">
            <span style={{ color: 'var(--text)' }}>Projete.</span><br />
            <span style={{ color: BRAND, textShadow: `0 0 40px ${BRAND}55` }}>Simule.</span><br />
            <span style={{ color: 'var(--text-soft)' }}>Calcule.</span>
          </h1>
          <p className="mb-9 max-w-[420px] text-[14px] leading-[1.9] text-[var(--text-soft)]">
            Canvas interativo de engenharia com {mods.length} módulos especializados. Cálculos em tempo real, análise de circuitos e simulação ao vivo.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={onRegister} className="ts-btn ts-btn-primary px-8 py-3.5 text-[12px]">
              COMEÇAR GRÁTIS →
            </button>
            <button onClick={onLogin} className="ts-btn ts-btn-ghost px-8 py-3.5 text-[12px]">
              JÁ TENHO CONTA
            </button>
          </div>
          <div className="mt-10 flex gap-9">
            {[[String(mods.length), 'Módulos'], ['2', 'Views 2D/3D'], ['PNG', 'Exportação']].map(([v, l]) => (
              <div key={l}>
                <div className="font-display text-2xl font-bold" style={{ color: BRAND, textShadow: `0 0 16px ${BRAND}44` }}>{v}</div>
                <div className="mono mt-0.5 text-[9px] tracking-[0.15em] text-[var(--text-dim)]">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — animated circuit canvas */}
        <div className="relative">
          <div className="ts-card relative overflow-hidden p-6" style={{ background: 'var(--panel-2)' }}>
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{ backgroundImage: `linear-gradient(${BRAND} 1px, transparent 1px), linear-gradient(90deg, ${BRAND} 1px, transparent 1px)`, backgroundSize: '24px 24px' }}
            />
            <svg viewBox="0 0 660 220" className="relative z-[2] w-full">
              {nodeWires.map(([x1, y1, x2, y2], i) => (
                <line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={animWire(i) ? SIGNAL : 'rgba(139,92,246,0.28)'}
                  strokeWidth={animWire(i) ? 2.5 : 1.5}
                  className={animWire(i) ? 'trace-flow' : ''}
                  opacity={animWire(i) ? 1 : 0.6}
                  style={{ transition: 'all 0.3s' }}
                />
              ))}
              {nodes.map((n, i) => (
                <g key={i}>
                  <rect x={n.x - 24} y={n.y - 18} width={48} height={36} rx={7} fill={`${n.col}18`} stroke={n.col} strokeWidth={1.5} opacity={0.9} />
                  <text x={n.x} y={n.y - 4} textAnchor="middle" fill={n.col} fontSize={9} fontWeight={700} fontFamily="var(--font-mono)">{n.sym}</text>
                  <text x={n.x} y={n.y + 9} textAnchor="middle" fill={n.col} fontSize={7} fontFamily="var(--font-mono)" opacity={0.75}>{n.val}</text>
                </g>
              ))}
            </svg>
            <div className="mono relative z-[2] mt-3 flex justify-center gap-3 text-[9px]">
              {['I = 10.00 mA', 'P = 120.0 mW', 'R_eq = 3.2 kΩ', 'KVL ✓'].map((r, i) => (
                <span key={i} style={{ color: [SIGNAL, '#4ade80', '#f59e0b', '#22c55e'][i] }}>{r}</span>
              ))}
            </div>
          </div>
          <div className="pulse-dot absolute -right-3 -top-3 rounded-full px-3.5 py-1.5 text-[9px] font-bold tracking-wide" style={{ background: '#22c55e', color: '#04030a', boxShadow: '0 0 16px #22c55e55' }}>
            AO VIVO ●
          </div>
        </div>
      </section>

      {/* ── MODULES GRID ────────────────────────────── */}
      <section className="relative z-[5] border-t border-white/[0.04] px-6 py-16 md:px-12">
        <div className="mb-12 text-center">
          <div className="eyebrow mb-2" style={{ color: `${BRAND}aa` }}>MÓDULOS</div>
          <div className="font-display text-[28px] font-semibold tracking-tight">{mods.length} Disciplinas de Engenharia</div>
          <div className="mt-2 text-[12px] text-[var(--text-dim)]">Cada módulo com canvas dedicado, componentes específicos e solver completo</div>
        </div>
        <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-3 md:grid-cols-4">
          {mods.map((m, i) => (
            <div
              key={i}
              onMouseEnter={() => setHov(i)}
              onMouseLeave={() => setHov(null)}
              onClick={onRegister}
              className="cursor-pointer rounded-xl border p-5 transition-all duration-200"
              style={{
                background: hov === i ? `${m.col}0e` : 'var(--surface)',
                borderColor: hov === i ? `${m.col}55` : 'var(--border)',
                transform: hov === i ? 'translateY(-3px)' : 'none',
                boxShadow: hov === i ? `0 8px 32px ${m.col}18` : 'none',
              }}
            >
              <div className="mb-2.5 text-2xl">{m.icon}</div>
              <div className="mb-1 text-[11px] font-bold" style={{ color: hov === i ? m.col : 'var(--text-soft)' }}>{m.label}</div>
              <div className="text-[9px] leading-relaxed text-[var(--text-dim)]">{m.desc}</div>
              {hov === i && <div className="mt-2 text-[9px]" style={{ color: m.col }}>Abrir →</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ───────────────────────────── */}
      <section className="relative z-[5] border-t border-white/[0.04] px-6 py-16 md:px-12">
        <div className="mb-12 text-center">
          <div className="eyebrow mb-2" style={{ color: `${BRAND}aa` }}>FERRAMENTAS</div>
          <div className="font-display text-[28px] font-semibold tracking-tight">Canvas Profissional</div>
          <div className="mt-2 text-[12px] text-[var(--text-dim)]">Tudo que um engenheiro precisa para projetar e documentar</div>
        </div>
        <div className="mx-auto grid max-w-[1100px] grid-cols-2 gap-3 md:grid-cols-4">
          {features.map((f, i) => (
            <div key={i} className="ts-card p-5">
              <div className="mb-2.5 text-xl">{f.icon}</div>
              <div className="mb-1 text-[11px] font-bold text-[var(--text-soft)]">{f.title}</div>
              <div className="text-[9px] leading-relaxed text-[var(--text-dim)]">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────── */}
      <section className="relative z-[5] border-t border-white/[0.04] px-6 py-24 text-center md:px-12">
        <div className="relative mx-auto max-w-[640px] overflow-hidden rounded-[24px] p-14" style={{ background: 'var(--panel-2)', border: '1px solid var(--border)' }}>
          <div className="pointer-events-none absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full" style={{ background: `radial-gradient(${BRAND}14, transparent 65%)` }} />
          <div className="eyebrow relative mb-4" style={{ color: `${BRAND}aa` }}>COMECE AGORA</div>
          <div className="font-display relative mb-2 text-[32px] font-semibold tracking-tight">Gratuito para sempre</div>
          <div className="relative mb-9 text-[13px] text-[var(--text-dim)]">Sem cartão de crédito · Sem limite de projetos · Sem limite de simulações</div>
          <button onClick={onRegister} className="ts-btn ts-btn-primary relative px-12 py-4 text-[13px]">
            CRIAR CONTA GRÁTIS →
          </button>
          <div className="relative mt-6 text-[10px] text-[var(--text-dim)]">
            <span onClick={onLogin} className="cursor-pointer underline decoration-dotted" style={{ color: `${BRAND}aa` }}>
              Já tenho conta — Entrar
            </span>
          </div>
        </div>
        <div className="mono mt-14 text-[8px] tracking-[0.24em] text-[var(--text-dim)]">
          © 2026 TECHSIM PRO · PLATAFORMA DE ENGENHARIA ELÉTRICA
        </div>
      </section>
    </div>
  );
}
