import { useCallback, useEffect, useMemo, useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { Engine } from './components/Engine';
import { AdminDashboard } from './components/AdminDashboard';
import { IconRail } from './components/IconRail';
import { AppIcon } from './components/ui/AppIcon';
import { LIBS, MODS_ALL, MODULE_PRESETS, getModulePresets } from './data/modules';
import { getCurrentUser, login, logout, refreshCurrentUser, register } from './services/auth';
import { listProjectRecords, loadProjectRecord, saveProjectRecord } from './services/projects';
import { backendConfig, isRemoteBackendEnabled } from './services/backend';
import { useTheme } from './context/ThemeContext';

function ThemeSwitch({ theme, toggleTheme }) {
  const items = [
    { id: 'light', label: 'Light', icon: 'themeLight' },
    { id: 'dark', label: 'Dark', icon: 'themeDark' },
  ];

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-slate-950/70 p-1 shadow-[0_10px_30px_rgba(2,8,23,0.25)]">
      {items.map(item => {
        const active = theme === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => !active && toggleTheme()}
            className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? 'border border-violet-400/50 bg-violet-500/20 text-violet-100'
                : 'border border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AppIcon name={item.icon} className="h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function UserChip({ user }) {
  const name = user?.name || 'Convidado';
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <button
      type="button"
      className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/70 py-1.5 pl-1.5 pr-3 text-left shadow-[0_10px_30px_rgba(2,8,23,0.25)] transition hover:border-white/20"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 via-rose-400 to-violet-500 text-sm font-bold text-white">
        {initial}
      </span>
      <span className="text-sm font-semibold text-slate-100">{name.split(' ')[0]}</span>
      <AppIcon name="down" className="h-4 w-4 text-slate-500" />
    </button>
  );
}

function WorkspaceHeader({ activeModule, openBlankModule, moduleOptions, theme, toggleTheme, user, onBack }) {
  const moduleMeta = moduleOptions.find(item => item.id === activeModule);

  return (
    <header className="panel-glass mx-4 mt-4 flex flex-wrap items-center justify-between gap-4 rounded-[24px] px-5 py-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-500/30 to-indigo-500/20 text-white shadow-[0_0_30px_rgba(124,58,237,0.22)]">
          <AppIcon icon={moduleMeta?.iconify} className="h-6 w-6" />
        </div>
        <div>
          <div className="eyebrow">Techsim Platform</div>
          <div className="font-display text-lg font-semibold text-slate-100">Workspace industrial em tempo real</div>
        </div>
      </div>

      <div className="min-w-[260px] flex-1 max-w-xl">
        <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">Projeto atual</div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-slate-950/60 px-4 py-3">
          <AppIcon icon={moduleMeta?.iconify} className="h-5 w-5 text-violet-300" />
          <select
            value={activeModule}
            onChange={event => openBlankModule(event.target.value)}
            className="w-full bg-transparent text-sm font-medium text-slate-100 outline-none"
          >
            {moduleOptions.map(module => (
              <option key={module.id} value={module.id} className="bg-slate-900 text-slate-100">
                {module.label} — Simulação em tempo real
              </option>
            ))}
          </select>
          {moduleMeta?.wiki && (
            <a
              href={moduleMeta.wiki}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-violet-400/30 hover:text-violet-200"
              title="Abrir referência na Wikipedia"
            >
              <AppIcon name="wiki" className="h-4 w-4" />
              Wiki
            </a>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:text-white"
        >
          <AppIcon name="back" className="h-4 w-4" />
          Dashboard
        </button>
        <div className="hidden rounded-full border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-400 lg:inline-flex">
          {isRemoteBackendEnabled() ? 'API remota' : 'Modo local'} · {backendConfig.appName}
        </div>
        <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />
        <UserChip user={user} />
      </div>
    </header>
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
      <div className="techsim-shell flex h-screen overflow-hidden">
        <IconRail active="projects" onNavigate={id => id === 'edit' && setPage('editor')} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="panel-glass mx-4 mt-4 flex flex-wrap items-center justify-between gap-4 rounded-[24px] px-5 py-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/25 bg-gradient-to-br from-violet-500/30 to-indigo-500/20 text-white shadow-[0_0_30px_rgba(124,58,237,0.22)]">
                <AppIcon name="module" className="h-6 w-6" />
              </div>
              <div>
                <div className="eyebrow">Techsim Platform</div>
                <div className="font-display text-lg font-semibold text-slate-100">Docker, API, colaboração e simulação industrial</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-400">
                {isRemoteBackendEnabled() ? 'API remota' : 'Modo local'}
              </span>
              <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-400">{backendConfig.appName}</span>
              <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />
              <UserChip user={user} />
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-auto px-4 pb-4 pt-4">
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
    <div className="techsim-shell flex h-screen overflow-hidden">
      <IconRail active="edit" onNavigate={id => id === 'projects' && setPage('dashboard')} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden pb-4">
        <WorkspaceHeader
          activeModule={activeModule}
          openBlankModule={openBlankModule}
          moduleOptions={MODS_ALL}
          theme={theme}
          toggleTheme={toggleTheme}
          user={user}
          onBack={() => setPage('dashboard')}
        />
        <div className="min-h-0 flex-1 overflow-hidden px-4 pt-4">
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
    </div>
  );
}
