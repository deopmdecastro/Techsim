import { useCallback, useEffect, useMemo, useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { Engine } from './components/Engine';
import { AdminDashboard } from './components/AdminDashboard';
import { IconRail } from './components/IconRail';
import { AppIcon } from './components/ui/AppIcon';
import { PageLayout, ThemeSwitch, UserChip } from './components/PageLayout';
import { CustomSelect } from './components/ui/CustomSelect';
import { HomePage } from './components/HomePage';
import { DataPage } from './components/DataPage';
import { ModelsPage } from './components/ModelsPage';
import { ReportsPage } from './components/ReportsPage';
import { MediaPage } from './components/MediaPage';
import { SettingsPage } from './components/SettingsPage';
import { LIBS, MODS_ALL, MODULE_PRESETS, getModulePresets } from './data/modules';
import { getCurrentUser, login, logout, refreshCurrentUser, register } from './services/auth';
import { listProjectRecords, loadProjectRecord, saveProjectRecord } from './services/projects';
import { backendConfig, isRemoteBackendEnabled } from './services/backend';
import { useTheme } from './context/ThemeContext';

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
        <div className="flex items-center gap-3">
          <CustomSelect
            className="flex-1"
            value={activeModule}
            onChange={openBlankModule}
            options={moduleOptions.map(module => ({ value: module.id, label: `${module.label} — Simulação em tempo real`, icon: module.iconify, color: module.color }))}
            renderOption={option => (
              <span className="flex min-w-0 flex-1 items-center gap-2.5">
                <AppIcon icon={option.icon} className="h-4 w-4 shrink-0" style={{ color: option.color }} />
                <span className="truncate">{option.label}</span>
              </span>
            )}
            buttonClassName="py-3"
          />
          {moduleMeta?.wiki && (
            <a
              href={moduleMeta.wiki}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/8 bg-white/5 px-3 py-3 text-xs font-medium text-slate-300 transition hover:border-violet-400/30 hover:text-violet-200"
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

  const openSpecificPreset = useCallback((moduleId, presetId) => {
    const preset = getModulePresets(moduleId).find(item => item.id === presetId) || getModulePresets(moduleId)[0];
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

  const handleRailNavigate = useCallback(id => {
    if (id === 'projects') { setPage('dashboard'); return; }
    if (id === 'edit') { setPage('editor'); return; }
    if (['home', 'data', 'models', 'reports', 'media', 'settings'].includes(id)) setPage(id);
  }, []);

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
      <div className="techsim-shell flex min-h-screen overflow-hidden pb-[92px] lg:h-screen lg:pb-0">
        <IconRail active="projects" onNavigate={handleRailNavigate} />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="panel-glass mx-3 mt-3 flex flex-wrap items-center justify-between gap-4 rounded-[24px] px-4 py-4 sm:mx-4 sm:mt-4 sm:px-5">
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
          <div className="min-h-0 flex-1 overflow-auto px-3 pb-4 pt-4 sm:px-4">
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

  if (page === 'home') {
    return (
      <PageLayout active="home" icon="home" title="Início" subtitle="O teu resumo do Techsim Platform" onNavigate={handleRailNavigate} theme={theme} toggleTheme={toggleTheme} user={user}>
        <HomePage user={user} recentProjects={recentProjects} onOpenModule={openBlankModule} onOpenDashboard={() => setPage('dashboard')} />
      </PageLayout>
    );
  }

  if (page === 'data') {
    return (
      <PageLayout active="data" icon="data" title="Dados" subtitle="Projetos guardados em todos os módulos" onNavigate={handleRailNavigate} theme={theme} toggleTheme={toggleTheme} user={user}>
        <DataPage recentProjects={recentProjects} onOpenModule={openSavedProjectFromDashboard} />
      </PageLayout>
    );
  }

  if (page === 'models') {
    return (
      <PageLayout active="models" icon="models" title="Modelos" subtitle="Templates prontos para todos os módulos" onNavigate={handleRailNavigate} theme={theme} toggleTheme={toggleTheme} user={user}>
        <ModelsPage onUsePreset={openSpecificPreset} />
      </PageLayout>
    );
  }

  if (page === 'reports') {
    return (
      <PageLayout active="reports" icon="reports" title="Relatórios" subtitle="Estatísticas dos teus projetos" onNavigate={handleRailNavigate} theme={theme} toggleTheme={toggleTheme} user={user}>
        <ReportsPage recentProjects={recentProjects} />
      </PageLayout>
    );
  }

  if (page === 'media') {
    return (
      <PageLayout active="media" icon="media" title="Mídia" subtitle="Biblioteca de símbolos SVG" onNavigate={handleRailNavigate} theme={theme} toggleTheme={toggleTheme} user={user}>
        <MediaPage onOpenAdmin={() => setPage('admin')} />
      </PageLayout>
    );
  }

  if (page === 'settings') {
    return (
      <PageLayout active="settings" icon="settings" title="Configurações" subtitle="Conta, aparência e sistema" onNavigate={handleRailNavigate} theme={theme} toggleTheme={toggleTheme} user={user}>
        <SettingsPage user={user} theme={theme} toggleTheme={toggleTheme} onLogout={handleLogout} onOpenAdmin={() => setPage('admin')} />
      </PageLayout>
    );
  }

  return (
    <div className="techsim-shell flex h-screen overflow-hidden">
      <IconRail active="edit" onNavigate={handleRailNavigate} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden px-3 pb-4 sm:px-0">
        <WorkspaceHeader
          activeModule={activeModule}
          openBlankModule={openBlankModule}
          moduleOptions={MODS_ALL}
          theme={theme}
          toggleTheme={toggleTheme}
          user={user}
          onBack={() => setPage('dashboard')}
        />
        <div className="min-h-0 flex-1 overflow-hidden px-0 pt-3 sm:px-4 sm:pt-4">
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
