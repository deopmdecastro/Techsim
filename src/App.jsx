import { useCallback, useEffect, useMemo, useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { Engine } from './components/Engine';
import { AdminDashboard } from './components/AdminDashboard';
import { IconRail } from './components/IconRail';
import { LIBS, MODS_ALL, MODULE_PRESETS, getModulePresets } from './data/modules';
import { getCurrentUser, login, logout, refreshCurrentUser, register } from './services/auth';
import { listProjectRecords, loadProjectRecord, saveProjectRecord } from './services/projects';
import { backendConfig, isRemoteBackendEnabled } from './services/backend';
import { useTheme } from './context/ThemeContext';

function ThemeSwitch({ theme, toggleTheme }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: 4, borderRadius: 999, background: '#0a1120', border: '1px solid #1b2740' }}>
      <button
        onClick={() => theme !== 'light' && toggleTheme()}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
          background: theme === 'light' ? '#f8fafc' : 'transparent', color: theme === 'light' ? '#0f172a' : '#64748b', fontWeight: 600, fontSize: 12.5,
        }}
      >
        <span aria-hidden>☀️</span> Light
      </button>
      <button
        onClick={() => theme !== 'dark' && toggleTheme()}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 999, border: theme === 'dark' ? '1px solid #8b5cf6' : 'none', cursor: 'pointer',
          background: theme === 'dark' ? 'rgba(139,92,246,0.18)' : 'transparent', color: theme === 'dark' ? '#c4b5fd' : '#64748b', fontWeight: 600, fontSize: 12.5,
        }}
      >
        <span aria-hidden>🌙</span> Dark
      </button>
    </div>
  );
}

function UserChip({ user }) {
  const name = user?.name || 'Convidado';
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px 6px 6px', borderRadius: 999, background: '#0a1120', border: '1px solid #1b2740', cursor: 'pointer' }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg,#fb923c,#f43f5e)', color: '#fff', fontWeight: 700, fontSize: 12.5,
      }}>{initial}</div>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{name.split(' ')[0]}</span>
      <span style={{ color: '#475569', fontSize: 10 }}>▾</span>
    </div>
  );
}

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [page, setPage] = useState('landing');
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [activeModule, setActiveModule] = useState('dc');
  const [recentProjects, setRecentProjects] = useState([]);
  const [initialProject, setInitialProject] = useState(null);
  const [editorSeed, setEditorSeed] = useState(0);

  const activeModuleMeta = useMemo(() => MODS_ALL.find(item => item.id === activeModule), [activeModule]);
  const currentModulePresets = useMemo(() => getModulePresets(activeModule), [activeModule]);
  const currentModuleProjects = useMemo(() => recentProjects.filter(project => project.moduleId === activeModule), [recentProjects, activeModule]);

  const refreshProjects = useCallback(async email => {
    if (!email) {
      setRecentProjects([]);
      return [];
    }
    const items = await listProjectRecords(email);
    setRecentProjects(items);
    return items;
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const sessionUser = getCurrentUser();
      if (!sessionUser) return;
      try {
        const freshUser = isRemoteBackendEnabled() ? await refreshCurrentUser() : sessionUser;
        setUser(freshUser);
        setPage('dashboard');
        await refreshProjects(freshUser.email);
      } catch {
        setUser(sessionUser);
        setPage('dashboard');
        await refreshProjects(sessionUser.email);
      }
    };
    bootstrap().catch(() => undefined);
  }, [refreshProjects]);

  const handleAuthSubmit = useCallback(async (mode, form) => {
    const sessionUser = mode === 'register'
      ? await register({ name: form.name, email: form.email, password: form.password })
      : await login({ email: form.email, password: form.password });
    setUser(sessionUser);
    setAuth(null);
    setPage('dashboard');
    await refreshProjects(sessionUser.email);
  }, [refreshProjects]);

  const handleLogout = useCallback(async () => {
    await logout();
    setUser(null);
    setRecentProjects([]);
    setInitialProject(null);
    setPage('landing');
  }, []);

  const openBlankModule = useCallback(moduleId => {
    setActiveModule(moduleId);
    setInitialProject(null);
    setEditorSeed(seed => seed + 1);
    setPage('editor');
  }, []);

  const openPresetModule = useCallback(moduleId => {
    const preset = getModulePresets(moduleId)[0];
    setActiveModule(moduleId);
    setInitialProject(preset ? preset.project : null);
    setEditorSeed(seed => seed + 1);
    setPage('editor');
  }, []);

  const openSavedProjectFromDashboard = useCallback(async (moduleId, projectId) => {
    setActiveModule(moduleId);
    if (!projectId) {
      setInitialProject(null);
      setEditorSeed(seed => seed + 1);
      setPage('editor');
      return;
    }
    const project = await loadProjectRecord(projectId);
    setInitialProject(project);
    setEditorSeed(seed => seed + 1);
    setPage('editor');
  }, []);

  const handleSaveProject = useCallback(async ({ id, moduleId, name, summary, viewMode, data }) => {
    if (!user?.email) throw new Error('Faça login para salvar projetos.');
    const project = await saveProjectRecord({ id, moduleId, name, summary, viewMode, data, userEmail: user.email });
    await refreshProjects(user.email);
    return project;
  }, [user?.email, refreshProjects]);

  const handleLoadProjectById = useCallback(async projectId => loadProjectRecord(projectId), []);

  if (page === 'landing') {
    return (
      <div className="techsim-shell">
        <LandingPage onLogin={() => setAuth({ mode: 'login' })} onRegister={() => setAuth({ mode: 'register' })} />
        {auth && <AuthModal mode={auth.mode} onClose={() => setAuth(null)} onSubmit={handleAuthSubmit} />}
      </div>
    );
  }

  if (page === 'admin') {
    return <AdminDashboard user={user} onBack={() => setPage('dashboard')} />;
  }

  if (page === 'dashboard') {
    return (
      <div className="techsim-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <IconRail active="projects" onNavigate={id => id === 'edit' && setPage('editor')} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="app-topbar">
            <div className="brand-badge">
              <span style={{ fontSize: 20 }}>⚡</span>
              <div>
                <div className="brand-title">Techsim Platform</div>
                <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>Docker, API, colaboração e simulação industrial</div>
              </div>
            </div>
            <div className="topbar-actions">
              <span className="topbar-chip">{isRemoteBackendEnabled() ? 'API remota' : 'Modo local'}</span>
              <span className="topbar-chip">{backendConfig.appName}</span>
              <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />
              <UserChip user={user} />
            </div>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <Dashboard
              user={user}
              onLogout={handleLogout}
              onOpenModule={openSavedProjectFromDashboard}
              onOpenPreset={openPresetModule}
              onAdmin={() => setPage('admin')}
              presetCatalog={MODULE_PRESETS}
              recentProjects={recentProjects}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="techsim-shell" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <IconRail active="edit" onNavigate={id => id === 'projects' && setPage('dashboard')} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="app-topbar" style={{ position: 'relative' }}>
          <div className="brand-badge">
            <span style={{ fontSize: 18 }}>⚡</span>
            <div>
              <div className="brand-title">Techsim Platform</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 240 }}>
            <span style={{ fontSize: 10.5, color: 'var(--text-soft)', letterSpacing: 0.5 }}>Projeto atual</span>
            <select
              value={activeModule}
              onChange={event => openBlankModule(event.target.value)}
              style={{
                background: '#0a1120', border: '1px solid #1b2740', color: '#e2e8f0', borderRadius: 10,
                padding: '8px 12px', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer',
              }}
            >
              {MODS_ALL.map(module => (
                <option key={module.id} value={module.id}>{module.label} — Simulação em tempo real</option>
              ))}
            </select>
          </div>

          <div className="topbar-actions">
            <button className="topbar-chip" onClick={() => setPage('dashboard')}>← Dashboard</button>
            <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />
            <UserChip user={user} />
          </div>
        </div>
        <Engine
          key={`${activeModule}-${editorSeed}`}
          modId={activeModule}
          modColor={activeModuleMeta?.color || '#22d3ee'}
          lib={LIBS[activeModule] || []}
          userName={user?.name}
          modulePresets={currentModulePresets}
          savedProjects={currentModuleProjects}
          onSaveProject={handleSaveProject}
          onLoadProject={handleLoadProjectById}
          initialProject={initialProject}
          initialProjectKey={`${activeModule}-${editorSeed}`}
        />
      </div>
    </div>
  );
}
