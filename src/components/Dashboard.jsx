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

function ModuleCard({ module, presetCount, projectCount, onOpenModule, onOpenPreset }) {
  return (
    <div style={{background:"#040d18", border:`1px solid ${hexToRgba(module.color, 0.24)}`, borderRadius:16, padding:20, display:"flex", flexDirection:"column", gap:14, boxShadow:`0 16px 40px ${hexToRgba(module.color, 0.08)}`}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12}}>
        <div style={{display:"flex", gap:12}}>
          <div style={{width:54, height:54, borderRadius:16, background:`linear-gradient(180deg, ${hexToRgba(module.color, 0.28)}, #071020)`, border:`1px solid ${hexToRgba(module.color, 0.34)}`, display:"grid", placeItems:"center", color:module.color, fontSize:28, textShadow:`0 0 20px ${hexToRgba(module.color, 0.45)}`}}>
            {module.icon}
          </div>
          <div>
            <div style={{fontSize:13, fontWeight:700, color:module.color, marginBottom:6}}>{module.label}</div>
            <div style={{fontSize:10, color:"#94a3b8", lineHeight:1.6}}>{module.desc}</div>
          </div>
        </div>
        <div style={{display:"grid", gap:6, minWidth:92}}>
          <div style={{fontSize:8, color:module.color, background:hexToRgba(module.color, 0.12), border:`1px solid ${hexToRgba(module.color, 0.28)}`, padding:"4px 8px", borderRadius:999, textAlign:"center", letterSpacing:1}}>{presetCount} presets</div>
          <div style={{fontSize:8, color:"#94a3b8", background:"#071020", border:"1px solid #1e293b", padding:"4px 8px", borderRadius:999, textAlign:"center", letterSpacing:1}}>{projectCount} projetos</div>
        </div>
      </div>

      <div style={{fontSize:9, color:"#475569", lineHeight:1.7, minHeight:32}}>{module.docs}</div>

      <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
        <button onClick={() => onOpenModule(module.id)} style={{background:`linear-gradient(135deg, ${module.color}, ${shiftHex(module.color, -0.12)})`, color:"#020b14", border:"none", padding:"10px 14px", borderRadius:10, fontWeight:700, cursor:"pointer", fontSize:10, letterSpacing:1.2, fontFamily:"inherit"}}>ABRIR EDITOR</button>
        <button onClick={() => onOpenPreset(module.id)} style={{background:"#071020", color:module.color, border:`1px solid ${hexToRgba(module.color, 0.34)}`, padding:"10px 14px", borderRadius:10, fontWeight:700, cursor:"pointer", fontSize:10, letterSpacing:1.2, fontFamily:"inherit"}}>ABRIR PRESET</button>
      </div>
    </div>
  );
}

export function Dashboard({ user, onLogout, onOpenModule, onOpenPreset, onAdmin, presetCatalog = {}, recentProjects = [] }) {
  const [activeTab, setActiveTab] = useState("modules");

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

  return (
    <div style={{minHeight:"100vh", background:"#010912", color:"#e2e8f0", fontFamily:"'Courier New',Consolas,monospace"}}>
      <header style={{height:62, background:"#040d18", borderBottom:"1px solid #1e3a5f55", display:"flex", alignItems:"center", padding:"0 28px", gap:16}}>
        <div style={{display:"flex", alignItems:"center", gap:10}}>
          <div style={{width:34, height:34, borderRadius:10, background:"#22d3ee22", border:"1px solid #22d3ee44", display:"grid", placeItems:"center", color:"#22d3ee", boxShadow:"0 0 18px #22d3ee22"}}>⚡</div>
          <div>
            <div style={{fontSize:13, fontWeight:700, color:"#22d3ee", letterSpacing:3}}>TECHSIM PRO</div>
            <div style={{fontSize:7, color:"#334155", letterSpacing:3}}>WORKSPACE DE ENGENHARIA</div>
          </div>
        </div>
        <div style={{marginLeft:"auto", display:"flex", alignItems:"center", gap:12}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:10, color:"#22d3ee", fontWeight:700}}>{user.name}</div>
            <div style={{fontSize:8, color:"#475569"}}>{user.email}</div>
          </div>
          <div style={{width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#22d3ee22,#0ea5e922)", border:"1px solid #22d3ee44", display:"grid", placeItems:"center", color:"#22d3ee", fontWeight:700}}>{user.name[0]?.toUpperCase()}</div>
          <button onClick={onAdmin} style={{background:"#f43f5e18", border:"1px solid #f43f5e44", color:"#f43f5e", padding:"6px 12px", borderRadius:8, cursor:"pointer", fontSize:9, letterSpacing:1.5, fontFamily:"inherit"}}>ADMIN</button>
          <button onClick={onLogout} style={{background:"transparent", border:"1px solid #1e3a5f", color:"#64748b", padding:"6px 12px", borderRadius:8, cursor:"pointer", fontSize:9, letterSpacing:1.5, fontFamily:"inherit"}}>SAIR</button>
        </div>
      </header>

      <div style={{display:"grid", gridTemplateColumns:"240px 1fr", minHeight:"calc(100vh - 62px)"}}>
        <aside style={{background:"#040d18", borderRight:"1px solid #1e3a5f33", padding:18, display:"flex", flexDirection:"column", gap:12}}>
          <div style={{background:"linear-gradient(135deg,#040d18,#071020)", border:"1px solid #22d3ee22", borderRadius:14, padding:16}}>
            <div style={{fontSize:9, color:"#22d3ee", letterSpacing:2, marginBottom:8}}>OLÁ, {user.name.split(" ")[0].toUpperCase()}</div>
            <div style={{fontSize:18, fontWeight:700, lineHeight:1.3, marginBottom:6}}>Seu laboratório visual está pronto.</div>
            <div style={{fontSize:10, color:"#475569", lineHeight:1.7}}>Abra um módulo do zero ou comece por um projeto pronto por disciplina.</div>
          </div>

          <div style={{display:"grid", gap:8}}>
            {[
              { id:"modules", icon:"🧩", label:"Módulos" },
              { id:"projects", icon:"📁", label:"Projetos recentes" },
              { id:"shortcuts", icon:"⌨️", label:"Atalhos" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{background:activeTab === tab.id ? "#22d3ee15" : "transparent", border:`1px solid ${activeTab === tab.id ? "#22d3ee44" : "#1e293b"}`, color:activeTab === tab.id ? "#22d3ee" : "#64748b", borderRadius:10, padding:"10px 12px", textAlign:"left", cursor:"pointer", fontSize:10, letterSpacing:1, fontFamily:"inherit"}}>{tab.icon} {tab.label}</button>
            ))}
          </div>

          <div style={{background:"#071020", border:"1px solid #1e293b", borderRadius:14, padding:12, display:"grid", gap:8}}>
            {stats.map(item => (
              <div key={item.label} style={{display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:8, borderBottom:"1px solid #1e293b"}}>
                <span style={{fontSize:9, color:"#64748b"}}>{item.icon} {item.label}</span>
                <span style={{fontSize:10, color:item.color, fontWeight:700}}>{item.value}</span>
              </div>
            ))}
          </div>
        </aside>

        <main style={{padding:"28px 30px 36px"}}>
          {activeTab === "modules" && (
            <>
              <div style={{marginBottom:18}}>
                <div style={{fontSize:9, color:"#334155", letterSpacing:4, marginBottom:8}}>MÓDULOS E PRESETS</div>
                <div style={{fontSize:28, fontWeight:700, marginBottom:6}}>Entre rápido em cada disciplina</div>
                <div style={{fontSize:11, color:"#475569"}}>Cada módulo agora já nasce com presets prontos e estrutura preparada para projetos persistentes.</div>
              </div>

              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:14}}>
                {MODULES.map(module => (
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
            </>
          )}

          {activeTab === "projects" && (
            <div>
              <div style={{fontSize:9, color:"#334155", letterSpacing:4, marginBottom:8}}>PROJETOS RECENTES</div>
              <div style={{fontSize:28, fontWeight:700, marginBottom:16}}>Continue de onde parou</div>
              {!recentProjects.length ? (
                <div style={{background:"#040d18", border:"1px dashed #1e3a5f", borderRadius:14, padding:22, color:"#64748b", fontSize:11, lineHeight:1.8}}>Nenhum projeto salvo ainda. Abra um módulo, carregue um preset e salve sua primeira base.</div>
              ) : (
                <div style={{display:"grid", gap:10}}>
                  {recentProjects.map(project => {
                    const module = MODULES.find(item => item.id === project.moduleId);
                    return (
                      <button key={project.id} onClick={() => onOpenModule(project.moduleId, project.id)} style={{background:"#040d18", border:"1px solid #1e293b", borderRadius:14, padding:"16px 18px", textAlign:"left", cursor:"pointer", fontFamily:"inherit", display:"flex", justifyContent:"space-between", gap:16}}>
                        <div>
                          <div style={{fontSize:12, color:module?.color || "#e2e8f0", fontWeight:700, marginBottom:4}}>{project.name}</div>
                          <div style={{fontSize:10, color:"#475569", marginBottom:6}}>{project.summary}</div>
                          <div style={{fontSize:8, color:"#334155"}}>{module?.label || project.moduleId} · {new Date(project.updatedAt).toLocaleString("pt-BR")}</div>
                        </div>
                        <div style={{alignSelf:"center", fontSize:10, color:module?.color || "#94a3b8", letterSpacing:1.4}}>ABRIR →</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "shortcuts" && (
            <div>
              <div style={{fontSize:9, color:"#334155", letterSpacing:4, marginBottom:8}}>ATALHOS</div>
              <div style={{fontSize:28, fontWeight:700, marginBottom:16}}>Fluxo de edição veloz</div>
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:10, maxWidth:920}}>
                {SHORTCUTS.map(([key, desc]) => (
                  <div key={key} style={{background:"#040d18", border:"1px solid #1e293b", borderRadius:12, padding:"12px 14px", display:"flex", alignItems:"center", gap:12}}>
                    <kbd style={{background:"#071020", border:"1px solid #334155", borderRadius:6, padding:"4px 8px", color:"#22d3ee", fontSize:9}}>{key}</kbd>
                    <span style={{fontSize:10, color:"#64748b"}}>{desc}</span>
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
