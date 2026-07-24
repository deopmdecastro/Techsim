import { G, hexToRgba, shiftHex } from '../constants';
import { LIBS } from '../data/modules';
import { getTintedSymbol } from './symbolImages';

// Tipos de componente "estáticos" (sem estado dependente de valor ao vivo,
// como agulha de medidor, posição de válvula, etc.) para os quais existe um
// símbolo SVG real na biblioteca — para estes, o canvas passa a desenhar o
// mesmo desenho técnico usado na galeria "Mídia" e na doca de componentes,
// em vez da forma vetorial aproximada. Componentes com animação/estado ao
// vivo (medidores, válvulas, PLC, osciloscópio, servo, etc.) continuam a
// usar o desenho vetorial dedicado, que sabe representar esse estado.
const SVG_BACKED_TYPES = new Set([
  'res', 'cap', 'ind', 'diode', 'led', 'gnd', 'gnde',
  'and', 'or', 'not', 'nand', 'nor', 'xor', 'buf',
  'vdc', 'vac', 'idc', 'fus', 'fuse', 'transformer', 'lamp',
]);

export function drawGrid(ctx,W,H,pan,zoom){
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

export function drawWire(ctx,w,sel,live,modColor,tick,viewMode="2d"){
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

export function drawComp(ctx,comp,sel,live,modColor,viewMode="2d"){
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
  let usedSvgSymbol = false;
  if (SVG_BACKED_TYPES.has(t)) {
    const tinted = getTintedSymbol(t, sel ? "#fbbf24" : col, 34);
    if (tinted) {
      ctx.drawImage(tinted, -tinted.width / 2, -tinted.height / 2, tinted.width, tinted.height);
      usedSvgSymbol = true;
    }
  }
  if (!usedSvgSymbol) switch(t){
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
