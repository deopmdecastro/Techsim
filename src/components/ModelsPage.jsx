import { useMemo, useState } from 'react';
import { hexToRgba } from '../constants';
import { MODS_ALL, MODULE_PRESETS } from '../data/modules';
import { AppIcon } from './ui/AppIcon';

export function ModelsPage({ onUsePreset }) {
  const [moduleFilter, setModuleFilter] = useState('all');

  const entries = useMemo(() => {
    const list = [];
    MODS_ALL.forEach(module => {
      (MODULE_PRESETS[module.id] || []).forEach(preset => list.push({ module, preset }));
    });
    return moduleFilter === 'all' ? list : list.filter(e => e.module.id === moduleFilter);
  }, [moduleFilter]);

  return (
    <div className="flex flex-col gap-5">
      <section className="panel-glass rounded-[24px] p-6">
        <div className="eyebrow">Modelos</div>
        <h1 className="font-display text-xl font-semibold text-slate-100">Modelos e templates prontos</h1>
        <p className="mt-1 text-sm text-slate-400">Começa a partir de um circuito pré-configurado, para qualquer módulo.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setModuleFilter('all')}
            className={`ts-pill cursor-pointer ${moduleFilter === 'all' ? 'border-violet-400/50 bg-violet-500/15 text-violet-200' : ''}`}
          >
            Todos
          </button>
          {MODS_ALL.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => setModuleFilter(m.id)}
              className="ts-pill cursor-pointer"
              style={moduleFilter === m.id ? { color: m.color, borderColor: hexToRgba(m.color, 0.4), background: hexToRgba(m.color, 0.15) } : {}}
            >
              {m.label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.length === 0 && (
          <div className="ts-card col-span-full flex flex-col items-center gap-2 p-10 text-center text-slate-500">
            <AppIcon name="models" className="h-8 w-8 opacity-40" />
            <div className="text-sm">Ainda não há modelos para este módulo.</div>
          </div>
        )}
        {entries.map(({ module, preset }) => (
          <div key={preset.id} className="ts-card flex flex-col gap-3 p-5" style={{ borderColor: hexToRgba(module.color, 0.2) }}>
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: hexToRgba(module.color, 0.15), color: module.color }}
              >
                <AppIcon icon={module.iconify} className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-100">{preset.title}</div>
                <span className="ts-pill mt-1 inline-block" style={{ color: module.color, borderColor: hexToRgba(module.color, 0.3), background: hexToRgba(module.color, 0.12) }}>
                  {module.label}
                </span>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">{preset.description}</p>
            <button
              type="button"
              onClick={() => onUsePreset(module.id, preset.id)}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/15 px-3 py-2 text-xs font-semibold text-violet-100 transition hover:bg-violet-500/25"
            >
              <AppIcon name="preset" className="h-4 w-4" />
              Usar este modelo
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
