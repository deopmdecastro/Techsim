import { useEffect, useState } from 'react';
import { SYMBOL_LIBRARY, symbolAssetUrl } from '../data/symbolLibrary';
import { getSymbolOverrides } from '../services/symbolOverrides';

// Mostra o símbolo SVG real de um componente quando existir mapeamento
// (biblioteca embutida ou override adicionado no Admin). Caso contrário,
// cai de volta para o glifo de texto original (item.sym), sem quebrar nada.
export default function SymbolIcon({ item, size = 22, className = '' }) {
  const [overrides, setOverrides] = useState(() => getSymbolOverrides());

  useEffect(() => {
    const onChange = () => setOverrides(getSymbolOverrides());
    window.addEventListener('techsim-symbols-changed', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('techsim-symbols-changed', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const override = overrides[item.t];
  const builtin = SYMBOL_LIBRARY[item.t];

  const src = override ? override.dataUrl : builtin ? symbolAssetUrl(builtin.file) : null;

  if (!src) {
    return (
      <span className={`mono text-sm font-semibold ${className}`} style={{ color: item.col }}>
        {item.sym}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={item.lbl}
      width={size}
      height={size}
      draggable={false}
      style={{ filter: 'invert(1) brightness(1.5)', objectFit: 'contain' }}
      className={className}
      onError={(event) => { event.currentTarget.style.display = 'none'; }}
    />
  );
}
