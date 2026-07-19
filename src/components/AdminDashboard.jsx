import { useState, useEffect } from 'react';
import { MODULE_GLYPHS } from '../constants';

export function AdminDashboard({user,onBack}){
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
  const planDist=[{plan:"FREE",n:89,col:"var(--text-dim)"},{plan:"EDU",n:31,col:"#4ade80"},{plan:"PRO",n:22,col:"#22d3ee"}];
  const planTotal=planDist.reduce((s,p)=>s+p.n,0);

  const grd=`repeating-linear-gradient(#22d3ee06 0,#22d3ee06 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,#22d3ee06 0,#22d3ee06 1px,transparent 1px,transparent 48px)`;
  const T=(t,b)=>({color:t,borderBottom:`2px solid ${activeTab===b?t:"transparent"}`,background:activeTab===b?t+"15":"transparent",padding:"8px 18px",cursor:"pointer",fontSize:9,letterSpacing:2,fontFamily:"inherit",fontWeight:700,border:`none`,borderRadius:"6px 6px 0 0",transition:"all 0.18s"});
  const statCard=(icon,label,val,unit,col,delta)=>(
    <div style={{background:"var(--panel-2)",border:`1px solid ${col}33`,borderRadius:10,padding:"16px 18px",position:"relative",overflow:"hidden",flex:"1 1 0"}}>
      <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:`radial-gradient(${col}18,transparent 70%)`}}/>
      <div style={{fontSize:18,marginBottom:6}}>{icon}</div>
      <div style={{fontSize:8,color:"var(--text-dim)",letterSpacing:3,marginBottom:4}}>{label}</div>
      <div style={{fontSize:22,fontWeight:700,color:col,fontFamily:"monospace"}}>{val}</div>
      <div style={{fontSize:8,color:"var(--text-soft)",marginTop:3}}>{unit}</div>
      {delta&&<div style={{position:"absolute",top:14,right:14,fontSize:8,color:parseFloat(delta)>=0?"#22c55e":"#f87171",background:parseFloat(delta)>=0?"#22c55e18":"#f8717118",padding:"2px 6px",borderRadius:4}}>{parseFloat(delta)>=0?"↑":"↓"} {delta}</div>}
    </div>
  );
  const miniBar=(val,max,col)=>{
    const pct=Math.min(1,val/max);
    return <div style={{height:3,borderRadius:2,background:"var(--surface-3)",overflow:"hidden",marginTop:4}}>
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
    <div style={{minHeight:"100vh",background:"var(--bg)",fontFamily:"var(--font-mono)",color:"var(--text)",backgroundImage:grd}}>
      {/* Top bar */}
      <nav style={{position:"sticky",top:0,zIndex:100,height:56,background:"rgba(5,6,13,0.9)",backdropFilter:"blur(14px)",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",padding:"0 28px",gap:14}}>
        <button onClick={onBack} style={{background:"transparent",border:"1px solid var(--border)",color:"var(--text-soft)",padding:"5px 12px",borderRadius:5,cursor:"pointer",fontSize:9,letterSpacing:1.5,fontFamily:"inherit"}}>← USUÁRIO</button>
        <div style={{width:1,height:24,background:"var(--border)"}}/>
        <span style={{fontSize:14,color:"#f43f5e",filter:"drop-shadow(0 0 8px #f43f5e)"}}>🔐</span>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:"#f43f5e",letterSpacing:2.5}}>TECHSIM ADMIN</div>
          <div style={{fontSize:7,color:"var(--text-dim)",letterSpacing:3}}>PAINEL DE CONTROLE</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:12,alignItems:"center"}}>
          {/* Live indicator */}
          <div style={{display:"flex",alignItems:"center",gap:6,background:"#22c55e18",border:"1px solid #22c55e33",borderRadius:12,padding:"4px 12px"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 8px #22c55e",animation:"pulse 1.5s infinite"}}/>
            <span style={{fontSize:8,color:"#22c55e",letterSpacing:2}}>LIVE</span>
          </div>
          <div style={{width:30,height:30,borderRadius:6,background:"#f43f5e22",border:"1px solid #f43f5e44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>👤</div>
          <div style={{fontSize:10,color:"var(--text-soft)"}}>{user?.name||"Admin"}</div>
        </div>
      </nav>

      <div style={{padding:"24px 28px",maxWidth:1400,margin:"0 auto"}}>

        {/* TABS */}
        <div style={{display:"flex",gap:2,marginBottom:24,borderBottom:"1px solid var(--border)"}}>
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
              <div style={{background:"var(--panel-2)",border:"1px solid var(--border)",borderRadius:10,padding:"18px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                  <div>
                    <div style={{fontSize:8,color:"var(--text-dim)",letterSpacing:3,marginBottom:4}}>SIMULAÇÕES / HORA</div>
                    <div style={{fontSize:18,fontWeight:700,color:"#f59e0b"}}>{simHistory[simHistory.length-1]}</div>
                  </div>
                  <div style={{fontSize:8,color:"#4ade80",background:"#4ade8018",padding:"3px 8px",borderRadius:4,border:"1px solid #4ade8033"}}>▲ 14%</div>
                </div>
                <div style={{display:"flex",gap:6,alignItems:"flex-end",height:70}}>
                  {simHistory.map((v,i)=>(
                    <div key={i} style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"flex-end",height:"100%"}}>
                      <div style={{background:i===simHistory.length-1?"#f59e0b":i>=simHistory.length-3?"#f59e0b66":"var(--border)",borderRadius:"3px 3px 0 0",height:`${(v/maxSim)*100}%`,transition:"height 0.5s"}}/>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                  {["12h","11h","10h","9h","8h","7h","6h","5h","4h","3h","2h","1h"].map(h=>(
                    <div key={h} style={{fontSize:5,color:"var(--border)",flex:1,textAlign:"center"}}>{h}</div>
                  ))}
                </div>
              </div>

              {/* Active users module breakdown */}
              <div style={{background:"var(--panel-2)",border:"1px solid var(--border)",borderRadius:10,padding:"18px 20px"}}>
                <div style={{fontSize:8,color:"var(--text-dim)",letterSpacing:3,marginBottom:12}}>POR MÓDULO</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {modules.slice(0,5).map(m=>(
                    <div key={m.id}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                        <span style={{fontSize:8,color:"var(--text-soft)"}}>{m.icon} {m.label}</span>
                        <span style={{fontSize:8,color:m.col}}>{m.sessions}</span>
                      </div>
                      {miniBar(m.sessions,totalSessions*0.55,m.col)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan distribution */}
              <div style={{background:"var(--panel-2)",border:"1px solid var(--border)",borderRadius:10,padding:"18px 20px"}}>
                <div style={{fontSize:8,color:"var(--text-dim)",letterSpacing:3,marginBottom:12}}>PLANOS</div>
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
                    <circle r={22} fill="var(--panel-2)"/>
                    <text textAnchor="middle" dy="4" fontSize="9" fill="var(--text)" fontFamily="monospace" fontWeight="bold">{planTotal}</text>
                  </svg>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:4}}>
                  {planDist.map(p=>(
                    <div key={p.plan} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",alignItems:"center",gap:5}}>
                        <div style={{width:7,height:7,borderRadius:2,background:p.col}}/>
                        <span style={{fontSize:9,color:"var(--text-soft)"}}>{p.plan}</span>
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
              <div style={{background:"var(--panel-2)",border:"1px solid var(--border)",borderRadius:10,padding:"18px 20px"}}>
                <div style={{fontSize:8,color:"var(--text-dim)",letterSpacing:3,marginBottom:4}}>CRESCIMENTO DE USUÁRIOS</div>
                <div style={{fontSize:18,fontWeight:700,color:"#22d3ee",marginBottom:12}}>{userHistory[userHistory.length-1]} usuários</div>
                {miniLineChart(userHistory,maxUser*1.1,"#22d3ee",60,300)}
              </div>
              {/* Recent events */}
              <div style={{background:"var(--panel-2)",border:"1px solid var(--border)",borderRadius:10,padding:"18px 20px"}}>
                <div style={{fontSize:8,color:"var(--text-dim)",letterSpacing:3,marginBottom:12}}>EVENTOS RECENTES</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {systemEvents.map((e,i)=>(
                    <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"6px 8px",background:`${eventCol[e.type]}0a`,borderRadius:4,border:`1px solid ${eventCol[e.type]}22`}}>
                      <span style={{fontSize:8,color:eventCol[e.type],fontWeight:700,whiteSpace:"nowrap"}}>{e.t}</span>
                      <span style={{fontSize:7,background:eventCol[e.type]+"22",color:eventCol[e.type],padding:"1px 5px",borderRadius:3,letterSpacing:1,flexShrink:0}}>{e.type}</span>
                      <span style={{fontSize:8,color:"var(--text-soft)",lineHeight:1.4}}>{e.msg}</span>
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
              <input placeholder="🔍  Buscar usuário..." style={{flex:1,background:"var(--panel-2)",border:"1px solid var(--border)",color:"var(--text-soft)",padding:"10px 16px",borderRadius:6,fontSize:10,fontFamily:"inherit",outline:"none"}}/>
              <select style={{background:"var(--panel-2)",border:"1px solid var(--border)",color:"var(--text-soft)",padding:"10px 14px",borderRadius:6,fontSize:10,fontFamily:"inherit"}}>
                <option>Todos os planos</option><option>FREE</option><option>PRO</option><option>EDU</option>
              </select>
              <button style={{background:"linear-gradient(135deg,#f43f5e,#e11d48)",border:"none",color:"#fff",padding:"10px 20px",borderRadius:6,cursor:"pointer",fontSize:9,fontWeight:700,letterSpacing:1.5,fontFamily:"inherit"}}>+ NOVO USUÁRIO</button>
            </div>
            {/* Users table */}
            <div style={{background:"var(--panel-2)",border:"1px solid var(--border)",borderRadius:10,overflow:"hidden"}}>
              <div style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr 1fr 1fr 1fr",gap:0,borderBottom:"1px solid var(--border)",padding:"10px 18px"}}>
                {["USUÁRIO","E-MAIL","PLANO","MÓDULO ATIVO","ONLINE","AÇÕES"].map(h=>(
                  <div key={h} style={{fontSize:7,color:"var(--text-dim)",letterSpacing:2,fontWeight:700}}>{h}</div>
                ))}
              </div>
              {recentUsers.map((u,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr 1fr 1fr 1fr",gap:0,borderBottom:"1px solid var(--surface-3)",padding:"12px 18px",transition:"background 0.12s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="var(--surface)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:26,height:26,borderRadius:6,background:"#f43f5e22",border:"1px solid #f43f5e44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#f43f5e",flexShrink:0}}>{u.name[0]}</div>
                    <span style={{fontSize:10,color:"var(--text-soft)"}}>{u.name}</span>
                  </div>
                  <div style={{fontSize:9,color:"var(--text-soft)",alignSelf:"center"}}>{u.email}</div>
                  <div style={{alignSelf:"center"}}>
                    <span style={{fontSize:8,background:u.plan==="PRO"?"#22d3ee18":u.plan==="EDU"?"#4ade8018":"rgba(148,163,184,0.14)",color:u.plan==="PRO"?"#22d3ee":u.plan==="EDU"?"#4ade80":"#94a3b8",padding:"3px 8px",borderRadius:4,border:`1px solid ${u.plan==="PRO"?"#22d3ee33":u.plan==="EDU"?"#4ade8033":"rgba(148,163,184,0.26)"}`,letterSpacing:1}}>{u.plan}</span>
                  </div>
                  <div style={{fontSize:9,color:"var(--text-soft)",alignSelf:"center"}}>{u.mod}</div>
                  <div style={{display:"flex",alignItems:"center",gap:4,alignSelf:"center"}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:"#22c55e"}}/>
                    <span style={{fontSize:8,color:"#22c55e"}}>{u.time} atrás</span>
                  </div>
                  <div style={{display:"flex",gap:6,alignSelf:"center"}}>
                    <button style={{background:"transparent",border:"1px solid var(--border)",color:"var(--text-soft)",padding:"3px 8px",borderRadius:3,cursor:"pointer",fontSize:8,fontFamily:"inherit"}}>Ver</button>
                    <button style={{background:"transparent",border:"1px solid #f8717133",color:"#f87171",padding:"3px 8px",borderRadius:3,cursor:"pointer",fontSize:8,fontFamily:"inherit"}}>Ban</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{marginTop:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:8,color:"var(--text-dim)"}}>Mostrando 6 de 142 usuários</span>
              <div style={{display:"flex",gap:4}}>
                {[1,2,3,"...","24"].map((p,i)=>(
                  <button key={i} style={{background:p===1?"#f43f5e22":"transparent",border:`1px solid ${p===1?"#f43f5e44":"var(--border)"}`,color:p===1?"#f43f5e":"var(--text-dim)",width:26,height:26,borderRadius:4,cursor:"pointer",fontSize:8,fontFamily:"inherit"}}>{p}</button>
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
                <div key={m.id} style={{background:"var(--panel-2)",border:`1px solid ${m.col}33`,borderRadius:10,padding:"20px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:36,height:36,borderRadius:8,background:`${m.col}22`,border:`1px solid ${m.col}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{m.icon}</div>
                      <div>
                        <div style={{fontSize:11,fontWeight:700,color:m.col,letterSpacing:0.5}}>{m.label}</div>
                        <div style={{fontSize:8,color:"var(--text-dim)"}}>{m.sessions} sessões ativas</div>
                      </div>
                    </div>
                    <div style={{fontSize:14,fontWeight:700,color:m.col}}>{Math.round(m.sessions/totalSessions*100)}%</div>
                  </div>
                  {/* Usage bar */}
                  <div style={{height:6,borderRadius:3,background:"var(--surface-3)",overflow:"hidden",marginBottom:10}}>
                    <div style={{height:"100%",width:`${m.sessions/totalSessions*100*2}%`,background:`linear-gradient(90deg,${m.col}aa,${m.col})`,borderRadius:3,maxWidth:"100%"}}/>
                  </div>
                  {/* Mini stats */}
                  <div style={{display:"flex",gap:10}}>
                    {[["Hoje",m.sessions*8],[`Semana`,m.sessions*52],["Erros",`${(Math.random()*2).toFixed(1)}%`]].map(([lbl,val])=>(
                      <div key={lbl} style={{flex:1,background:"var(--surface)",borderRadius:4,padding:"6px 8px",textAlign:"center"}}>
                        <div style={{fontSize:7,color:"var(--text-dim)",letterSpacing:1,marginBottom:2}}>{lbl}</div>
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
            <div style={{background:"var(--panel-2)",border:"1px solid var(--border)",borderRadius:10,padding:"20px"}}>
              <div style={{fontSize:8,color:"var(--text-dim)",letterSpacing:3,marginBottom:16}}>SAÚDE DO SERVIDOR</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
                {[
                  {label:"CPU",val:serverLoad,unit:"%",max:100,col:parseInt(serverLoad)>80?"#f87171":"#22d3ee"},
                  {label:"RAM",val:58,unit:"%",max:100,col:"#4ade80"},
                  {label:"DISCO",val:34,unit:"%",max:100,col:"#f59e0b"},
                  {label:"REDE",val:12,unit:"Mbps",max:100,col:"#a78bfa"},
                ].map(m=>(
                  <div key={m.label} style={{background:"var(--surface)",borderRadius:8,padding:"14px",textAlign:"center"}}>
                    <div style={{fontSize:8,color:"var(--text-dim)",letterSpacing:2,marginBottom:8}}>{m.label}</div>
                    {/* Radial gauge */}
                    <svg width={80} height={50} style={{margin:"0 auto",display:"block"}}>
                      <path d="M 10 45 A 30 30 0 0 1 70 45" fill="none" stroke="var(--surface-3)" strokeWidth="6" strokeLinecap="round"/>
                      <path d={`M 10 45 A 30 30 0 0 1 ${10+60*parseFloat(m.val)/m.max*0.9} ${45-Math.sin(Math.PI*parseFloat(m.val)/m.max*0.9)*30}`} fill="none" stroke={m.col} strokeWidth="6" strokeLinecap="round"/>
                      <text x="40" y="42" textAnchor="middle" fontSize="11" fill={m.col} fontFamily="monospace" fontWeight="bold">{m.val}</text>
                      <text x="40" y="50" textAnchor="middle" fontSize="6" fill="var(--text-dim)" fontFamily="monospace">{m.unit}</text>
                    </svg>
                  </div>
                ))}
              </div>
            </div>
            {/* Performance metrics */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div style={{background:"var(--panel-2)",border:"1px solid var(--border)",borderRadius:10,padding:"20px"}}>
                <div style={{fontSize:8,color:"var(--text-dim)",letterSpacing:3,marginBottom:12}}>TEMPOS DE RESPOSTA (ms)</div>
                {[["API /simulate","48ms","#22c55e"],["API /save","23ms","#22c55e"],["API /auth","15ms","#22c55e"],["WebSocket","8ms","#22c55e"],["DB Query","12ms","#22c55e"]].map(([ep,t,col])=>(
                  <div key={ep} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid var(--surface-3)"}}>
                    <span style={{fontSize:9,color:"var(--text-soft)",fontFamily:"monospace"}}>{ep}</span>
                    <span style={{fontSize:9,color:col,fontWeight:700}}>{t}</span>
                  </div>
                ))}
              </div>
              <div style={{background:"var(--panel-2)",border:"1px solid var(--border)",borderRadius:10,padding:"20px"}}>
                <div style={{fontSize:8,color:"var(--text-dim)",letterSpacing:3,marginBottom:12}}>VERSÃO DO SISTEMA</div>
                {[["TechSim Frontend","v3.2.1","#22d3ee"],["API Server","v2.8.0","#4ade80"],["WebSocket","v1.4.2","#4ade80"],["Banco de Dados","PostgreSQL 15","#f59e0b"],["Cache","Redis 7.2","#f59e0b"],["Node.js","v20.11.0","#22c55e"]].map(([k,v2,col])=>(
                  <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid var(--surface-3)"}}>
                    <span style={{fontSize:9,color:"var(--text-soft)"}}>{k}</span>
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
                <button key={l} style={{background:l==="ALL"?"#f43f5e22":"transparent",border:`1px solid ${l==="ALL"?"#f43f5e44":"var(--border)"}`,color:l==="ALL"?"#f43f5e":"var(--text-dim)",padding:"4px 12px",borderRadius:4,cursor:"pointer",fontSize:8,fontFamily:"inherit",letterSpacing:1}}>{l}</button>
              ))}
              <div style={{marginLeft:"auto",fontSize:8,color:"var(--text-dim)"}}>● Auto-atualizar</div>
            </div>
            <div style={{background:"var(--bg)",border:"1px solid var(--border)",borderRadius:8,padding:"14px",fontFamily:"monospace",fontSize:9,maxHeight:460,overflowY:"auto"}}>
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
                <div key={i} style={{display:"flex",gap:14,padding:"3px 0",borderBottom:"1px solid var(--border)"}}>
                  <span style={{color:"var(--text-dim)",minWidth:70}}>{time}</span>
                  <span style={{color:eventCol[level]||"var(--text-soft)",minWidth:50,fontWeight:700}}>[{level}]</span>
                  <span style={{color:"var(--text-soft)"}}>{msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
