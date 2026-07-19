import { useState, useEffect } from 'react';
import { MODS_ALL } from '../data/modules';

export function PropertiesPanel({comp,lib,modColor,comps,wires,push,setSel,sd,onCalc,onToggleSim,running,hist}){
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
    <div className="editor-scroll" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,padding:20,overflowY:"auto"}}>
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
    <div className="editor-scroll" style={{flex:1,overflowY:"auto",padding:"10px"}}>
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
