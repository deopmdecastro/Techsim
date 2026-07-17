import { useState, useEffect } from 'react';
import { MODULE_GLYPHS } from '../constants';

export function LandingPage({ onLogin, onRegister }) {
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
