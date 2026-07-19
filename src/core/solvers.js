import { analyzeConnectivity } from './topology';
import { simulatePlcScan } from './plcRuntime';

export function solve(modId, comps, wires) {
  const h = { T:t=>({text:t,type:"title"}), F:f=>({text:f,type:"formula"}), R:r=>({text:r,type:"result"}), P:p=>({text:p,type:"sub"}), D:{text:"",type:"divider"} };
  try {
    let base;
    switch(modId) {
      case "dc":      base = solveDC(comps,wires,h); break;
      case "ac":      base = solveAC(comps,wires,h); break;
      case "pneum":   base = solvePneum(comps,wires,h); break;
      case "hidro":   base = solveHidro(comps,wires,h); break;
      case "logic":   base = solveLogic(comps,wires,h); break;
      case "cmd":     base = solveCmd(comps,wires,h); break;
      case "install": base = solveInstall(comps,wires,h); break;
      case "ladder":  base = solveLadder(comps,wires,h); break;
      case "plc":     base = solvePlc(comps,wires,h); break;
      default: base = {steps:[],results:[],ok:false};
    }
    return finalizeSolution(modId, comps, wires, base, h);
  } catch(e) { return {steps:[{text:"❌ "+e.message,type:"result"}],results:[],ok:false}; }
}

function finalizeSolution(modId, comps, wires, base, { T, R, P, D }) {
  const validation = analyzeConnectivity(modId, comps, wires);
  const severityRank = { error: 2, warning: 1, info: 0 };
  const worstSeverity = validation.diagnostics.reduce((level, item) => Math.max(level, severityRank[item.severity] ?? 0), 0);
  const steps = [...(base.steps || [])];
  const results = [...(base.results || [])];
  const liveByComp = { ...(base.live?.byComp || {}) };

  validation.energizedCompIds.forEach(id => {
    liveByComp[id] = { ...(liveByComp[id] || {}), energized: true };
  });

  steps.push(D);
  steps.push(T('🔎 Validação inteligente'));
  steps.push(P(`Malhas:${validation.summary.islands} | Energizados:${validation.summary.energizedComponents} comps / ${validation.summary.energizedWires} fios`));
  steps.push(P(`Órfãos:${validation.summary.orphanComponents} | Pontas abertas:${validation.summary.openWires}`));
  if (validation.diagnostics.length) {
    validation.diagnostics.slice(0, 6).forEach(item => steps.push(R(`${item.severity === 'error' ? '❌' : '⚠️'} ${item.message}`)));
  } else {
    steps.push(R('✅ Nenhuma inconsistência estrutural relevante foi detetada.'));
  }

  results.push({ label:'Malhas', value:String(validation.summary.islands), icon:'🧩', col:'#94a3b8' });
  results.push({ label:'Energizados', value:String(validation.summary.energizedComponents), icon:'⚡', col:'#22c55e' });
  if (validation.summary.openWires) results.push({ label:'Pontas abertas', value:String(validation.summary.openWires), icon:'⚠️', col:'#f87171' });
  if (validation.summary.orphanComponents) results.push({ label:'Órfãos', value:String(validation.summary.orphanComponents), icon:'🧱', col:'#f59e0b' });

  return {
    ...base,
    ok: Boolean(base.ok) && worstSeverity < 2,
    steps,
    results,
    validation,
    live: {
      ...(base.live || {}),
      byComp: liveByComp,
      energizedWireIds: [...validation.energizedWireIds],
    },
  };
}

function solvePlc(comps,wires,{T,F,R,P,D}){
  const runtime = simulatePlcScan(comps);
  const st = [];
  const re = [];
  st.push(T('🧠 PLC RUNTIME'));
  st.push(P(`CPUs:${runtime.summary.cpuCount} | Módulos I/O:${runtime.summary.ioCount} | Tags:${runtime.summary.addressedCount}`));
  st.push(D);
  st.push(T('Scan cycle'));
  st.push(F('scan = base CPU + peso do programa + overhead de I/O'));
  st.push(R(`Scan estimado = ${runtime.scanCycleMs.toFixed(2)} ms | CPU load ≈ ${runtime.cpuLoadPct.toFixed(1)}%`));
  st.push(D);
  st.push(T('Capacidade / uso'));
  st.push(P(`DI ${runtime.usage.I}/${runtime.capacity.I || 0} · DO ${runtime.usage.Q}/${runtime.capacity.Q || 0} · AI ${runtime.usage.AI}/${runtime.capacity.AI || 0} · AO ${runtime.usage.AQ}/${runtime.capacity.AQ || 0}`));
  if (runtime.outputs.length) {
    st.push(D);
    st.push(T('Saídas monitoradas'));
    runtime.outputs.slice(0, 8).forEach(output => st.push(P(`${output.addr} → ${output.name} = ${output.value}`)));
  }
  if (runtime.memoryMap.length) {
    st.push(D);
    st.push(T('Mapa de endereços'));
    runtime.memoryMap.slice(0, 10).forEach(item => st.push(P(`${item.addr} · ${item.name} (${item.type})`)));
  }
  if (runtime.diagnostics.length) {
    st.push(D);
    st.push(T('Diagnóstico do runtime'));
    runtime.diagnostics.forEach(item => st.push(R(`${item.severity === 'error' ? '❌' : '⚠️'} ${item.message}`)));
  }
  re.push({ label:'Scan cycle', value:`${runtime.scanCycleMs.toFixed(2)} ms`, icon:'⏱', col:'#22d3ee' });
  re.push({ label:'CPU load', value:`${runtime.cpuLoadPct.toFixed(1)}%`, icon:'🧠', col:'#a78bfa' });
  re.push({ label:'Tags válidas', value:String(runtime.summary.addressedCount), icon:'#', col:'#4ade80' });
  if (runtime.summary.duplicateCount) re.push({ label:'Duplicados', value:String(runtime.summary.duplicateCount), icon:'⚠️', col:'#f87171' });
  if (runtime.summary.invalidCount) re.push({ label:'Inválidos', value:String(runtime.summary.invalidCount), icon:'🚫', col:'#f59e0b' });
  return {
    steps: st,
    results: re,
    ok: runtime.diagnostics.every(item => item.severity !== 'error'),
    live: {
      plc: runtime,
      byComp: runtime.outputs.reduce((acc, output) => ({ ...acc, [output.componentId]: { energized: Boolean(output.value) } }), {}),
    },
  };
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
