import { useCallback, useEffect, useMemo, useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { Engine } from './components/Engine';
import { AdminDashboard } from './components/AdminDashboard';
import { LIBS, MODS_ALL, MODULE_PRESETS, getModulePresets } from './data/modules';
import { getCurrentUser, login, logout, refreshCurrentUser, register } from './services/auth';
import { listProjectRecords, loadProjectRecord, saveProjectRecord } from './services/projects';
import { backendConfig, isRemoteBackendEnabled } from './services/backend';
import { useTheme } from './context/ThemeContext';

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
      <div className="techsim-shell">
        <div className="app-topbar">
          <div className="brand-badge">
            <span style={{ fontSize: 20 }}>⚡</span>
            <div>
              <div className="brand-title">TECHSIM PLATFORM</div>
              <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>Docker, API, colaboração e simulação industrial</div>
            </div>
          </div>
          <div className="topbar-actions">
            <span className="topbar-chip">{isRemoteBackendEnabled() ? 'API remota' : 'Modo local'}</span>
            <span className="topbar-chip">{backendConfig.appName}</span>
            <button className="topbar-chip" onClick={toggleTheme}>{theme === 'dark' ? '☀️ Light' : '🌙 Dark'}</button>
          </div>
        </div>
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
    );
  }

  return (
    <div className="techsim-shell" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <div className="app-topbar" style={{ position: 'relative' }}>
        <div className="brand-badge">
          <span style={{ fontSize: 18 }}>⚙️</span>
          <div>
            <div className="brand-title">{activeModuleMeta?.label || 'Editor'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>Simulação em tempo real · páginas · autosave ready</div>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="topbar-chip" onClick={() => setPage('dashboard')}>← Dashboard</button>
          <button className="topbar-chip" onClick={toggleTheme}>{theme === 'dark' ? '☀️ Light' : '🌙 Dark'}</button>
          <span className="topbar-chip">{user?.name}</span>
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
  );
}
