import { useEffect, useRef, useState } from 'react';
import { AppIcon } from './AppIcon';

/*
 * Dropdown temático para substituir <select> nativos.
 * O <select> do browser ignora o tema da app (aparece com o estilo
 * default do SO), o que quebra a identidade visual escura/roxa do
 * Techsim. Este componente replica o comportamento de um <select>
 * (teclado, aria, valor controlado) mas com o mesmo "panel-glass"
 * usado no resto da interface.
 */
export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Selecionar…',
  icon,
  className = '',
  buttonClassName = '',
  renderOption,
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef(null);
  const listRef = useRef(null);

  const selected = options.find(option => option.value === value);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = event => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const onKey = event => {
      if (event.key === 'Escape') { setOpen(false); return; }
      if (event.key === 'ArrowDown') { event.preventDefault(); setHighlight(index => Math.min(index + 1, options.length - 1)); }
      if (event.key === 'ArrowUp') { event.preventDefault(); setHighlight(index => Math.max(index - 1, 0)); }
      if (event.key === 'Enter') {
        event.preventDefault();
        const option = options[highlight];
        if (option) { onChange(option.value); setOpen(false); }
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, options, highlight, onChange]);

  useEffect(() => {
    if (open) setHighlight(Math.max(options.findIndex(option => option.value === value), 0));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector('[data-highlighted="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [open, highlight]);

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen(value_ => !value_)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center gap-2 rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3 text-left text-sm font-medium text-slate-100 outline-none transition hover:border-white/15 ${open ? 'border-violet-400/50 shadow-[0_0_0_3px_rgba(139,92,246,0.12)]' : ''} ${buttonClassName}`}
      >
        {icon && <AppIcon name={icon} className="h-4 w-4 shrink-0 text-violet-300" />}
        <span className="min-w-0 flex-1 truncate">{selected ? selected.label : placeholder}</span>
        <AppIcon name="down" className={`h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform duration-150 ${open ? 'rotate-180' : 'rotate-0'}`} />
      </button>

      {open && (
        <div
          ref={listRef}
          role="listbox"
          className="panel-glass editor-scroll absolute left-0 right-0 top-[calc(100%+8px)] z-[200] max-h-72 overflow-y-auto rounded-2xl p-1.5 shadow-[0_20px_44px_rgba(2,6,23,0.5)]"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlight;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                data-highlighted={isHighlighted}
                onMouseEnter={() => setHighlight(index)}
                onClick={() => { onChange(option.value); setOpen(false); }}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${isSelected ? 'bg-violet-500/18 text-violet-100' : isHighlighted ? 'bg-white/[0.06] text-white' : 'text-slate-300'}`}
              >
                {renderOption ? renderOption(option) : <span className="min-w-0 flex-1 truncate">{option.label}</span>}
                {isSelected && <AppIcon name="check" className="h-3.5 w-3.5 shrink-0 text-violet-300" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
