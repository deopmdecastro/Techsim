import { useMemo, useState } from "react";
import { hexToRgba, shiftHex } from "../constants";
import { MODS_ALL } from "../data/modules";

const MODULES = MODS_ALL.map(module => ({
  ...module,
  docs: module.desc,
}));

const SHORTCUTS = [
  ["S", "Selecionar / mover"], ["W", "Traçar fio"], ["D", "Apagar"],
  ["F9", "Calcular"], ["F5", "Simular"], ["Ctrl + D", "Duplicar componente"],
  ["Ctrl + ←/→", "Girar 90°"], ["2 / 3", "Alternar visão 2D / 3D"],
];

const pluralize = (count, singular, plural) => `${count} ${count === 1 ? singular : plural}`;

function ModuleCard({ module, presetCount, projectCount, onOpenModule, onOpenPreset }) {
  return (
    <div className="module-card" style={{border:`1px solid ${hexToRgba(module.color, 0.24)}`, boxShadow:`0 16px 40px ${hexToRgba(module.color, 0.08)}`}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12}}>
        <div style={{display:"flex", gap:12}}>
          <div style={{width:54, height:54, borderRadius:16, background:`linear-gradient(180deg, ${hexToRgba(module.color, 0.28)}, ${hexToRgba(module.color, 0.05)})`, border:`1px solid ${hexToRgba(module.color, 0.34)}`, display:"grid", placeItems:"center", color:module.color, fontSize:28, textShadow:`0 0 20px ${hexToRgba(module.color, 0.45)}`, flexShrink:0}}>
            {module.icon}
          </div>
          <div>
            <div style={{fontSize:13, fontWeight:700, color:module.color, marginBottom:6}}>{module.label}</div>
            <div style={{fontSize:10, color:"var(--text-soft)", lineHeight:1.6}}>{module.desc}</div>
          </div>
        </div>
        <div style={{display:"grid", gap:6, minWidth:96}}>
          <div style={{fontSize:8, color:module.color, background:hexToRgba(module.color, 0.12), border:`1px solid ${hexToRgba(module.color, 0.28)}`, padding:"4px 8px", borderRadius:999, textAlign:"center", letterSpacing:1, whiteSpace:"nowrap"}}>{pluralize(presetCount, "preset", "presets")}</div>
          <div style={{fontSize:8, color:"var(--text-soft)", background:"var(--bg)", border:"1px solid var(--surface-border)", padding:"4px 8px", borderRadius:999, textAlign:"center", letterSpacing:1, whiteSpace:"nowrap"}}>{pluralize(projectCount, "projeto", "projetos")}</div>
        </div>
      </div>

      <div style={{fontSize:9, color:"var(--text-soft)", opacity:0.75, lineHeight:1.7, minHeight:32}}>{module.docs}</div>

      <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
        <button onClick={() => onOpenModule(module.id)} style={{background:`linear-gradient(135deg, ${module.color}, ${shiftHex(module.color, -0.12)})`, color:"#020b14", border:"none", padding:"10px 14px", borderRadius:10, fontWeight:700, cursor:"pointer", fontSize:10, letterSpacing:1.2, fontFamily:"inherit"}}>ABRIR EDITOR</button>
        <button onClick={() => onOpenPreset(module.id)} style={{background:"var(--bg)", color:module.color, border:`1px solid ${hexToRgba(module.color, 0.34)}`, padding:"10px 14px", borderRadius:10, fontWeight:700, cursor:"pointer", fontSize:10, letterSpacing:1.2, fontFamily:"inherit"}}>ABRIR PRESET</button>
      </div>
    </div>
  );
}

export function Dashboard({ user, onLogout, onOpenModule, onOpenPreset, onAdmin, presetCatalog = {}, recentProjects = [] }) {
  const [activeTab, setActiveTab] = useState("modules");
  const [search, setSearch] = useState("");
  const isAdmin = user?.role === "admin";

  const stats = useMemo(() => {
    const presetCount = Object.values(presetCatalog).reduce((sum, list) => sum + (list?.length || 0), 0);
    return [
      { label:"Módulos", value:String(MODULES.length), icon:"🧩", color:"#22d3ee" },
      { label:"Presets", value:String(presetCount), icon:"🗂️", color:"#4ade80" },
      { label:"Projetos", value:String(recentProjects.length), icon:"📁", color:"#f59e0b" },
      { label:"Views", value:"2D/3D", icon:"👁️", color:"#a78bfa" },
    ];
  }, [presetCatalog, recentProjects.length]);

  const projectsByModule = useMemo(() => {
    return recentProjects.reduce((acc, item) => {
      acc[item.moduleId] = (acc[item.moduleId] || 0) + 1;
      return acc;
    }, {});
  }, [recentProjects]);

  const filteredModules = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MODULES;
    return MODULES.filter(module =>
      module.label.toLowerCase().includes(q) || module.desc.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="dashboard-shell" style={{fontFamily:"'JetBrains Mono','Courier New',Consolas,monospace"}}>
      <header style={{height:62, background:"var(--bg-elevated)", borderBottom:"1px solid var(--surface-border)", display:"flex", alignItems:"center", padding:"0 28px", gap:16}}>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <div style={{width:34, height:34, borderRadius:10, background:"color-mix(in srgb, var(--accent) 14%, transparent)", border:"1px solid color-mix(in srgb, var(--accent) 30%, transparent)", display:"grid", placeItems:"center", color:"var(--accent)", boxShadow:"0 0 18px color-mix(in srgb, var(--accent) 20%, transparent)"}}>⚡</div>
          <div>
            <div style={{fontSize:13, fontWeight:700, color:"var(--accent)", letterSpacing:3}}>TECHSIM PRO</div>
            <div style={{fontSize:7, color:"var(--text-soft)", letterSpacing:3}}>WORKSPACE DE ENGENHARIA</div>
          </div>
        </div>
        <div style={{marginLeft:"auto", display:"flex", alignItems:"center", gap:12}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:10, color:"var(--accent)", fontWeight:700}}>{user.name}</div>
            <div style={{fontSize:8, color:"var(--text-soft)"}}>{user.email}</div>
            <div className={`role-badge ${isAdmin ? "role-admin" : "role-user"}`}>{isAdmin ? "ADMIN" : "UTILIZADOR"}</div>
          </div>
          <div style={{width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg, color-mix(in srgb, var(--accent) 20%, transparent), color-mix(in srgb, var(--accent-2) 20%, transparent))", border:"1px solid color-mix(in srgb, var(--accent) 30%, transparent)", display:"grid", placeItems:"center", color:"var(--accent)", fontWeight:700}}>{user.name[0]?.toUpperCase()}</div>
          {isAdmin && (
            <button onClick={onAdmin} style={{background:"rgba(244,63,94,0.1)", border:"1px solid rgba(244,63,94,0.34)", color:"#f43f5e", padding:"6px 12px", borderRadius:8, cursor:"pointer", fontSize:9, letterSpacing:1.5, fontFamily:"inherit"}}>ADMIN</button>
          )}
          <button onClick={onLogout} style={{background:"transparent", border:"1px solid var(--surface-border)", color:"var(--text-soft)", padding:"6px 12px", borderRadius:8, cursor:"pointer", fontSize:9, letterSpacing:1.5, fontFamily:"inherit"}}>SAIR</button>
        </div>
      </header>

      <div style={{display:"grid", gridTemplateColumns:"240px 1fr", minHeight:"calc(100vh - 62px)"}}>
        <aside style={{background:"var(--bg-elevated)", borderRight:"1px solid var(--surface-border)", padding:18, display:"flex", flexDirection:"column", gap:12}}>
          <div style={{background:"linear-gradient(135deg, var(--bg-elevated), var(--bg))", border:"1px solid color-mix(in srgb, var(--accent) 22%, transparent)", borderRadius:14, padding:16}}>
            <div style={{fontSize:9, color:"var(--accent)", letterSpacing:2, marginBottom:8}}>OLÁ, {user.name.split(" ")[0].toUpperCase()}</div>
            <div style={{fontSize:18, fontWeight:700, lineHeight:1.3, marginBottom:6}}>Seu laboratório visual está pronto.</div>
            <div style={{fontSize:10, color:"var(--text-soft)", lineHeight:1.7}}>Abra um módulo do zero ou comece por um projeto pronto por disciplina.</div>
          </div>

          <div style={{display:"grid", gap:8}}>
            {[
              { id:"modules", icon:"🧩", label:"Módulos" },
              { id:"projects", icon:"📁", label:"Projetos recentes" },
              { id:"shortcuts", icon:"⌨️", label:"Atalhos" },
            ].map(tab => (
              <button key={tab.id} className="dashboard-nav-tab" onClick={() => setActiveTab(tab.id)} style={{background:activeTab === tab.id ? "color-mix(in srgb, var(--accent) 14%, transparent)" : "transparent", border:`1px solid ${activeTab === tab.id ? "color-mix(in srgb, var(--accent) 30%, transparent)" : "var(--surface-border)"}`, color:activeTab === tab.id ? "var(--accent)" : "var(--text-soft)", borderRadius:10, padding:"10px 12px", textAlign:"left", cursor:"pointer", fontSize:10, letterSpacing:1, fontFamily:"inherit"}}>{tab.icon} {tab.label}</button>
            ))}
          </div>

          <div style={{background:"var(--bg)", border:"1px solid var(--surface-border)", borderRadius:14, padding:12, display:"grid", gap:8}}>
            {stats.map(item => (
              <div key={item.label} style={{display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:8, borderBottom:"1px solid var(--surface-border)"}}>
                <span style={{fontSize:9, color:"var(--text-soft)"}}>{item.icon} {item.label}</span>
                <span style={{fontSize:10, color:item.color, fontWeight:700}}>{item.value}</span>
              </div>
            ))}
          </div>
        </aside>

        <main className="dashboard-blueprint" style={{padding:"28px 30px 36px"}}>
          {activeTab === "modules" && (
            <>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", flexWrap:"wrap", gap:16, marginBottom:18}}>
                <div>
                  <div style={{fontSize:9, color:"var(--text-soft)", opacity:0.7, letterSpacing:4, marginBottom:8}}>MÓDULOS E PRESETS</div>
                  <div style={{fontSize:28, fontWeight:700, marginBottom:6}}>Entre rápido em cada disciplina</div>
                  <div style={{fontSize:11, color:"var(--text-soft)"}}>Cada módulo agora já nasce com presets prontos e estrutura preparada para projetos persistentes.</div>
                </div>
                <input
                  className="dashboard-search"
                  type="text"
                  placeholder="🔎 Pesquisar módulo…"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  aria-label="Pesquisar módulo"
                />
              </div>

              {filteredModules.length ? (
                <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:14}}>
                  {filteredModules.map(module => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      presetCount={(presetCatalog[module.id] || []).length}
                      projectCount={projectsByModule[module.id] || 0}
                      onOpenModule={onOpenModule}
                      onOpenPreset={onOpenPreset}
                    />
                  ))}
                </div>
              ) : (
                <div style={{background:"var(--bg-elevated)", border:"1px dashed var(--surface-border)", borderRadius:14, padding:22, color:"var(--text-soft)", fontSize:11, lineHeight:1.8}}>
                  Nenhum módulo corresponde a "{search}". Tenta outro termo de pesquisa.
                </div>
              )}
            </>
          )}

          {activeTab === "projects" && (
            <div>
              <div style={{fontSize:9, color:"var(--text-soft)", opacity:0.7, letterSpacing:4, marginBottom:8}}>PROJETOS RECENTES</div>
              <div style={{fontSize:28, fontWeight:700, marginBottom:16}}>Continue de onde parou</div>
              {!recentProjects.length ? (
                <div style={{background:"var(--bg-elevated)", border:"1px dashed var(--surface-border)", borderRadius:14, padding:22, color:"var(--text-soft)", fontSize:11, lineHeight:1.8}}>Nenhum projeto salvo ainda. Abra um módulo, carregue um preset e salve sua primeira base.</div>
              ) : (
                <div style={{display:"grid", gap:10}}>
                  {recentProjects.map(project => {
                    const module = MODULES.find(item => item.id === project.moduleId);
                    return (
                      <button key={project.id} className="module-card" onClick={() => onOpenModule(project.moduleId, project.id)} style={{border:"1px solid var(--surface-border)", padding:"16px 18px", textAlign:"left", cursor:"pointer", fontFamily:"inherit", flexDirection:"row", justifyContent:"space-between", alignItems:"center", gap:16}}>
                        <div>
                          <div style={{fontSize:12, color:module?.color || "var(--text)", fontWeight:700, marginBottom:4}}>{project.name}</div>
                          <div style={{fontSize:10, color:"var(--text-soft)", marginBottom:6}}>{project.summary}</div>
                          <div style={{fontSize:8, color:"var(--text-soft)", opacity:0.7}}>{module?.label || project.moduleId} · {new Date(project.updatedAt).toLocaleString("pt-BR")}</div>
                        </div>
                        <div style={{alignSelf:"center", fontSize:10, color:module?.color || "var(--text-soft)", letterSpacing:1.4, flexShrink:0}}>ABRIR →</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "shortcuts" && (
            <div>
              <div style={{fontSize:9, color:"var(--text-soft)", opacity:0.7, letterSpacing:4, marginBottom:8}}>ATALHOS</div>
              <div style={{fontSize:28, fontWeight:700, marginBottom:16}}>Fluxo de edição veloz</div>
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:10, maxWidth:920}}>
                {SHORTCUTS.map(([key, desc]) => (
                  <div key={key} style={{background:"var(--bg-elevated)", border:"1px solid var(--surface-border)", borderRadius:12, padding:"12px 14px", display:"flex", alignItems:"center", gap:12}}>
                    <kbd style={{background:"var(--bg)", border:"1px solid var(--surface-border)", borderRadius:6, padding:"4px 8px", color:"var(--accent)", fontSize:9}}>{key}</kbd>
                    <span style={{fontSize:10, color:"var(--text-soft)"}}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
