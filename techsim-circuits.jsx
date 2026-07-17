import { useState, useRef, useEffect, useCallback, useReducer, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS & CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
const G = 48;
const SN = v => Math.round(v / G) * G;
const MAX_H = 60;
let _uid = 1;
const uid = () => `e${_uid++}`;
const WIRE_COLORS = ["#38bdf8","#22c55e","#f59e0b","#f43f5e","#a78bfa","#fb923c","#ffffff","#fbbf24","#4ade80","#c084fc"];
const MODULE_GLYPHS = { dc:"⎓", ac:"∿", pneum:"⬡", hidro:"◉", logic:"⊞", cmd:"⌬", install:"⟂", ladder:"⇄" };
const TOOL_GLYPHS = { select:"◎", wire:"∿", delete:"⨯" };
const clamp = (v,min,max) => Math.min(max, Math.max(min, v));
const hexToRgba = (hex, alpha=1) => {
  if (!hex || typeof hex !== "string" || !hex.startsWith("#")) return `rgba(148,163,184,${alpha})`;
  let h = hex.slice(1);
  if (h.length === 3) h = h.split("").map(ch => ch + ch).join("");
  const n = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(n)) return `rgba(148,163,184,${alpha})`;
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
};
const shiftHex = (hex, amt=0) => {
  if (!hex || typeof hex !== "string" || !hex.startsWith("#")) return hex || "#94a3b8";
  let h = hex.slice(1);
  if (h.length === 3) h = h.split("").map(ch => ch + ch).join("");
  const n = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(n)) return hex;
  const f = amt >= 0 ? 255 * amt : 0;
  const m = Math.abs(amt);
  const mix = (c) => Math.round(c + (f - c) * m);
  const r = clamp(mix((n >> 16) & 255), 0, 255).toString(16).padStart(2, "0");
  const g = clamp(mix((n >> 8) & 255), 0, 255).toString(16).padStart(2, "0");
  const b = clamp(mix(n & 255), 0, 255).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
};

// ═══════════════════════════════════════════════════════════════════════════════
// LANDING PAGE
// ═══════════════════════════════════════════════════════════════════════════════
function LandingPage({ onLogin, onRegister }) {
  const [hov, setHov] = useState(null);
  const [tick, setTick] = useState(0);
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => { const t = setInterval(() => setTick(x => (x+1)%100), 80); return ()=>clearInterval(t); }, []);

  const nodes = [
    {x:80,  y:95, col:"#22d3ee", sym:"V₁", val:"12V",  t:"vdc"},
    {x:210, y:55, col:"#f59e0b", sym:"R₁", val:"1kΩ",  t:"res"},
    {x:340, y:95, col:"#f59e0b", sym:"R₂", val:"2.2kΩ",t:"res"},
    {x:470, y:55, col:"#fbbf24", sym:"LED", val:"2.0V", t:"led"},
    {x:570, y:95, col:"#6ee7b7", sym:"⏚",  val:"GND",  t:"gnd"},
  ];
  const nodeWires = [[80,95,210,55],[210,55,340,95],[340,95,470,55],[470,55,570,95],[570,95,570,165],[570,165,80,165],[80,165,80,95]];
  const animWire = (i) => (tick % nodeWires.length) === i;

  const mods = [
    {icon:MODULE_GLYPHS.dc,label:"Corrente Contínua", col:"#22d3ee",desc:"DC · Ohm · KVL · Thévenin"},
    {icon:MODULE_GLYPHS.ac,label:"Corrente Alternada", col:"#f59e0b",desc:"AC · RLC · Fasores · FP"},
    {icon:MODULE_GLYPHS.pneum,label:"Pneumática",         col:"#a78bfa",desc:"Válvulas · Cilindros · Força"},
    {icon:MODULE_GLYPHS.hidro,label:"Hidráulica",         col:"#38bdf8",desc:"Bombas · Pascal · Potência"},
    {icon:MODULE_GLYPHS.logic,label:"Lógica Digital",     col:"#4ade80",desc:"AND/OR/NOT/XOR · FF-SR"},
    {icon:MODULE_GLYPHS.cmd,label:"Comandos Elétricos", col:"#fb923c",desc:"Motores 3φ · Contatores"},
    {icon:MODULE_GLYPHS.install, label:"Instalações",        col:"#f43f5e",desc:"NBR 5410 · Dimensionamento"},
    {icon:MODULE_GLYPHS.ladder, label:"Ladder / CLP",       col:"#c084fc",desc:"Contatos · Bobinas · Timers"},
  ];

  const features = [
    {icon:"⟳",title:"Girar Componentes",    desc:"Ctrl+← → ou painel lateral · 4 orientações"},
    {icon:"◌",title:"Cor dos Fios",          desc:"10 cores para organizar circuitos complexos"},
    {icon:"⌁",title:"Buscar & Duplicar",     desc:"Busca rápida na paleta + Ctrl+D para replicar componentes"},
    {icon:"▣",title:"Modo 2D / 3D",          desc:"Visual técnico plano ou com profundidade para inspeção"},
    {icon:"⌗",title:"Endereçamento CLP",     desc:"Defina I0.0, Q0.1, M0.0 em cada componente"},
    {icon:"⬒",title:"Salvar / PNG / JSON",   desc:"Exportação rápida para projetos portáveis e documentação"},
    {icon:"↩",title:"Undo/Redo 60 níveis",   desc:"Nunca perca trabalho · Ctrl+Z/Y"},
    {icon:"◎",title:"Ajuste Automático",     desc:"Fit View, auto layout e simulação ao vivo no mesmo canvas"},
  ];

  const grd = `repeating-linear-gradient(#22d3ee08 0,#22d3ee08 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,#22d3ee08 0,#22d3ee08 1px,transparent 1px,transparent 48px)`;

  return (
    <div style={{minHeight:"100vh",background:"#010912",fontFamily:"'Courier New',Consolas,monospace",color:"#e2e8f0",overflowX:"hidden"}}>

      {/* Grid bg */}
      <div style={{position:"fixed",inset:0,zIndex:0,backgroundImage:grd,pointerEvents:"none"}}/>
      {/* Cyan glow top-left */}
      <div style={{position:"fixed",top:-300,left:-200,width:700,height:700,borderRadius:"50%",background:"radial-gradient(circle,#22d3ee14 0%,transparent 65%)",pointerEvents:"none",zIndex:0}}/>
      {/* Purple glow bottom-right */}
      <div style={{position:"fixed",bottom:-200,right:-100,width:600,height:600,borderRadius:"50%",background:"radial-gradient(circle,#a78bfa12 0%,transparent 65%)",pointerEvents:"none",zIndex:0}}/>

      {/* ── NAV ─────────────────────────────────────── */}
      <nav style={{position:"sticky",top:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 48px",height:60,background:"#010912dd",backdropFilter:"blur(12px)",borderBottom:"1px solid #1e3a5f55"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:34,height:34,borderRadius:6,background:"#22d3ee22",border:"1px solid #22d3ee44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,boxShadow:"0 0 16px #22d3ee33"}}>⚡</div>
          <div>
            <div style={{fontSize:14,fontWeight:700,letterSpacing:3,color:"#22d3ee",textShadow:"0 0 16px #22d3ee44"}}>TECHSIM PRO</div>
            <div style={{fontSize:7,color:"#1e3a5f",letterSpacing:4,marginTop:-1}}>SIMULADOR DE CIRCUITOS</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={onLogin}
            style={{background:"transparent",border:"1px solid #1e3a5f",color:"#64748b",padding:"8px 20px",borderRadius:5,cursor:"pointer",fontSize:10,letterSpacing:2,fontFamily:"inherit",transition:"all 0.18s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#22d3ee55";e.currentTarget.style.color="#22d3ee";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#1e3a5f";e.currentTarget.style.color="#64748b";}}>
            ENTRAR
          </button>
          <button onClick={onRegister}
            style={{background:"linear-gradient(135deg,#22d3ee,#0ea5e9)",border:"none",color:"#010912",padding:"8px 22px",borderRadius:5,cursor:"pointer",fontSize:10,fontWeight:700,letterSpacing:2,fontFamily:"inherit",boxShadow:"0 0 24px #22d3ee33",transition:"all 0.18s"}}
            onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 0 36px #22d3ee66";e.currentTarget.style.transform="translateY(-1px)";}}
            onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 0 24px #22d3ee33";e.currentTarget.style.transform="none";}}>
            CRIAR CONTA
          </button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────── */}
      <section style={{position:"relative",zIndex:5,display:"grid",gridTemplateColumns:"1fr 1fr",gap:60,alignItems:"center",padding:"80px 72px 60px",maxWidth:1200,margin:"0 auto"}}>
        {/* Left text */}
        <div>
          <div style={{display:"inline-block",background:"#22d3ee14",border:"1px solid #22d3ee33",borderRadius:20,padding:"4px 14px",fontSize:9,color:"#22d3ee",letterSpacing:3,marginBottom:24}}>
            ⚡ PLATAFORMA PROFISSIONAL · 8 MÓDULOS
          </div>
          <h1 style={{margin:"0 0 20px",fontSize:"clamp(32px,4vw,58px)",fontWeight:700,lineHeight:1.1,letterSpacing:-1}}>
            <span style={{color:"#e2e8f0"}}>Projete.</span><br/>
            <span style={{color:"#22d3ee",textShadow:"0 0 40px #22d3ee55"}}>Simule.</span><br/>
            <span style={{color:"#94a3b8"}}>Calcule.</span>
          </h1>
          <p style={{fontSize:14,color:"#4a6a80",lineHeight:1.9,maxWidth:420,marginBottom:36}}>
            Canvas interativo de engenharia com 8 módulos especializados. Cálculos em tempo real, análise de circuitos e simulação ao vivo.
          </p>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <button onClick={onRegister}
              style={{background:"linear-gradient(135deg,#22d3ee,#0ea5e9)",color:"#010912",border:"none",padding:"14px 32px",borderRadius:5,fontSize:12,fontWeight:700,letterSpacing:2,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 32px #22d3ee33",transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 48px #22d3ee55";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 32px #22d3ee33";}}>
              COMEÇAR GRÁTIS →
            </button>
            <button onClick={onLogin}
              style={{background:"transparent",color:"#475569",border:"1px solid #1e3a5f",padding:"14px 32px",borderRadius:5,fontSize:12,letterSpacing:2,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.color="#94a3b8";e.currentTarget.style.borderColor="#334155";}}
              onMouseLeave={e=>{e.currentTarget.style.color="#475569";e.currentTarget.style.borderColor="#1e3a5f";}}>
              JÁ TENHO CONTA
            </button>
          </div>
          <div style={{display:"flex",gap:28,marginTop:40}}>
            {[["8","Módulos"],["2","Views 2D/3D"],["PNG","Exportação"]].map(([v,l])=>(
              <div key={l}>
                <div style={{fontSize:24,fontWeight:700,color:"#22d3ee",textShadow:"0 0 16px #22d3ee44"}}>{v}</div>
                <div style={{fontSize:9,color:"#334155",letterSpacing:2,marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Right — animated circuit canvas */}
        <div style={{position:"relative"}}>
          <div style={{background:"#040d18",border:"1px solid #1e3a5f",borderRadius:12,padding:"24px",position:"relative",overflow:"hidden",boxShadow:"0 0 60px #22d3ee0a,inset 0 0 60px #00000033"}}>
            {/* Mini grid */}
            <div style={{position:"absolute",inset:0,opacity:0.08,backgroundImage:"linear-gradient(#22d3ee 1px,transparent 1px),linear-gradient(90deg,#22d3ee 1px,transparent 1px)",backgroundSize:"24px 24px"}}/>
            <svg viewBox="0 0 660 220" style={{width:"100%",position:"relative",zIndex:2}}>
              {/* Wires */}
              {nodeWires.map(([x1,y1,x2,y2],i)=>(
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={animWire(i)?"#22d3ee":"#1e3a5f"}
                  strokeWidth={animWire(i)?2.5:1.5}
                  strokeDasharray={animWire(i)?"8 4":"none"}
                  opacity={animWire(i)?1:0.4}
                  style={{transition:"all 0.3s"}}/>
              ))}
              {/* Current flow dots */}
              {nodeWires.map(([x1,y1,x2,y2],i)=> animWire(i) ? (
                <circle key={`d${i}`} cx={x1+(x2-x1)*((tick%20)/20)} cy={y1+(y2-y1)*((tick%20)/20)} r={3} fill="#22d3ee" opacity={0.9}/>
              ): null)}
              {/* Nodes */}
              {nodes.map((n,i)=>(
                <g key={i}>
                  <rect x={n.x-24} y={n.y-18} width={48} height={36} rx={5}
                    fill={`${n.col}18`} stroke={n.col} strokeWidth={1.5} opacity={0.85}/>
                  <text x={n.x} y={n.y-4} textAnchor="middle" fill={n.col} fontSize={9} fontWeight={700} fontFamily="monospace">{n.sym}</text>
                  <text x={n.x} y={n.y+9} textAnchor="middle" fill={n.col} fontSize={7} fontFamily="monospace" opacity={0.7}>{n.val}</text>
                </g>
              ))}
            </svg>
            {/* Results footer */}
            <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:8,fontSize:9,color:"#334155",fontFamily:"monospace"}}>
              {["I = 10.00 mA","P = 120.0 mW","R_eq = 3.2 kΩ","KVL ✓"].map((r,i)=>(
                <span key={i} style={{color:["#22d3ee","#4ade80","#f59e0b","#22c55e"][i]}}>{r}</span>
              ))}
            </div>
          </div>
          {/* Floating badge */}
          <div style={{position:"absolute",top:-14,right:-14,background:"#22c55e",color:"#010912",borderRadius:20,padding:"4px 12px",fontSize:9,fontWeight:700,letterSpacing:1,boxShadow:"0 0 16px #22c55e44"}}>AO VIVO ●</div>
        </div>
      </section>

      {/* ── MODULES GRID ────────────────────────────── */}
      <section style={{position:"relative",zIndex:5,padding:"60px 72px",borderTop:"1px solid #1e293b22"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontSize:9,letterSpacing:5,color:"#22d3ee66",marginBottom:8}}>MÓDULOS</div>
          <div style={{fontSize:28,fontWeight:700,color:"#e2e8f0",letterSpacing:-0.5}}>8 Disciplinas de Engenharia</div>
          <div style={{fontSize:12,color:"#334155",marginTop:8}}>Cada módulo com canvas dedicado, componentes específicos e solver completo</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,maxWidth:1100,margin:"0 auto"}}>
          {mods.map((m,i)=>(
            <div key={i} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)} onClick={onRegister}
              style={{background:hov===i?`${m.col}0e`:"#040e1a",border:`1px solid ${hov===i?m.col+"55":"#1e3a5f"}`,borderRadius:8,padding:"20px 18px",cursor:"pointer",transition:"all 0.18s",transform:hov===i?"translateY(-3px)":"none",boxShadow:hov===i?`0 8px 32px ${m.col}18`:"none"}}>
              <div style={{fontSize:24,marginBottom:10}}>{m.icon}</div>
              <div style={{fontSize:11,fontWeight:700,color:hov===i?m.col:"#94a3b8",letterSpacing:0.5,marginBottom:4}}>{m.label}</div>
              <div style={{fontSize:9,color:"#334155",lineHeight:1.6}}>{m.desc}</div>
              {hov===i&&<div style={{marginTop:8,fontSize:9,color:m.col}}>Abrir →</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ───────────────────────────── */}
      <section style={{position:"relative",zIndex:5,padding:"60px 72px",borderTop:"1px solid #1e293b22"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontSize:9,letterSpacing:5,color:"#22d3ee66",marginBottom:8}}>FERRAMENTAS</div>
          <div style={{fontSize:28,fontWeight:700,color:"#e2e8f0",letterSpacing:-0.5}}>Canvas Profissional</div>
          <div style={{fontSize:12,color:"#334155",marginTop:8}}>Tudo que um engenheiro precisa para projetar e documentar</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,maxWidth:1100,margin:"0 auto"}}>
          {features.map((f,i)=>(
            <div key={i} style={{background:"#040e1a",border:"1px solid #1e3a5f",borderRadius:8,padding:"20px 18px",transition:"all 0.18s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#22d3ee33";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#1e3a5f";}}>
              <div style={{fontSize:22,marginBottom:10}}>{f.icon}</div>
              <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",letterSpacing:0.5,marginBottom:4}}>{f.title}</div>
              <div style={{fontSize:9,color:"#334155",lineHeight:1.7}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ───────────────────────────────── */}
      <section style={{position:"relative",zIndex:5,textAlign:"center",padding:"80px 48px 100px",borderTop:"1px solid #1e293b22"}}>
        <div style={{background:"#040e1a",border:"1px solid #1e3a5f",borderRadius:16,padding:"60px 48px",maxWidth:640,margin:"0 auto",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-80,right:-80,width:300,height:300,borderRadius:"50%",background:"radial-gradient(#22d3ee0a,transparent 65%)"}}/>
          <div style={{fontSize:9,letterSpacing:5,color:"#22d3ee66",marginBottom:16}}>COMECE AGORA</div>
          <div style={{fontSize:32,fontWeight:700,letterSpacing:-0.5,marginBottom:8}}>Gratuito para sempre</div>
          <div style={{fontSize:13,color:"#334155",marginBottom:40}}>Sem cartão de crédito · Sem limite de projetos · Sem limite de simulações</div>
          <button onClick={onRegister}
            style={{background:"linear-gradient(135deg,#22d3ee,#0ea5e9)",color:"#010912",border:"none",padding:"16px 52px",borderRadius:6,fontSize:13,fontWeight:700,letterSpacing:2,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 4px 40px #22d3ee44",transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 56px #22d3ee66";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 40px #22d3ee44";}}>
            CRIAR CONTA GRÁTIS →
          </button>
          <div style={{marginTop:24,fontSize:10,color:"#1e3a5f"}}>
            <span onClick={onLogin} style={{color:"#22d3ee66",cursor:"pointer",textDecoration:"underline"}} onMouseEnter={e=>e.currentTarget.style.color="#22d3ee"} onMouseLeave={e=>e.currentTarget.style.color="#22d3ee66"}>
              Já tenho conta — Entrar
            </span>
          </div>
        </div>
        <div style={{marginTop:60,fontSize:8,color:"#1e3a5f",letterSpacing:3}}>
          © 2025 TECHSIM PRO · PLATAFORMA DE ENGENHARIA ELÉTRICA
        </div>
      </section>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// AUTH MODAL
// ═══════════════════════════════════════════════════════════════════════════════
function AuthModal({ mode, onClose, onSuccess }) {
  const [tab, setTab] = useState(mode);
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = () => {
    if(!form.email || !form.password) { setErr("Preencha todos os campos."); return; }
    if(tab==="register" && !form.name) { setErr("Informe seu nome."); return; }
    setLoading(true); setErr("");
    setTimeout(() => { setLoading(false); onSuccess({ name: form.name || form.email.split("@")[0], email: form.email }); }, 900);
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"#00000099",backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div style={{background:"#040e1a",border:"1px solid #1e3a5f",borderRadius:10,padding:"36px",width:380,position:"relative"}} onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} style={{position:"absolute",top:14,right:18,background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:18}}>✕</button>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:24,marginBottom:4}}>⚡</div>
          <div style={{fontSize:14,fontWeight:700,color:"#22d3ee",letterSpacing:3}}>TECHSIM PRO</div>
        </div>
        {/* Tabs */}
        <div style={{display:"flex",background:"#071020",borderRadius:6,padding:3,marginBottom:24,border:"1px solid #1e3a5f"}}>
          {["login","register"].map(t => (
            <button key={t} onClick={()=>setTab(t)}
              style={{flex:1,background:tab===t?"#22d3ee":"transparent",color:tab===t?"#020b14":"#475569",border:"none",borderRadius:4,padding:"8px",cursor:"pointer",fontSize:10,fontWeight:700,letterSpacing:2,fontFamily:"'Courier New',monospace",transition:"all 0.15s"}}>
              {t==="login"?"ENTRAR":"CRIAR CONTA"}
            </button>
          ))}
        </div>
        {err && <div style={{background:"#1a0000",border:"1px solid #f43f5e44",borderRadius:4,padding:"8px 12px",fontSize:10,color:"#f87171",marginBottom:14}}>{err}</div>}
        {tab==="register" && (
          <div style={{marginBottom:12}}>
            <div style={{fontSize:9,color:"#475569",marginBottom:5,letterSpacing:2}}>NOME</div>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
              placeholder="Seu nome completo"
              style={{width:"100%",background:"#071020",border:"1px solid #1e3a5f",color:"#e2e8f0",padding:"10px 12px",borderRadius:4,fontSize:11,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
          </div>
        )}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:9,color:"#475569",marginBottom:5,letterSpacing:2}}>EMAIL</div>
          <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}
            placeholder="seu@email.com"
            style={{width:"100%",background:"#071020",border:"1px solid #1e3a5f",color:"#e2e8f0",padding:"10px 12px",borderRadius:4,fontSize:11,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{marginBottom:20}}>
          <div style={{fontSize:9,color:"#475569",marginBottom:5,letterSpacing:2}}>SENHA</div>
          <input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))}
            onKeyDown={e=>e.key==="Enter"&&submit()}
            placeholder="••••••••"
            style={{width:"100%",background:"#071020",border:"1px solid #1e3a5f",color:"#e2e8f0",padding:"10px 12px",borderRadius:4,fontSize:11,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
        </div>
        <button onClick={submit} disabled={loading}
          style={{width:"100%",background:loading?"#1e3a5f":"#22d3ee",color:loading?"#475569":"#020b14",border:"none",padding:"12px",borderRadius:4,fontSize:12,fontWeight:700,letterSpacing:2,cursor:loading?"wait":"pointer",fontFamily:"inherit",boxShadow:loading?"none":"0 0 20px #22d3ee44",transition:"all 0.2s"}}>
          {loading?"AGUARDE...":tab==="login"?"ENTRAR →":"CRIAR CONTA →"}
        </button>
        <div style={{textAlign:"center",marginTop:14,fontSize:9,color:"#1e3a5f"}}>
          {tab==="login"?"Não tem conta? ":"Já tem conta? "}
          <span style={{color:"#22d3ee",cursor:"pointer"}} onClick={()=>setTab(tab==="login"?"register":"login")}>
            {tab==="login"?"Criar conta grátis":"Entrar"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function Dashboard({ user, onLogout, onOpenModule, onAdmin }) {
  const [hovMod, setHovMod] = useState(null);
  const [activeTab, setActiveTab] = useState("modules");

  const mods = [
    { id:"dc",      icon:MODULE_GLYPHS.dc, label:"Corrente Contínua",   color:"#22d3ee", desc:"DC · Ohm · KVL · Thévenin",      docs:"Lei de Ohm, KVL, KCL, Thévenin/Norton" },
    { id:"ac",      icon:MODULE_GLYPHS.ac, label:"Corrente Alternada",  color:"#f59e0b", desc:"AC · RLC · Fasores · FP",         docs:"Impedância, Reatância XL/XC, Potência" },
    { id:"pneum",   icon:MODULE_GLYPHS.pneum, label:"Pneumática",          color:"#a78bfa", desc:"Válvulas · Cilindros · Força",    docs:"Pressão, Força, Consumo, Válvulas" },
    { id:"hidro",   icon:MODULE_GLYPHS.hidro, label:"Hidráulica",          color:"#38bdf8", desc:"Bombas · Cilindros · Pascal",     docs:"Potência Hid., Força, Velocidade" },
    { id:"logic",   icon:MODULE_GLYPHS.logic, label:"Lógica Digital",      color:"#4ade80", desc:"AND·OR·NOT·XOR · FF",            docs:"Propagação de sinais, Tabela Verdade" },
    { id:"cmd",     icon:MODULE_GLYPHS.cmd, label:"Comandos Elétricos",  color:"#fb923c", desc:"Contatores · Motores · Relés",    docs:"Motor 3φ, Cabo, Disjuntor, Relé Térm." },
    { id:"install", icon:MODULE_GLYPHS.install,  label:"Instalações",         color:"#f43f5e", desc:"NBR 5410 · Dimensionamento",     docs:"Carga, Id, Queda de tensão, DPS" },
    { id:"ladder",  icon:MODULE_GLYPHS.ladder,  label:"Ladder / CLP",        color:"#c084fc", desc:"Contatos · Bobinas · Timers",    docs:"Contatos NA/NF, Bobinas, TON/TOF" },
  ];

  const shortcuts = [
    ["S","Selecionar / Mover"],["W","Traçar Fio"],["D","Apagar"],
    ["F9","Calcular"],["F5","Simular"],["F2","Renomear"],
    ["Dbl-click","Editar valor / Toggle"],["Del","Apagar selecionado"],
    ["Ctrl+Z","Desfazer"],["Ctrl+Y","Refazer"],
    ["Ctrl+←→","Girar 90°"],["Ctrl+S","Salvar JSON"],
    ["Ctrl+O","Abrir JSON"],["ESC","Cancelar"],
    ["Scroll","Zoom"],["Btn central","Pan"],
  ];

  const stats = [
    { label:"Módulos",    value:"8",   icon:"🧩", col:"#22d3ee" },
    { label:"Componentes",value:"60+", icon:"⚙️", col:"#a78bfa" },
    { label:"Simulações", value:"∞",   icon:"⚡", col:"#f59e0b" },
    { label:"Projetos",   value:"∞",   icon:"📁", col:"#4ade80" },
  ];

  return (
    <div style={{minHeight:"100vh",background:"#010912",fontFamily:"'Courier New',Consolas,monospace",color:"#e2e8f0",display:"flex",flexDirection:"column"}}>

      {/* ── Top nav ── */}
      <header style={{height:56,background:"#040d18",borderBottom:"1px solid #1e3a5f55",display:"flex",alignItems:"center",padding:"0 32px",gap:16,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:30,height:30,borderRadius:6,background:"#22d3ee22",border:"1px solid #22d3ee44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:"0 0 12px #22d3ee22"}}>⚡</div>
          <span style={{fontSize:13,fontWeight:700,color:"#22d3ee",letterSpacing:3}}>TECHSIM PRO</span>
        </div>
        <div style={{height:18,width:1,background:"#1e3a5f"}}/>
        <span style={{fontSize:9,color:"#334155",letterSpacing:4}}>DASHBOARD</span>
        <div style={{flex:1}}/>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:10,color:"#22d3ee",fontWeight:700}}>{user.name}</div>
            <div style={{fontSize:8,color:"#334155"}}>{user.email}</div>
          </div>
          <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#22d3ee22,#0ea5e922)",border:"1px solid #22d3ee44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#22d3ee"}}>
            {user.name[0].toUpperCase()}
          </div>
          <button onClick={onLogout}
            style={{background:"transparent",border:"1px solid #1e3a5f",color:"#475569",padding:"5px 14px",borderRadius:4,cursor:"pointer",fontSize:9,letterSpacing:2,fontFamily:"inherit",transition:"all 0.15s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#f43f5e55";e.currentTarget.style.color="#f43f5e";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#1e3a5f";e.currentTarget.style.color="#475569";}}>
            SAIR
          </button>
          {onAdmin&&<button onClick={onAdmin}
            style={{background:"#f43f5e18",border:"1px solid #f43f5e44",color:"#f43f5e",padding:"5px 14px",borderRadius:4,cursor:"pointer",fontSize:9,letterSpacing:2,fontFamily:"inherit",transition:"all 0.15s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="#f43f5e28";}}
            onMouseLeave={e=>{e.currentTarget.style.background="#f43f5e18";}}>
            🔐 ADMIN
          </button>}
        </div>
      </header>

      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        {/* ── Sidebar ── */}
        <aside style={{width:220,background:"#040d18",borderRight:"1px solid #1e3a5f33",display:"flex",flexDirection:"column",padding:"20px 12px",gap:4,flexShrink:0}}>
          <div style={{fontSize:8,color:"#1e3a5f",letterSpacing:3,marginBottom:8,paddingLeft:4}}>NAVEGAÇÃO</div>
          {[
            {id:"modules",  icon:"🧩", label:"Módulos"},
            {id:"shortcuts",icon:"⌨️", label:"Atalhos"},
            {id:"about",    icon:"ℹ️",  label:"Sobre"},
          ].map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
              style={{background:activeTab===tab.id?"#22d3ee15":"transparent",border:`1px solid ${activeTab===tab.id?"#22d3ee44":"transparent"}`,color:activeTab===tab.id?"#22d3ee":"#475569",borderRadius:6,padding:"8px 12px",cursor:"pointer",fontFamily:"inherit",fontSize:10,letterSpacing:1,textAlign:"left",display:"flex",alignItems:"center",gap:8,transition:"all 0.15s"}}
              onMouseEnter={e=>{if(activeTab!==tab.id)e.currentTarget.style.background="#071020";}}
              onMouseLeave={e=>{if(activeTab!==tab.id)e.currentTarget.style.background="transparent";}}>
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
          <div style={{flex:1}}/>
          {/* Quick stats */}
          <div style={{background:"#071020",border:"1px solid #1e3a5f33",borderRadius:8,padding:"12px"}}>
            {stats.map((s,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:i<stats.length-1?"1px solid #1e293b22":"none"}}>
                <span style={{fontSize:9,color:"#334155"}}>{s.icon} {s.label}</span>
                <span style={{fontSize:10,fontWeight:700,color:s.col,fontFamily:"monospace"}}>{s.value}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={{flex:1,overflowY:"auto",padding:"32px"}}>

          {/* Welcome banner */}
          <div style={{background:"linear-gradient(135deg,#040d18,#071020)",border:"1px solid #22d3ee22",borderRadius:12,padding:"28px 32px",marginBottom:28,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-40,right:-40,width:200,height:200,borderRadius:"50%",background:"radial-gradient(#22d3ee0a,transparent 70%)"}}/>
            <div style={{fontSize:9,color:"#22d3ee66",letterSpacing:3,marginBottom:8}}>BEM-VINDO DE VOLTA</div>
            <div style={{fontSize:22,fontWeight:700,marginBottom:6}}>Olá, {user.name.split(" ")[0]} 👋</div>
            <div style={{fontSize:11,color:"#334155"}}>Selecione um módulo para começar. Canvas interativo com simulação em tempo real.</div>
          </div>

          {/* Tab: MODULES */}
          {activeTab === "modules" && (
            <div>
              <div style={{fontSize:9,color:"#334155",letterSpacing:4,marginBottom:16}}>MÓDULOS DE SIMULAÇÃO</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
                {mods.map(m=>(
                  <button key={m.id} onClick={()=>onOpenModule(m.id)}
                    onMouseEnter={()=>setHovMod(m.id)} onMouseLeave={()=>setHovMod(null)}
                    style={{background:hovMod===m.id?`${m.color}0e`:"#040d18",border:`1px solid ${hovMod===m.id?m.color+"44":"#1e3a5f"}`,borderRadius:10,padding:"20px",cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"all 0.18s",transform:hovMod===m.id?"translateY(-2px)":"none",boxShadow:hovMod===m.id?`0 8px 32px ${m.color}18`:"none"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                      <span style={{fontSize:26}}>{m.icon}</span>
                      <span style={{fontSize:8,background:`${m.color}18`,color:m.color,padding:"2px 8px",borderRadius:10,border:`1px solid ${m.color}33`,letterSpacing:1}}>ABRIR →</span>
                    </div>
                    <div style={{fontSize:12,fontWeight:700,color:hovMod===m.id?m.color:"#94a3b8",letterSpacing:0.5,marginBottom:4}}>{m.label}</div>
                    <div style={{fontSize:9,color:"#475569",lineHeight:1.5,marginBottom:6}}>{m.desc}</div>
                    <div style={{fontSize:8,color:"#1e3a5f",lineHeight:1.6,borderTop:"1px solid #1e293b",paddingTop:8,marginTop:4}}>{m.docs}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tab: SHORTCUTS */}
          {activeTab === "shortcuts" && (
            <div>
              <div style={{fontSize:9,color:"#334155",letterSpacing:4,marginBottom:16}}>ATALHOS DE TECLADO</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,maxWidth:700}}>
                {shortcuts.map(([key,desc],i)=>(
                  <div key={i} style={{background:"#040d18",border:"1px solid #1e3a5f",borderRadius:6,padding:"10px 14px",display:"flex",alignItems:"center",gap:12}}>
                    <kbd style={{background:"#071020",border:"1px solid #334155",borderRadius:4,padding:"3px 8px",fontSize:9,color:"#22d3ee",fontFamily:"monospace",whiteSpace:"nowrap",flexShrink:0}}>{key}</kbd>
                    <span style={{fontSize:9,color:"#475569"}}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab: ABOUT */}
          {activeTab === "about" && (
            <div style={{maxWidth:600}}>
              <div style={{fontSize:9,color:"#334155",letterSpacing:4,marginBottom:16}}>SOBRE O TECHSIM PRO</div>
              <div style={{background:"#040d18",border:"1px solid #1e3a5f",borderRadius:10,padding:"28px"}}>
                <div style={{fontSize:16,fontWeight:700,color:"#22d3ee",marginBottom:16}}>⚡ TechSim Pro v2.0</div>
                <div style={{fontSize:11,color:"#475569",lineHeight:2,marginBottom:20}}>
                  Plataforma de construção e simulação de circuitos para engenheiros, técnicos e estudantes. Canvas interativo com snap ao grid, pan/zoom, undo/redo e simulação em tempo real.
                </div>
                {[
                  ["Canvas Engine","Snap ao grid · Ortho mode · Pan/Zoom · 60fps"],
                  ["Solvers","DC (KVL/KCL/Thévenin) · AC (RLC/Fasores) · Pneum · Hidro · Lógica · Cmd · NBR5410 · Ladder"],
                  ["Ferramentas","Girar · Cor dos fios · Endereçamento · N.º entradas · Salvar/Abrir JSON · Undo 60 níveis"],
                  ["Visualização","Animação de corrente ao vivo · Live data overlay · Passo a passo de cálculo"],
                ].map(([k,v])=>(
                  <div key={k} style={{borderTop:"1px solid #1e293b",padding:"12px 0",display:"flex",gap:16}}>
                    <span style={{fontSize:9,color:"#22d3ee",fontWeight:700,minWidth:120,letterSpacing:0.5}}>{k}</span>
                    <span style={{fontSize:9,color:"#334155",lineHeight:1.7}}>{v}</span>
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


// ═══════════════════════════════════════════════════════════════════════════════
// HISTORY REDUCER
// ═══════════════════════════════════════════════════════════════════════════════
function hRed(st, a) {
  switch(a.type) {
    case "PUSH":  return { past:[...st.past,st.present].slice(-MAX_H), present:a.p, future:[] };
    case "UNDO":  return st.past.length===0 ? st : { past:st.past.slice(0,-1), present:st.past[st.past.length-1], future:[st.present,...st.future] };
    case "REDO":  return st.future.length===0 ? st : { past:[...st.past,st.present], present:st.future[0], future:st.future.slice(1) };
    case "RESET": return { past:[], present:a.p, future:[] };
    default: return st;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE DEFINITIONS (for Engine)
// ═══════════════════════════════════════════════════════════════════════════════
const MODS_ALL = [
  { id:"dc",      icon:MODULE_GLYPHS.dc, label:"Corrente Contínua",   color:"#22d3ee", desc:"DC · Ohm · KVL · Thévenin" },
  { id:"ac",      icon:MODULE_GLYPHS.ac, label:"Corrente Alternada",  color:"#f59e0b", desc:"AC · RLC · Fasores · FP" },
  { id:"pneum",   icon:MODULE_GLYPHS.pneum, label:"Pneumática",          color:"#a78bfa", desc:"Válvulas · Cilindros · Pressão" },
  { id:"hidro",   icon:MODULE_GLYPHS.hidro, label:"Hidráulica",          color:"#38bdf8", desc:"Bombas · Cilindros · Pascal" },
  { id:"logic",   icon:MODULE_GLYPHS.logic, label:"Lógica Digital",      color:"#4ade80", desc:"AND·OR·NOT·XOR · FF" },
  { id:"cmd",     icon:MODULE_GLYPHS.cmd, label:"Comandos Elétricos",  color:"#fb923c", desc:"Contatores · Motores · Relés" },
  { id:"install", icon:MODULE_GLYPHS.install,  label:"Instalações",         color:"#f43f5e", desc:"NBR 5410 · Cargas · Proteção" },
  { id:"ladder",  icon:MODULE_GLYPHS.ladder,  label:"Ladder / CLP",        color:"#c084fc", desc:"Contatos · Bobinas · Timers" },
];

const LIBS = {
  dc:[
    { t:"vdc",  lbl:"Fonte DC",  sym:"±V", col:"#22d3ee",k:"V",dv:12,  u:"V",  tip:"Fonte de tensão contínua" },
    { t:"idc",  lbl:"Fonte I",   sym:"→I", col:"#a78bfa",k:"I",dv:1,   u:"A",  tip:"Fonte de corrente" },
    { t:"res",  lbl:"Resistor",  sym:"R",  col:"#f59e0b",k:"R",dv:1000,u:"Ω",  tip:"Resistor linear" },
    { t:"cap",  lbl:"Capacitor", sym:"C",  col:"#4ade80",k:"C",dv:100, u:"μF", tip:"Capacitor" },
    { t:"ind",  lbl:"Indutor",   sym:"L",  col:"#fb923c",k:"L",dv:10,  u:"mH", tip:"Indutor/bobina" },
    { t:"diode",lbl:"Diodo",     sym:"D",  col:"#f43f5e",k:"D",dv:0.7, u:"V",  tip:"Diodo retificador" },
    { t:"led",  lbl:"LED",       sym:"LED",col:"#fbbf24",k:"E",dv:2.0, u:"V",  tip:"LED" },
    { t:"sw",   lbl:"Chave",     sym:"SW", col:"#94a3b8",k:"K",dv:1,   u:"",   tip:"Chave (dbl=toggle)" },
    { t:"gnd",  lbl:"Terra",     sym:"⏚",  col:"#6ee7b7",k:"G",dv:0,   u:"",   tip:"Referência 0V" },
    { t:"mtr",  lbl:"Multímetro",sym:"⊛",  col:"#fb923c",k:"M",dv:0,   u:"",   tip:"Multímetro — dbl=mudar modo (V/mA/Ω/AC)" },
    { t:"osc",  lbl:"Osciloscóp",sym:"OSC",col:"#22d3ee",k:"O",dv:0,   u:"",   tip:"Osciloscópio" },
    { t:"pot",  lbl:"Potenciôm.", sym:"POT",col:"#fbbf24",k:"P",dv:50,  u:"%",  tip:"Potenciômetro (0-100%)" },
    { t:"zpv",  lbl:"Zener",     sym:"Dz", col:"#c084fc",k:"Z",dv:5.1, u:"V",  tip:"Diodo Zener" },
    { t:"trns", lbl:"Transistor",sym:"NPN",col:"#4ade80",k:"N",dv:100, u:"",   tip:"Transistor NPN" },
    { t:"psu",  lbl:"Fonte Reg.", sym:"PSU",col:"#22c55e",k:"U",dv:12,  u:"V",  tip:"Fonte regulada DC" },
    { t:"rgbled",lbl:"LED RGB",   sym:"RGB",col:"#a78bfa",k:"H",dv:0,   u:"",   tip:"LED RGB colorido" },
    { t:"tgauge",lbl:"Term.Anal.",sym:"TG", col:"#f87171",k:"J",dv:25,  u:"°C", tip:"Termômetro analógico" },
  ],
  ac:[
    { t:"vac",  lbl:"Fonte AC",  sym:"~V",col:"#f59e0b",k:"V",dv:220,u:"V",  tip:"Fonte alternada" },
    { t:"res",  lbl:"Resistor",  sym:"R", col:"#f59e0b",k:"R",dv:100,u:"Ω",  tip:"Resistência" },
    { t:"cap",  lbl:"Capacitor", sym:"C", col:"#4ade80",k:"C",dv:100,u:"μF", tip:"Capacitor — XC" },
    { t:"ind",  lbl:"Indutor",   sym:"L", col:"#fb923c",k:"L",dv:100,u:"mH", tip:"Indutor — XL" },
    { t:"transf",lbl:"Transf.",  sym:"TR",col:"#22d3ee",k:"T",dv:220,u:"V",  tip:"Transformador" },
    { t:"imp",  lbl:"Impedância",sym:"Z", col:"#a78bfa",k:"Z",dv:50, u:"Ω",  tip:"Impedância" },
    { t:"gnd",  lbl:"Terra",     sym:"⏚", col:"#6ee7b7",k:"G",dv:0,  u:"",   tip:"Terra" },
    { t:"mtr",  lbl:"Multímetro",sym:"⊛", col:"#fb923c",k:"M",dv:0,  u:"",   tip:"Multímetro AC — dbl=mudar modo" },
    { t:"watt", lbl:"Wattímetro",sym:"W",  col:"#22c55e",k:"W",dv:0,  u:"W",  tip:"Wattímetro" },
    { t:"phasem",lbl:"Fasímetro", sym:"φ",  col:"#a78bfa",k:"H",dv:0,  u:"°",  tip:"Medidor de fase" },
  ],
  pneum:[
    { t:"comp", lbl:"Compressor",sym:"K",  col:"#a78bfa",k:"C",dv:6, u:"bar",tip:"Fonte de ar" },
    { t:"v32",  lbl:"Válv. 3/2", sym:"3/2",col:"#c084fc",k:"V",dv:1, u:"",  tip:"3 vias 2 pos." },
    { t:"v52",  lbl:"Válv. 5/2", sym:"5/2",col:"#e879f9",k:"X",dv:1, u:"",  tip:"5 vias 2 pos." },
    { t:"v53",  lbl:"Válv. 5/3", sym:"5/3",col:"#d946ef",k:"Y",dv:0, u:"",  tip:"5 vias 3 pos." },
    { t:"cyl",  lbl:"Cil. DE",   sym:"CIL",col:"#38bdf8",k:"T",dv:50,u:"mm",tip:"Cilindro DE" },
    { t:"cylse",lbl:"Cil. SE",   sym:"CSE",col:"#7dd3fc",k:"J",dv:40,u:"mm",tip:"Cilindro SE" },
    { t:"snsr", lbl:"Sensor",    sym:"B",  col:"#4ade80",k:"S",dv:1, u:"",  tip:"Sensor" },
    { t:"resv", lbl:"Reservat.", sym:"RES",col:"#7dd3fc",k:"R",dv:50,u:"L", tip:"Reservatório" },
    { t:"flt",  lbl:"Filtro",    sym:"FR", col:"#94a3b8",k:"F",dv:40,u:"μm",tip:"Filtro" },
    { t:"sil",  lbl:"Silenc.",   sym:"SIL",col:"#64748b",k:"I",dv:1, u:"",  tip:"Silenciador" },
    { t:"prs",  lbl:"Pressostato",sym:"PS", col:"#f87171",k:"H",dv:6,  u:"bar",tip:"Pressostato" },
    { t:"manm", lbl:"Manômetro",  sym:"P?", col:"#fbbf24",k:"G",dv:6,  u:"bar",tip:"Manômetro analógico" },
    { t:"lubd", lbl:"Lubrificad.",sym:"LB", col:"#94a3b8",k:"B",dv:1,  u:"",   tip:"Lubrificador FRL" },
    { t:"propv",lbl:"V.Proporcn.",sym:"VP", col:"#c084fc",k:"W",dv:50, u:"%",  tip:"Válvula proporcional (0-100%)" },
    { t:"preg", lbl:"Regulador",  sym:"REG",col:"#7dd3fc",k:"E",dv:6,  u:"bar",tip:"Regulador de pressão FRL" },
    { t:"servo",lbl:"Servo Pneu.",sym:"SRV",col:"#38bdf8",k:"O",dv:0,  u:"°",  tip:"Servo cilindro posicional" },
    { t:"flowin",lbl:"Rot.Fluxo", sym:"FLW",col:"#4ade80",k:"D",dv:50, u:"%",  tip:"Rotâmetro / indicador de fluxo" },
  ],
  hidro:[
    { t:"pump",   lbl:"Bomba",   sym:"P", col:"#38bdf8",k:"P",dv:200,u:"bar",tip:"Bomba hidráulica" },
    { t:"mtrh",   lbl:"Motor H.",sym:"MH",col:"#0ea5e9",k:"M",dv:150,u:"bar",tip:"Motor hidráulico" },
    { t:"vd",     lbl:"Válv.Dir",sym:"VD",col:"#7dd3fc",k:"V",dv:1,  u:"",  tip:"Válvula direcional" },
    { t:"valivio",lbl:"V.Alívio",sym:"VA",col:"#f87171",k:"R",dv:250,u:"bar",tip:"Válvula de alívio" },
    { t:"vret",   lbl:"V.Retenc",sym:"VR",col:"#fb923c",k:"C",dv:1,  u:"",  tip:"V. retenção" },
    { t:"cylh",   lbl:"Cil. Hid",sym:"CH",col:"#22d3ee",k:"T",dv:80, u:"mm",tip:"Cilindro hidráulico" },
    { t:"flth",   lbl:"Filtro H",sym:"FH",col:"#94a3b8",k:"F",dv:10, u:"μm",tip:"Filtro hidráulico" },
    { t:"tank",   lbl:"Reservat",sym:"TK",col:"#64748b",k:"K",dv:100,u:"L", tip:"Tanque" },
    { t:"fq",     lbl:"Vazão",   sym:"FQ",col:"#4ade80",k:"Q",dv:20, u:"L/m",tip:"Medidor vazão" },
  ],
  logic:[
    { t:"inp", lbl:"Entrada",sym:"IN", col:"#4ade80",k:"I",dv:0,u:"",tip:"Entrada (dbl=toggle)" },
    { t:"out", lbl:"Saída",  sym:"OUT",col:"#f87171",k:"O",dv:0,u:"",tip:"Saída lógica" },
    { t:"and", lbl:"AND",    sym:"&",  col:"#22d3ee",k:"A",dv:0,u:"",tip:"AND" },
    { t:"or",  lbl:"OR",     sym:"≥1", col:"#4ade80",k:"R",dv:0,u:"",tip:"OR" },
    { t:"not", lbl:"NOT",    sym:"¬",  col:"#f87171",k:"N",dv:0,u:"",tip:"NOT" },
    { t:"nand",lbl:"NAND",   sym:"¬&", col:"#fb923c",k:"Q",dv:0,u:"",tip:"NAND" },
    { t:"nor", lbl:"NOR",    sym:"¬1", col:"#a78bfa",k:"W",dv:0,u:"",tip:"NOR" },
    { t:"xor", lbl:"XOR",    sym:"⊕",  col:"#fbbf24",k:"X",dv:0,u:"",tip:"XOR" },
    { t:"ffsr",lbl:"FF-SR",  sym:"SR", col:"#c084fc",k:"F",dv:0,u:"",tip:"Flip-Flop SR" },
    { t:"buf", lbl:"Buffer", sym:"1",  col:"#38bdf8",k:"B",dv:0,u:"",tip:"Buffer" },
    { t:"mux",  lbl:"Mux 2:1",   sym:"M2",  col:"#22d3ee",k:"U",dv:0,u:"",tip:"Multiplexador 2:1" },
    { t:"dff",  lbl:"FF-D",       sym:"D",   col:"#4ade80",k:"H",dv:0,u:"",tip:"Flip-Flop D" },
    { t:"seg7", lbl:"Display 7sg",sym:"7SEG",col:"#f87171",k:"7",dv:0,u:"",tip:"Display 7 segmentos" },
    { t:"plc",  lbl:"CPU CLP",    sym:"PLC", col:"#c084fc",k:"J",dv:0,u:"",tip:"Bloco CPU PLC" },
  ],
  cmd:[
    { t:"cont", lbl:"Contator",  sym:"KM",col:"#fb923c",k:"K",dv:1,  u:"",  tip:"Contator" },
    { t:"rele", lbl:"Relé Aux.", sym:"KA",col:"#f59e0b",k:"R",dv:1,  u:"",  tip:"Relé auxiliar" },
    { t:"bna",  lbl:"Botão NA",  sym:"E", col:"#4ade80",k:"N",dv:0,  u:"",  tip:"Botão N.Aberto" },
    { t:"bnf",  lbl:"Botão NF",  sym:"F", col:"#f87171",k:"X",dv:1,  u:"",  tip:"Botão N.Fechado" },
    { t:"tmr",  lbl:"Temporizad",sym:"KT",col:"#22d3ee",k:"T",dv:5,  u:"s", tip:"Temporizador" },
    { t:"mote", lbl:"Motor 3φ",  sym:"M", col:"#a78bfa",k:"M",dv:7.5,u:"kW",tip:"Motor (kW)" },
    { t:"fus",  lbl:"Fusível",   sym:"FU",col:"#f43f5e",k:"U",dv:16, u:"A", tip:"Fusível" },
    { t:"disj", lbl:"Disjuntor", sym:"QF",col:"#e2e8f0",k:"Q",dv:10, u:"A", tip:"Disjuntor" },
    { t:"rterm",lbl:"Relé Térm.",sym:"FR",col:"#fb923c",k:"A",dv:10, u:"A", tip:"Relé de sobrecarga" },
    { t:"lamp", lbl:"Sinaleiro", sym:"HL",col:"#fbbf24",k:"L",dv:24, u:"V", tip:"Sinaleiro" },
    { t:"enc",  lbl:"Encoder",    sym:"ENC",col:"#22d3ee",k:"E",dv:1000,u:"ppr",tip:"Encoder rotativo" },
    { t:"tc",   lbl:"Termopar",   sym:"TC", col:"#f43f5e",k:"J",dv:25,  u:"°C", tip:"Termopar tipo J/K" },
    { t:"vfd",  lbl:"Inversor",   sym:"VFD",col:"#a78bfa",k:"H",dv:50,  u:"Hz", tip:"Inversor de frequência" },
    { t:"servo",lbl:"Servo Motor",sym:"SRV",col:"#22d3ee",k:"W",dv:90,  u:"°",  tip:"Servo motor posicional" },
    { t:"tgauge",lbl:"Termômetro",sym:"TG", col:"#f87171",k:"X",dv:25,  u:"°C", tip:"Termômetro analógico de painel" },
  ],
  install:[
    { t:"qg",  lbl:"Disj.Geral",sym:"QG", col:"#f43f5e",k:"Q",dv:63,  u:"A",  tip:"Disjuntor geral" },
    { t:"qc",  lbl:"Disj.Circ.",sym:"QC", col:"#fb923c",k:"C",dv:20,  u:"A",  tip:"Disjuntor circuito" },
    { t:"dr",  lbl:"DR/DDR",    sym:"DR", col:"#22d3ee",k:"D",dv:30,  u:"mA", tip:"Diferencial" },
    { t:"dps", lbl:"DPS",       sym:"DPS",col:"#f87171",k:"P",dv:1,   u:"",   tip:"Proteção surto" },
    { t:"bus", lbl:"Barramento",sym:"BB", col:"#fbbf24",k:"B",dv:1,   u:"",   tip:"Barramento" },
    { t:"tom", lbl:"Tomada",    sym:"TOM",col:"#4ade80",k:"T",dv:20,  u:"A",  tip:"Tomada" },
    { t:"lum", lbl:"Iluminação",sym:"LUM",col:"#fbbf24",k:"L",dv:100, u:"W",  tip:"Iluminação" },
    { t:"ar",  lbl:"Ar-Cond.",  sym:"❄",  col:"#38bdf8",k:"A",dv:3000,u:"W",  tip:"Ar-condicionado" },
    { t:"gnde",lbl:"Terra PE",  sym:"⏚",  col:"#6ee7b7",k:"G",dv:0,   u:"",   tip:"Terra proteção" },
  ],
  ladder:[
    { t:"cno", lbl:"Contato NA",sym:"[ ]",col:"#4ade80",k:"N",dv:0,u:"",  tip:"N. Aberto" },
    { t:"cnf", lbl:"Contato NF",sym:"[/]",col:"#f87171",k:"X",dv:1,u:"",  tip:"N. Fechado" },
    { t:"cpos",lbl:"Borda ↑",   sym:"[P]",col:"#22d3ee",k:"P",dv:0,u:"",  tip:"Borda subida" },
    { t:"coil",lbl:"Bobina",    sym:"( )",col:"#c084fc",k:"O",dv:0,u:"",  tip:"Bobina saída" },
    { t:"set", lbl:"Set",       sym:"(S)",col:"#a78bfa",k:"S",dv:0,u:"",  tip:"Bobina Set" },
    { t:"rst", lbl:"Reset",     sym:"(R)",col:"#f43f5e",k:"R",dv:0,u:"",  tip:"Bobina Reset" },
    { t:"ton", lbl:"TON",       sym:"TON",col:"#22d3ee",k:"T",dv:5,u:"s", tip:"Timer ON" },
    { t:"tof", lbl:"TOF",       sym:"TOF",col:"#0ea5e9",k:"F",dv:5,u:"s", tip:"Timer OFF" },
    { t:"ctu", lbl:"CTU",       sym:"CTU",col:"#f59e0b",k:"C",dv:10,u:"", tip:"Contador" },
    { t:"cmp", lbl:"Compare",   sym:"CMP",col:"#38bdf8",k:"Z",dv:0,u:"",  tip:"Comparador" },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// SOLVERS
// ═══════════════════════════════════════════════════════════════════════════════
function solve(modId, comps, wires) {
  const h = { T:t=>({text:t,type:"title"}), F:f=>({text:f,type:"formula"}), R:r=>({text:r,type:"result"}), P:p=>({text:p,type:"sub"}), D:{text:"",type:"divider"} };
  try {
    switch(modId) {
      case "dc":      return solveDC(comps,wires,h);
      case "ac":      return solveAC(comps,wires,h);
      case "pneum":   return solvePneum(comps,wires,h);
      case "hidro":   return solveHidro(comps,wires,h);
      case "logic":   return solveLogic(comps,wires,h);
      case "cmd":     return solveCmd(comps,wires,h);
      case "install": return solveInstall(comps,wires,h);
      case "ladder":  return solveLadder(comps,wires,h);
      default: return {steps:[],results:[],ok:false};
    }
  } catch(e) { return {steps:[{text:"❌ "+e.message,type:"result"}],results:[],ok:false}; }
}

function solveDC(comps,wires,{T,F,R,P,D}){
  const st=[],re=[];
  const vs=comps.filter(c=>c.t==="vdc"), rs=comps.filter(c=>c.t==="res"), is=comps.filter(c=>c.t==="idc"), gs=comps.filter(c=>c.t==="gnd"), leds=comps.filter(c=>["led","diode"].includes(c.t));
  if(!gs.length){st.push(R("⚠️ Adicione Terra (GND)"));return{steps:st,results:re,ok:false};}
  if(!rs.length&&!leds.length){st.push(R("⚠️ Adicione um Resistor ou LED"));return{steps:st,results:re,ok:false};}
  if(!vs.length&&!is.length){st.push(R("⚠️ Adicione Fonte de tensão ou corrente"));return{steps:st,results:re,ok:false};}
  const totalV=vs.reduce((s,v)=>s+parseFloat(v.v||0),0);
  const totalVled=leds.reduce((s,d)=>s+parseFloat(d.v||0.7),0);
  const Veff=Math.max(0,totalV-totalVled);
  const totalR=rs.reduce((s,r)=>s+parseFloat(r.v||1),0)||0.001;
  const totalI=totalV>0?Veff/totalR:is.reduce((s,ii)=>s+parseFloat(ii.v||0),0);
  const totalP=totalV*totalI;
  st.push(T("⚡ CIRCUITO DC"));
  st.push(P(`V_total=${totalV.toFixed(2)}V | R_eq=${totalR.toFixed(2)}Ω`));
  st.push(D);
  st.push(T("1. Resistência Equivalente (série)"));
  st.push(F(`R_eq = ${rs.map(r=>r.v+"Ω").join(" + ")||"—"}`));
  st.push(R(`R_eq = ${totalR.toFixed(4)} Ω`));
  if(leds.length)st.push(P(`Queda diodos: ${totalVled.toFixed(2)}V → Vef=${Veff.toFixed(2)}V`));
  st.push(D);
  st.push(T("2. Corrente — Lei de Ohm"));
  st.push(F(`I = Vef / R_eq = ${Veff.toFixed(2)}V ÷ ${totalR.toFixed(4)}Ω`));
  st.push(R(`I = ${totalI.toFixed(5)} A = ${(totalI*1000).toFixed(3)} mA`));
  st.push(D);
  const byComp={};
  if(rs.length){
    st.push(T("3. Por Resistor (série)"));
    rs.forEach((r,i)=>{const Vr=totalI*parseFloat(r.v||1),Pr=totalI*totalI*parseFloat(r.v||1);st.push(P(`${r.n||"R"+(i+1)}: V=${Vr.toFixed(3)}V P=${Pr.toFixed(3)}W`));byComp[r.id]={I:totalI,V:Vr};re.push({label:`${r.n||"R"+(i+1)} Tensão`,value:`${Vr.toFixed(4)}V`,icon:"🔋",col:"#22d3ee",id:r.id});});
    st.push(D);
    st.push(T("4. KVL (ΣV=0)"));
    const sumVr=rs.reduce((s,r)=>s+totalI*parseFloat(r.v||1),0)+totalVled;
    const ok=Math.abs(sumVr-totalV)<0.01;
    st.push(R(`${sumVr.toFixed(4)}V ${ok?"≈":"≠"} ${totalV.toFixed(4)}V ${ok?"✅ OK":"⚠️"}`));
    if(rs.length>=2&&vs.length){st.push(D);st.push(T("5. Thévenin (vis. R_último)"));const Rl=parseFloat(rs[rs.length-1].v||1),Rr=totalR-Rl,Vth=totalV*Rl/totalR,Rth=Rr*Rl/(Rr+Rl||0.001);st.push(R(`V_th=${Vth.toFixed(4)}V | R_th=${Rth.toFixed(4)}Ω`));re.push({label:"V_Thévenin",value:`${Vth.toFixed(4)}V`,icon:"⚡",col:"#c084fc"});re.push({label:"R_Thévenin",value:`${Rth.toFixed(4)}Ω`,icon:"🔌",col:"#a78bfa"});}
  }
  st.push(D); st.push(T("Potência Total")); st.push(F("P=V×I")); st.push(R(`P=${totalP.toFixed(4)}W`));
  return{steps:st,results:[{label:"Tensão",value:`${totalV.toFixed(2)}V`,icon:"🔋",col:"#22d3ee"},{label:"Corrente",value:`${totalI.toFixed(5)}A`,icon:"⚡",col:"#22d3ee"},{label:"Corrente (mA)",value:`${(totalI*1000).toFixed(3)}mA`,icon:"⚡",col:"#38bdf8"},{label:"R Equivalente",value:`${totalR.toFixed(4)}Ω`,icon:"🔌",col:"#f59e0b"},{label:"Potência",value:`${totalP.toFixed(4)}W`,icon:"💡",col:"#4ade80"},...re],ok:true,live:{totalI,totalV,byComp}};
}

function solveAC(comps,wires,{T,F,R,P,D}){
  const st=[],re=[];
  const vs=comps.filter(c=>c.t==="vac"),rs=comps.filter(c=>c.t==="res"),ls=comps.filter(c=>c.t==="ind"),cs=comps.filter(c=>c.t==="cap");
  if(!vs.length){st.push(R("⚠️ Adicione Fonte AC"));return{steps:st,results:re,ok:false};}
  const V=parseFloat(vs[0].v||220),f=60,Rt=rs.reduce((s,r)=>s+parseFloat(r.v||0),0)||0.001;
  const Lt=ls.reduce((s,l)=>s+parseFloat(l.v||0),0)/1000,Ct=cs.reduce((s,c)=>s+parseFloat(c.v||0),0)/1e6;
  const w=2*Math.PI*f,XL=w*Lt,XC=Ct>0?1/(w*Ct):0,Xn=XL-XC;
  const Z=Math.sqrt(Rt**2+Xn**2),phi=Math.atan2(Xn,Rt)*180/Math.PI;
  const I=V/Z,Pa=I*I*Rt,Q=I*I*Xn,S=V*I,FP=S>0?Pa/S:0;
  const fr=Ct>0&&Lt>0?1/(2*Math.PI*Math.sqrt(Lt*Ct)):0;
  st.push(T("⚡ AC — RLC Série (f=60Hz)"));
  st.push(P(`V=${V}V | R=${Rt}Ω | XL=${XL.toFixed(2)}Ω | XC=${XC.toFixed(2)}Ω`));
  st.push(D);st.push(T("Impedância"));st.push(F("Z=√(R²+(XL-XC)²)"));st.push(R(`Z=${Z.toFixed(4)}Ω ∠${phi.toFixed(2)}°`));
  st.push(D);st.push(T("Corrente RMS"));st.push(R(`I=${I.toFixed(5)}A`));
  st.push(D);st.push(T("Potências"));st.push(P(`P=${Pa.toFixed(2)}W | Q=${Math.abs(Q).toFixed(2)}VAr | S=${S.toFixed(2)}VA`));st.push(R(`FP=${FP.toFixed(4)}`));
  if(fr>0){st.push(D);st.push(T("Ressonância"));st.push(R(`f_r=${fr.toFixed(4)}Hz ${Math.abs(f-fr)<1?"← EM RESSONÂNCIA!":""}`))}
  return{steps:st,results:[{label:"Z",value:`${Z.toFixed(4)}Ω`,icon:"⚡",col:"#f59e0b"},{label:"φ",value:`${phi.toFixed(2)}°`,icon:"📐",col:"#94a3b8"},{label:"I rms",value:`${I.toFixed(5)}A`,icon:"⚡",col:"#22d3ee"},{label:"XL",value:`${XL.toFixed(4)}Ω`,icon:"🌀",col:"#fb923c"},{label:"XC",value:`${XC>0?XC.toFixed(4):"∞"}Ω`,icon:"⚡",col:"#4ade80"},{label:"P Ativa",value:`${Pa.toFixed(2)}W`,icon:"💡",col:"#22c55e"},{label:"Q Reativa",value:`${Math.abs(Q).toFixed(2)}VAr`,icon:"🔄",col:"#fb923c"},{label:"FP",value:FP.toFixed(4),icon:"📐",col:"#fbbf24"},...(fr>0?[{label:"f_ressonância",value:`${fr.toFixed(2)}Hz`,icon:"🎯",col:"#f43f5e"}]:[])],ok:true};
}

function solvePneum(comps,wires,{T,F,R,P,D}){
  const st=[],re=[];
  const comp=comps.find(c=>c.t==="comp"),cyls=comps.filter(c=>["cyl","cylse"].includes(c.t)),flt=comps.find(c=>c.t==="flt");
  if(!comp){st.push(R("⚠️ Adicione Compressor"));return{steps:st,results:re,ok:false};}
  const Pb=parseFloat(comp.v||6),Pr=flt?Math.min(Pb,parseFloat(flt.v||Pb)):Pb;
  st.push(T("💨 PNEUMÁTICA"));st.push(P(`Pressão: ${Pb}bar${flt?` → regulada ${Pr}bar`:""}`));st.push(D);
  cyls.forEach((c,i)=>{const Dm=parseFloat(c.v||50)/1000,A=Math.PI*(Dm/2)**2,Fa=Pr*1e5*A;st.push(T(`${c.n||"Cil"+(i+1)} Ø${c.v}mm`));st.push(F("F=P×A"));st.push(R(`F=${Fa.toFixed(0)}N = ${(Fa/9.81).toFixed(1)}kgf`));if(c.t!=="cylse")st.push(P(`F recuo≈${(Fa*0.85).toFixed(0)}N`));st.push(D);re.push({label:`${c.n||"C"+(i+1)} Força`,value:`${Fa.toFixed(0)}N`,icon:"💨",col:"#a78bfa"});re.push({label:`${c.n||"C"+(i+1)} kgf`,value:`${(Fa/9.81).toFixed(1)}`,icon:"⚖️",col:"#c084fc"});});
  if(!cyls.length)st.push(P("→ Adicione Cilindros"));
  return{steps:st,results:[{label:"Pressão",value:`${Pr}bar`,icon:"🌡️",col:"#38bdf8"},...re],ok:true};
}

function solveHidro(comps,wires,{T,F,R,P,D}){
  const st=[],re=[];
  const pump=comps.find(c=>c.t==="pump"),fq=comps.find(c=>c.t==="fq"),cyls=comps.filter(c=>c.t==="cylh");
  if(!pump){st.push(R("⚠️ Adicione Bomba Hidráulica"));return{steps:st,results:re,ok:false};}
  const Pb=parseFloat(pump.v||200),Q=parseFloat(fq?.v||20),Qm=Q/60000,Pot=Pb*1e5*Qm/1000;
  st.push(T("💧 HIDRÁULICA"));st.push(P(`P=${Pb}bar | Q=${Q}L/min`));st.push(D);
  st.push(T("Potência Hidráulica"));st.push(F("Pot=P×Q [kW]"));st.push(R(`Pot=${Pot.toFixed(3)}kW | Elét.=${(Pot/0.85).toFixed(3)}kW`));st.push(D);
  cyls.forEach((c,i)=>{const Dm=parseFloat(c.v||80)/1000,A=Math.PI*(Dm/2)**2,Fc=Pb*1e5*A,Vel=Qm/A*1000;st.push(T(`${c.n||"Cil"+(i+1)} Ø${c.v}mm`));st.push(R(`F=${Fc.toFixed(0)}N = ${(Fc/9810).toFixed(2)}tf | v=${Vel.toFixed(1)}mm/s`));st.push(D);re.push({label:`${c.n||"C"+(i+1)} Força`,value:`${Fc.toFixed(0)}N`,icon:"💧",col:"#38bdf8"});re.push({label:`${c.n||"C"+(i+1)} Vel.`,value:`${Vel.toFixed(1)}mm/s`,icon:"⏩",col:"#4ade80"});});
  return{steps:st,results:[{label:"Pressão",value:`${Pb}bar`,icon:"💧",col:"#0ea5e9"},{label:"Pot.Hid.",value:`${Pot.toFixed(2)}kW`,icon:"⚡",col:"#22c55e"},...re],ok:true};
}

function solveLogic(comps,wires,{T,F,R,P,D}){
  const st=[],re=[];
  const inps=comps.filter(c=>c.t==="inp"),gates=comps.filter(c=>["and","or","not","nand","nor","xor","buf"].includes(c.t));
  const state={};inps.forEach(i=>{state[i.id]=parseInt(i.v||0)&1;});
  const findIns=(gx,gy)=>wires.filter(w=>Math.abs(w.x2-gx)<G*1.5&&Math.abs(w.y2-gy)<G*1.5).map(w=>{const s=comps.find(c=>Math.abs(c.x-w.x1)<G&&Math.abs(c.y-w.y1)<G);return s?(state[s.id]??0):0;});
  [...gates].sort((a,b)=>a.x-b.x).forEach(g=>{const ins=findIns(g.x,g.y),a=ins[0]??0,b=ins[1]??0;let out=0;switch(g.t){case"and":out=a&b;break;case"or":out=a|b;break;case"not":out=a?0:1;break;case"buf":out=a;break;case"nand":out=(a&b)?0:1;break;case"nor":out=(a|b)?0:1;break;case"xor":out=a^b;break;}state[g.id]=out;});
  st.push(T("🔲 LÓGICA DIGITAL"));st.push(P(`Entradas:${inps.length} | Portas:${gates.length}`));st.push(D);
  if(inps.length){st.push(T("Entradas:"));inps.forEach(i=>st.push(P(`${i.n||"IN"}=${state[i.id]} → ${state[i.id]?"HIGH":"LOW"}`)));st.push(D);}
  if(gates.length){st.push(T("Portas:"));gates.forEach(g=>{const out=state[g.id];st.push(R(`${g.n||g.t.toUpperCase()} → ${out?"1 ✅":"0 ⭕"}`));re.push({label:g.n||g.t.toUpperCase(),value:out?"1":"0",icon:"🔲",col:out?"#4ade80":"#f87171"});});}
  inps.forEach(i=>re.push({label:i.n||"IN",value:state[i.id]?"1":"0",icon:state[i.id]?"▶":"▷",col:state[i.id]?"#4ade80":"#f87171"}));
  if(!inps.length&&!gates.length)st.push(P("→ Adicione entradas e portas lógicas"));
  return{steps:st,results:re,ok:true,live:{state}};
}

function solveCmd(comps,wires,{T,F,R,P,D}){
  const st=[],re=[];
  const motors=comps.filter(c=>c.t==="mote"),disjs=comps.filter(c=>c.t==="disj"),fuses=comps.filter(c=>c.t==="fus");
  if(!motors.length&&!disjs.length){st.push(R("⚠️ Adicione Motor e/ou Disjuntor"));return{steps:st,results:re,ok:false};}
  st.push(T("🏭 COMANDOS ELÉTRICOS"));st.push(D);
  motors.forEach((m,i)=>{const kW=parseFloat(m.v||7.5),In=kW*1000/(Math.sqrt(3)*380*0.85*0.92),Ip=In*7,Iy=Ip/Math.sqrt(3),cabo=In<=10?"1.5mm²":In<=16?"2.5mm²":In<=21?"4mm²":In<=28?"6mm²":"10mm²",dI=Math.ceil(In*1.25/5)*5;st.push(T(`${m.n||"M"+(i+1)} — ${kW}kW/380V/3φ`));st.push(F("In=P/(√3·V·FP·η)"));st.push(R(`In=${In.toFixed(3)}A | Ip=${Ip.toFixed(1)}A | IY=${Iy.toFixed(1)}A`));st.push(P(`Cabo:${cabo} | Disj:${dI}A | Térm:${(In*1.15).toFixed(1)}A`));st.push(D);re.push({label:`${m.n||"M"+(i+1)} In`,value:`${In.toFixed(3)}A`,icon:"🏭",col:"#fb923c"});re.push({label:`${m.n||"M"+(i+1)} Ip`,value:`${Ip.toFixed(1)}A`,icon:"⚡",col:"#f87171"});re.push({label:`${m.n||"M"+(i+1)} Cabo`,value:cabo,icon:"🔌",col:"#22d3ee"});});
  disjs.forEach((d,i)=>re.push({label:`${d.n||"Q"+(i+1)}`,value:`${d.v}A`,icon:"⚡",col:"#e2e8f0"}));
  fuses.forEach((f,i)=>re.push({label:`${f.n||"FU"+(i+1)}`,value:`${f.v}A`,icon:"🔴",col:"#f43f5e"}));
  return{steps:st,results:re,ok:true};
}

function solveInstall(comps,wires,{T,F,R,P,D}){
  const st=[],re=[];
  const lums=comps.filter(c=>c.t==="lum"),toms=comps.filter(c=>c.t==="tom"),ars=comps.filter(c=>c.t==="ar");
  const cL=lums.reduce((s,l)=>s+parseFloat(l.v||100),0),cT=toms.length*600,cA=ars.reduce((s,a)=>s+parseFloat(a.v||3000),0),cTot=cL+cT+cA;
  if(!cTot){st.push(R("⚠️ Adicione cargas (iluminação, tomadas, AC)"));return{steps:st,results:re,ok:false};}
  const Id=cTot*0.6/220,cabo=Id<=10?"1.5mm²":Id<=15?"2.5mm²":Id<=21?"4mm²":Id<=27?"6mm²":"10mm²",dV=Math.ceil(Id*1.25/5)*5;
  const Vdrop=2*20*Id*0.0175/(Id<=15?2.5:4),Vdrop_pct=Vdrop/220*100;
  st.push(T("🏗 INSTALAÇÕES — NBR 5410"));st.push(P(`Ilum:${cL}W | Tom:${cT}W | AC:${cA}W`));st.push(D);
  st.push(T("Corrente de Projeto (FD=0.6)"));st.push(F("Id=Carga×FD/V"));st.push(R(`Id=${Id.toFixed(2)}A`));st.push(D);
  st.push(T("Dimensionamento"));st.push(P(`Cabo:${cabo} | Disj:${dV}A`));st.push(R(`Queda tensão:${Vdrop_pct.toFixed(2)}% ${Vdrop_pct>4?"⚠️ ACIMA DE 4%":"✅ OK"}`));
  return{steps:st,results:[{label:"Carga Total",value:`${cTot}W`,icon:"🏗",col:"#f43f5e"},{label:"Id",value:`${Id.toFixed(2)}A`,icon:"⚡",col:"#fb923c"},{label:"Cabo",value:cabo,icon:"🔌",col:"#22d3ee"},{label:"Disjuntor",value:`${dV}A`,icon:"⚡",col:"#4ade80"},{label:"ΔV%",value:`${Vdrop_pct.toFixed(2)}%`,icon:Vdrop_pct>4?"⚠️":"✅",col:Vdrop_pct>4?"#f87171":"#22c55e"}],ok:true};
}

function solveLadder(comps,wires,{T,F,R,P,D}){
  const st=[],re=[];
  const cnos=comps.filter(c=>c.t==="cno"),cnfs=comps.filter(c=>c.t==="cnf"),coils=comps.filter(c=>["coil","set","rst"].includes(c.t)),tons=comps.filter(c=>c.t==="ton"),tofs=comps.filter(c=>c.t==="tof");
  st.push(T("🖥 LADDER / CLP"));st.push(P(`NA:${cnos.length} | NF:${cnfs.length} | Bobinas:${coils.length} | TON:${tons.length} | TOF:${tofs.length}`));st.push(D);
  if(cnos.length||cnfs.length){st.push(T("Contatos:"));cnos.forEach(c=>st.push(P(`${c.n||"[ ]"} [NA] → ${parseInt(c.v||0)?"FECHADO ✅":"ABERTO ⭕"}`)));cnfs.forEach(c=>st.push(P(`${c.n||"[/]"} [NF] → ${parseInt(c.v||1)===0?"FECHADO ✅":"ABERTO ⭕"}`)));st.push(D);}
  tons.forEach((t,i)=>{st.push(P(`${t.n||"TON"+(i+1)}: PT=${t.v}s`));re.push({label:t.n||"TON"+(i+1),value:`${t.v}s`,icon:"⏱",col:"#22d3ee"});});
  tofs.forEach((t,i)=>{st.push(P(`${t.n||"TOF"+(i+1)}: PT=${t.v}s`));re.push({label:t.n||"TOF"+(i+1),value:`${t.v}s`,icon:"⏱",col:"#0ea5e9"});});
  coils.forEach(c=>{st.push(R(`${c.n||c.t.toUpperCase()} — verificar rung`));re.push({label:c.n||"Bobina",value:"—",icon:"⭕",col:"#c084fc"});});
  cnos.forEach(c=>re.push({label:c.n||"NA",value:parseInt(c.v||0)?"1":"0",icon:"[ ]",col:parseInt(c.v||0)?"#4ade80":"#f87171"}));
  cnfs.forEach(c=>re.push({label:c.n||"NF",value:parseInt(c.v||1)===0?"1":"0",icon:"[/]",col:parseInt(c.v||1)===0?"#4ade80":"#f87171"}));
  if(!cnos.length&&!cnfs.length&&!coils.length)st.push(P("→ Adicione contatos NA/NF e bobinas"));
  return{steps:st,results:re,ok:cnos.length>0||cnfs.length>0};
}

// ═══════════════════════════════════════════════════════════════════════════════
// CANVAS DRAW HELPERS
// ═══════════════════════════════════════════════════════════════════════════════
function drawGrid(ctx,W,H,pan,zoom){
  const s=G*zoom,ox=((pan.x%s)+s)%s,oy=((pan.y%s)+s)%s;
  ctx.strokeStyle="#0b1e2e";ctx.lineWidth=0.5;
  for(let x=ox;x<W;x+=s){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=oy;y<H;y+=s){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  const s5=s*5,ox5=((pan.x%s5)+s5)%s5,oy5=((pan.y%s5)+s5)%s5;
  ctx.strokeStyle="#142236";ctx.lineWidth=0.8;
  for(let x=ox5;x<W;x+=s5){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=oy5;y<H;y+=s5){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.fillStyle="#1d3a5a";
  for(let x=ox;x<W;x+=s)for(let y=oy;y<H;y+=s){ctx.beginPath();ctx.arc(x,y,1.2,0,Math.PI*2);ctx.fill();}
}

function drawWire(ctx,w,sel,live,modColor,tick,viewMode="2d"){
  const wCol=w.color||(live?modColor:"#2a4a6a");
  if(viewMode==="3d"){
    ctx.save();
    ctx.strokeStyle=hexToRgba(sel?"#fbbf24":wCol,0.24);
    ctx.lineWidth=sel?9:live?8:7;
    ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(w.x1+1.5,w.y1+2.5);ctx.lineTo(w.x2+1.5,w.y2+2.5);ctx.stroke();
    ctx.restore();
  }
  ctx.save();
  ctx.strokeStyle=sel?"#fbbf24":wCol;
  ctx.lineWidth=sel?3.4:live?2.8:2.2;
  ctx.lineCap="round";
  ctx.setLineDash([]);
  if(live){ctx.setLineDash([9,5]);ctx.lineDashOffset=-(tick%14);}
  ctx.beginPath();ctx.moveTo(w.x1,w.y1);ctx.lineTo(w.x2,w.y2);ctx.stroke();
  if(viewMode==="3d"){
    ctx.strokeStyle=hexToRgba("#ffffff",0.18);
    ctx.lineWidth=1;
    ctx.setLineDash([]);
    ctx.beginPath();ctx.moveTo(w.x1,w.y1-0.8);ctx.lineTo(w.x2,w.y2-0.8);ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();
  [[w.x1,w.y1],[w.x2,w.y2]].forEach(([x,y])=>{
    if(viewMode==="3d"){
      ctx.fillStyle=hexToRgba(wCol,0.22);
      ctx.beginPath();ctx.arc(x+1.5,y+2,6,0,Math.PI*2);ctx.fill();
    }
    ctx.fillStyle=sel?"#fbbf24":wCol;
    ctx.beginPath();ctx.arc(x,y,4.2,0,Math.PI*2);ctx.fill();
    if(viewMode==="3d"){
      ctx.fillStyle=hexToRgba("#ffffff",0.28);
      ctx.beginPath();ctx.arc(x-1.2,y-1.2,1.6,0,Math.PI*2);ctx.fill();
    }
  });
}

function shBox(ctx,col,sel,sym,sub=""){const c=sel?"#fbbf24":col;ctx.fillStyle="#050d18";ctx.strokeStyle=c;ctx.lineWidth=2;const w=sub?28:20;ctx.beginPath();ctx.roundRect(-w,-13,w*2,26,4);ctx.fill();ctx.stroke();ctx.fillStyle=col;ctx.font="bold 9px monospace";ctx.textAlign="center";ctx.fillText(sym,0,sub?-1:4);if(sub){ctx.font="7px monospace";ctx.fillStyle=col+"88";ctx.fillText(sub,0,10);}ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-w,0);ctx.stroke();ctx.beginPath();ctx.moveTo(w,0);ctx.lineTo(G,0);ctx.stroke();}
function shRes(ctx,col,sel){const c=sel?"#fbbf24":col;ctx.strokeStyle=c;ctx.lineWidth=2;ctx.fillStyle="#0e2233";ctx.beginPath();ctx.roundRect(-21,-10,42,20,3);ctx.fill();ctx.stroke();ctx.strokeStyle=col+"cc";ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(-16,0);for(let i=0;i<4;i++)ctx.lineTo(-10+i*8,i%2===0?-6:6);ctx.lineTo(16,0);ctx.stroke();}
function shCap(ctx,col,sel){const c=sel?"#fbbf24":col;ctx.strokeStyle=c;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-6,-15);ctx.lineTo(-6,15);ctx.stroke();ctx.beginPath();ctx.moveTo(6,-15);ctx.lineTo(6,15);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-14,-8);ctx.lineTo(-10,-8);ctx.stroke();ctx.beginPath();ctx.moveTo(-12,-10);ctx.lineTo(-12,-6);ctx.stroke();}
function shInd(ctx,col,sel){const c=sel?"#fbbf24":col;ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<4;i++)ctx.arc(-12+i*8,0,6,Math.PI,0,false);ctx.stroke();}
function shVsrc(ctx,col,sel,ac){const c=sel?"#fbbf24":col;ctx.fillStyle="#050e1a";ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,21,0,Math.PI*2);ctx.fill();ctx.stroke();if(ac){ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<=20;i++)ctx.lineTo(-10+i,4-9*Math.sin(i*Math.PI/10));ctx.stroke();}else{ctx.fillStyle=col;ctx.font="bold 13px monospace";ctx.textAlign="center";ctx.fillText("+",11,5);ctx.fillText("−",-11,5);}}
function shIsrc(ctx,col,sel){const c=sel?"#fbbf24":col;ctx.fillStyle="#1a0a2a";ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,21,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(6,0);ctx.stroke();ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(6,-6);ctx.lineTo(6,6);ctx.closePath();ctx.fill();}
function shGnd(ctx,col,sel){const c=sel?"#fbbf24":col;ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(0,0);ctx.stroke();[[0,20],[7,12],[14,6]].forEach(([o,w])=>{ctx.beginPath();ctx.moveTo(-w,o);ctx.lineTo(w,o);ctx.stroke();});}
function shDiode(ctx,col,sel,led){const c=sel?"#fbbf24":col;ctx.strokeStyle=c;ctx.lineWidth=2;ctx.fillStyle=col+"44";ctx.beginPath();ctx.moveTo(-13,0);ctx.lineTo(13,-13);ctx.lineTo(13,13);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(13,-14);ctx.lineTo(13,14);ctx.stroke();if(led){ctx.strokeStyle=col+"aa";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(16,-8);ctx.lineTo(24,-18);ctx.stroke();ctx.beginPath();ctx.moveTo(20,-4);ctx.lineTo(28,-14);ctx.stroke();}}
function shSwitch(ctx,col,sel,cl){const c=sel?"#fbbf24":col;ctx.strokeStyle=c;ctx.lineWidth=2;ctx.fillStyle=col;ctx.beginPath();ctx.arc(-12,0,4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(12,0,4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(12,cl?0:-12);ctx.stroke();}
function shMeter(ctx,col,sel,meterMode,meterVal){
  const c=sel?"#fbbf24":col;
  const modes=["V DC","mA","Ω","V AC","Hz"];
  const modeColors=["#22d3ee","#f59e0b","#4ade80","#f43f5e","#a78bfa"];
  const m=(meterMode||0)%5;
  const mCol=modeColors[m];
  const mStr=modes[m];
  const pct=Math.min(1,Math.max(0,meterVal??0.6));
  // Outer body — rounded, chunky multimeter shape
  ctx.fillStyle="#03101c";ctx.strokeStyle=c;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.roundRect(-32,-36,64,72,10);ctx.fill();ctx.stroke();
  // Top color band (mode indicator)
  ctx.fillStyle=mCol+"33";ctx.strokeStyle=mCol+"55";ctx.lineWidth=1;
  ctx.beginPath();ctx.roundRect(-30,-34,60,10,8);ctx.fill();ctx.stroke();
  ctx.fillStyle=mCol;ctx.font="bold 7px monospace";ctx.textAlign="center";ctx.fillText(mStr,0,-27);
  // Display screen (LCD look)
  ctx.fillStyle="#010c0f";ctx.strokeStyle=mCol+"66";ctx.lineWidth=1.5;
  ctx.beginPath();ctx.roundRect(-26,-22,52,26,4);ctx.fill();ctx.stroke();
  // Analog dial area (inside screen)
  const cx=0,cy=-10,r=17;
  // Dial background arc
  ctx.strokeStyle="#0e2235";ctx.lineWidth=8;
  ctx.beginPath();ctx.arc(cx,cy,r,Math.PI*0.85,Math.PI*0.15,false);ctx.stroke();
  // Color zones on dial: green 0-60%, yellow 60-85%, red 85-100%
  ctx.strokeStyle="#22c55e44";ctx.lineWidth=4;
  ctx.beginPath();ctx.arc(cx,cy,r,Math.PI*0.85,Math.PI*0.85+(Math.PI*1.3*0.6),false);ctx.stroke();
  ctx.strokeStyle="#f59e0b44";ctx.lineWidth=4;
  ctx.beginPath();ctx.arc(cx,cy,r,Math.PI*0.85+(Math.PI*1.3*0.6),Math.PI*0.85+(Math.PI*1.3*0.85),false);ctx.stroke();
  ctx.strokeStyle="#f8717144";ctx.lineWidth=4;
  ctx.beginPath();ctx.arc(cx,cy,r,Math.PI*0.85+(Math.PI*1.3*0.85),Math.PI*0.15+Math.PI*2,false);ctx.stroke();
  // Scale ticks
  for(let i=0;i<=10;i++){
    const a=Math.PI*0.85+(i/10)*Math.PI*1.3;
    const big=i%2===0,r1=r,r2=big?r-5:r-3;
    ctx.strokeStyle=big?mCol:mCol+"66";ctx.lineWidth=big?1.5:0.8;
    ctx.beginPath();ctx.moveTo(cx+r1*Math.cos(a),cy+r1*Math.sin(a));ctx.lineTo(cx+r2*Math.cos(a),cy+r2*Math.sin(a));ctx.stroke();
  }
  // Pointer shadow
  const pa=Math.PI*0.85+pct*Math.PI*1.3;
  ctx.strokeStyle="#00000088";ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(cx+1,cy+1);ctx.lineTo(cx+1+(r-2)*Math.cos(pa),(cy+1)+(r-2)*Math.sin(pa));ctx.stroke();
  // Pointer
  const needleCol=pct>0.85?"#f87171":pct>0.6?"#f59e0b":"#e2e8f0";
  ctx.strokeStyle=needleCol;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+(r-2)*Math.cos(pa),cy+(r-2)*Math.sin(pa));ctx.stroke();
  // Pivot dot
  ctx.fillStyle=mCol;ctx.strokeStyle="#03101c";ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(cx,cy,3.5,0,Math.PI*2);ctx.fill();ctx.stroke();
  // Digital display value
  const displayVal=(pct*100).toFixed(1);
  ctx.fillStyle=mCol;ctx.font="bold 8px monospace";ctx.textAlign="center";
  ctx.fillText(displayVal,cx,cy+r+2);
  // Bottom panel: selector knob dot + probe holes
  ctx.fillStyle="#051520";ctx.strokeStyle=c+"44";ctx.lineWidth=1;
  ctx.beginPath();ctx.roundRect(-26,8,52,20,3);ctx.fill();ctx.stroke();
  // Mode knob ring
  ctx.strokeStyle=mCol;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(0,18,6,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle=mCol+"44";ctx.beginPath();ctx.arc(0,18,5,0,Math.PI*2);ctx.fill();
  const ka=m/5*Math.PI*2-Math.PI/2;
  ctx.fillStyle=mCol;ctx.beginPath();ctx.arc(Math.cos(ka)*4,18+Math.sin(ka)*4,2,0,Math.PI*2);ctx.fill();
  // Probe sockets
  ctx.fillStyle="#08202e";ctx.strokeStyle="#f87171";ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(-16,18,3,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.strokeStyle="#000";
  ctx.beginPath();ctx.arc(16,18,3,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.strokeStyle=c;ctx.lineWidth=1;ctx.beginPath();ctx.arc(16,18,3,0,Math.PI*2);ctx.stroke();
  // Leads (test probes)
  ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-32,0);ctx.stroke();
  ctx.beginPath();ctx.moveTo(32,0);ctx.lineTo(G,0);ctx.stroke();
}
function shCircleDev(ctx,col,sel,sym){const c=sel?"#fbbf24":col;ctx.fillStyle="#060f1a";ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=col;ctx.font="bold 10px monospace";ctx.textAlign="center";ctx.fillText(sym,0,4);}
function shCylinder(ctx,col,sel,pistonPct,isDE){
  const c=sel?"#fbbf24":col;
  const pct=Math.min(1,Math.max(0,pistonPct??0.5));
  const bW=60,bH=28,rx=-bW/2,ry=-bH/2;
  // Drop shadow
  ctx.fillStyle="#010508";ctx.beginPath();ctx.roundRect(rx+3,ry+4,bW,bH,6);ctx.fill();
  // Body gradient (metallic look)
  const bg=ctx.createLinearGradient(rx,ry,rx,ry+bH);
  bg.addColorStop(0,"#1a3550");bg.addColorStop(0.35,"#0e2035");bg.addColorStop(0.65,"#071525");bg.addColorStop(1,"#040d1a");
  ctx.fillStyle=bg;ctx.strokeStyle=c;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.roundRect(rx,ry,bW,bH,6);ctx.fill();ctx.stroke();
  // Highlight band top
  ctx.fillStyle="rgba(255,255,255,0.04)";ctx.beginPath();ctx.roundRect(rx+3,ry+2,bW-6,5,3);ctx.fill();
  // Interior bore
  const boreH=bH-10,boreX=rx+5,boreY=ry+5,boreW=bW-10;
  ctx.fillStyle="#020a12";ctx.strokeStyle=col+"22";ctx.lineWidth=1;
  ctx.beginPath();ctx.roundRect(boreX,boreY,boreW,boreH,3);ctx.fill();ctx.stroke();
  // Compressed air (rear) — glowing
  if(pct>0){
    const airG=ctx.createLinearGradient(boreX,boreY,boreX,boreY+boreH);
    airG.addColorStop(0,col+"55");airG.addColorStop(1,col+"22");
    ctx.fillStyle=airG;
    ctx.beginPath();ctx.roundRect(boreX,boreY,boreW*pct,boreH,3);ctx.fill();
    // Air glow effect
    ctx.strokeStyle=col+"44";ctx.lineWidth=1;
    ctx.beginPath();ctx.roundRect(boreX,boreY,boreW*pct,boreH,3);ctx.stroke();
  }
  // Front air (exhaust — dim)
  if(pct<1&&isDE){
    ctx.fillStyle=col+"0f";
    ctx.beginPath();ctx.roundRect(boreX+boreW*pct,boreY,boreW*(1-pct),boreH,3);ctx.fill();
  }
  // Piston
  const pisX=boreX+boreW*pct-5;
  const pisG=ctx.createLinearGradient(pisX,boreY,pisX+10,boreY+boreH);
  pisG.addColorStop(0,"#2a5070");pisG.addColorStop(0.5,"#3a6a90");pisG.addColorStop(1,"#1a3858");
  ctx.fillStyle=pisG;ctx.strokeStyle=col+"88";ctx.lineWidth=1.5;
  ctx.beginPath();ctx.roundRect(pisX,boreY-1,10,boreH+2,2);ctx.fill();ctx.stroke();
  // Piston rings (seal look)
  ctx.strokeStyle=col+"aa";ctx.lineWidth=1;
  [boreY+2,boreY+boreH-3].forEach(ry2=>{ctx.beginPath();ctx.moveTo(pisX+1,ry2);ctx.lineTo(pisX+9,ry2);ctx.stroke();});
  // Piston rod
  const rodStart=pisX+10,rodEnd=rx+bW+22;
  const rodG=ctx.createLinearGradient(0,ry-1,0,ry+4);
  rodG.addColorStop(0,col);rodG.addColorStop(1,col+"88");
  ctx.strokeStyle=col;ctx.lineWidth=4;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(rodStart,0);ctx.lineTo(rodEnd,0);ctx.stroke();
  ctx.lineCap="butt";
  // Shiny rod top line
  ctx.strokeStyle="rgba(255,255,255,0.2)";ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(rodStart,-1);ctx.lineTo(rodEnd,-1);ctx.stroke();
  // Rod clevis/connector
  ctx.fillStyle=col;ctx.strokeStyle=c;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(rodEnd,0,5,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillStyle="#020a12";ctx.beginPath();ctx.arc(rodEnd,0,2,0,Math.PI*2);ctx.fill();
  // End cap left
  ctx.fillStyle="#0e2030";ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(rx-4,ry-2,8,bH+4,4);ctx.fill();ctx.stroke();
  // End cap right (with rod seal)
  ctx.fillStyle="#0e2030";
  ctx.beginPath();ctx.roundRect(rx+bW-4,ry-2,8,bH+4,4);ctx.fill();ctx.stroke();
  // Rod seal ring on right cap
  ctx.strokeStyle=col+"88";ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(rx+bW,0,3,0,Math.PI*2);ctx.stroke();
  // Air ports (top)
  const portH=8;
  // Port A (rear, rear-pressurize = advance)
  ctx.fillStyle=pct>0.1?col+"66":"#040d1a";
  ctx.strokeStyle=c;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.roundRect(rx+8,ry-portH,9,portH,2);ctx.fill();ctx.stroke();
  ctx.fillStyle=col;ctx.font="bold 5.5px monospace";ctx.textAlign="center";ctx.fillText("A",rx+12.5,ry-2);
  // Port B (front, DE only)
  if(isDE!==false){
    ctx.fillStyle=pct<0.9?col+"44":"#040d1a";
    ctx.strokeStyle=c;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.roundRect(rx+bW-17,ry-portH,9,portH,2);ctx.fill();ctx.stroke();
    ctx.fillStyle=col+"aa";ctx.font="bold 5.5px monospace";ctx.fillText("B",rx+bW-12.5,ry-2);
  }
  // Spring (SE only)
  if(isDE===false){
    ctx.strokeStyle=col+"55";ctx.lineWidth=1;
    for(let si=0;si<5;si++){const sx=boreX+boreW*pct+(si/5)*boreW*(1-pct);ctx.beginPath();ctx.moveTo(sx,boreY);ctx.lineTo(sx+boreW*(1-pct)/10,boreY+boreH/2);ctx.lineTo(sx,boreY+boreH);ctx.stroke();}
  }
  // Stroke % indicator
  ctx.fillStyle=col+"88";ctx.font="bold 6px monospace";ctx.textAlign="center";
  ctx.fillText(`${Math.round(pct*100)}%`,0,ry+bH+11);
  // Connection lead left
  ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(rx-4,0);ctx.stroke();
}
function shTank(ctx,col,sel){const c=sel?"#fbbf24":col;ctx.fillStyle="#060f1a";ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-22,-20,44,38,5);ctx.fill();ctx.stroke();ctx.fillStyle=col+"22";ctx.beginPath();ctx.roundRect(-20,-4,40,16,2);ctx.fill();ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,18);ctx.lineTo(0,G);ctx.stroke();}
function shValve(ctx,col,sel,sym){const c=sel?"#fbbf24":col;const bxs=sym.includes("5/3")?3:sym.includes("5/2")?2:1,bw=24,tot=bxs*(bw+2)-2;ctx.fillStyle="#08192a";ctx.strokeStyle=c;ctx.lineWidth=2;for(let b=0;b<bxs;b++){const bx=-tot/2+b*(bw+2);ctx.beginPath();ctx.rect(bx,-13,bw,26);ctx.fill();ctx.stroke();if(b===0){ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(bx+4,-7);ctx.lineTo(bx+20,-7);ctx.stroke();ctx.beginPath();ctx.moveTo(bx+16,-11);ctx.lineTo(bx+20,-7);ctx.lineTo(bx+16,-3);ctx.stroke();ctx.beginPath();ctx.moveTo(bx+20,7);ctx.lineTo(bx+4,7);ctx.stroke();ctx.beginPath();ctx.moveTo(bx+8,3);ctx.lineTo(bx+4,7);ctx.lineTo(bx+8,11);ctx.stroke();}}ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-tot/2,0);ctx.lineTo(-G,0);ctx.stroke();ctx.beginPath();ctx.moveTo(tot/2,0);ctx.lineTo(G,0);ctx.stroke();}
function shFilter(ctx,col,sel){const c=sel?"#fbbf24":col;ctx.fillStyle="#060f1a";ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,18,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=1.5;for(let y=-8;y<=8;y+=4){ctx.beginPath();ctx.moveTo(-14,y);ctx.lineTo(14,y);ctx.stroke();}ctx.beginPath();ctx.moveTo(0,18);ctx.lineTo(0,26);ctx.stroke();ctx.beginPath();ctx.moveTo(-4,26);ctx.lineTo(4,26);ctx.stroke();}
function shTransformer(ctx,col,sel){const c=sel?"#fbbf24":col;ctx.strokeStyle=c;ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(-16+i*8,-4,6,Math.PI,0,false);ctx.stroke();}ctx.fillStyle=col+"33";ctx.beginPath();ctx.rect(-2,-18,4,30);ctx.fill();ctx.stroke();for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(16-i*8,-4,6,Math.PI,0,true);ctx.stroke();}}
function shGate(ctx,col,sel,sym){const c=sel?"#fbbf24":col;ctx.strokeStyle=c;ctx.lineWidth=2;ctx.fillStyle="#060f1a";ctx.beginPath();ctx.moveTo(-20,-18);ctx.lineTo(5,-18);ctx.quadraticCurveTo(24,0,5,18);ctx.lineTo(-20,18);ctx.closePath();ctx.fill();ctx.stroke();if(["¬&","¬1"].includes(sym)){ctx.beginPath();ctx.arc(27,0,4,0,Math.PI*2);ctx.stroke();}if(sym==="⊕"){ctx.beginPath();ctx.moveTo(-24,-18);ctx.quadraticCurveTo(-12,0,-24,18);ctx.stroke();}ctx.fillStyle=col;ctx.font="bold 10px monospace";ctx.textAlign="center";ctx.fillText(sym,0,4);ctx.strokeStyle=c;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-G,-10);ctx.lineTo(-20,-10);ctx.stroke();ctx.beginPath();ctx.moveTo(-G,10);ctx.lineTo(-20,10);ctx.stroke();const ox=["¬&","¬1"].includes(sym)?31:24;ctx.beginPath();ctx.moveTo(ox,0);ctx.lineTo(G,0);ctx.stroke();}
function shBuf(ctx,col,sel){const c=sel?"#fbbf24":col;ctx.strokeStyle=c;ctx.lineWidth=2;ctx.fillStyle="#060f1a";ctx.beginPath();ctx.moveTo(-18,-16);ctx.lineTo(18,0);ctx.lineTo(-18,16);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-18,0);ctx.stroke();ctx.beginPath();ctx.moveTo(18,0);ctx.lineTo(G,0);ctx.stroke();}
function shFFSR(ctx,col,sel){const c=sel?"#fbbf24":col;ctx.fillStyle="#060f1a";ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-22,-22,44,44,4);ctx.fill();ctx.stroke();ctx.fillStyle=col;ctx.font="bold 9px monospace";ctx.textAlign="center";ctx.fillText("FF",0,-5);ctx.fillText("SR",0,7);ctx.strokeStyle=c;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-G,-10);ctx.lineTo(-22,-10);ctx.stroke();ctx.beginPath();ctx.moveTo(-G,10);ctx.lineTo(-22,10);ctx.stroke();ctx.beginPath();ctx.moveTo(22,-10);ctx.lineTo(G,-10);ctx.stroke();ctx.beginPath();ctx.moveTo(22,10);ctx.lineTo(G,10);ctx.stroke();}
function shIO(ctx,col,sel,isOut){const c=sel?"#fbbf24":col;ctx.strokeStyle=c;ctx.lineWidth=2;ctx.fillStyle=isOut?col+"22":"#060f1a";if(isOut){ctx.beginPath();ctx.arc(0,0,16,0,Math.PI*2);ctx.fill();ctx.stroke();}else{ctx.beginPath();ctx.moveTo(-18,-14);ctx.lineTo(18,-14);ctx.lineTo(24,0);ctx.lineTo(18,14);ctx.lineTo(-18,14);ctx.closePath();ctx.fill();ctx.stroke();}ctx.fillStyle=col;ctx.font="bold 8px monospace";ctx.textAlign="center";ctx.fillText(isOut?"OUT":"IN",0,4);ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(isOut?-16:-18,0);ctx.stroke();ctx.beginPath();ctx.moveTo(isOut?16:24,0);ctx.lineTo(G,0);ctx.stroke();}
function shContactor(ctx,col,sel,sym){const c=sel?"#fbbf24":col;ctx.fillStyle="#060f1a";ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-22,-18,44,36,5);ctx.fill();ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(-6,-2,6,Math.PI,0,false);ctx.stroke();ctx.beginPath();ctx.arc(6,-2,6,Math.PI,0,false);ctx.stroke();ctx.beginPath();ctx.moveTo(-12,-2);ctx.lineTo(-12,8);ctx.stroke();ctx.beginPath();ctx.moveTo(12,-2);ctx.lineTo(12,8);ctx.stroke();ctx.fillStyle=col;ctx.font="bold 8px monospace";ctx.textAlign="center";ctx.fillText(sym,0,14);ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-22,0);ctx.stroke();ctx.beginPath();ctx.moveTo(22,0);ctx.lineTo(G,0);ctx.stroke();}
function shContact(ctx,col,sel,nf){const c=sel?"#fbbf24":col;ctx.strokeStyle=c;ctx.lineWidth=2;ctx.fillStyle=col;ctx.beginPath();ctx.arc(-14,0,4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(14,0,4,0,Math.PI*2);ctx.fill();if(nf){ctx.beginPath();ctx.moveTo(-14,-16);ctx.lineTo(14,-16);ctx.stroke();}ctx.beginPath();ctx.moveTo(-14,0);ctx.lineTo(14,nf?-14:0);ctx.stroke();ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-14,0);ctx.stroke();ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(G,0);ctx.stroke();}
function shCoil(ctx,col,sel,sym){const c=sel?"#fbbf24":col;ctx.strokeStyle=c;ctx.lineWidth=2;ctx.fillStyle="#060f1a";ctx.beginPath();ctx.arc(0,0,16,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=col;ctx.font="bold 9px monospace";ctx.textAlign="center";ctx.fillText(sym,0,4);ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-16,0);ctx.stroke();ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(G,0);ctx.stroke();}
function shMotor(ctx,col,sel){const c=sel?"#fbbf24":col;ctx.fillStyle="#060f1a";ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=2;for(let i=0;i<3;i++){const a=i*Math.PI*2/3-Math.PI/2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*14,Math.sin(a)*14);ctx.stroke();}ctx.fillStyle=col;ctx.font="bold 12px monospace";ctx.textAlign="center";ctx.fillText("M",0,5);ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-22,0);ctx.stroke();ctx.beginPath();ctx.moveTo(22,0);ctx.lineTo(G,0);ctx.stroke();}
function shFuse(ctx,col,sel){const c=sel?"#fbbf24":col;ctx.fillStyle="#060f1a";ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-18,-8,36,16,3);ctx.fill();ctx.stroke();ctx.setLineDash([3,2]);ctx.strokeStyle=col;ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(12,0);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle=col+"88";ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,-2,8,Math.PI*1.1,Math.PI*1.9,false);ctx.stroke();}
function shBreaker(ctx,col,sel){const c=sel?"#fbbf24":col;ctx.fillStyle="#060f1a";ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-12,-22,24,44,4);ctx.fill();ctx.stroke();ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(-5,-18,10,8,2);ctx.fill();ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-12,0);ctx.stroke();ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(G,0);ctx.stroke();}
function shThermal(ctx,col,sel){const c=sel?"#fbbf24":col;ctx.fillStyle="#060f1a";ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-20,-12,40,24,4);ctx.fill();ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=1.8;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-12+i*12,-8);ctx.quadraticCurveTo(-8+i*12,0,-12+i*12,8);ctx.stroke();}}
function shDR(ctx,col,sel){const c=sel?"#fbbf24":col;ctx.fillStyle="#060f1a";ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-18,-22,36,44,4);ctx.fill();ctx.stroke();ctx.fillStyle=col;ctx.font="bold 8px monospace";ctx.textAlign="center";ctx.fillText("DR",0,-4);ctx.fillText("30mA",0,8);ctx.strokeStyle=c;ctx.lineWidth=2;[[-8],[8]].forEach(([y])=>{ctx.beginPath();ctx.moveTo(-G,y);ctx.lineTo(-18,y);ctx.stroke();ctx.beginPath();ctx.moveTo(18,y);ctx.lineTo(G,y);ctx.stroke();});}
function shLamp(ctx,col,sel,sig){const c=sel?"#fbbf24":col;ctx.fillStyle=sig?col+"11":"#060f1a";ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,16,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-10,-10);ctx.lineTo(10,10);ctx.stroke();ctx.beginPath();ctx.moveTo(10,-10);ctx.lineTo(-10,10);ctx.stroke();ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-16,0);ctx.stroke();ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(G,0);ctx.stroke();}
function shBusbar(ctx,col,sel){const c=sel?"#fbbf24":col;ctx.strokeStyle=c;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-G*2,0);ctx.lineTo(G*2,0);ctx.stroke();ctx.lineWidth=2;for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(i*16,0);ctx.lineTo(i*16,18);ctx.stroke();}}
function shSensor(ctx,col,sel){const c=sel?"#fbbf24":col;ctx.fillStyle="#060f1a";ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-16,-14,32,28,3);ctx.fill();ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.stroke();ctx.fillStyle=col;ctx.beginPath();ctx.arc(0,0,3,0,Math.PI*2);ctx.fill();ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-16,0);ctx.stroke();ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(G,0);ctx.stroke();}
function shTimer(ctx,col,sel,sym){const c=sel?"#fbbf24":col;ctx.fillStyle="#060f1a";ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(-24,-22,48,44,4);ctx.fill();ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,-6,8,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(5,-2);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(0,-12);ctx.stroke();ctx.fillStyle=col;ctx.font="bold 8px monospace";ctx.textAlign="center";ctx.fillText(sym,0,14);ctx.strokeStyle=c;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-G,-10);ctx.lineTo(-24,-10);ctx.stroke();ctx.beginPath();ctx.moveTo(-G,10);ctx.lineTo(-24,10);ctx.stroke();ctx.beginPath();ctx.moveTo(24,-10);ctx.lineTo(G,-10);ctx.stroke();ctx.beginPath();ctx.moveTo(24,10);ctx.lineTo(G,10);ctx.stroke();}

// ═══════════════════════════════════════════════════════════════════════════════
// NEW COMPONENT SHAPES
// ═══════════════════════════════════════════════════════════════════════════════

// Oscilloscope
function shOscilloscope(ctx,col,sel,tick){
  const c=sel?"#fbbf24":col;
  ctx.fillStyle="#040e1a";ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(-28,-24,56,48,6);ctx.fill();ctx.stroke();
  // Screen
  ctx.fillStyle="#000e1c";ctx.strokeStyle=col+"44";ctx.lineWidth=1;
  ctx.beginPath();ctx.roundRect(-23,-20,40,28,3);ctx.fill();ctx.stroke();
  // Scope grid
  ctx.strokeStyle=col+"22";ctx.lineWidth=0.5;
  for(let x=-15;x<=17;x+=8){ctx.beginPath();ctx.moveTo(-23+x+8,-20);ctx.lineTo(-23+x+8,8);ctx.stroke();}
  for(let y=-12;y<=8;y+=7){ctx.beginPath();ctx.moveTo(-23,-20+y+7);ctx.lineTo(17,-20+y+7);ctx.stroke();}
  // Animated waveform
  const toff=tick||0;
  ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.beginPath();
  for(let px=0;px<=40;px++){
    const wx=px/40*2*Math.PI*2.5+toff*0.3;
    const wy=Math.sin(wx)*8+Math.sin(wx*2.1)*3;
    if(px===0)ctx.moveTo(-23+px,-6+wy);else ctx.lineTo(-23+px,-6+wy);
  }
  ctx.stroke();
  // Channel 2 (secondary)
  ctx.strokeStyle="#f59e0b88";ctx.lineWidth=1;ctx.beginPath();
  for(let px=0;px<=40;px++){
    const wx=px/40*2*Math.PI*1.8+toff*0.2+1;
    const wy=Math.cos(wx)*5;
    if(px===0)ctx.moveTo(-23+px,-6+wy);else ctx.lineTo(-23+px,-6+wy);
  }
  ctx.stroke();
  // Controls dots (right side)
  [[-12],[0],[12]].forEach(([y])=>{ctx.fillStyle=col+"66";ctx.beginPath();ctx.arc(21,y,3,0,Math.PI*2);ctx.fill();});
  // Leads
  ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-28,0);ctx.stroke();
  ctx.beginPath();ctx.moveTo(28,0);ctx.lineTo(G,0);ctx.stroke();
}

// Potentiometer
function shPotentiometer(ctx,col,sel,pct){
  const c=sel?"#fbbf24":col;
  const angle=Math.PI*0.8;
  const wiper=(pct??0.5)*2*angle-angle;
  // Body resistor
  ctx.fillStyle="#0e2233";ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(-21,-10,42,20,3);ctx.fill();ctx.stroke();
  ctx.strokeStyle=col+"cc";ctx.lineWidth=1.8;ctx.beginPath();
  ctx.moveTo(-16,0);for(let i=0;i<4;i++)ctx.lineTo(-10+i*8,i%2===0?-6:6);ctx.lineTo(16,0);ctx.stroke();
  // Wiper arrow
  ctx.strokeStyle="#fbbf24";ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(0,-10);ctx.stroke();
  ctx.fillStyle="#fbbf24";ctx.beginPath();ctx.moveTo(-4,-10);ctx.lineTo(4,-10);ctx.lineTo(0,-6);ctx.closePath();ctx.fill();
  // Leads
  ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-21,0);ctx.stroke();
  ctx.beginPath();ctx.moveTo(21,0);ctx.lineTo(G,0);ctx.stroke();
  // Wiper lead up
  ctx.beginPath();ctx.moveTo(0,-G);ctx.lineTo(0,-22);ctx.stroke();
}

// Pressure switch / pressostato
function shPressureSwitch(ctx,col,sel,active){
  const c=sel?"#fbbf24":col;
  const activeCol=active?"#f87171":col;
  // Gauge circle
  ctx.fillStyle="#040e1a";ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(-8,0,16,0,Math.PI*2);ctx.fill();ctx.stroke();
  // Gauge needle
  const na=Math.PI*0.8*(active?0.85:0.3);
  ctx.strokeStyle=active?"#f87171":col;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(-8+Math.cos(Math.PI+na)*11,Math.sin(Math.PI+na)*11);ctx.stroke();
  ctx.fillStyle=col;ctx.beginPath();ctx.arc(-8,0,2.5,0,Math.PI*2);ctx.fill();
  // Scale arcs
  ctx.strokeStyle=col+"44";ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(-8,0,13,Math.PI*0.8,Math.PI*2.2,false);ctx.stroke();
  ctx.strokeStyle="#f87171";ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(-8,0,13,Math.PI*1.7,Math.PI*2.2,false);ctx.stroke();
  // Switch block
  ctx.fillStyle="#071020";ctx.strokeStyle=activeCol;ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(8,-10,16,20,3);ctx.fill();ctx.stroke();
  if(active){ctx.fillStyle="#f87171";ctx.beginPath();ctx.roundRect(10,-8,12,8,2);ctx.fill();}
  // Leads
  ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-24,0);ctx.stroke();
  ctx.beginPath();ctx.moveTo(24,0);ctx.lineTo(G,0);ctx.stroke();
}

// Pressure gauge (manometer)
function shManometer(ctx,col,sel,val){
  const c=sel?"#fbbf24":col;
  const pct=Math.min(1,Math.max(0,(val??0.5)));
  // Body
  ctx.fillStyle="#040e1a";ctx.strokeStyle=c;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.arc(0,0,24,0,Math.PI*2);ctx.fill();ctx.stroke();
  // Gauge face
  ctx.fillStyle="#06111e";ctx.strokeStyle=col+"33";ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(0,0,20,0,Math.PI*2);ctx.fill();ctx.stroke();
  // Scale ticks (semicircle bottom-left to bottom-right)
  const startA=Math.PI*0.75, endA=Math.PI*2.25;
  for(let i=0;i<=10;i++){
    const a=startA+(i/10)*(endA-startA);
    const big=i%2===0;
    const r1=20,r2=big?14:16;
    const danger=i>=8;
    ctx.strokeStyle=danger?"#f87171":col+(big?"":"66");ctx.lineWidth=big?2:1;
    ctx.beginPath();ctx.moveTo(Math.cos(a)*r1,Math.sin(a)*r1);ctx.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);ctx.stroke();
  }
  // Red zone arc
  ctx.strokeStyle="#f8717166";ctx.lineWidth=4;
  ctx.beginPath();ctx.arc(0,0,17,startA+(0.8)*(endA-startA),endA,false);ctx.stroke();
  // Needle
  const needleA=startA+pct*(endA-startA);
  ctx.strokeStyle="#f87171";ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(needleA)*16,Math.sin(needleA)*16);ctx.stroke();
  // Pivot
  ctx.fillStyle=col;ctx.strokeStyle=c;ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(0,0,3.5,0,Math.PI*2);ctx.fill();ctx.stroke();
  // Value text
  ctx.fillStyle=col;ctx.font="bold 6px monospace";ctx.textAlign="center";
  ctx.fillText(`${(pct*10).toFixed(1)}`,0,10);
  // Connecting pipe bottom
  ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(0,24);ctx.lineTo(0,G);ctx.stroke();
}

// Thermocouple
function shThermocouple(ctx,col,sel,temp){
  const c=sel?"#fbbf24":col;
  const hot=temp>50;
  const hcol=hot?"#f87171":col;
  // Body box
  ctx.fillStyle="#040e1a";ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(-22,-16,44,32,5);ctx.fill();ctx.stroke();
  // TC symbol (two dissimilar metals junction)
  ctx.strokeStyle=col;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-18,0);ctx.lineTo(-4,0);ctx.stroke();
  ctx.strokeStyle="#f59e0b";ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-4,0);ctx.lineTo(18,0);ctx.stroke();
  // Junction point
  ctx.fillStyle=hcol;ctx.beginPath();ctx.arc(-4,0,4,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=c;ctx.lineWidth=1;ctx.stroke();
  // Type label
  ctx.fillStyle=col;ctx.font="bold 7px monospace";ctx.textAlign="center";ctx.fillText("J/K",10,-7);
  // Temp display
  ctx.fillStyle=hcol;ctx.font="bold 7px monospace";ctx.fillText(`${Math.round(temp??25)}°`,10,9);
  // Leads
  ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-22,0);ctx.stroke();
  ctx.beginPath();ctx.moveTo(22,0);ctx.lineTo(G,0);ctx.stroke();
}

// Encoder
function shEncoder(ctx,col,sel,tick){
  const c=sel?"#fbbf24":col;
  const angle=(tick||0)*0.15;
  // Body
  ctx.fillStyle="#040e1a";ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();ctx.stroke();
  // Shaft disc with sectors
  for(let i=0;i<8;i++){
    const a1=angle+i*Math.PI/4;
    const a2=a1+Math.PI/4-0.1;
    ctx.fillStyle=i%2===0?col+"44":"#080f1a";
    ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,18,a1,a2);ctx.closePath();ctx.fill();
  }
  // Outer ring
  ctx.strokeStyle=col+"88";ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(0,0,18,0,Math.PI*2);ctx.stroke();
  // Center shaft
  ctx.fillStyle="#1a3040";ctx.strokeStyle=c;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.strokeStyle=col;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(0,-22);ctx.stroke();
  // Output leads
  ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-G,-8);ctx.lineTo(-22,-8);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-G,8);ctx.lineTo(-22,8);ctx.stroke();
  ctx.beginPath();ctx.moveTo(22,0);ctx.lineTo(G,0);ctx.stroke();
}

// VFD - Inverter
function shVFD(ctx,col,sel,freq){
  const c=sel?"#fbbf24":col;
  // Body
  ctx.fillStyle="#040e1a";ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(-28,-24,56,48,6);ctx.fill();ctx.stroke();
  // Display panel
  ctx.fillStyle="#001a08";ctx.strokeStyle="#22c55e44";ctx.lineWidth=1;
  ctx.beginPath();ctx.roundRect(-22,-18,30,18,3);ctx.fill();ctx.stroke();
  // Freq display
  const fv=(freq??50).toFixed(1);
  ctx.fillStyle="#22c55e";ctx.font="bold 9px monospace";ctx.textAlign="center";ctx.fillText(`${fv}Hz`,-7,-7);
  ctx.fillStyle="#22c55e66";ctx.font="6px monospace";ctx.fillText("VFD",-7,-16);
  // Output wave symbol
  ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.beginPath();
  let first=true;
  for(let i=0;i<=20;i++){const wx=i/20*Math.PI*4;const wy=Math.sin(wx)*5;if(first){ctx.moveTo(10+i,-5+wy);first=false;}else{ctx.lineTo(10+i,-5+wy);}}
  ctx.stroke();
  // Heat fins
  ctx.strokeStyle=col+"44";ctx.lineWidth=1;
  [18,20,22,24,26].forEach(x=>{ctx.beginPath();ctx.moveTo(x,-20);ctx.lineTo(x,20);ctx.stroke();});
  // Leads (3-phase in, 3-phase out)
  ctx.strokeStyle=c;ctx.lineWidth=2;
  [[-8],[0],[8]].forEach(([y])=>{
    ctx.beginPath();ctx.moveTo(-G,y);ctx.lineTo(-28,y);ctx.stroke();
    ctx.beginPath();ctx.moveTo(28,y);ctx.lineTo(G,y);ctx.stroke();
  });
}

// 7-segment Display
function shSeg7(ctx,col,sel,digit){
  const c=sel?"#fbbf24":col;
  const dv=Math.min(9,Math.max(0,Math.round(digit??8)));
  // Segs: a(top) b(tr) c(br) d(bot) e(bl) f(tl) g(mid)
  const segs={0:[1,1,1,1,1,1,0],1:[0,1,1,0,0,0,0],2:[1,1,0,1,1,0,1],3:[1,1,1,1,0,0,1],
              4:[0,1,1,0,0,1,1],5:[1,0,1,1,0,1,1],6:[1,0,1,1,1,1,1],7:[1,1,1,0,0,0,0],
              8:[1,1,1,1,1,1,1],9:[1,1,1,1,0,1,1]};
  const s=segs[dv]||segs[8];
  // Body
  ctx.fillStyle="#01080e";ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(-24,-24,48,48,5);ctx.fill();ctx.stroke();
  // Draw segments (scaled to fit)
  const sw=12,sh=3,gap=1;
  const segColor=(on)=>on?col:col+"18";
  const drawH=(x,y,on)=>{ctx.fillStyle=segColor(on);ctx.beginPath();ctx.moveTo(x-sw/2+gap,y);ctx.lineTo(x-sw/2+sh+gap,y-sh);ctx.lineTo(x+sw/2-sh-gap,y-sh);ctx.lineTo(x+sw/2-gap,y);ctx.lineTo(x+sw/2-sh-gap,y+sh);ctx.lineTo(x-sw/2+sh+gap,y+sh);ctx.closePath();ctx.fill();};
  const drawV=(x,y,top,on)=>{ctx.fillStyle=segColor(on);ctx.beginPath();const y1=top?y:y+gap,y2=top?y+sw/2-gap:y+sw/2;ctx.moveTo(x,y1+gap);ctx.lineTo(x+sh,y1+sh+gap);ctx.lineTo(x+sh,y2-sh-gap);ctx.lineTo(x,y2-gap);ctx.lineTo(x-sh,y2-sh-gap);ctx.lineTo(x-sh,y1+sh+gap);ctx.closePath();ctx.fill();};
  drawH(0,-16,s[0]);   // a top
  drawV(10,-15,true,s[1]);  // b top-right
  drawV(10,1,false,s[2]);   // c bot-right
  drawH(0,2,s[6]);     // g mid  
  drawH(0,18,s[3]);    // d bot
  drawV(-10,1,false,s[4]);  // e bot-left
  drawV(-10,-15,true,s[5]); // f top-left
  // Decimal point
  ctx.fillStyle=col+"44";ctx.beginPath();ctx.arc(17,18,2,0,Math.PI*2);ctx.fill();
  // Leads
  ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-24,0);ctx.stroke();
  ctx.beginPath();ctx.moveTo(24,0);ctx.lineTo(G,0);ctx.stroke();
}

// PLC Block
function shPLC(ctx,col,sel){
  const c=sel?"#fbbf24":col;
  // Main body
  ctx.fillStyle="#030b14";ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(-32,-28,64,56,5);ctx.fill();ctx.stroke();
  // CPU label area
  ctx.fillStyle=col+"11";ctx.strokeStyle=col+"33";ctx.lineWidth=1;
  ctx.beginPath();ctx.roundRect(-28,-24,28,20,3);ctx.fill();ctx.stroke();
  ctx.fillStyle=col;ctx.font="bold 8px monospace";ctx.textAlign="center";ctx.fillText("CPU",-14,-11);
  ctx.fillStyle=col+"66";ctx.font="6px monospace";ctx.fillText("PLC",-14,-3);
  // Status LEDs
  [["RUN","#22c55e",-2],["ERR","#f87171",6],["IO","#fbbf24",14]].forEach(([lbl,c2,y])=>{
    ctx.fillStyle=c2+"99";ctx.beginPath();ctx.arc(14,y,3.5,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=c2+"44";ctx.lineWidth=1;ctx.stroke();
  });
  // I/O ports area
  ctx.fillStyle="#040d1a";ctx.strokeStyle=col+"44";ctx.lineWidth=1;
  ctx.beginPath();ctx.roundRect(-28,0,62,20,3);ctx.fill();ctx.stroke();
  ctx.fillStyle=col+"66";ctx.font="5px monospace";ctx.textAlign="left";ctx.fillText("I0.0 I0.1 I0.2",-26,10);
  ctx.fillText("Q0.0 Q0.1     ",-26,18);
  // Multi-leads
  ctx.strokeStyle=c;ctx.lineWidth=2;
  [[-16],[-8],[0],[8],[16]].forEach(([y])=>{
    ctx.beginPath();ctx.moveTo(-G,y);ctx.lineTo(-32,y);ctx.stroke();
    ctx.beginPath();ctx.moveTo(32,y);ctx.lineTo(G,y);ctx.stroke();
  });
}

// Wattmeter
function shWattmeter(ctx,col,sel,watts){
  const c=sel?"#fbbf24":col;
  const pct=Math.min(1,Math.max(0,(watts??0.6)));
  ctx.fillStyle="#040e1a";ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(-24,-22,48,44,6);ctx.fill();ctx.stroke();
  // W symbol
  ctx.fillStyle=col;ctx.font="bold 14px monospace";ctx.textAlign="center";ctx.fillText("W",0,-6);
  // Power bar
  ctx.fillStyle="#0d1a27";ctx.beginPath();ctx.roundRect(-16,6,32,8,3);ctx.fill();
  const barCol=pct>0.8?"#f87171":pct>0.5?"#f59e0b":"#22c55e";
  ctx.fillStyle=barCol;ctx.beginPath();ctx.roundRect(-16,6,32*pct,8,3);ctx.fill();
  ctx.strokeStyle=col+"44";ctx.lineWidth=1;ctx.stroke();
  // Leads
  ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-G,-8);ctx.lineTo(-24,-8);ctx.stroke();
  ctx.beginPath();ctx.moveTo(24,-8);ctx.lineTo(G,-8);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-G,8);ctx.lineTo(-24,8);ctx.stroke();
  ctx.beginPath();ctx.moveTo(24,8);ctx.lineTo(G,8);ctx.stroke();
}

// Phase meter
function shPhaseMeter(ctx,col,sel,phase){
  const c=sel?"#fbbf24":col;
  const ph=(phase??30)*Math.PI/180;
  ctx.fillStyle="#040e1a";ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(0,0,24,0,Math.PI*2);ctx.fill();ctx.stroke();
  // Reference line
  ctx.strokeStyle=col+"55";ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(-20,0);ctx.lineTo(20,0);ctx.stroke();
  // Phase 1 (reference)
  ctx.strokeStyle="#22d3ee";ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(18,0);ctx.stroke();
  // Phase 2 (shifted)
  ctx.strokeStyle="#f59e0b";ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(-ph)*18,Math.sin(-ph)*18);ctx.stroke();
  // Arc showing angle
  ctx.strokeStyle="#a78bfa";ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(0,0,10,Math.min(0,-ph),Math.max(0,-ph),ph<0);ctx.stroke();
  // Leads
  ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-G,-8);ctx.lineTo(-24,-8);ctx.stroke();
  ctx.beginPath();ctx.moveTo(24,-8);ctx.lineTo(G,-8);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-G,8);ctx.lineTo(-24,8);ctx.stroke();
  ctx.beginPath();ctx.moveTo(24,8);ctx.lineTo(G,8);ctx.stroke();
}

// Transistor NPN
function shTransistor(ctx,col,sel){
  const c=sel?"#fbbf24":col;
  ctx.fillStyle="#040e1a";ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(0,0,20,0,Math.PI*2);ctx.fill();ctx.stroke();
  // Base line (left)
  ctx.strokeStyle=col;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-20,0);ctx.lineTo(-8,0);ctx.stroke();
  // Collector/Emitter vertical
  ctx.beginPath();ctx.moveTo(-8,-14);ctx.lineTo(-8,14);ctx.stroke();
  // Collector diagonal
  ctx.beginPath();ctx.moveTo(-8,-8);ctx.lineTo(16,-16);ctx.stroke();
  // Emitter with arrow (NPN)
  ctx.beginPath();ctx.moveTo(-8,8);ctx.lineTo(16,16);ctx.stroke();
  ctx.fillStyle=col;ctx.save();ctx.translate(8,12);ctx.rotate(Math.atan2(16,24));
  ctx.beginPath();ctx.moveTo(-5,-3);ctx.lineTo(0,0);ctx.lineTo(-5,3);ctx.fill();ctx.restore();
  // Leads
  ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-20,0);ctx.stroke();
  ctx.beginPath();ctx.moveTo(16,-16);ctx.lineTo(G,-16);ctx.stroke();
  ctx.beginPath();ctx.moveTo(16,16);ctx.lineTo(G,16);ctx.stroke();
}

// Zener diode
function shZener(ctx,col,sel){
  const c=sel?"#fbbf24":col;
  ctx.strokeStyle=c;ctx.lineWidth=2;ctx.fillStyle=col+"44";
  ctx.beginPath();ctx.moveTo(-13,0);ctx.lineTo(13,-13);ctx.lineTo(13,13);ctx.closePath();ctx.fill();ctx.stroke();
  // Zener bar (bent)
  ctx.strokeStyle=col;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(7,-14);ctx.lineTo(13,-14);ctx.lineTo(13,14);ctx.lineTo(19,14);ctx.stroke();
  // Leads
  ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-13,0);ctx.stroke();
  ctx.beginPath();ctx.moveTo(13,0);ctx.lineTo(G,0);ctx.stroke();
}

// FRL Lubricator
function shLubricator(ctx,col,sel){
  const c=sel?"#fbbf24":col;
  ctx.fillStyle="#040e1a";ctx.strokeStyle=c;ctx.lineWidth=2;
  // Bowl
  ctx.beginPath();ctx.ellipse(0,10,14,10,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  // Body
  ctx.fillStyle="#07121e";ctx.beginPath();ctx.roundRect(-12,-14,24,28,4);ctx.fill();ctx.stroke();
  // Oil level
  ctx.fillStyle="#f59e0b22";ctx.beginPath();ctx.ellipse(0,8,12,4,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#f59e0b55";ctx.lineWidth=1;ctx.stroke();
  // LB label
  ctx.fillStyle=col;ctx.font="bold 8px monospace";ctx.textAlign="center";ctx.fillText("LB",0,-3);
  // Leads
  ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-12,0);ctx.stroke();
  ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(G,0);ctx.stroke();
}

// MUX 2:1
function shMux(ctx,col,sel){
  const c=sel?"#fbbf24":col;
  ctx.fillStyle="#040e1a";ctx.strokeStyle=c;ctx.lineWidth=2;
  // Trapezoid body
  ctx.beginPath();ctx.moveTo(-20,-20);ctx.lineTo(20,-14);ctx.lineTo(20,14);ctx.lineTo(-20,20);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=col;ctx.font="bold 7px monospace";ctx.textAlign="center";ctx.fillText("MUX",0,3);
  // I0, I1 leads (left)
  ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-G,-12);ctx.lineTo(-20,-12);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-G,12);ctx.lineTo(-20,12);ctx.stroke();
  // Sel (bottom)
  ctx.beginPath();ctx.moveTo(0,G);ctx.lineTo(0,20);ctx.stroke();
  // Out (right)
  ctx.beginPath();ctx.moveTo(20,0);ctx.lineTo(G,0);ctx.stroke();
}

// D Flip-Flop
function shDFF(ctx,col,sel){
  const c=sel?"#fbbf24":col;
  ctx.fillStyle="#040e1a";ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(-22,-24,44,48,5);ctx.fill();ctx.stroke();
  ctx.fillStyle=col;ctx.font="bold 8px monospace";ctx.textAlign="center";
  ctx.fillText("D",0,-10);ctx.fillText("FF",0,2);
  // Clock triangle
  ctx.strokeStyle=col;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(-22,8);ctx.lineTo(-16,14);ctx.lineTo(-22,20);ctx.stroke();
  // Leads D, CLK, Q, Qn
  ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-G,-12);ctx.lineTo(-22,-12);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-G,12);ctx.lineTo(-22,12);ctx.stroke();
  ctx.beginPath();ctx.moveTo(22,-12);ctx.lineTo(G,-12);ctx.stroke();
  ctx.beginPath();ctx.moveTo(22,12);ctx.lineTo(G,12);ctx.stroke();
  // Labels
  ctx.fillStyle=col+"88";ctx.font="6px monospace";ctx.textAlign="left";
  ctx.fillText("D",-20,-9);ctx.fillText(">",-20,15);
  ctx.fillText("Q",16,-9);ctx.fillText("Q̄",16,15);
}


// ─── SERVO MOTOR ──────────────────────────────────────────────────────────────
function shServo(ctx,col,sel,angle,tick){
  const c=sel?"#fbbf24":col;
  const a=(angle??0)*Math.PI/180;
  // Housing
  const hg=ctx.createLinearGradient(-24,-20,24,20);
  hg.addColorStop(0,"#112030");hg.addColorStop(1,"#07131e");
  ctx.fillStyle=hg;ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(-24,-20,48,40,7);ctx.fill();ctx.stroke();
  // Mounting tabs
  ctx.fillStyle="#0d1e2e";ctx.strokeStyle=c;ctx.lineWidth=1.5;
  [[-24,-28],[8,-28]].forEach(([tx,ty])=>{ctx.beginPath();ctx.roundRect(tx,ty,16,10,3);ctx.fill();ctx.stroke();ctx.fillStyle=col+"33";ctx.beginPath();ctx.arc(tx+8,ty+5,2.5,0,Math.PI*2);ctx.fill();ctx.restore?.();});
  // Output shaft disc
  ctx.fillStyle="#0a1e2e";ctx.strokeStyle=col+"66";ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(0,0,13,0,Math.PI*2);ctx.fill();ctx.stroke();
  // Shaft outer ring
  ctx.strokeStyle=col;ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(0,0,13,0,Math.PI*2);ctx.stroke();
  // Shaft position arm (animated)
  const liveA=tick!==undefined?((tick*3)%360)*Math.PI/180:a;
  ctx.strokeStyle=col;ctx.lineWidth=3;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(liveA)*11,Math.sin(liveA)*11);ctx.stroke();
  ctx.lineCap="butt";
  // Shaft center
  ctx.fillStyle=col;ctx.beginPath();ctx.arc(0,0,3.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#020a12";ctx.beginPath();ctx.arc(0,0,1.5,0,Math.PI*2);ctx.fill();
  // Label
  ctx.fillStyle=col+"88";ctx.font="bold 6px monospace";ctx.textAlign="center";ctx.fillText("SERVO",0,22);
  // Angle display
  const dispA=tick!==undefined?(tick*3)%360:Math.round((angle??0));
  ctx.fillStyle=col;ctx.font="bold 6px monospace";ctx.fillText(`${dispA}°`,0,30);
  // Leads
  ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-24,0);ctx.stroke();
  ctx.beginPath();ctx.moveTo(24,0);ctx.lineTo(G,0);ctx.stroke();
}

// ─── RGB LED ─────────────────────────────────────────────────────────────────
function shRGBLed(ctx,col,sel,r,g,b){
  const c=sel?"#fbbf24":col;
  const rv=r??128,gv=g??60,bv=b??200;
  const hexRGB=`rgb(${rv},${gv},${bv})`;
  // Outer lens (dome)
  const dg=ctx.createRadialGradient(-4,-6,2,0,0,16);
  dg.addColorStop(0,`rgba(${rv},${gv},${bv},0.9)`);dg.addColorStop(0.6,`rgba(${rv},${gv},${bv},0.4)`);dg.addColorStop(1,`rgba(${rv},${gv},${bv},0.05)`);
  ctx.fillStyle=dg;ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(0,-4,16,0,Math.PI*2);ctx.fill();ctx.stroke();
  // Inner bright spot
  ctx.fillStyle=`rgba(${Math.min(255,rv+80)},${Math.min(255,gv+80)},${Math.min(255,bv+80)},0.6)`;
  ctx.beginPath();ctx.arc(-4,-8,6,0,Math.PI*2);ctx.fill();
  // Glow effect
  ctx.shadowColor=hexRGB;ctx.shadowBlur=12;
  ctx.fillStyle=`rgba(${rv},${gv},${bv},0.15)`;
  ctx.beginPath();ctx.arc(0,-4,20,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;
  // Base body
  ctx.fillStyle="#06111e";ctx.strokeStyle=c;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.rect(-12,10,24,10);ctx.fill();ctx.stroke();
  // Flat edge indicator
  ctx.strokeStyle=col+"88";ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(10,10);ctx.lineTo(10,20);ctx.stroke();
  // RGB label
  ctx.fillStyle=col+"66";ctx.font="5px monospace";ctx.textAlign="center";ctx.fillText("RGB",0,22);
  // Leads (R,G,B,GND = 4 pins)
  ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-12,15);ctx.stroke();
  ctx.beginPath();ctx.moveTo(G,0);ctx.lineTo(12,15);ctx.stroke();
}

// ─── PROPORTIONAL VALVE ──────────────────────────────────────────────────────
function shPropValve(ctx,col,sel,pct){
  const c=sel?"#fbbf24":col;
  const p=Math.min(1,Math.max(0,pct??0.5));
  // Main body
  ctx.fillStyle="#07121e";ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(-28,-18,56,36,6);ctx.fill();ctx.stroke();
  // Flow path visualization
  const flowW=52*p;
  const flowG=ctx.createLinearGradient(-26,0,26,0);
  flowG.addColorStop(0,col+"00");flowG.addColorStop(0.3,col+"66");flowG.addColorStop(0.7,col+"66");flowG.addColorStop(1,col+"00");
  ctx.fillStyle=flowG;ctx.beginPath();ctx.roundRect(-26,-6,flowW,12,2);ctx.fill();
  // Valve spool
  ctx.fillStyle="#1a3a50";ctx.strokeStyle=col+"88";ctx.lineWidth=1.5;
  ctx.beginPath();ctx.roundRect(-24+52*p-4,-14,8,28,2);ctx.fill();ctx.stroke();
  // Solenoid coil indicator (top)
  ctx.fillStyle=col+"22";ctx.strokeStyle=col+"55";ctx.lineWidth=1;
  ctx.beginPath();ctx.roundRect(-18,-26,36,10,3);ctx.fill();ctx.stroke();
  ctx.strokeStyle=col+"66";ctx.lineWidth=0.8;
  for(let i=-14;i<=14;i+=4){ctx.beginPath();ctx.moveTo(i,-26);ctx.lineTo(i,-16);ctx.stroke();}
  // Position label
  ctx.fillStyle=col;ctx.font="bold 6px monospace";ctx.textAlign="center";ctx.fillText(`${Math.round(p*100)}%`,0,8);
  ctx.fillStyle=col+"88";ctx.font="5.5px monospace";ctx.fillText("PROP",0,16);
  // Leads
  ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-28,0);ctx.stroke();
  ctx.beginPath();ctx.moveTo(28,0);ctx.lineTo(G,0);ctx.stroke();
}

// ─── POWER SUPPLY ────────────────────────────────────────────────────────────
function shPowerSupply(ctx,col,sel,volt,tick){
  const c=sel?"#fbbf24":col;
  // Outer case
  ctx.fillStyle="#04111e";ctx.strokeStyle=c;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.roundRect(-32,-28,64,56,8);ctx.fill();ctx.stroke();
  // Panel face
  ctx.fillStyle="#071a28";ctx.strokeStyle=col+"22";ctx.lineWidth=1;
  ctx.beginPath();ctx.roundRect(-30,-26,60,52,6);ctx.fill();ctx.stroke();
  // AC input indicator strip
  ctx.fillStyle="#f43f5e22";ctx.beginPath();ctx.roundRect(-28,-24,10,20,2);ctx.fill();
  ctx.fillStyle="#f43f5e88";ctx.font="5px monospace";ctx.textAlign="center";ctx.fillText("AC",-23,-15);
  ctx.fillStyle="#f43f5e55";ctx.beginPath();ctx.arc(-23,-8,3,0,Math.PI*2);ctx.fill();
  // DC output indicator strip
  ctx.fillStyle=col+"22";ctx.beginPath();ctx.roundRect(18,-24,10,20,2);ctx.fill();
  ctx.fillStyle=col+"88";ctx.font="5px monospace";ctx.fillText("DC",23,-15);
  ctx.fillStyle=col+"55";ctx.beginPath();ctx.arc(23,-8,3,0,Math.PI*2);ctx.fill();
  // Digital display
  ctx.fillStyle="#00080f";ctx.strokeStyle=col+"44";ctx.lineWidth=1;
  ctx.beginPath();ctx.roundRect(-12,-24,24,16,3);ctx.fill();ctx.stroke();
  ctx.fillStyle=col;ctx.font="bold 9px monospace";ctx.textAlign="center";
  ctx.fillText(`${(volt??12).toFixed(1)}V`,0,-14);
  // Fan grill (right side)
  ctx.strokeStyle=col+"22";ctx.lineWidth=1;
  for(let i=-22;i<22;i+=5){ctx.beginPath();ctx.moveTo(i,2);ctx.lineTo(i,18);ctx.stroke();}
  // Ventilation lines
  ctx.strokeStyle=col+"11";
  for(let y=4;y<18;y+=3){ctx.beginPath();ctx.moveTo(-22,y);ctx.lineTo(22,y);ctx.stroke();}
  // Status LED array
  [["#22c55e","PWR"],["#22d3ee","OUT"],["#fbbf24","OVP"]].forEach(([lc,lbl],i)=>{
    ctx.fillStyle=lc+(i===0?"cc":"44");ctx.beginPath();ctx.arc(-28+i*6,6,2.5,0,Math.PI*2);ctx.fill();
  });
  // Trim pot knob
  ctx.fillStyle="#0d2030";ctx.strokeStyle=col+"66";ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(22,10,5,0,Math.PI*2);ctx.fill();ctx.stroke();
  const ka=(tick||0)*0.1;
  ctx.strokeStyle=col;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(22,10);ctx.lineTo(22+Math.cos(ka)*4,10+Math.sin(ka)*4);ctx.stroke();
  // Leads
  ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-G,-8);ctx.lineTo(-32,-8);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-G,8);ctx.lineTo(-32,8);ctx.stroke();
  ctx.beginPath();ctx.moveTo(32,-8);ctx.lineTo(G,-8);ctx.stroke();
  ctx.beginPath();ctx.moveTo(32,8);ctx.lineTo(G,8);ctx.stroke();
}

// ─── PRESSURE REGULATOR (FRL unit) ──────────────────────────────────────────
function shPressReg(ctx,col,sel,pct){
  const c=sel?"#fbbf24":col;
  const p=Math.min(1,Math.max(0,pct??0.6));
  // Body cylinder
  ctx.fillStyle="#07121e";ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(-16,-24,32,42,5);ctx.fill();ctx.stroke();
  // Bowl (transparent bowl showing liquid level)
  ctx.fillStyle="#050e18";ctx.strokeStyle=col+"55";ctx.lineWidth=1.5;
  ctx.beginPath();ctx.ellipse(0,20,12,8,0,0,Math.PI*2);ctx.fill();ctx.stroke();
  // Liquid level
  ctx.fillStyle=col+"44";ctx.beginPath();ctx.ellipse(0,20,10,5,0,-Math.PI/2,Math.PI/2*((p*2)-1));ctx.closePath();ctx.fill();
  // Adjustment knob
  ctx.fillStyle="#0e2030";ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(0,-24,8,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.strokeStyle=col;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(0,-24);ctx.lineTo(0,-30);ctx.stroke();
  // Pressure gauge mini
  ctx.fillStyle="#02080e";ctx.strokeStyle=col+"66";ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(0,-6,8,0,Math.PI*2);ctx.fill();ctx.stroke();
  const na=Math.PI*0.8+p*Math.PI*1.4;
  ctx.strokeStyle=col;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(Math.cos(na)*6,(-6)+Math.sin(na)*6);ctx.stroke();
  ctx.fillStyle=col;ctx.beginPath();ctx.arc(0,-6,2,0,Math.PI*2);ctx.fill();
  // Value
  ctx.fillStyle=col+"88";ctx.font="5.5px monospace";ctx.textAlign="center";ctx.fillText(`${(p*10).toFixed(1)}`,0,4);ctx.fillText("bar",0,11);
  // FRL label
  ctx.fillStyle=col+"66";ctx.font="5px monospace";ctx.fillText("REG",0,-16);
  // Leads
  ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-16,0);ctx.stroke();
  ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(G,0);ctx.stroke();
}

// ─── FLOW INDICATOR (visual animated) ───────────────────────────────────────
function shFlowIndicator(ctx,col,sel,flow,tick){
  const c=sel?"#fbbf24":col;
  const f=Math.min(1,Math.max(0,flow??0.5));
  // Pipe body
  ctx.fillStyle="#050e18";ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(-28,-14,56,28,5);ctx.fill();ctx.stroke();
  // Rotameter float (animated position showing flow rate)
  const floatX=-20+f*40;
  // Flow stream (animated bubbles/particles)
  if(f>0){
    const toff=(tick||0)*0.8*f;
    for(let i=0;i<5;i++){
      const bx=((-20+(i/5*44)+toff)%48)-24;
      const by=(Math.sin(i*1.3+toff*0.5))*4;
      const alpha=Math.min(1,f*2)*0.6;
      ctx.fillStyle=col+Math.round(alpha*255).toString(16).padStart(2,"0");
      ctx.beginPath();ctx.arc(bx,by,f*3+0.5,0,Math.PI*2);ctx.fill();
    }
  }
  // Float indicator (vertical position)
  const fy=(1-f)*8-4;
  ctx.fillStyle="#1a4060";ctx.strokeStyle=col;ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(-4,fy-6);ctx.lineTo(4,fy-6);ctx.lineTo(4,fy+6);ctx.lineTo(-4,fy+6);ctx.closePath();ctx.fill();ctx.stroke();
  // Scale marks
  ctx.strokeStyle=col+"44";ctx.lineWidth=0.8;
  for(let i=0;i<=4;i++){const sx=-28+i*14;ctx.beginPath();ctx.moveTo(sx,-14);ctx.lineTo(sx,-10);ctx.stroke();}
  // Value
  ctx.fillStyle=col;ctx.font="bold 6px monospace";ctx.textAlign="center";ctx.fillText(`${Math.round(f*100)}%`,0,22);
  // Leads
  ctx.strokeStyle=c;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-28,0);ctx.stroke();
  ctx.beginPath();ctx.moveTo(28,0);ctx.lineTo(G,0);ctx.stroke();
}

// ─── TEMPERATURE GAUGE (round analog) ────────────────────────────────────────
function shTempGauge(ctx,col,sel,temp){
  const c=sel?"#fbbf24":col;
  const maxT=200,minT=0;
  const pct=Math.min(1,Math.max(0,((temp??25)-minT)/(maxT-minT)));
  const heatCol=pct>0.7?"#f87171":pct>0.4?"#f59e0b":col;
  // Body
  ctx.fillStyle="#040e1a";ctx.strokeStyle=c;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.arc(0,0,26,0,Math.PI*2);ctx.fill();ctx.stroke();
  // Inner glass
  ctx.fillStyle="#050e18";ctx.strokeStyle=col+"22";ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();ctx.stroke();
  // Heat zone arc (red, outer)
  const startA=Math.PI*0.8,endA=Math.PI*2.2;
  ctx.strokeStyle="#f8717133";ctx.lineWidth=5;
  ctx.beginPath();ctx.arc(0,0,19,startA+(0.7)*(endA-startA),endA,false);ctx.stroke();
  // Temp scale ticks
  for(let i=0;i<=10;i++){
    const a=startA+(i/10)*(endA-startA);
    const big=i%5===0;
    const danger=i>=7;
    ctx.strokeStyle=danger?"#f87171":(big?col:col+"55");ctx.lineWidth=big?2:1;
    ctx.beginPath();ctx.moveTo(Math.cos(a)*22,Math.sin(a)*22);ctx.lineTo(Math.cos(a)*(big?14:17),Math.sin(a)*(big?14:17));ctx.stroke();
  }
  // Needle
  const na=startA+pct*(endA-startA);
  ctx.strokeStyle=heatCol;ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(na)*17,Math.sin(na)*17);ctx.stroke();
  // Pivot
  ctx.fillStyle=heatCol;ctx.strokeStyle=c;ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();ctx.stroke();
  // Temp reading
  ctx.fillStyle=heatCol;ctx.font="bold 7px monospace";ctx.textAlign="center";ctx.fillText(`${Math.round(temp??25)}°C`,0,10);
  // Unit label below
  ctx.fillStyle=col+"88";ctx.font="5.5px monospace";ctx.fillText("TEMP",0,-16);
  // Lead (thermowell probe)
  ctx.strokeStyle=c;ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(0,26);ctx.lineTo(0,G);ctx.stroke();
}

function drawComp(ctx,comp,sel,live,modColor,viewMode="2d"){
  const{x,y,t,n,v,r=0}=comp;
  const lib=Object.values(LIBS).flat().find(l=>l.t===t);
  const col=comp.color||lib?.col||"#94a3b8";
  const is3d=viewMode==="3d";
  ctx.save();ctx.translate(x,y);ctx.rotate(r*Math.PI/180);
  if(is3d){
    ctx.save();
    ctx.shadowColor=hexToRgba(col, sel?0.40:0.24);
    ctx.shadowBlur=sel?24:14;
    ctx.shadowOffsetX=3;
    ctx.shadowOffsetY=5;
    ctx.fillStyle=hexToRgba(shiftHex(col,-0.1),0.09);
    ctx.strokeStyle=hexToRgba(col,0.20);
    ctx.lineWidth=1.2;
    ctx.beginPath();ctx.roundRect(-34,-26,68,52,10);ctx.fill();ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.strokeStyle=hexToRgba("#ffffff",0.10);
    ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(-26,-18);ctx.lineTo(24,-18);ctx.stroke();
    ctx.restore();
  }
  const hasLeads=!["gnd","gnde","bus","cyl","cylse","cylh","mtr","osc","pot","prs","manm","tc","enc","vfd","seg7","plc","watt","phasem","lubd","mux","dff","trns","zpv"].includes(t);
  const gateType=["and","or","not","nand","nor","xor","buf"].includes(t);
  const contactType=["cno","cnf","cpos","coil","set","rst"].includes(t);
  if(hasLeads&&!gateType&&!contactType&&!["vd","valivio","vret","v32","v52","v53","cont","rele","mote","disj","qg","qc","fus","rterm","dr","transf","snsr","fq","inp","out","ffsr","ton","tof","ctu","cmp"].includes(t)){ctx.strokeStyle=sel?"#fbbf24":col;ctx.lineWidth=2;ctx.setLineDash([]);ctx.beginPath();ctx.moveTo(-G,0);ctx.lineTo(-22,0);ctx.stroke();ctx.beginPath();ctx.moveTo(22,0);ctx.lineTo(G,0);ctx.stroke();}
  switch(t){
    case"res":shRes(ctx,col,sel);break;case"cap":shCap(ctx,col,sel);break;case"ind":shInd(ctx,col,sel);break;
    case"vdc":shVsrc(ctx,col,sel,false);break;case"vac":shVsrc(ctx,col,sel,true);break;case"idc":shIsrc(ctx,col,sel);break;
    case"gnd":case"gnde":shGnd(ctx,col,sel);break;case"diode":shDiode(ctx,col,sel,false);break;case"led":shDiode(ctx,col,sel,true);break;
    case"sw":shSwitch(ctx,col,sel,parseFloat(v||1)>0);break;case"mtr":shMeter(ctx,col,sel,comp.mmode||0,live?.pct??0.7);break;
    case"comp":case"pump":case"mtrh":shCircleDev(ctx,col,sel,lib?.sym||"K");break;
    case"cyl":shCylinder(ctx,col,sel,live?.pct??0.5,true);break;
    case"cylse":shCylinder(ctx,col,sel,live?.pct??0.5,false);break;
    case"cylh":shCylinder(ctx,col,sel,live?.pct??0.5,true);break;
    case"resv":case"tank":shTank(ctx,col,sel);break;
    case"v32":shValve(ctx,col,sel,"3/2");break;case"v52":shValve(ctx,col,sel,"5/2");break;case"v53":shValve(ctx,col,sel,"5/3");break;
    case"vd":shValve(ctx,col,sel,"VD");break;case"valivio":shValve(ctx,col,sel,"VA");break;case"vret":shValve(ctx,col,sel,"VR");break;
    case"flt":case"flth":shFilter(ctx,col,sel);break;case"snsr":shSensor(ctx,col,sel);break;
    case"fq":shBox(ctx,col,sel,"FQ","L/min");break;case"sil":shBox(ctx,col,sel,"SIL");break;
    case"transf":shTransformer(ctx,col,sel);break;case"imp":shBox(ctx,col,sel,"Z","Ω");break;
    case"inp":shIO(ctx,col,sel,false);break;case"out":shIO(ctx,col,sel,true);break;
    case"and":shGate(ctx,col,sel,"&");break;case"or":shGate(ctx,col,sel,"≥1");break;case"not":shGate(ctx,col,sel,"¬");break;
    case"nand":shGate(ctx,col,sel,"¬&");break;case"nor":shGate(ctx,col,sel,"¬1");break;case"xor":shGate(ctx,col,sel,"⊕");break;
    case"buf":shBuf(ctx,col,sel);break;case"ffsr":shFFSR(ctx,col,sel);break;
    case"cont":shContactor(ctx,col,sel,"KM");break;case"rele":shContactor(ctx,col,sel,"KA");break;
    case"bna":shContact(ctx,col,sel,false);break;case"bnf":shContact(ctx,col,sel,true);break;
    case"tmr":shBox(ctx,col,sel,"KT","⏱");break;case"mote":shMotor(ctx,col,sel);break;
    case"fus":shFuse(ctx,col,sel);break;case"disj":case"qg":case"qc":shBreaker(ctx,col,sel);break;
    case"rterm":shThermal(ctx,col,sel);break;case"lamp":shLamp(ctx,col,sel,true);break;
    case"dr":shDR(ctx,col,sel);break;case"dps":shBox(ctx,col,sel,"DPS","⚡");break;
    case"bus":shBusbar(ctx,col,sel);break;case"tom":shBox(ctx,col,sel,"TOM","~");break;
    case"lum":shLamp(ctx,col,sel,false);break;case"ar":shBox(ctx,col,sel,"❄","kW");break;
    case"cno":shContact(ctx,col,sel,false);break;case"cnf":shContact(ctx,col,sel,true);break;
    case"cpos":shContact(ctx,col,sel,false);break;
    case"coil":shCoil(ctx,col,sel,"()");break;case"set":shCoil(ctx,col,sel,"S");break;case"rst":shCoil(ctx,col,sel,"R");break;
    case"ton":shTimer(ctx,col,sel,"TON");break;case"tof":shTimer(ctx,col,sel,"TOF");break;
    case"ctu":shBox(ctx,col,sel,"CTU","CTR");break;case"cmp":shBox(ctx,col,sel,"CMP","=");break;
    // NEW COMPONENTS
    case"osc":shOscilloscope(ctx,col,sel,live?.tick||0);break;
    case"pot":shPotentiometer(ctx,col,sel,parseFloat(v||50)/100);break;
    case"zpv":shZener(ctx,col,sel);break;
    case"trns":shTransistor(ctx,col,sel);break;
    case"prs":shPressureSwitch(ctx,col,sel,live?.active||false);break;
    case"manm":shManometer(ctx,col,sel,live?.pct??0.5);break;
    case"tc":shThermocouple(ctx,col,sel,parseFloat(v||25));break;
    case"enc":shEncoder(ctx,col,sel,live?.tick||0);break;
    case"vfd":shVFD(ctx,col,sel,parseFloat(v||50));break;
    case"seg7":shSeg7(ctx,col,sel,live?.digit??0);break;
    case"plc":shPLC(ctx,col,sel);break;
    case"watt":shWattmeter(ctx,col,sel,live?.pct??0.5);break;
    case"phasem":shPhaseMeter(ctx,col,sel,parseFloat(v||30));break;
    case"lubd":shLubricator(ctx,col,sel);break;
    case"mux":shMux(ctx,col,sel);break;
    case"dff":shDFF(ctx,col,sel);break;
    case"servo":shServo(ctx,col,sel,parseFloat(v||0),live?live.tick:undefined);break;
    case"rgbled":shRGBLed(ctx,col,sel,comp.rv||128,comp.gv||60,comp.bv||200);break;
    case"propv":shPropValve(ctx,col,sel,live?.pct??parseFloat(v||50)/100);break;
    case"psu":shPowerSupply(ctx,col,sel,parseFloat(v||12),live?.tick||0);break;
    case"preg":shPressReg(ctx,col,sel,live?.pct??parseFloat(v||60)/100);break;
    case"flowin":shFlowIndicator(ctx,col,sel,live?.pct??0.5,live?.tick||0);break;
    case"tgauge":shTempGauge(ctx,col,sel,parseFloat(v||25));break;
    default:shBox(ctx,col,sel,t.slice(0,3).toUpperCase());
  }
  // Labels
  const lbl=n||(lib?.sym||t.slice(0,3));
  const us=lib?.u||"",vs2=v!==undefined&&String(v)!=="0"?`${v}${us}`:"";
  ctx.fillStyle=col;ctx.font="bold 9px monospace";ctx.textAlign="center";ctx.fillText(lbl,0,-32);
  if(vs2){ctx.fillStyle="#4a6a80";ctx.font="7.5px monospace";ctx.fillText(vs2,0,34);}
  // Address label
  if(comp.addr){ctx.fillStyle="#334155";ctx.font="7px monospace";ctx.fillText(comp.addr,0,44);}
  // Logic input indicator
  if(t==="inp"){const val=parseInt(v||0);ctx.fillStyle=val?"#22c55e":"#334155";ctx.beginPath();ctx.arc(0,0,6,0,Math.PI*2);ctx.fill();ctx.fillStyle="#fff";ctx.font="bold 7px monospace";ctx.fillText(val?"1":"0",0,3);}
  // Live data
  if(live){ctx.fillStyle="#22c55e";ctx.font="bold 8px monospace";if(live.I!==undefined)ctx.fillText(`${live.I.toFixed(3)}A`,0,46);if(live.V!==undefined){ctx.fillStyle="#38bdf8";ctx.fillText(`${live.V.toFixed(3)}V`,0,56);}}
  // Selection box
  if(sel){ctx.strokeStyle=col+"bb";ctx.lineWidth=1.5;ctx.setLineDash([3,2]);ctx.beginPath();ctx.rect(-36,-30,72,66);ctx.stroke();ctx.setLineDash([]);}
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROPERTIES PANEL (right side panel showing all editable fields)
// ═══════════════════════════════════════════════════════════════════════════════
function PropertiesPanel({comp,lib,modColor,comps,wires,push,setSel,sd,onCalc,onToggleSim,running,hist}){
  const [editVal, setEditVal]   = useState("");
  const [editName, setEditName] = useState("");
  const [editAddr, setEditAddr] = useState("");
  const [editInps, setEditInps] = useState(2);
  const [editColor,setEditColor]= useState("");

  useEffect(()=>{
    if(comp){
      setEditVal(String(comp.v));
      setEditName(comp.n||"");
      setEditAddr(comp.addr||"");
      setEditInps(comp.inputs||2);
      setEditColor(comp.color||"");
    }
  },[comp?.id]);

  const li=comp?lib.find(l=>l.t===comp.t):null;
  const B=(col,bg="#071020")=>({background:bg,border:`1px solid ${col}44`,color:col,borderRadius:4,padding:"4px 10px",cursor:"pointer",fontSize:10,fontFamily:"'Courier New',monospace",transition:"all 0.15s",letterSpacing:0.5});

  if(!comp&&!sd) return(
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,padding:20}}>
      <div style={{fontSize:40}}>{MODS_ALL.find(m=>m.id===comp?.modId)?.icon||"⚡"}</div>
      <div style={{fontSize:10,color:"#334155",textAlign:"center",lineHeight:2}}>
        Selecione um componente<br/>para editar suas propriedades<br/><br/>
        <span style={{color:"#1e3a5f"}}>ou pressione</span>{" "}
        <kbd style={{color:modColor,background:"#071020",padding:"1px 6px",borderRadius:3,border:`1px solid ${modColor}44`,fontFamily:"monospace"}}>F9</kbd>
        {" "}<span style={{color:"#1e3a5f"}}>para calcular</span>
      </div>
    </div>
  );

  return(
    <div style={{flex:1,overflowY:"auto",padding:"10px"}}>
      {comp&&(
        <>
          {/* Header */}
          <div style={{background:"#071020",border:`1px solid ${modColor}33`,borderRadius:6,padding:"10px 12px",marginBottom:10}}>
            <div style={{fontSize:8,color:"#334155",letterSpacing:2,marginBottom:4}}>COMPONENTE</div>
            <div style={{fontSize:13,fontWeight:700,color:modColor,marginBottom:2}}>{comp.n||comp.t}</div>
            <div style={{fontSize:9,color:"#475569"}}>{li?.lbl||comp.t} {li?.tip?`— ${li.tip}`:""}</div>
            {comp.t==="mtr"&&<div style={{marginTop:6,display:"flex",gap:4}}>
              {["V","mA","Ω","AC"].map((m,i)=>(
                <button key={m} onClick={()=>push({comps:comps.map(c=>c.id===comp.id?{...c,mmode:i}:c),wires})}
                  style={{background:(comp.mmode||0)===i?`${modColor}22`:"#071020",border:`1px solid ${(comp.mmode||0)===i?modColor:"#1e3a5f"}`,color:(comp.mmode||0)===i?modColor:"#334155",borderRadius:3,padding:"3px 8px",cursor:"pointer",fontSize:9,fontFamily:"monospace",fontWeight:700}}>
                  {m}
                </button>
              ))}
              <span style={{fontSize:7.5,color:"#334155",alignSelf:"center",marginLeft:4}}>dbl=ciclar</span>
            </div>}
          </div>

          {/* NOME */}
          <div style={{marginBottom:8}}>
            <div style={{fontSize:8,color:"#475569",letterSpacing:2,marginBottom:4}}>NOME / ETIQUETA</div>
            <div style={{display:"flex",gap:4}}>
              <input value={editName} onChange={e=>setEditName(e.target.value)}
                placeholder="Ex: R1, Motor_A"
                style={{flex:1,background:"#071020",border:"1px solid #1e3a5f",color:"#e2e8f0",padding:"6px 8px",borderRadius:4,fontSize:11,fontFamily:"monospace",outline:"none"}}/>
              <button onClick={()=>push({comps:comps.map(c=>c.id===comp.id?{...c,n:editName||c.n}:c),wires})} style={B(modColor)}>OK</button>
            </div>
          </div>

          {/* VALOR */}
          {li&&li.u!==""&&(
            <div style={{marginBottom:8}}>
              <div style={{fontSize:8,color:"#475569",letterSpacing:2,marginBottom:4}}>VALOR ({li.u||"unid."})</div>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <input type="number" value={editVal} onChange={e=>setEditVal(e.target.value)}
                  style={{flex:1,background:"#071020",border:"1px solid #1e3a5f",color:"#e2e8f0",padding:"6px 8px",borderRadius:4,fontSize:11,fontFamily:"monospace",outline:"none"}}/>
                <span style={{fontSize:9,color:"#475569",minWidth:28}}>{li.u}</span>
                <button onClick={()=>push({comps:comps.map(c=>c.id===comp.id?{...c,v:isNaN(parseFloat(editVal))?c.v:parseFloat(editVal)}:c),wires})} style={B(modColor)}>OK</button>
              </div>
              {/* Quick presets for common values */}
              {li.u==="Ω"&&<div style={{display:"flex",gap:3,marginTop:4,flexWrap:"wrap"}}>
                {[100,470,1000,4700,10000].map(rv=>(
                  <button key={rv} onClick={()=>{setEditVal(String(rv));push({comps:comps.map(c=>c.id===comp.id?{...c,v:rv}:c),wires});}} style={{background:"#071020",border:"1px solid #1e3a5f",color:"#475569",borderRadius:3,padding:"2px 5px",cursor:"pointer",fontSize:8,fontFamily:"monospace"}}>{rv<1000?rv+"Ω":(rv/1000)+"kΩ"}</button>
                ))}
              </div>}
              {li.u==="V"&&comp.t==="vdc"&&<div style={{display:"flex",gap:3,marginTop:4,flexWrap:"wrap"}}>
                {[3.3,5,9,12,24,48].map(vv=>(
                  <button key={vv} onClick={()=>{setEditVal(String(vv));push({comps:comps.map(c=>c.id===comp.id?{...c,v:vv}:c),wires});}} style={{background:"#071020",border:"1px solid #1e3a5f",color:"#475569",borderRadius:3,padding:"2px 5px",cursor:"pointer",fontSize:8,fontFamily:"monospace"}}>{vv}V</button>
                ))}
              </div>}
            </div>
          )}

          {/* ENDEREÇO */}
          <div style={{marginBottom:8}}>
            <div style={{fontSize:8,color:"#475569",letterSpacing:2,marginBottom:4}}>ENDEREÇO CLP / TAG</div>
            <div style={{display:"flex",gap:4}}>
              <input value={editAddr} onChange={e=>setEditAddr(e.target.value)}
                placeholder="Ex: I0.0, Q0.1, M0.0"
                style={{flex:1,background:"#071020",border:"1px solid #1e3a5f",color:"#e2e8f0",padding:"6px 8px",borderRadius:4,fontSize:11,fontFamily:"monospace",outline:"none"}}/>
              <button onClick={()=>push({comps:comps.map(c=>c.id===comp.id?{...c,addr:editAddr}:c),wires})} style={B("#64748b")}>OK</button>
            </div>
          </div>

          {/* NÚMERO DE ENTRADAS (portas lógicas) */}
          {["and","or","nand","nor","xor"].includes(comp.t)&&(
            <div style={{marginBottom:8}}>
              <div style={{fontSize:8,color:"#475569",letterSpacing:2,marginBottom:4}}>N.º DE ENTRADAS</div>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <input type="number" min={2} max={8} value={editInps} onChange={e=>setEditInps(parseInt(e.target.value)||2)}
                  style={{width:60,background:"#071020",border:"1px solid #1e3a5f",color:"#e2e8f0",padding:"6px 8px",borderRadius:4,fontSize:11,fontFamily:"monospace",outline:"none"}}/>
                <button onClick={()=>push({comps:comps.map(c=>c.id===comp.id?{...c,inputs:editInps}:c),wires})} style={B("#4ade80")}>OK</button>
                <span style={{fontSize:8,color:"#334155"}}>entradas (2–8)</span>
              </div>
            </div>
          )}

          {/* COR DO COMPONENTE */}
          <div style={{marginBottom:8}}>
            <div style={{fontSize:8,color:"#475569",letterSpacing:2,marginBottom:4}}>COR DO COMPONENTE</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {["","#22d3ee","#f59e0b","#f43f5e","#4ade80","#a78bfa","#fb923c","#fbbf24","#38bdf8","#c084fc","#e2e8f0"].map(cc=>(
                <div key={cc} onClick={()=>{setEditColor(cc);push({comps:comps.map(c=>c.id===comp.id?{...c,color:cc||undefined}:c),wires});}}
                  style={{width:18,height:18,borderRadius:"50%",background:cc||"#1e293b",border:`2px solid ${(comp.color||"")===(cc)?"#fff":"#1e293b"}`,cursor:"pointer",flexShrink:0}}/>
              ))}
            </div>
          </div>

          {/* ROTAÇÃO */}
          <div style={{marginBottom:8}}>
            <div style={{fontSize:8,color:"#475569",letterSpacing:2,marginBottom:4}}>ROTAÇÃO</div>
            <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
              {[0,90,180,270].map(a=>(
                <button key={a} onClick={()=>push({comps:comps.map(c=>c.id===comp.id?{...c,r:a}:c),wires})}
                  style={{...B((comp.r||0)===a?modColor:"#334155",(comp.r||0)===a?`${modColor}15`:"#071020"),padding:"4px 10px"}}>{a}°</button>
              ))}
              <button onClick={()=>push({comps:comps.map(c=>c.id===comp.id?{...c,r:(((c.r||0)+90)%360+360)%360}:c),wires})} style={B("#64748b")}>↻ +90°</button>
              <button onClick={()=>push({comps:comps.map(c=>c.id===comp.id?{...c,r:(((c.r||0)-90)%360+360)%360}:c),wires})} style={B("#64748b")}>↺ −90°</button>
            </div>
          </div>

          {/* APAGAR */}
          <div style={{marginBottom:12}}>
            <button onClick={()=>{push({comps:comps.filter(c=>c.id!==comp.id),wires:wires.filter(w=>w.id!==comp.id)});setSel(null);}} style={{...B("#f87171","#1a0000"),width:"100%",padding:"7px"}}>🗑 Apagar Componente</button>
          </div>

          <div style={{height:1,background:"#1e293b",margin:"8px 0"}}/>
        </>
      )}

      {/* RESULTS */}
      {sd&&(
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div style={{fontSize:8,color:"#475569",letterSpacing:2}}>RESULTADOS</div>
            <button onClick={()=>onCalc()} style={{background:"none",border:`1px solid ${modColor}44`,color:modColor,borderRadius:3,padding:"2px 8px",cursor:"pointer",fontSize:8,fontFamily:"monospace"}}>⚡ Recalc.</button>
          </div>
          {sd.results.map((r,i)=>(
            <div key={i} style={{background:"#071020",border:`1px solid ${r.col||modColor}22`,borderLeft:`3px solid ${r.col||modColor}`,borderRadius:4,padding:"4px 8px",marginBottom:3,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:8,color:"#475569"}}>{r.icon} {r.label}</span>
              <span style={{fontSize:9,color:r.col||modColor,fontWeight:700,fontFamily:"monospace"}}>{r.value}</span>
            </div>
          ))}
          <div style={{height:1,background:"#1e293b",margin:"8px 0"}}/>
          <div style={{fontSize:8,color:"#475569",marginBottom:5,letterSpacing:2}}>PASSO A PASSO</div>
          <div style={{background:"#040d18",borderRadius:5,padding:"8px",border:"1px solid #1e293b",fontSize:7.5,lineHeight:1.9,fontFamily:"monospace",overflowX:"auto"}}>
            {sd.steps.map((s,i)=>(
              s.type==="divider"
                ?<div key={i} style={{height:1,background:"#1e3a5f",margin:"3px 0"}}/>
                :<div key={i} style={{color:s.type==="title"?"#f59e0b":s.type==="formula"?"#a78bfa":s.type==="result"?"#22c55e":"#4a6a80",fontWeight:s.type==="title"||s.type==="result"?700:400,paddingLeft:s.type==="sub"||s.type==="formula"?"8px":"0"}}>
                  {s.text}
                </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOOLBAR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
function Toolbar({tool,setTool,sel,selComp,selWire,modColor,running,snap,ortho,zoom,hist,comps,wires,push,dispatch,setSel,setSnap,setOrtho,setZoom,setPan,doRot,calc,toggleSim,saveJSON,fileRef,clearAll,autoLayout,modId,wireColor,setWireColor,viewMode,setViewMode,exportPNG,duplicateSelected,fitView}){
  const [showWireColors, setShowWireColors] = useState(false);
  const B=(col,bg="#071020",active=false)=>({
    background:active?`${col}20`:bg,
    border:`1px solid ${active?col:col+"33"}`,
    color:active?col:col,
    borderRadius:6,
    padding:"4px 10px",
    cursor:"pointer",
    fontSize:10,
    fontFamily:"'Courier New',monospace",
    transition:"all 0.15s",
    whiteSpace:"nowrap",
    letterSpacing:0.5,
    boxShadow:active?`0 0 0 1px ${hexToRgba(col,0.15)} inset, 0 0 16px ${hexToRgba(col,0.16)}`:"inset 0 1px 0 #ffffff08"
  });
  const Sep=()=><div style={{width:1,height:22,background:"#1e293b",margin:"0 2px",flexShrink:0}}/>;

  return(
    <div style={{position:"absolute",top:8,left:8,right:8,display:"flex",gap:4,alignItems:"center",background:"#040d18ee",borderRadius:8,padding:"6px 10px",border:`1px solid ${modColor}22`,flexWrap:"wrap",zIndex:100,backdropFilter:"blur(8px)",boxShadow:"0 10px 34px #0008"}}>
      <button onClick={()=>dispatch({type:"UNDO"})} disabled={!hist.past.length} title="Desfazer Ctrl+Z" style={B(hist.past.length?"#94a3b8":"#1e293b")}>↩</button>
      <button onClick={()=>dispatch({type:"REDO"})} disabled={!hist.future.length} title="Refazer Ctrl+Y" style={B(hist.future.length?"#94a3b8":"#1e293b")}>↪</button>
      <Sep/>

      {selComp&&<>
        <button onClick={()=>doRot(-90)} title="Girar -90° (Ctrl+←)" style={B("#94a3b8")}>↺ −90°</button>
        <button onClick={()=>doRot(90)}  title="Girar +90° (Ctrl+→)" style={B("#94a3b8")}>↻ +90°</button>
        <button onClick={duplicateSelected} title="Duplicar selecionado (Ctrl+D)" style={B(modColor)}>
          ⧉ Duplicar
        </button>
        <Sep/>
      </>}

      {tool==="wire"&&(
        <div style={{position:"relative"}}>
          <button onClick={()=>setShowWireColors(s=>!s)} title="Cor do fio" style={{...B("#94a3b8"),display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:wireColor||"#38bdf8"}}/>
            Cor do Fio
          </button>
          {showWireColors&&(
            <div style={{position:"absolute",top:32,left:0,background:"#071020",border:"1px solid #1e3a5f",borderRadius:6,padding:"8px",display:"flex",gap:5,flexWrap:"wrap",width:140,zIndex:200,boxShadow:"0 4px 20px #000c"}}>
              {WIRE_COLORS.map(wc=>(
                <div key={wc} onClick={()=>{setWireColor(wc);setShowWireColors(false);}} style={{width:20,height:20,borderRadius:"50%",background:wc,border:`2px solid ${wireColor===wc?"#fff":"#1e3a5f"}`,cursor:"pointer"}}/>
              ))}
            </div>
          )}
        </div>
      )}

      {selWire&&<>
        <div style={{position:"relative"}}>
          <button onClick={()=>setShowWireColors(s=>!s)} style={B("#94a3b8")}>
            <div style={{width:10,height:10,borderRadius:"50%",background:selWire.color||"#38bdf8",display:"inline-block",marginRight:4}}/>
            Cor do Fio
          </button>
          {showWireColors&&(
            <div style={{position:"absolute",top:32,left:0,background:"#071020",border:"1px solid #1e3a5f",borderRadius:6,padding:"8px",display:"flex",gap:5,flexWrap:"wrap",width:140,zIndex:200,boxShadow:"0 4px 20px #000c"}}>
              {WIRE_COLORS.map(wc=>(
                <div key={wc} onClick={()=>{push({comps,wires:wires.map(w=>w.id===selWire.id?{...w,color:wc}:w)});setShowWireColors(false);}} style={{width:20,height:20,borderRadius:"50%",background:wc,border:`2px solid ${(selWire.color||"#38bdf8")===wc?"#fff":"#1e3a5f"}`,cursor:"pointer"}}/>
              ))}
            </div>
          )}
        </div>
        <button onClick={()=>{push({comps,wires:wires.filter(w=>w.id!==sel)});setSel(null);}} style={B("#f87171")}>🗑 Fio</button>
        <Sep/>
      </>}

      <button onClick={toggleSim} title="F5" style={B(running?"#22c55e":"#64748b",running?"#052e16":"#071020",running)}>{running?"⏸ Parar":"▶ Simular"}</button>
      <button onClick={calc} title="F9" style={{...B(modColor,"#071020"),fontWeight:700}}>⚡ Calcular</button>
      <Sep/>

      <button onClick={saveJSON} title="Ctrl+S" style={B("#64748b")}>💾 JSON</button>
      <button onClick={()=>fileRef.current?.click()} title="Ctrl+O" style={B("#64748b")}>📂 Abrir</button>
      <button onClick={exportPNG} title="Exportar PNG" style={B("#64748b")}>🖼 PNG</button>
      <button onClick={autoLayout} title="Auto Layout" style={B("#64748b")}>✨ Layout</button>
      <button onClick={clearAll} title="Limpar" style={B("#f87171")}>🗑 Limpar</button>
      <Sep/>

      <button onClick={()=>setZoom(z=>Math.min(z*1.2,5))} title="Zoom +" style={B("#64748b")}>+</button>
      <button onClick={()=>setZoom(z=>Math.max(z*0.8,0.15))} title="Zoom -" style={B("#64748b")}>−</button>
      <button onClick={fitView} title="Ajustar à área útil" style={B("#64748b")}>◎ Fit</button>
      <button onClick={()=>{setZoom(1);setPan({x:0,y:0});}} style={{...B("#64748b"),minWidth:48,fontSize:9}}>{(zoom*100).toFixed(0)}%</button>
      <button onClick={()=>setSnap(s=>!s)} style={B(snap?"#22c55e":"#475569",snap?"#052e16":"#071020",snap)}>{snap?"SNAP✓":"SNAP"}</button>
      <button onClick={()=>setOrtho(o=>!o)} style={B(ortho?"#22d3ee":"#475569",ortho?"#06303a":"#071020",ortho)}>{ortho?"ORTHO✓":"ORTHO"}</button>
      <button onClick={()=>setViewMode("2d")} style={B(viewMode==="2d"?"#38bdf8":"#475569",viewMode==="2d"?"#082f49":"#071020",viewMode==="2d")}>2D</button>
      <button onClick={()=>setViewMode("3d")} style={B(viewMode==="3d"?modColor:"#475569",viewMode==="3d"?hexToRgba(modColor,0.12):"#071020",viewMode==="3d")}>3D</button>

      {running&&<span style={{fontSize:8,color:"#22c55e",padding:"2px 8px",background:"#052e16",borderRadius:10,border:"1px solid #22c55e44",marginLeft:4}}>● AO VIVO</span>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CANVAS ENGINE

// ═══════════════════════════════════════════════════════════════════════════════
const INIT={comps:[],wires:[]};

function Engine({modId,modColor,lib,onBack,userName}){
  const cvRef=useRef(),animRef=useRef(),tickRef=useRef(0),isPan=useRef(false),panStart=useRef({mx:0,my:0,px:0,py:0});
  const[hist,dispatch]=useReducer(hRed,{past:[],present:INIT,future:[]});
  const{comps,wires}=hist.present;
  const push=useCallback(s=>dispatch({type:"PUSH",p:s}),[]);

  const[tool,setTool]=useState("select");
  const[sel,setSel]=useState(null);
  const[wStart,setWStart]=useState(null);
  const[mouse,setMouse]=useState({x:0,y:0});
  const[drag,setDrag]=useState(null);
  const[zoom,setZoom]=useState(1);
  const[pan,setPan]=useState({x:0,y:0});
  const[running,setRunning]=useState(false);
  const[snap,setSnap]=useState(true);
  const[ortho,setOrtho]=useState(false);
  const[viewMode,setViewMode]=useState("3d");
  const[paletteFilter,setPaletteFilter]=useState("");
  const[sd,setSd]=useState(null);
  const[tick,setTick]=useState(0);
  const[status,_setS]=useState("Selecione ferramenta → clique no canvas");
  const setStatus=useCallback(m=>{_setS(m);setTimeout(()=>_setS("Pronto"),3000);},[]);
  const[wireColor,setWireColor]=useState("#38bdf8");
  const fileRef=useRef();

  const selComp=comps.find(c=>c.id===sel);
  const selWire=wires.find(w=>w.id===sel);
  const mod=MODS_ALL.find(m=>m.id===modId);
  const filteredLib=useMemo(()=>{
    const q=paletteFilter.trim().toLowerCase();
    if(!q) return lib;
    return lib.filter(l=>`${l.lbl} ${l.sym} ${l.tip} ${l.k}`.toLowerCase().includes(q));
  },[lib,paletteFilter]);

  useEffect(()=>{if(running){const f=()=>{tickRef.current++;setTick(t=>t+1);animRef.current=requestAnimationFrame(f);};animRef.current=requestAnimationFrame(f);}else cancelAnimationFrame(animRef.current);return()=>cancelAnimationFrame(animRef.current);},[running]);
  useEffect(()=>{const cv=cvRef.current;if(!cv)return;const ro=new ResizeObserver(()=>{cv.width=cv.parentElement.offsetWidth;cv.height=cv.parentElement.offsetHeight;});ro.observe(cv.parentElement);return()=>ro.disconnect();},[]);

  useEffect(()=>{
    const cv=cvRef.current;if(!cv)return;
    const ctx=cv.getContext("2d"),W=cv.width,H=cv.height;
    ctx.clearRect(0,0,W,H);
    drawGrid(ctx,W,H,pan,zoom);
    ctx.save();ctx.translate(pan.x,pan.y);ctx.scale(zoom,zoom);
    wires.forEach(w=>drawWire(ctx,w,sel===w.id,running,modColor,tickRef.current,viewMode));
    if(wStart&&tool==="wire"){
      let ex=(mouse.x-pan.x)/zoom,ey=(mouse.y-pan.y)/zoom;
      if(ortho){if(Math.abs(ex-wStart.x)>Math.abs(ey-wStart.y))ey=wStart.y;else ex=wStart.x;}
      if(viewMode==="3d"){
        ctx.strokeStyle=hexToRgba(wireColor,0.22);ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(wStart.x+1.5,wStart.y+2);ctx.lineTo(ex+1.5,ey+2);ctx.stroke();
      }
      ctx.strokeStyle=wireColor;ctx.lineWidth=2.2;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(wStart.x,wStart.y);ctx.lineTo(ex,ey);ctx.stroke();ctx.setLineDash([]);
    }
    comps.forEach(c=>{
      let liveData=sd?.live?.byComp?.[c.id]||null;
      if(running){
        const t=tickRef.current;
        if(["cyl","cylse","cylh"].includes(c.t)){
          const period=120,raw=(t%period)/period;
          const pct=raw<0.5?raw*2:2-raw*2;
          liveData={...(liveData||{}),pct};
        }
        if(["osc","enc","servo","flowin","psu"].includes(c.t)) liveData={...(liveData||{}),tick:t};
        if(c.t==="mtr"&&sd?.live){
          const modes=["V","mA","Ω","AC"];const mode=modes[(c.mmode||0)%4];
          let mVal=0.5;
          if(mode==="V")mVal=Math.min(1,sd.live.totalV/24);
          else if(mode==="mA")mVal=Math.min(1,(sd.live.totalI||0)*100);
          else if(mode==="Ω")mVal=0.3;
          else mVal=0.5+Math.sin(t*0.08)*0.3;
          liveData={...(liveData||{}),pct:Math.max(0,Math.min(1,mVal))};
        }
        if(["manm","prs","propv","preg"].includes(c.t)) liveData={...(liveData||{}),pct:0.6+Math.sin(t*0.05)*0.1};
        if(c.t==="watt"&&sd?.live) liveData={...(liveData||{}),pct:Math.min(1,sd.live.totalV*sd.live.totalI/100||0.5)};
      }
      drawComp(ctx,c,sel===c.id,liveData,modColor,viewMode);
    });
    ctx.restore();
  },[comps,wires,sel,wStart,mouse,zoom,pan,tick,sd,running,modColor,tool,ortho,wireColor,viewMode]);

  const toW=useCallback((cx,cy)=>{const x=(cx-pan.x)/zoom,y=(cy-pan.y)/zoom;return snap?{x:SN(x),y:SN(y)}:{x:Math.round(x),y:Math.round(y)};},[pan,zoom,snap]);
  const hitComp=useCallback((wx,wy)=>comps.find(c=>Math.abs(c.x-wx)<G&&Math.abs(c.y-wy)<G),[comps]);
  const hitWire=useCallback((wx,wy)=>wires.find(w=>{const dx=w.x2-w.x1,dy=w.y2-w.y1,len=Math.sqrt(dx*dx+dy*dy);if(len===0)return false;const t=((wx-w.x1)*dx+(wy-w.y1)*dy)/(len*len),tc=Math.max(0,Math.min(1,t)),dist=Math.sqrt((wx-(w.x1+tc*dx))**2+(wy-(w.y1+tc*dy))**2);return dist<10/zoom;}),[wires,zoom]);

  const onWheel=useCallback(e=>{e.preventDefault();const rect=cvRef.current.getBoundingClientRect(),cx=e.clientX-rect.left,cy=e.clientY-rect.top,f=e.deltaY<0?1.12:0.9,nz=Math.min(5,Math.max(0.1,zoom*f));setPan(p=>({x:cx-(cx-p.x)*(nz/zoom),y:cy-(cy-p.y)*(nz/zoom)}));setZoom(nz);},[zoom]);
  useEffect(()=>{const cv=cvRef.current;if(!cv)return;cv.addEventListener("wheel",onWheel,{passive:false});return()=>cv.removeEventListener("wheel",onWheel);},[onWheel]);

  const onDown=useCallback(e=>{
    const rect=cvRef.current.getBoundingClientRect(),cx=e.clientX-rect.left,cy=e.clientY-rect.top;
    panStart.current={mx:cx,my:cy,px:pan.x,py:pan.y};
    if(e.button===1||e.button===2){isPan.current=true;return;}
    if(e.button!==0)return;
    const pos=toW(cx,cy);
    if(tool==="select"){const h=hitComp(pos.x,pos.y);if(h){setSel(h.id);setDrag(h.id);}else{const hw=hitWire(pos.x,pos.y);if(hw){setSel(hw.id);}else{setSel(null);isPan.current=true;}}return;}
    if(tool==="wire"){if(!wStart){setWStart(pos);setStatus("Clique no destino · ESC para terminar");}else{let ex=pos.x,ey=pos.y;if(ortho){if(Math.abs(ex-wStart.x)>Math.abs(ey-wStart.y))ey=wStart.y;else ex=wStart.x;}push({comps,wires:[...wires,{id:uid(),x1:wStart.x,y1:wStart.y,x2:ex,y2:ey,color:wireColor}]});setWStart({x:ex,y:ey});setStatus("Fio adicionado · ESC para terminar");}return;}
    if(tool==="delete"){const h=hitComp(pos.x,pos.y);if(h){push({comps:comps.filter(c=>c.id!==h.id),wires});setStatus("Componente apagado");return;}const hw=hitWire(pos.x,pos.y);if(hw){push({comps,wires:wires.filter(w=>w.id!==hw.id)});setStatus("Fio apagado");return;}return;}
    const li=lib.find(l=>l.t===tool);
    if(li){const cnt=comps.filter(c=>c.t===tool).length+1;const nm=li.sym.replace(/[^A-Za-z0-9]/g,"").slice(0,3)||li.lbl.slice(0,2);push({comps:[...comps,{id:uid(),t:tool,x:pos.x,y:pos.y,v:li.dv,n:`${nm}${cnt}`,r:0}],wires});setStatus(`${nm}${cnt} adicionado`);}
  },[tool,pan,wStart,ortho,comps,wires,push,toW,hitComp,hitWire,lib,setStatus,wireColor]);

  const onMove=useCallback(e=>{const rect=cvRef.current.getBoundingClientRect(),cx=e.clientX-rect.left,cy=e.clientY-rect.top;setMouse({x:cx,y:cy});if(isPan.current){const dx=cx-panStart.current.mx,dy=cy-panStart.current.my;setPan({x:panStart.current.px+dx,y:panStart.current.py+dy});return;}if(drag){const pos=toW(cx,cy);dispatch({type:"PUSH",p:{comps:comps.map(c=>c.id===drag?{...c,x:pos.x,y:pos.y}:c),wires}});}},[drag,comps,wires,toW]);
  const onUp=()=>{isPan.current=false;setDrag(null);};
  const onDbl=useCallback(e=>{const rect=cvRef.current.getBoundingClientRect(),pos=toW(e.clientX-rect.left,e.clientY-rect.top),h=hitComp(pos.x,pos.y);if(!h)return;if(["inp","cno","cnf","sw"].includes(h.t)){push({comps:comps.map(c=>c.id===h.id?{...c,v:parseInt(c.v||0)?0:1}:c),wires});}else if(h.t==="mtr"){push({comps:comps.map(c=>c.id===h.id?{...c,mmode:((c.mmode||0)+1)%4}:c),wires});}else{setSel(h.id);}},[toW,hitComp,comps,wires,push]);

  const doRot=useCallback(delta=>{if(!sel)return;push({comps:comps.map(c=>c.id===sel?{...c,r:(((c.r||0)+delta)%360+360)%360}:c),wires});},[sel,comps,wires,push]);
  const duplicateSelected=useCallback(()=>{
    if(!selComp) return;
    const base=selComp.n||selComp.t.toUpperCase();
    let name=`${base}_copy`;
    let idx=2;
    while(comps.some(c=>c.n===name)) name=`${base}_copy${idx++}`;
    const clone={...selComp,id:uid(),x:selComp.x+G,y:selComp.y+G,n:name};
    push({comps:[...comps,clone],wires});
    setSel(clone.id);
    setStatus(`${name} duplicado`);
  },[selComp,comps,wires,push,setStatus]);
  const calc=useCallback(()=>{const s=solve(modId,comps,wires);setSd(s);setStatus(s.ok?"✅ Calculado":"⚠️ Verifique o circuito");},[modId,comps,wires,setStatus]);
  const toggleSim=useCallback(()=>{setRunning(r=>{if(!r){const s=solve(modId,comps,wires);setSd(s);}return!r;});},[modId,comps,wires]);
  const clearAll=()=>{if(window.confirm("Limpar circuito?")){ dispatch({type:"RESET",p:INIT});setSd(null);setSel(null);}};
  const exportPNG=()=>{const cv=cvRef.current;if(!cv)return;const a=document.createElement("a");a.href=cv.toDataURL("image/png");a.download=`techsim_${modId}_${viewMode}_${Date.now()}.png`;a.click();setStatus("🖼 PNG exportado");};
  const saveJSON=()=>{const d=JSON.stringify({version:"2.0",modId,viewMode,comps,wires},null,2),a=document.createElement("a");a.href="data:application/json;charset=utf-8,"+encodeURIComponent(d);a.download=`techsim_${modId}_${Date.now()}.json`;a.click();};
  const loadJSON=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{try{const d=JSON.parse(ev.target.result);dispatch({type:"RESET",p:{comps:d.comps||[],wires:d.wires||[]}});if(d.viewMode)setViewMode(d.viewMode);setSd(null);setStatus("📂 Projeto carregado");}catch{setStatus("❌ Arquivo inválido");}};r.readAsText(f);e.target.value="";};
  const autoLayout=()=>{push({comps:comps.map((c,i)=>({...c,x:G*3+Math.floor(i%5)*G*3,y:G*3+Math.floor(i/5)*G*3})),wires:[]});setStatus("✨ Layout aplicado");};
  const fitView=useCallback(()=>{
    const cv=cvRef.current;
    if(!cv||(!comps.length&&!wires.length)){setZoom(1);setPan({x:0,y:0});setStatus("Vista centralizada");return;}
    const xs=[...comps.flatMap(c=>[c.x-64,c.x+64]),...wires.flatMap(w=>[w.x1,w.x2])];
    const ys=[...comps.flatMap(c=>[c.y-64,c.y+64]),...wires.flatMap(w=>[w.y1,w.y2])];
    const minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    const spanX=Math.max(200,maxX-minX+160),spanY=Math.max(200,maxY-minY+160);
    const nz=Math.min(2.2,Math.max(0.18,Math.min(cv.width/spanX,cv.height/spanY)));
    const cx=(minX+maxX)/2,cy=(minY+maxY)/2;
    setZoom(nz);
    setPan({x:cv.width/2-cx*nz,y:cv.height/2-cy*nz});
    setStatus("◎ Área ajustada ao projeto");
  },[comps,wires,setStatus]);

  useEffect(()=>{
    const f=e=>{
      if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA")return;
      const ctrl=e.ctrlKey||e.metaKey;
      if(ctrl&&e.key==="z"){e.preventDefault();dispatch({type:"UNDO"});}
      else if(ctrl&&(e.key==="y")){e.preventDefault();dispatch({type:"REDO"});}
      else if(ctrl&&e.key.toLowerCase()==="s"){e.preventDefault();saveJSON();}
      else if(ctrl&&e.key.toLowerCase()==="o"){e.preventDefault();fileRef.current?.click();}
      else if(ctrl&&e.key.toLowerCase()==="d"&&selComp){e.preventDefault();duplicateSelected();}
      else if(ctrl&&e.key==="ArrowRight"){e.preventDefault();doRot(90);}
      else if(ctrl&&e.key==="ArrowLeft"){e.preventDefault();doRot(-90);}
      else if(e.key==="F9"){e.preventDefault();calc();}
      else if(e.key==="F5"){e.preventDefault();toggleSim();}
      else if(e.key==="Delete"&&sel){push({comps:comps.filter(c=>c.id!==sel),wires:wires.filter(w=>w.id!==sel)});setSel(null);}
      else if(e.key==="Escape"){setWStart(null);setSel(null);}
      else if(!ctrl&&!e.altKey){
        if(e.key==="2")setViewMode("2d");
        else if(e.key==="3")setViewMode("3d");
        else if(e.key==="s"||e.key==="S")setTool("select");
        else if(e.key==="w"||e.key==="W")setTool("wire");
        else if(e.key==="d"||e.key==="D")setTool("delete");
        else{const l=lib.find(l=>l.k===e.key.toUpperCase());if(l)setTool(l.t);}
      }
    };
    window.addEventListener("keydown",f);return()=>window.removeEventListener("keydown",f);
  },[sel,selComp,comps,wires,push,lib,doRot,calc,toggleSim,duplicateSelected]);

  const TOOL_BTNS=[
    {t:"select",lbl:"Selecionar",sym:TOOL_GLYPHS.select,col:"#fb7185",k:"S",tip:"Selecionar/mover [S]"},
    {t:"wire",  lbl:"Conectar", sym:TOOL_GLYPHS.wire,col:"#94a3b8",k:"W",tip:"Traçar fio [W]"},
    {t:"delete",lbl:"Excluir",  sym:TOOL_GLYPHS.delete,col:"#f87171",k:"D",tip:"Apagar comp/fio [D]"},
  ];

  return(
    <div style={{display:"flex",flex:1,overflow:"hidden",height:"100%",fontFamily:"'Courier New','Consolas',monospace"}}>
      <div style={{width:120,background:"#040d18",borderRight:"1px solid #1e293b",display:"flex",flexDirection:"column",padding:"8px 6px",gap:6,overflowY:"auto",flexShrink:0}}>
        <div style={{fontSize:7,color:"#1e3a5f",textAlign:"center",letterSpacing:2,padding:"2px 0"}}>TOOLS</div>
        {TOOL_BTNS.map(x=>(
          <button key={x.t} onClick={()=>setTool(x.t)} title={x.tip} style={{background:tool===x.t?`${x.col}18`:"#050e1a",border:`1px solid ${tool===x.t?x.col:"#1e293b"}`,color:tool===x.t?x.col:"#334155",borderRadius:8,padding:"6px 4px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,fontFamily:"inherit",boxShadow:tool===x.t?`0 0 14px ${hexToRgba(x.col,0.18)}`:"inset 0 1px 0 #ffffff08",transition:"all 0.12s"}}>
            <div style={{width:36,height:24,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(180deg, ${hexToRgba(x.col,0.22)}, #071020)`,border:`1px solid ${hexToRgba(x.col,0.28)}`}}>
              <span style={{fontSize:15,fontWeight:700,color:x.col}}>{x.sym}</span>
            </div>
            <span style={{fontSize:7,letterSpacing:0.4}}>{x.lbl}</span>
            <span style={{fontSize:6,color:tool===x.t?x.col:"#475569",border:`1px solid ${tool===x.t?hexToRgba(x.col,0.4):"#1e293b"}`,padding:"1px 5px",borderRadius:99}}>{x.k}</span>
          </button>
        ))}
        <div style={{height:1,background:"#1e293b",margin:"2px 2px"}}/>
        <div style={{fontSize:7,color:"#1e3a5f",textAlign:"center",letterSpacing:2,padding:"2px 0"}}>COMP. {filteredLib.length!==lib.length?`${filteredLib.length}/${lib.length}`:lib.length}</div>
        <input value={paletteFilter} onChange={e=>setPaletteFilter(e.target.value)} placeholder="buscar" style={{background:"#071020",border:"1px solid #1e293b",color:"#cbd5e1",padding:"6px 8px",borderRadius:7,fontSize:10,fontFamily:"inherit",outline:"none"}}/>
        {filteredLib.map(l=>(
          <button key={l.t} onClick={()=>setTool(l.t)} title={`${l.lbl} [${l.k}]`} style={{background:tool===l.t?`${l.col}18`:"#050e1a",border:`1px solid ${tool===l.t?l.col:"#1e293b"}`,color:tool===l.t?l.col:"#334155",borderRadius:8,padding:"6px 4px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,fontFamily:"inherit",boxShadow:tool===l.t?`0 0 12px ${hexToRgba(l.col,0.16)}`:"inset 0 1px 0 #ffffff08",transition:"all 0.1s"}}>
            <div style={{width:40,height:24,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(180deg, ${hexToRgba(l.col,0.20)}, #071020)`,border:`1px solid ${hexToRgba(l.col,0.28)}`}}>
              <span style={{fontSize:11,fontWeight:700,color:tool===l.t?l.col:shiftHex(l.col,0.08)}}>{l.sym}</span>
            </div>
            <span style={{fontSize:6.2,textAlign:"center",lineHeight:1.15,color:tool===l.t?l.col:"#94a3b8"}}>{l.lbl}</span>
            <span style={{fontSize:5.8,color:tool===l.t?l.col:"#475569",border:`1px solid ${tool===l.t?hexToRgba(l.col,0.4):"#1e293b"}`,padding:"1px 5px",borderRadius:99}}>{l.k}</span>
          </button>
        ))}
        {!filteredLib.length&&<div style={{fontSize:8,color:"#475569",textAlign:"center",padding:"10px 6px",border:"1px dashed #1e293b",borderRadius:8}}>Sem resultados</div>}
      </div>

      <div style={{flex:1,position:"relative",overflow:"hidden",background:viewMode==="3d"?"radial-gradient(circle at top, #082033 0%, #020b14 55%)":"#020b14"}}>
        <canvas ref={cvRef} style={{display:"block",width:"100%",height:"100%",cursor:isPan.current?"grabbing":drag?"grabbing":tool==="wire"?"crosshair":tool==="delete"?"not-allowed":tool==="select"?"grab":"copy"}} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onDoubleClick={onDbl} onContextMenu={e=>{e.preventDefault();isPan.current=false;}}/>

        <Toolbar tool={tool} setTool={setTool} sel={sel} selComp={selComp} selWire={selWire} modColor={modColor} running={running} snap={snap} ortho={ortho} zoom={zoom} hist={hist} comps={comps} wires={wires} push={push} dispatch={dispatch} setSel={setSel} setSnap={setSnap} setOrtho={setOrtho} setZoom={setZoom} setPan={setPan} doRot={doRot} calc={calc} toggleSim={toggleSim} saveJSON={saveJSON} fileRef={fileRef} clearAll={clearAll} autoLayout={autoLayout} modId={modId} wireColor={wireColor} setWireColor={setWireColor} viewMode={viewMode} setViewMode={setViewMode} exportPNG={exportPNG} duplicateSelected={duplicateSelected} fitView={fitView}/>

        <input ref={fileRef} type="file" accept=".json" onChange={loadJSON} style={{display:"none"}}/>

        <div style={{position:"absolute",bottom:0,left:0,right:0,background:"#040d18cc",borderTop:"1px solid #1e293b",padding:"3px 12px",display:"flex",gap:10,fontSize:8,color:"#334155",alignItems:"center"}}>
          <span style={{color:status.startsWith("✅")?"#22c55e":status.startsWith("⚠️")||status.startsWith("❌")?"#f87171":"#3a5a70",minWidth:220}}>{status}</span>
          <span>C:{comps.length}</span><span>F:{wires.length}</span>
          <span style={{color:viewMode==="3d"?modColor:"#38bdf8"}}>VIEW:{viewMode.toUpperCase()}</span>
          {running&&<span style={{color:"#22c55e"}}>● SIMULANDO</span>}
          <span style={{marginLeft:"auto",opacity:0.5}}>S=Mover W=Fio D=Del 2/3=View Ctrl+D=Duplicar Ctrl+Z/Y F9=Calc F5=Sim ESC=Cancelar</span>
        </div>
      </div>

      <div style={{width:256,background:"#040d18",borderLeft:"1px solid #1e293b",display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"10px 12px",borderBottom:"1px solid #1e293b",flexShrink:0,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:16}}>{mod?.icon}</span>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:modColor,letterSpacing:0.5}}>{mod?.label}</div>
            <div style={{fontSize:8,color:"#334155"}}>{mod?.desc}</div>
          </div>
        </div>
        <PropertiesPanel comp={selComp} lib={lib} modColor={modColor} comps={comps} wires={wires} push={push} setSel={setSel} sd={sd} onCalc={calc} onToggleSim={toggleSim} running={running} hist={hist}/>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// APP SHELL — routing between landing / auth / dashboard / editor

// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function AdminDashboard({user,onBack}){
  const[activeTab,setATab]=useState("overview");
  const[tick,setTick]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setTick(x=>x+1),1200);return()=>clearInterval(t);},[]);

  // Simulated live data
  const liveUsers=142+Math.floor(Math.sin(tick*0.7)*8);
  const activeSessions=37+Math.floor(Math.sin(tick*0.5)*4);
  const totalSims=28847+tick;
  const errRate=(0.8+Math.sin(tick*0.4)*0.3).toFixed(2);
  const serverLoad=(68+Math.sin(tick*0.6)*12).toFixed(0);
  const apiCalls=1284+tick*3;
  const simHistory=[65,72,58,88,95,77,82,91,70,84,93,87];
  const userHistory=[110,118,105,132,148,140,155,162,142,158,170,142+Math.floor(Math.sin(tick*0.7)*8)];
  const maxSim=Math.max(...simHistory);
  const maxUser=Math.max(...userHistory);

  const recentUsers=[
    {name:"Ana Silva",email:"ana@techsim.com",mod:"DC",time:"2min",plan:"PRO"},
    {name:"Carlos M.",email:"carlos@eng.br",mod:"Pneum",time:"8min",plan:"FREE"},
    {name:"Rafaela T.",email:"rafaela@usp.br",mod:"Lógica",time:"15min",plan:"EDU"},
    {name:"Bruno L.",email:"bruno@abc.com",mod:"AC",time:"22min",plan:"PRO"},
    {name:"Isabela R.",email:"isabela@fab.br",mod:"Ladder",time:"31min",plan:"PRO"},
    {name:"Pedro N.",email:"pedro@mec.com",mod:"Hidro",time:"45min",plan:"FREE"},
  ];
  const modules=[
    {id:"dc",icon:MODULE_GLYPHS.dc,label:"DC",sessions:52,col:"#22d3ee"},
    {id:"ac",icon:MODULE_GLYPHS.ac,label:"AC",sessions:38,col:"#f59e0b"},
    {id:"pneum",icon:MODULE_GLYPHS.pneum,label:"Pneum",sessions:31,col:"#a78bfa"},
    {id:"hidro",icon:MODULE_GLYPHS.hidro,label:"Hidro",sessions:18,col:"#38bdf8"},
    {id:"logic",icon:MODULE_GLYPHS.logic,label:"Lógica",sessions:29,col:"#4ade80"},
    {id:"cmd",icon:MODULE_GLYPHS.cmd,label:"Cmds",sessions:22,col:"#fb923c"},
    {id:"install",icon:MODULE_GLYPHS.install,label:"Instal",sessions:14,col:"#f43f5e"},
    {id:"ladder",icon:MODULE_GLYPHS.ladder,label:"Ladder",sessions:20,col:"#c084fc"},
  ];
  const totalSessions=modules.reduce((s,m)=>s+m.sessions,0);
  const systemEvents=[
    {t:"02:14",type:"OK",msg:"Backup automático concluído — 284MB"},
    {t:"01:55",type:"WARN",msg:"CPU pico 94% — 3 simulações simultâneas"},
    {t:"01:30",type:"OK",msg:"Deploy v3.2.1 — zero downtime"},
    {t:"00:48",type:"INFO",msg:"Novo usuário EDU: prof.joao@ufmg.br"},
    {t:"00:12",type:"ERROR",msg:"Timeout simulação #4421 (user: carlos@eng.br)"},
  ];
  const planDist=[{plan:"FREE",n:89,col:"#334155"},{plan:"EDU",n:31,col:"#4ade80"},{plan:"PRO",n:22,col:"#22d3ee"}];
  const planTotal=planDist.reduce((s,p)=>s+p.n,0);

  const grd=`repeating-linear-gradient(#22d3ee06 0,#22d3ee06 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,#22d3ee06 0,#22d3ee06 1px,transparent 1px,transparent 48px)`;
  const T=(t,b)=>({color:t,borderBottom:`2px solid ${activeTab===b?t:"transparent"}`,background:activeTab===b?t+"15":"transparent",padding:"8px 18px",cursor:"pointer",fontSize:9,letterSpacing:2,fontFamily:"inherit",fontWeight:700,border:`none`,borderRadius:"6px 6px 0 0",transition:"all 0.18s"});
  const statCard=(icon,label,val,unit,col,delta)=>(
    <div style={{background:"#040d18",border:`1px solid ${col}33`,borderRadius:10,padding:"16px 18px",position:"relative",overflow:"hidden",flex:"1 1 0"}}>
      <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:`radial-gradient(${col}18,transparent 70%)`}}/>
      <div style={{fontSize:18,marginBottom:6}}>{icon}</div>
      <div style={{fontSize:8,color:"#334155",letterSpacing:3,marginBottom:4}}>{label}</div>
      <div style={{fontSize:22,fontWeight:700,color:col,fontFamily:"monospace"}}>{val}</div>
      <div style={{fontSize:8,color:"#475569",marginTop:3}}>{unit}</div>
      {delta&&<div style={{position:"absolute",top:14,right:14,fontSize:8,color:parseFloat(delta)>=0?"#22c55e":"#f87171",background:parseFloat(delta)>=0?"#22c55e18":"#f8717118",padding:"2px 6px",borderRadius:4}}>{parseFloat(delta)>=0?"↑":"↓"} {delta}</div>}
    </div>
  );
  const miniBar=(val,max,col)=>{
    const pct=Math.min(1,val/max);
    return <div style={{height:3,borderRadius:2,background:"#0d1e2e",overflow:"hidden",marginTop:4}}>
      <div style={{height:"100%",width:`${pct*100}%`,background:col,borderRadius:2,transition:"width 0.5s"}}/>
    </div>;
  };
  const eventCol={OK:"#22c55e",WARN:"#f59e0b",ERROR:"#f87171",INFO:"#38bdf8"};

  const miniLineChart=(data,maxV,col,h=40,w=160)=>{
    const pts=data.map((v,i)=>`${i/(data.length-1)*w},${h-(v/maxV)*h}`).join(" ");
    return <svg width={w} height={h} style={{overflow:"visible"}}>
      <defs>
        <linearGradient id={`lg${col.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={col} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={col} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#lg${col.replace("#","")})`}/>
      <polyline points={pts} fill="none" stroke={col} strokeWidth="2" strokeLinejoin="round"/>
      <circle cx={(data.length-1)/(data.length-1)*w} cy={h-(data[data.length-1]/maxV)*h} r="3" fill={col}/>
    </svg>;
  };

  return(
    <div style={{minHeight:"100vh",background:"#020b14",fontFamily:"'Courier New',Consolas,monospace",color:"#e2e8f0",backgroundImage:grd}}>
      {/* Top bar */}
      <nav style={{position:"sticky",top:0,zIndex:100,height:56,background:"#010912ee",backdropFilter:"blur(14px)",borderBottom:"1px solid #1e3a5f44",display:"flex",alignItems:"center",padding:"0 28px",gap:14}}>
        <button onClick={onBack} style={{background:"transparent",border:"1px solid #1e3a5f",color:"#475569",padding:"5px 12px",borderRadius:5,cursor:"pointer",fontSize:9,letterSpacing:1.5,fontFamily:"inherit"}}>← USUÁRIO</button>
        <div style={{width:1,height:24,background:"#1e3a5f"}}/>
        <span style={{fontSize:14,color:"#f43f5e",filter:"drop-shadow(0 0 8px #f43f5e)"}}>🔐</span>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:"#f43f5e",letterSpacing:2.5}}>TECHSIM ADMIN</div>
          <div style={{fontSize:7,color:"#334155",letterSpacing:3}}>PAINEL DE CONTROLE</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:12,alignItems:"center"}}>
          {/* Live indicator */}
          <div style={{display:"flex",alignItems:"center",gap:6,background:"#22c55e18",border:"1px solid #22c55e33",borderRadius:12,padding:"4px 12px"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 8px #22c55e",animation:"pulse 1.5s infinite"}}/>
            <span style={{fontSize:8,color:"#22c55e",letterSpacing:2}}>LIVE</span>
          </div>
          <div style={{width:30,height:30,borderRadius:6,background:"#f43f5e22",border:"1px solid #f43f5e44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>👤</div>
          <div style={{fontSize:10,color:"#94a3b8"}}>{user?.name||"Admin"}</div>
        </div>
      </nav>

      <div style={{padding:"24px 28px",maxWidth:1400,margin:"0 auto"}}>

        {/* TABS */}
        <div style={{display:"flex",gap:2,marginBottom:24,borderBottom:"1px solid #1e3a5f"}}>
          {[["overview","VISÃO GERAL"],["users","USUÁRIOS"],["modules","MÓDULOS"],["system","SISTEMA"],["logs","LOGS"]].map(([t,l])=>(
            <button key={t} onClick={()=>setATab(t)} style={T("#f43f5e",t)}>{l}</button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ────────────────── */}
        {activeTab==="overview"&&(
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            {/* Top stat cards */}
            <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
              {statCard("👥","USUÁRIOS ATIVOS",liveUsers,"online agora","#22d3ee","+5.2%")}
              {statCard("🖥","SESSÕES",activeSessions,"em andamento","#4ade80","+2")}
              {statCard("⚡","SIMULAÇÕES","28,8K","total acumulado","#f59e0b","+12%")}
              {statCard("⚠️","TAXA ERRO",`${errRate}%`,"últimas 24h","#f87171","+0.1")}
              {statCard("💽","CPU SERVER",`${serverLoad}%`,"carga atual","#a78bfa",null)}
              {statCard("📡","API CALLS",`${apiCalls.toLocaleString()}`,"esta sessão","#38bdf8","+3/s")}
            </div>

            {/* Charts row */}
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:14}}>
              {/* Simulations chart */}
              <div style={{background:"#040d18",border:"1px solid #1e3a5f",borderRadius:10,padding:"18px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <div>
                    <div style={{fontSize:8,color:"#334155",letterSpacing:3,marginBottom:4}}>SIMULAÇÕES / HORA</div>
                    <div style={{fontSize:18,fontWeight:700,color:"#f59e0b"}}>{simHistory[simHistory.length-1]}</div>
                  </div>
                  <div style={{fontSize:8,color:"#4ade80",background:"#4ade8018",padding:"3px 8px",borderRadius:4,border:"1px solid #4ade8033"}}>▲ 14%</div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"flex-end",height:70}}>
                  {simHistory.map((v,i)=>(
                    <div key={i} style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-end",height:"100%"}}>
                      <div style={{background:i===simHistory.length-1?"#f59e0b":i>=simHistory.length-3?"#f59e0b66":"#1e3a5f",borderRadius:"3px 3px 0 0",height:`${(v/maxSim)*100}%`,transition:"height 0.5s"}}/>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                  {["12h","11h","10h","9h","8h","7h","6h","5h","4h","3h","2h","1h"].map(h=>(
                    <div key={h} style={{fontSize:5,color:"#1e3a5f",flex:1,textAlign:"center"}}>{h}</div>
                  ))}
                </div>
              </div>

              {/* Active users module breakdown */}
              <div style={{background:"#040d18",border:"1px solid #1e3a5f",borderRadius:10,padding:"18px 20px"}}>
                <div style={{fontSize:8,color:"#334155",letterSpacing:3,marginBottom:12}}>POR MÓDULO</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {modules.slice(0,5).map(m=>(
                    <div key={m.id}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                        <span style={{fontSize:8,color:"#94a3b8"}}>{m.icon} {m.label}</span>
                        <span style={{fontSize:8,color:m.col}}>{m.sessions}</span>
                      </div>
                      {miniBar(m.sessions,totalSessions*0.55,m.col)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan distribution */}
              <div style={{background:"#040d18",border:"1px solid #1e3a5f",borderRadius:10,padding:"18px 20px"}}>
                <div style={{fontSize:8,color:"#334155",letterSpacing:3,marginBottom:12}}>PLANOS</div>
                <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
                  <svg width={100} height={100} viewBox="-50 -50 100 100">
                    {planDist.reduce((acc,p,i)=>{
                      const pct=p.n/planTotal;
                      const startA=acc.start;
                      const endA=startA+pct*2*Math.PI;
                      const x1=Math.cos(startA-Math.PI/2)*38,y1=Math.sin(startA-Math.PI/2)*38;
                      const x2=Math.cos(endA-Math.PI/2)*38,y2=Math.sin(endA-Math.PI/2)*38;
                      const large=pct>0.5?1:0;
                      acc.els.push(<path key={i} d={`M 0 0 L ${x1} ${y1} A 38 38 0 ${large} 1 ${x2} ${y2} Z`} fill={p.col} opacity="0.8"/>);
                      acc.start=endA;return acc;
                    },{start:0,els:[]}).els}
                    <circle r={22} fill="#040d18"/>
                    <text textAnchor="middle" dy="4" fontSize="9" fill="#e2e8f0" fontFamily="monospace" fontWeight="bold">{planTotal}</text>
                  </svg>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  {planDist.map(p=>(
                    <div key={p.plan} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <div style={{width:7,height:7,borderRadius:2,background:p.col}}/>
                        <span style={{fontSize:9,color:"#94a3b8"}}>{p.plan}</span>
                      </div>
                      <span style={{fontSize:9,color:p.col,fontWeight:700}}>{p.n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* User activity trend + system events */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {/* User trend */}
              <div style={{background:"#040d18",border:"1px solid #1e3a5f",borderRadius:10,padding:"18px 20px"}}>
                <div style={{fontSize:8,color:"#334155",letterSpacing:3,marginBottom:4}}>CRESCIMENTO DE USUÁRIOS</div>
                <div style={{fontSize:18,fontWeight:700,color:"#22d3ee",marginBottom:12}}>{userHistory[userHistory.length-1]} usuários</div>
                {miniLineChart(userHistory,maxUser*1.1,"#22d3ee",60,300)}
              </div>
              {/* Recent events */}
              <div style={{background:"#040d18",border:"1px solid #1e3a5f",borderRadius:10,padding:"18px 20px"}}>
                <div style={{fontSize:8,color:"#334155",letterSpacing:3,marginBottom:12}}>EVENTOS RECENTES</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {systemEvents.map((e,i)=>(
                    <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"6px 8px",background:`${eventCol[e.type]}0a`,borderRadius:4,border:`1px solid ${eventCol[e.type]}22`}}>
                      <span style={{fontSize:8,color:eventCol[e.type],fontWeight:700,whiteSpace:"nowrap"}}>{e.t}</span>
                      <span style={{fontSize:7,background:eventCol[e.type]+"22",color:eventCol[e.type],padding:"1px 5px",borderRadius:3,letterSpacing:1,flexShrink:0}}>{e.type}</span>
                      <span style={{fontSize:8,color:"#475569",lineHeight:1.4}}>{e.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── USERS TAB ───────────────────── */}
        {activeTab==="users"&&(
          <div>
            {/* Search / actions bar */}
            <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:20}}>
              <input placeholder="🔍  Buscar usuário..." style={{flex:1,background:"#040d18",border:"1px solid #1e3a5f",color:"#94a3b8",padding:"10px 16px",borderRadius:6,fontSize:10,fontFamily:"inherit",outline:"none"}}/>
              <select style={{background:"#040d18",border:"1px solid #1e3a5f",color:"#94a3b8",padding:"10px 14px",borderRadius:6,fontSize:10,fontFamily:"inherit"}}>
                <option>Todos os planos</option><option>FREE</option><option>PRO</option><option>EDU</option>
              </select>
              <button style={{background:"linear-gradient(135deg,#f43f5e,#e11d48)",border:"none",color:"#fff",padding:"10px 20px",borderRadius:6,cursor:"pointer",fontSize:9,fontWeight:700,letterSpacing:1.5,fontFamily:"inherit"}}>+ NOVO USUÁRIO</button>
            </div>
            {/* Users table */}
            <div style={{background:"#040d18",border:"1px solid #1e3a5f",borderRadius:10,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr 1fr 1fr 1fr",gap:0,borderBottom:"1px solid #1e3a5f",padding:"10px 18px"}}>
                {["USUÁRIO","E-MAIL","PLANO","MÓDULO ATIVO","ONLINE","AÇÕES"].map(h=>(
                  <div key={h} style={{fontSize:7,color:"#334155",letterSpacing:2,fontWeight:700}}>{h}</div>
                ))}
              </div>
              {recentUsers.map((u,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr 1fr 1fr 1fr",gap:0,borderBottom:"1px solid #0d1e2e",padding:"12px 18px",transition:"background 0.12s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#071020"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:26,height:26,borderRadius:6,background:"#f43f5e22",border:"1px solid #f43f5e44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#f43f5e",flexShrink:0}}>{u.name[0]}</div>
                    <span style={{fontSize:10,color:"#94a3b8"}}>{u.name}</span>
                  </div>
                  <div style={{fontSize:9,color:"#475569",alignSelf:"center"}}>{u.email}</div>
                  <div style={{alignSelf:"center"}}>
                    <span style={{fontSize:8,background:u.plan==="PRO"?"#22d3ee18":u.plan==="EDU"?"#4ade8018":"#33415518",color:u.plan==="PRO"?"#22d3ee":u.plan==="EDU"?"#4ade80":"#64748b",padding:"3px 8px",borderRadius:4,border:`1px solid ${u.plan==="PRO"?"#22d3ee33":u.plan==="EDU"?"#4ade8033":"#33415533"}`,letterSpacing:1}}>{u.plan}</span>
                  </div>
                  <div style={{fontSize:9,color:"#94a3b8",alignSelf:"center"}}>{u.mod}</div>
                  <div style={{display:"flex",alignItems:"center",gap:4,alignSelf:"center"}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:"#22c55e"}}/>
                    <span style={{fontSize:8,color:"#22c55e"}}>{u.time} atrás</span>
                  </div>
                  <div style={{display:"flex",gap:6,alignSelf:"center"}}>
                    <button style={{background:"transparent",border:"1px solid #1e3a5f",color:"#475569",padding:"3px 8px",borderRadius:3,cursor:"pointer",fontSize:8,fontFamily:"inherit"}}>Ver</button>
                    <button style={{background:"transparent",border:"1px solid #f8717133",color:"#f87171",padding:"3px 8px",borderRadius:3,cursor:"pointer",fontSize:8,fontFamily:"inherit"}}>Ban</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:8,color:"#334155"}}>Mostrando 6 de 142 usuários</span>
              <div style={{display:"flex",gap:4}}>
                {[1,2,3,"...","24"].map((p,i)=>(
                  <button key={i} style={{background:p===1?"#f43f5e22":"transparent",border:`1px solid ${p===1?"#f43f5e44":"#1e3a5f"}`,color:p===1?"#f43f5e":"#334155",width:26,height:26,borderRadius:4,cursor:"pointer",fontSize:8,fontFamily:"inherit"}}>{p}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── MODULES TAB ─────────────────── */}
        {activeTab==="modules"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
              {modules.map(m=>(
                <div key={m.id} style={{background:"#040d18",border:`1px solid ${m.col}33`,borderRadius:10,padding:"20px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:36,height:36,borderRadius:8,background:`${m.col}22`,border:`1px solid ${m.col}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{m.icon}</div>
                      <div>
                        <div style={{fontSize:11,fontWeight:700,color:m.col,letterSpacing:0.5}}>{m.label}</div>
                        <div style={{fontSize:8,color:"#334155"}}>{m.sessions} sessões ativas</div>
                      </div>
                    </div>
                    <div style={{fontSize:14,fontWeight:700,color:m.col}}>{Math.round(m.sessions/totalSessions*100)}%</div>
                  </div>
                  {/* Usage bar */}
                  <div style={{height:6,borderRadius:3,background:"#0d1e2e",overflow:"hidden",marginBottom:10}}>
                    <div style={{height:"100%",width:`${m.sessions/totalSessions*100*2}%`,background:`linear-gradient(90deg,${m.col}aa,${m.col})`,borderRadius:3,maxWidth:"100%"}}/>
                  </div>
                  {/* Mini stats */}
                  <div style={{display:"flex",gap:10}}>
                    {[["Hoje",m.sessions*8],[`Semana`,m.sessions*52],["Erros",`${(Math.random()*2).toFixed(1)}%`]].map(([lbl,val])=>(
                      <div key={lbl} style={{flex:1,background:"#071020",borderRadius:4,padding:"6px 8px",textAlign:"center"}}>
                        <div style={{fontSize:7,color:"#334155",letterSpacing:1,marginBottom:2}}>{lbl}</div>
                        <div style={{fontSize:10,color:m.col,fontWeight:700}}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SYSTEM TAB ──────────────────── */}
        {activeTab==="system"&&(
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            {/* Server health */}
            <div style={{background:"#040d18",border:"1px solid #1e3a5f",borderRadius:10,padding:"20px"}}>
              <div style={{fontSize:8,color:"#334155",letterSpacing:3,marginBottom:16}}>SAÚDE DO SERVIDOR</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
                {[
                  {label:"CPU",val:serverLoad,unit:"%",max:100,col:parseInt(serverLoad)>80?"#f87171":"#22d3ee"},
                  {label:"RAM",val:58,unit:"%",max:100,col:"#4ade80"},
                  {label:"DISCO",val:34,unit:"%",max:100,col:"#f59e0b"},
                  {label:"REDE",val:12,unit:"Mbps",max:100,col:"#a78bfa"},
                ].map(m=>(
                  <div key={m.label} style={{background:"#071020",borderRadius:8,padding:"14px",textAlign:"center"}}>
                    <div style={{fontSize:8,color:"#334155",letterSpacing:2,marginBottom:8}}>{m.label}</div>
                    {/* Radial gauge */}
                    <svg width={80} height={50} style={{margin:"0 auto",display:"block"}}>
                      <path d="M 10 45 A 30 30 0 0 1 70 45" fill="none" stroke="#0d1e2e" strokeWidth="6" strokeLinecap="round"/>
                      <path d={`M 10 45 A 30 30 0 0 1 ${10+60*parseFloat(m.val)/m.max*0.9} ${45-Math.sin(Math.PI*parseFloat(m.val)/m.max*0.9)*30}`} fill="none" stroke={m.col} strokeWidth="6" strokeLinecap="round"/>
                      <text x="40" y="42" textAnchor="middle" fontSize="11" fill={m.col} fontFamily="monospace" fontWeight="bold">{m.val}</text>
                      <text x="40" y="50" textAnchor="middle" fontSize="6" fill="#334155" fontFamily="monospace">{m.unit}</text>
                    </svg>
                  </div>
                ))}
              </div>
            </div>
            {/* Performance metrics */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div style={{background:"#040d18",border:"1px solid #1e3a5f",borderRadius:10,padding:"20px"}}>
                <div style={{fontSize:8,color:"#334155",letterSpacing:3,marginBottom:12}}>TEMPOS DE RESPOSTA (ms)</div>
                {[["API /simulate","48ms","#22c55e"],["API /save","23ms","#22c55e"],["API /auth","15ms","#22c55e"],["WebSocket","8ms","#22c55e"],["DB Query","12ms","#22c55e"]].map(([ep,t,col])=>(
                  <div key={ep} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #0d1e2e"}}>
                    <span style={{fontSize:9,color:"#475569",fontFamily:"monospace"}}>{ep}</span>
                    <span style={{fontSize:9,color:col,fontWeight:700}}>{t}</span>
                  </div>
                ))}
              </div>
              <div style={{background:"#040d18",border:"1px solid #1e3a5f",borderRadius:10,padding:"20px"}}>
                <div style={{fontSize:8,color:"#334155",letterSpacing:3,marginBottom:12}}>VERSÃO DO SISTEMA</div>
                {[["TechSim Frontend","v3.2.1","#22d3ee"],["API Server","v2.8.0","#4ade80"],["WebSocket","v1.4.2","#4ade80"],["Banco de Dados","PostgreSQL 15","#f59e0b"],["Cache","Redis 7.2","#f59e0b"],["Node.js","v20.11.0","#22c55e"]].map(([k,v2,col])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #0d1e2e"}}>
                    <span style={{fontSize:9,color:"#475569"}}>{k}</span>
                    <span style={{fontSize:9,color:col,fontFamily:"monospace"}}>{v2}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── LOGS TAB ────────────────────── */}
        {activeTab==="logs"&&(
          <div>
            <div style={{display:"flex",gap:8,marginBottom:14,alignItems:"center"}}>
              {["ALL","ERROR","WARN","INFO","OK"].map(l=>(
                <button key={l} style={{background:l==="ALL"?"#f43f5e22":"transparent",border:`1px solid ${l==="ALL"?"#f43f5e44":"#1e3a5f"}`,color:l==="ALL"?"#f43f5e":"#334155",padding:"4px 12px",borderRadius:4,cursor:"pointer",fontSize:8,fontFamily:"inherit",letterSpacing:1}}>{l}</button>
              ))}
              <div style={{marginLeft:"auto",fontSize:8,color:"#334155"}}>● Auto-atualizar</div>
            </div>
            <div style={{background:"#020b14",border:"1px solid #1e3a5f",borderRadius:8,padding:"14px",fontFamily:"monospace",fontSize:9,maxHeight:460,overflowY:"auto"}}>
              {[
                ["02:14:32","INFO","[AUTH] Login: ana@techsim.com — 192.168.1.45"],
                ["02:14:28","OK","[SIM] Simulação DC #4847 concluída — 12ms"],
                ["02:14:15","OK","[SAVE] Projeto salvo: user#892 pneum_circuit_v3.json"],
                ["02:13:55","WARN","[SIM] Timeout detectado: AC #4845 — retry 1/3"],
                ["02:13:50","OK","[AUTH] Novo registro: carlos@eng.br — plano FREE"],
                ["02:13:21","ERROR","[SIM] Erro convergência: circuito lógico malformado — user#721"],
                ["02:13:10","OK","[API] GET /modules — 142 req/s"],
                ["02:12:48","INFO","[ADMIN] Export CSV usuários — admin@techsim.com"],
                ["02:12:30","OK","[CACHE] Redis flush — 2840 chaves expiradas"],
                ["02:12:10","WARN","[DB] Query lenta: 248ms — simulations.findAll()"],
                ["02:11:55","OK","[SIM] Simulação Ladder #4842 concluída — 8ms"],
                ["02:11:33","INFO","[WEBSOCKET] 37 conexões ativas"],
                ["02:11:12","OK","[API] POST /simulate/pneum — 23ms"],
                ["02:10:55","ERROR","[SIM] Divisão por zero: resistência=0 — user#511"],
                ["02:10:30","OK","[BACKUP] Snapshot automático — 284MB — S3 OK"],
              ].map(([time,level,msg],i)=>(
                <div key={i} style={{display:"flex",gap:14,padding:"3px 0",borderBottom:"1px solid #0a1828"}}>
                  <span style={{color:"#334155",minWidth:70}}>{time}</span>
                  <span style={{color:eventCol[level]||"#94a3b8",minWidth:50,fontWeight:700}}>[{level}]</span>
                  <span style={{color:"#475569"}}>{msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function App(){
  const[page,setPage]=useState("landing"); // landing | dashboard | editor | admin
  const[auth,setAuth]=useState(null);
  const[user,setUser]=useState(null);
  const[activeModule,setActiveModule]=useState("dc");

  const mod=MODS_ALL.find(m=>m.id===activeModule);

  const handleLogin=(u)=>{setUser(u);setAuth(null);setPage("dashboard");};
  const handleLogout=()=>{setUser(null);setPage("landing");};
  const openModule=(id)=>{setActiveModule(id);setPage("editor");};

  if(page==="landing") return(
    <>
      <LandingPage onLogin={()=>setAuth({mode:"login"})} onRegister={()=>setAuth({mode:"register"})}/>
      {auth&&<AuthModal mode={auth.mode} onClose={()=>setAuth(null)} onSuccess={handleLogin}/>}
    </>
  );

  if(page==="admin") return(
    <AdminDashboard user={user} onBack={()=>setPage("dashboard")}/>
  );

  if(page==="dashboard") return(
    <Dashboard user={user} onLogout={handleLogout} onOpenModule={openModule} onAdmin={()=>setPage("admin")}/>
  );

  // editor
  return(
    <div style={{display:"flex",flexDirection:"column",height:"100vh",background:"#020b14",fontFamily:"'Courier New','Consolas',monospace",overflow:"hidden",userSelect:"none"}}>
      {/* Editor top bar */}
      <div style={{height:46,background:"#040d18",borderBottom:"1px solid #1e3a5f",display:"flex",alignItems:"center",padding:"0 14px",gap:10,flexShrink:0}}>
        <button onClick={()=>setPage("dashboard")}
          style={{background:"transparent",border:"1px solid #1e3a5f",color:"#475569",padding:"4px 10px",borderRadius:4,cursor:"pointer",fontSize:10,letterSpacing:1,fontFamily:"inherit"}}>
          ← Dashboard
        </button>
        <div style={{width:1,height:20,background:"#1e3a5f"}}/>
        <span style={{fontSize:16,color:"#22d3ee",filter:"drop-shadow(0 0 4px #22d3ee)"}}>⚡</span>
        <span style={{fontSize:12,fontWeight:700,color:"#22d3ee",letterSpacing:2}}>TECHSIM PRO</span>
        <div style={{width:1,height:20,background:"#1e3a5f"}}/>
        <span style={{fontSize:12,color:mod?.color,fontWeight:700}}>{mod?.icon} {mod?.label}</span>
        {/* Module switcher */}
        <div style={{marginLeft:8,display:"flex",gap:3,overflowX:"auto"}}>
          {MODS_ALL.map(m=>(
            <button key={m.id} onClick={()=>setActiveModule(m.id)}
              style={{background:m.id===activeModule?`${m.color}22`:"transparent",border:`1px solid ${m.id===activeModule?m.color+"66":"#1e293b"}`,color:m.id===activeModule?m.color:"#334155",borderRadius:4,padding:"3px 8px",cursor:"pointer",fontSize:10,letterSpacing:0.5,fontFamily:"inherit",whiteSpace:"nowrap",transition:"all 0.12s"}}>
              {m.icon}
            </button>
          ))}
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
          {user&&<div style={{fontSize:9,color:"#334155"}}>{user.name}</div>}
          <button onClick={handleLogout} style={{background:"transparent",border:"1px solid #1e293b",color:"#334155",padding:"3px 8px",borderRadius:3,cursor:"pointer",fontSize:8,fontFamily:"inherit"}}>Sair</button>
        </div>
      </div>
      <Engine key={activeModule} modId={activeModule} modColor={mod?.color||"#22d3ee"} lib={LIBS[activeModule]||[]} onBack={()=>setPage("dashboard")} userName={user?.name}/>
    </div>
  );
}
