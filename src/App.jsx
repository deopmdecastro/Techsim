import { useCallback, useEffect, useMemo, useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { AuthModal } from "./components/AuthModal";
import { Dashboard } from "./components/Dashboard";
import { Engine } from "./components/Engine";
import { AdminDashboard } from "./components/AdminDashboard";
import { LIBS, MODS_ALL, MODULE_PRESETS, getModulePresets } from "./data/modules";
import { getCurrentUser, login, logout, register } from "./services/auth";
import { listProjectRecords, loadProjectRecord, saveProjectRecord } from "./services/projects";

export default function App() {
  const [page, setPage] = useState("landing");
  const [auth, setAuth] = useState(null);
  const [user, setUser] = useState(null);
  const [activeModule, setActiveModule] = useState("dc");
  const [recentProjects, setRecentProjects] = useState([]);
  const [initialProject, setInitialProject] = useState(null);
  const [editorSeed, setEditorSeed] = useState(0);

  const activeModuleMeta = useMemo(() => MODS_ALL.find(item => item.id === activeModule), [activeModule]);
  const currentModulePresets = useMemo(() => getModulePresets(activeModule), [activeModule]);
  const currentModuleProjects = useMemo(() => recentProjects.filter(project => project.moduleId === activeModule), [recentProjects, activeModule]);

  const refreshProjects = useCallback(async (email) => {
    if (!email) {
      setRecentProjects([]);
      return [];
    }
    const items = await listProjectRecords(email);
    setRecentProjects(items);
    return items;
  }, []);

  useEffect(() => {
    const sessionUser = getCurrentUser();
    if (sessionUser) {
      setUser(sessionUser);
      setPage("dashboard");
      refreshProjects(sessionUser.email).catch(() => undefined);
    }
  }, [refreshProjects]);

  const handleAuthSubmit = useCallback(async (mode, form) => {
    const sessionUser = mode === "register"
      ? await register({ name:form.name, email:form.email, password:form.password })
      : await login({ email:form.email, password:form.password });
    setUser(sessionUser);
    setAuth(null);
    setPage("dashboard");
    await refreshProjects(sessionUser.email);
  }, [refreshProjects]);

  const handleLogout = useCallback(async () => {
    await logout();
    setUser(null);
    setRecentProjects([]);
    setInitialProject(null);
    setPage("landing");
  }, []);

  const openBlankModule = useCallback((moduleId) => {
    setActiveModule(moduleId);
    setInitialProject(null);
    setEditorSeed(seed => seed + 1);
    setPage("editor");
  }, []);

  const openPresetModule = useCallback((moduleId) => {
    const preset = getModulePresets(moduleId)[0];
    setActiveModule(moduleId);
    setInitialProject(preset ? preset.project : null);
    setEditorSeed(seed => seed + 1);
    setPage("editor");
  }, []);

  const openSavedProjectFromDashboard = useCallback(async (moduleId, projectId) => {
    setActiveModule(moduleId);
    if (!projectId) {
      setInitialProject(null);
      setEditorSeed(seed => seed + 1);
      setPage("editor");
      return;
    }
    const project = await loadProjectRecord(projectId);
    setInitialProject(project);
    setEditorSeed(seed => seed + 1);
    setPage("editor");
  }, []);

  const handleSaveProject = useCallback(async ({ moduleId, name, summary, viewMode, data }) => {
    if (!user?.email) throw new Error("Faça login para salvar projetos.");
    const project = await saveProjectRecord({ moduleId, name, summary, viewMode, data, userEmail:user.email });
    await refreshProjects(user.email);
    return project;
  }, [user?.email, refreshProjects]);

  const handleLoadProjectById = useCallback(async (projectId) => {
    const project = await loadProjectRecord(projectId);
    return project;
  }, []);

  if (page === "landing") {
    return (
      <>
        <LandingPage onLogin={() => setAuth({ mode:"login" })} onRegister={() => setAuth({ mode:"register" })} />
        {auth && <AuthModal mode={auth.mode} onClose={() => setAuth(null)} onSubmit={handleAuthSubmit} />}
      </>
    );
  }

  if (page === "admin") {
    return <AdminDashboard user={user} onBack={() => setPage("dashboard")} />;
  }

  if (page === "dashboard") {
    return (
      <Dashboard
        user={user}
        onLogout={handleLogout}
        onOpenModule={openSavedProjectFromDashboard}
        onOpenPreset={openPresetModule}
        onAdmin={() => setPage("admin")}
        presetCatalog={MODULE_PRESETS}
        recentProjects={recentProjects}
      />
    );
  }

  return (
    <div style={{display:"flex", flexDirection:"column", height:"100vh", background:"#020b14", fontFamily:"'Courier New','Consolas',monospace", overflow:"hidden", userSelect:"none"}}>
      <div style={{height:50, background:"#040d18", borderBottom:"1px solid #1e3a5f", display:"flex", alignItems:"center", padding:"0 14px", gap:10, flexShrink:0}}>
        <button onClick={() => setPage("dashboard")} style={{background:"transparent", border:"1px solid #1e3a5f", color:"#64748b", padding:"5px 10px", borderRadius:6, cursor:"pointer", fontSize:10, letterSpacing:1, fontFamily:"inherit"}}>← Dashboard</button>
        <div style={{width:1, height:20, background:"#1e3a5f"}} />
        <span style={{fontSize:16, color:"#22d3ee", filter:"drop-shadow(0 0 4px #22d3ee)"}}>⚡</span>
        <span style={{fontSize:12, fontWeight:700, color:"#22d3ee", letterSpacing:2}}>TECHSIM PRO</span>
        <div style={{width:1, height:20, background:"#1e3a5f"}} />
        <span style={{fontSize:12, color:activeModuleMeta?.color, fontWeight:700}}>{activeModuleMeta?.icon} {activeModuleMeta?.label}</span>

        <div style={{marginLeft:8, display:"flex", gap:4, overflowX:"auto"}}>
          {MODS_ALL.map(module => (
            <button key={module.id} onClick={() => openBlankModule(module.id)} style={{background:module.id === activeModule ? `${module.color}22` : "transparent", border:`1px solid ${module.id === activeModule ? `${module.color}66` : "#1e293b"}`, color:module.id === activeModule ? module.color : "#475569", borderRadius:6, padding:"4px 8px", cursor:"pointer", fontSize:10, letterSpacing:0.5, fontFamily:"inherit", whiteSpace:"nowrap"}}>{module.icon}</button>
          ))}
        </div>

        <div style={{marginLeft:"auto", display:"flex", gap:8, alignItems:"center"}}>
          {user && <div style={{fontSize:9, color:"#475569"}}>{user.name}</div>}
          <button onClick={handleLogout} style={{background:"transparent", border:"1px solid #1e293b", color:"#475569", padding:"4px 8px", borderRadius:6, cursor:"pointer", fontSize:8, fontFamily:"inherit"}}>Sair</button>
        </div>
      </div>

      <Engine
        key={`${activeModule}-${editorSeed}`}
        modId={activeModule}
        modColor={activeModuleMeta?.color || "#22d3ee"}
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
