const ICONS = {
  home: <path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-8.5Z" />,
  grid: <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />,
  edit: <path d="M4 20h4.2L18.8 9.4a2 2 0 0 0 0-2.8l-1.4-1.4a2 2 0 0 0-2.8 0L4 15.8V20Zm10.6-13.2 2.6 2.6" />,
  db: <path d="M12 5c4.4 0 8-1.34 8-3s-3.6-3-8-3-8 1.34-8 3 3.6 3 8 3Zm-8 4c0 1.66 3.6 3 8 3s8-1.34 8-3M4 9v6c0 1.66 3.6 3 8 3s8-1.34 8-3V9M4 15v6c0 1.66 3.6 3 8 3s8-1.34 8-3v-6" />,
  cube: <path d="m12 3 8 4.6v8.8L12 21l-8-4.6V7.6L12 3Zm0 0v8.6m0 0L4 7.4m8 4.2 8-4.2m-8 9.4V12" />,
  chart: <path d="M4 20V10m6.5 10V4m6.5 16v-7" />,
  image: <path d="M4 5h16v14H4V5Zm2.5 11 4-4.5 3 3 3.5-4.5L20 16" />,
  gear: <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Zm8-3.2c0 .5-.04 1-.12 1.46l2.1 1.63-2 3.46-2.48-1a7.9 7.9 0 0 1-2.53 1.46L14.6 21H9.4l-.37-2.79a7.9 7.9 0 0 1-2.53-1.46l-2.48 1-2-3.46 2.1-1.63A8.3 8.3 0 0 1 4 12c0-.5.04-1 .12-1.46L2.02 8.9l2-3.46 2.48 1A7.9 7.9 0 0 1 9.03 4.98L9.4 2.2h5.2l.37 2.79a7.9 7.9 0 0 1 2.53 1.46l2.48-1 2 3.46-2.1 1.63c.08.46.12.96.12 1.46Z" />,
};

function RailIcon({ name, size = 18, strokeWidth = 1.8 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  );
}

export function IconRail({ active = 'edit', onNavigate }) {
  const items = [
    { id: 'home', icon: 'home', label: 'Início' },
    { id: 'projects', icon: 'grid', label: 'Projetos' },
    { id: 'edit', icon: 'edit', label: 'Editor' },
    { id: 'data', icon: 'db', label: 'Dados' },
    { id: 'models', icon: 'cube', label: 'Modelos 3D' },
    { id: 'reports', icon: 'chart', label: 'Relatórios' },
    { id: 'media', icon: 'image', label: 'Mídia' },
  ];

  return (
    <div style={{
      width: 60, flexShrink: 0, background: '#04070d', borderRight: '1px solid #131c2c',
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 0', gap: 6, height: '100%',
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 10, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', boxShadow: '0 0 18px #8b5cf655', color: '#fff',
      }}>
        <RailIcon name="cube" size={18} strokeWidth={2} />
      </div>

      {items.map(item => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            title={item.label}
            onClick={() => onNavigate?.(item.id)}
            style={{
              width: 40, height: 40, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isActive ? 'rgba(139,92,246,0.16)' : 'transparent',
              border: isActive ? '1px solid #8b5cf6' : '1px solid transparent',
              color: isActive ? '#a78bfa' : '#3f4d63',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <RailIcon name={item.icon} />
          </button>
        );
      })}

      <div style={{ flex: 1 }} />

      <button
        title="Configurações"
        onClick={() => onNavigate?.('settings')}
        style={{
          width: 40, height: 40, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: '1px solid transparent', color: '#3f4d63', cursor: 'pointer',
        }}
      >
        <RailIcon name="gear" />
      </button>

      <button
        title="Recolher"
        style={{
          width: 40, height: 24, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#0a1120', border: '1px solid #131c2c', color: '#3f4d63', cursor: 'pointer', marginTop: 4,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m8 10 4 4 4-4" /></svg>
      </button>
    </div>
  );
}
