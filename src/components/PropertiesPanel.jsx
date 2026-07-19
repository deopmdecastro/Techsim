import { useState, useEffect } from 'react';
import { MODS_ALL } from '../data/modules';
import { AppIcon } from './ui/AppIcon';

function SmallButton({ children, onClick, tone = 'default', wide = false }) {
  const tones = {
    default: 'border-white/10 bg-slate-950/70 text-slate-200 hover:border-white/20',
    brand: 'border-violet-400/30 bg-violet-500/12 text-violet-200 hover:border-violet-400/45',
    success: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200 hover:border-emerald-400/40',
    danger: 'border-rose-400/25 bg-rose-500/10 text-rose-200 hover:border-rose-400/40',
    muted: 'border-white/10 bg-slate-900/70 text-slate-300 hover:border-white/20',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.96] ${wide ? 'w-full justify-center' : ''} inline-flex items-center justify-center gap-2 ${tones[tone] || tones.default}`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</div>
      {children}
    </div>
  );
}

const inputClass = 'w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition-all duration-150 focus:border-violet-400/50 focus:bg-slate-950/90 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.12)]';

export function PropertiesPanel({ comp, lib, modColor, comps, wires, push, setSel, sd, onCalc, onToggleSim, running }) {
  const [editVal, setEditVal] = useState('');
  const [editName, setEditName] = useState('');
  const [editAddr, setEditAddr] = useState('');
  const [editInps, setEditInps] = useState(2);
  const [editColor, setEditColor] = useState('');

  useEffect(() => {
    if (comp) {
      setEditVal(String(comp.v));
      setEditName(comp.n || '');
      setEditAddr(comp.addr || '');
      setEditInps(comp.inputs || 2);
      setEditColor(comp.color || '');
    }
  }, [comp?.id]);

  const li = comp ? lib.find(l => l.t === comp.t) : null;
  const moduleMeta = MODS_ALL.find(m => m.id === comp?.modId);

  if (!comp && !sd) {
    return (
      <div className="editor-scroll flex flex-1 flex-col items-center justify-center gap-5 px-6 py-10 text-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-violet-500/10 text-violet-200">
          <div className="absolute inset-0 rounded-3xl bg-violet-500/10 blur-xl" aria-hidden="true" />
          <AppIcon name="component" className="relative h-10 w-10" />
        </div>
        <div className="space-y-2">
          <div className="text-lg font-semibold text-slate-100">Selecione um componente</div>
          <div className="max-w-[240px] text-sm leading-7 text-slate-500">
            Clique em um item do canvas para editar propriedades, endereços e comportamento de simulação.
          </div>
        </div>
        <div className="inline-flex items-center rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-400">
          <span className="mr-2 text-slate-500">Atalho</span>
          <kbd className="rounded-lg border border-violet-400/25 bg-violet-500/10 px-2 py-1 font-mono text-xs text-violet-200">F9</kbd>
          <span className="ml-2">para calcular</span>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-scroll flex-1 overflow-y-auto px-4 py-4">
      {comp && (
        <div className="space-y-4">
          <div className="workspace-card rounded-3xl p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Componente</div>
                <div className="mt-1 text-lg font-semibold" style={{ color: modColor }}>{comp.n || comp.t}</div>
                <div className="mt-1 text-sm text-slate-400">{li?.lbl || comp.t} {li?.tip ? `— ${li.tip}` : ''}</div>
              </div>
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-slate-100"
                style={{
                  borderColor: `${modColor}40`,
                  background: `linear-gradient(135deg, ${modColor}26, rgba(15,18,32,0.4))`,
                  boxShadow: `0 0 20px ${modColor}1f`,
                }}
              >
                <span className="mono text-sm font-semibold">{li?.sym || 'IO'}</span>
              </div>
            </div>

            {comp.t === 'mtr' && (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-white/6 pt-3">
                {['V', 'mA', 'Ω', 'AC'].map((m, i) => (
                  <SmallButton
                    key={m}
                    tone={(comp.mmode || 0) === i ? 'brand' : 'muted'}
                    onClick={() => push({ comps: comps.map(c => c.id === comp.id ? { ...c, mmode: i } : c), wires })}
                  >
                    {m}
                  </SmallButton>
                ))}
              </div>
            )}
          </div>

          <div className="workspace-card rounded-3xl p-4 space-y-4">
            <Field label="Nome / etiqueta">
              <div className="flex gap-2">
                <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Ex: R1, Motor_A" className={inputClass} />
                <SmallButton tone="brand" onClick={() => push({ comps: comps.map(c => c.id === comp.id ? { ...c, n: editName || c.n } : c), wires })}>OK</SmallButton>
              </div>
            </Field>

            {li && li.u !== '' && (
              <Field label={`Valor ${li.u ? `(${li.u})` : ''}`}>
                <div className="flex gap-2">
                  <input type="number" value={editVal} onChange={e => setEditVal(e.target.value)} className={inputClass} />
                  <SmallButton tone="brand" onClick={() => push({ comps: comps.map(c => c.id === comp.id ? { ...c, v: Number.isNaN(parseFloat(editVal)) ? c.v : parseFloat(editVal) } : c), wires })}>OK</SmallButton>
                </div>
                {li.u === 'Ω' && (
                  <div className="flex flex-wrap gap-2">
                    {[100, 470, 1000, 4700, 10000].map(rv => (
                      <SmallButton key={rv} tone="muted" onClick={() => { setEditVal(String(rv)); push({ comps: comps.map(c => c.id === comp.id ? { ...c, v: rv } : c), wires }); }}>
                        {rv < 1000 ? `${rv}Ω` : `${rv / 1000}kΩ`}
                      </SmallButton>
                    ))}
                  </div>
                )}
                {li.u === 'V' && comp.t === 'vdc' && (
                  <div className="flex flex-wrap gap-2">
                    {[3.3, 5, 9, 12, 24, 48].map(vv => (
                      <SmallButton key={vv} tone="muted" onClick={() => { setEditVal(String(vv)); push({ comps: comps.map(c => c.id === comp.id ? { ...c, v: vv } : c), wires }); }}>
                        {vv}V
                      </SmallButton>
                    ))}
                  </div>
                )}
              </Field>
            )}

            <Field label="Endereço CLP / tag">
              <div className="flex gap-2">
                <input value={editAddr} onChange={e => setEditAddr(e.target.value)} placeholder="Ex: I0.0, Q0.1, M0.0" className={inputClass} />
                <SmallButton tone="muted" onClick={() => push({ comps: comps.map(c => c.id === comp.id ? { ...c, addr: editAddr } : c), wires })}>OK</SmallButton>
              </div>
            </Field>

            {['and', 'or', 'nand', 'nor', 'xor'].includes(comp.t) && (
              <Field label="Número de entradas">
                <div className="flex items-center gap-2">
                  <input type="number" min={2} max={8} value={editInps} onChange={e => setEditInps(parseInt(e.target.value, 10) || 2)} className={`${inputClass} max-w-[110px]`} />
                  <SmallButton tone="success" onClick={() => push({ comps: comps.map(c => c.id === comp.id ? { ...c, inputs: editInps } : c), wires })}>Aplicar</SmallButton>
                </div>
              </Field>
            )}

            <Field label="Cor do componente">
              <div className="flex flex-wrap gap-2">
                {['', '#22d3ee', '#f59e0b', '#f43f5e', '#4ade80', '#a78bfa', '#fb923c', '#fbbf24', '#38bdf8', '#c084fc', '#e2e8f0'].map(cc => {
                  const selected = (comp.color || '') === cc;
                  return (
                    <button
                      key={cc || 'default'}
                      type="button"
                      onClick={() => { setEditColor(cc); push({ comps: comps.map(c => c.id === comp.id ? { ...c, color: cc || undefined } : c), wires }); }}
                      className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-bold text-black/70 transition-all duration-150 hover:scale-110 ${selected ? 'scale-110 border-white shadow-[0_0_0_2px_rgba(255,255,255,0.15)]' : 'border-slate-700'}`}
                      style={{ background: cc || '#1f2937' }}
                      aria-label={`Selecionar cor ${cc || 'padrão'}`}
                    >
                      {selected && '✓'}
                    </button>
                  );
                })}
              </div>
              {editColor !== undefined && <div className="text-xs text-slate-500">Selecionada: {editColor || 'padrão do módulo'}</div>}
            </Field>

            <Field label="Rotação">
              <div className="flex flex-wrap gap-2">
                {[0, 90, 180, 270].map(a => (
                  <SmallButton key={a} tone={(comp.r || 0) === a ? 'brand' : 'muted'} onClick={() => push({ comps: comps.map(c => c.id === comp.id ? { ...c, r: a } : c), wires })}>
                    {a}°
                  </SmallButton>
                ))}
                <SmallButton tone="muted" onClick={() => push({ comps: comps.map(c => c.id === comp.id ? { ...c, r: (((c.r || 0) + 90) % 360 + 360) % 360 } : c), wires })}>+90°</SmallButton>
                <SmallButton tone="muted" onClick={() => push({ comps: comps.map(c => c.id === comp.id ? { ...c, r: (((c.r || 0) - 90) % 360 + 360) % 360 } : c), wires })}>−90°</SmallButton>
              </div>
            </Field>

            <SmallButton tone="danger" wide onClick={() => { push({ comps: comps.filter(c => c.id !== comp.id), wires: wires.filter(w => w.id !== comp.id) }); setSel(null); }}>
              <AppIcon name="delete" className="h-4 w-4" />
              Apagar componente
            </SmallButton>
          </div>
        </div>
      )}

      {sd && (
        <div className="mt-4 space-y-4">
          <div className="workspace-card rounded-3xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Resultados</div>
                <div className="mt-1 text-sm text-slate-400">Resumo do cálculo e diagnóstico do circuito.</div>
              </div>
              <div className="flex items-center gap-2">
                <SmallButton tone="brand" onClick={onCalc}>Recalcular</SmallButton>
                <SmallButton tone={running ? 'success' : 'muted'} onClick={onToggleSim}>{running ? 'Parar' : 'Simular'}</SmallButton>
              </div>
            </div>
            <div className="space-y-2">
              {sd.results.map((r, i) => {
                const rowColor = r.col || modColor;
                return (
                  <div
                    key={i}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-white/6 bg-slate-950/60 px-3 py-2.5 transition-all duration-150 hover:border-white/12 hover:bg-slate-950/80"
                    style={{ borderLeftColor: rowColor, borderLeftWidth: 3 }}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm transition-transform duration-150 group-hover:scale-105"
                        style={{ background: `${rowColor}1f`, color: rowColor }}
                      >
                        {r.icon}
                      </span>
                      <span className="truncate text-sm text-slate-400">{r.label}</span>
                    </div>
                    <span className="mono shrink-0 text-sm font-semibold" style={{ color: rowColor }}>{r.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="workspace-card rounded-3xl p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Passo a passo</div>
                <div className="mt-1 text-sm text-slate-400">Sequência de avaliação lógica em tempo real.</div>
              </div>
              {moduleMeta?.wiki && (
                <a
                  href={moduleMeta.wiki}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-violet-400/30 hover:text-violet-200"
                >
                  <AppIcon name="wiki" className="h-4 w-4" />
                  Wikipedia
                </a>
              )}
            </div>
            <div className="rounded-2xl border border-white/6 bg-[#080b14] p-4 mono text-xs leading-6 text-slate-400 shadow-[inset_0_2px_12px_rgba(0,0,0,0.25)]">
              {sd.steps.map((s, i) => (
                s.type === 'divider'
                  ? <div key={i} className="my-2 h-px bg-white/8" />
                  : (
                    <div
                      key={i}
                      className={`${s.type === 'sub' || s.type === 'formula' ? 'pl-4' : ''}`}
                      style={{
                        color: s.type === 'title' ? '#f59e0b' : s.type === 'formula' ? '#c084fc' : s.type === 'result' ? '#4ade80' : '#94a3b8',
                        fontWeight: s.type === 'title' || s.type === 'result' ? 700 : 400,
                      }}
                    >
                      {s.text}
                    </div>
                  )
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
