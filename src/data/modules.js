import { MODULE_GLYPHS } from '../constants';

export const MODS_ALL = [
  { id:"dc",      icon:MODULE_GLYPHS.dc, label:"Corrente Contínua",   color:"#22d3ee", desc:"DC · Ohm · KVL · Thévenin" },
  { id:"ac",      icon:MODULE_GLYPHS.ac, label:"Corrente Alternada",  color:"#f59e0b", desc:"AC · RLC · Fasores · FP" },
  { id:"pneum",   icon:MODULE_GLYPHS.pneum, label:"Pneumática",          color:"#a78bfa", desc:"Válvulas · Cilindros · Pressão" },
  { id:"hidro",   icon:MODULE_GLYPHS.hidro, label:"Hidráulica",          color:"#38bdf8", desc:"Bombas · Cilindros · Pascal" },
  { id:"logic",   icon:MODULE_GLYPHS.logic, label:"Lógica Digital",      color:"#4ade80", desc:"AND·OR·NOT·XOR · FF" },
  { id:"cmd",     icon:MODULE_GLYPHS.cmd, label:"Comandos Elétricos",  color:"#fb923c", desc:"Contatores · Motores · Relés" },
  { id:"install", icon:MODULE_GLYPHS.install,  label:"Instalações",         color:"#f43f5e", desc:"NBR 5410 · Cargas · Proteção" },
  { id:"ladder",  icon:MODULE_GLYPHS.ladder,  label:"Ladder / CLP",        color:"#c084fc", desc:"Contatos · Bobinas · Timers" },
];

export const LIBS = {
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

const preset = (id, title, description, project) => ({ id, title, description, project });

export const MODULE_PRESETS = {
  dc: [
    preset("dc-led-series", "LED com resistor", "Fonte 12V, resistor limitador e LED para cálculo imediato.", {
      viewMode: "3d",
      comps: [
        { id: "dc_v1", t: "vdc", x: 96, y: 192, v: 12, n: "V1", r: 0 },
        { id: "dc_r1", t: "res", x: 288, y: 192, v: 1000, n: "R1", r: 0 },
        { id: "dc_led1", t: "led", x: 480, y: 192, v: 2, n: "LED1", r: 0 },
        { id: "dc_gnd", t: "gnd", x: 672, y: 192, v: 0, n: "GND", r: 0 },
      ],
      wires: [
        { id: "dc_w1", x1: 96, y1: 192, x2: 288, y2: 192, color: "#38bdf8" },
        { id: "dc_w2", x1: 288, y1: 192, x2: 480, y2: 192, color: "#22c55e" },
        { id: "dc_w3", x1: 480, y1: 192, x2: 672, y2: 192, color: "#f59e0b" },
      ],
    }),
  ],
  ac: [
    preset("ac-rlc-series", "RLC série", "Fonte AC com resistor, indutor e capacitor para análise de impedância.", {
      viewMode: "3d",
      comps: [
        { id: "ac_v1", t: "vac", x: 96, y: 192, v: 220, n: "VAC", r: 0 },
        { id: "ac_r1", t: "res", x: 288, y: 192, v: 100, n: "R1", r: 0 },
        { id: "ac_l1", t: "ind", x: 480, y: 192, v: 120, n: "L1", r: 0 },
        { id: "ac_c1", t: "cap", x: 672, y: 192, v: 100, n: "C1", r: 0 },
      ],
      wires: [
        { id: "ac_w1", x1: 96, y1: 192, x2: 288, y2: 192, color: "#f59e0b" },
        { id: "ac_w2", x1: 288, y1: 192, x2: 480, y2: 192, color: "#22d3ee" },
        { id: "ac_w3", x1: 480, y1: 192, x2: 672, y2: 192, color: "#4ade80" },
      ],
    }),
  ],
  pneum: [
    preset("pneum-cyl-control", "Cilindro de dupla ação", "Compressor, válvula 5/2 e cilindro para estudo de avanço e retorno.", {
      viewMode: "3d",
      comps: [
        { id: "pn_comp", t: "comp", x: 96, y: 192, v: 6, n: "COMP", r: 0 },
        { id: "pn_v52", t: "v52", x: 336, y: 192, v: 1, n: "V1", r: 0 },
        { id: "pn_cyl", t: "cyl", x: 576, y: 192, v: 50, n: "CIL1", r: 0 },
        { id: "pn_m", t: "manm", x: 336, y: 336, v: 6, n: "P1", r: 90 },
      ],
      wires: [
        { id: "pn_w1", x1: 96, y1: 192, x2: 336, y2: 192, color: "#a78bfa" },
        { id: "pn_w2", x1: 336, y1: 192, x2: 576, y2: 192, color: "#38bdf8" },
        { id: "pn_w3", x1: 336, y1: 192, x2: 336, y2: 336, color: "#fbbf24" },
      ],
    }),
  ],
  hidro: [
    preset("hidro-cylinder-power", "Circuito hidráulico básico", "Bomba, válvula direcional, cilindro e medidor de vazão.", {
      viewMode: "3d",
      comps: [
        { id: "hd_pump", t: "pump", x: 96, y: 192, v: 180, n: "PUMP", r: 0 },
        { id: "hd_vd", t: "vd", x: 336, y: 192, v: 1, n: "VD1", r: 0 },
        { id: "hd_cyl", t: "cylh", x: 576, y: 192, v: 80, n: "CH1", r: 0 },
        { id: "hd_fq", t: "fq", x: 336, y: 336, v: 20, n: "Q1", r: 90 },
      ],
      wires: [
        { id: "hd_w1", x1: 96, y1: 192, x2: 336, y2: 192, color: "#38bdf8" },
        { id: "hd_w2", x1: 336, y1: 192, x2: 576, y2: 192, color: "#22d3ee" },
        { id: "hd_w3", x1: 336, y1: 192, x2: 336, y2: 336, color: "#4ade80" },
      ],
    }),
  ],
  logic: [
    preset("logic-and-output", "Porta AND + saída", "Duas entradas alimentando uma porta AND e saída digital.", {
      viewMode: "2d",
      comps: [
        { id: "lg_i1", t: "inp", x: 96, y: 144, v: 1, n: "IN1", r: 0 },
        { id: "lg_i2", t: "inp", x: 96, y: 240, v: 1, n: "IN2", r: 0 },
        { id: "lg_and", t: "and", x: 336, y: 192, v: 0, n: "AND1", r: 0 },
        { id: "lg_out", t: "out", x: 576, y: 192, v: 0, n: "OUT1", r: 0 },
      ],
      wires: [
        { id: "lg_w1", x1: 96, y1: 144, x2: 336, y2: 144, color: "#4ade80" },
        { id: "lg_w2", x1: 96, y1: 240, x2: 336, y2: 240, color: "#22d3ee" },
        { id: "lg_w3", x1: 336, y1: 192, x2: 576, y2: 192, color: "#fbbf24" },
      ],
    }),
  ],
  cmd: [
    preset("cmd-direct-start", "Partida direta", "Botões, contator, relé térmico e motor trifásico.", {
      viewMode: "3d",
      comps: [
        { id: "cmd_bna", t: "bna", x: 96, y: 192, v: 0, n: "START", r: 0 },
        { id: "cmd_bnf", t: "bnf", x: 96, y: 288, v: 1, n: "STOP", r: 0 },
        { id: "cmd_km", t: "cont", x: 336, y: 192, v: 1, n: "KM1", r: 0 },
        { id: "cmd_fr", t: "rterm", x: 576, y: 192, v: 10, n: "FR1", r: 0 },
        { id: "cmd_m", t: "mote", x: 768, y: 192, v: 7.5, n: "M1", r: 0 },
      ],
      wires: [
        { id: "cmd_w1", x1: 96, y1: 192, x2: 336, y2: 192, color: "#4ade80" },
        { id: "cmd_w2", x1: 336, y1: 192, x2: 576, y2: 192, color: "#fb923c" },
        { id: "cmd_w3", x1: 576, y1: 192, x2: 768, y2: 192, color: "#a78bfa" },
        { id: "cmd_w4", x1: 96, y1: 288, x2: 336, y2: 288, color: "#f87171" },
      ],
    }),
  ],
  install: [
    preset("install-board", "Quadro residencial", "Disjuntor geral, DR, circuito de tomadas e iluminação.", {
      viewMode: "2d",
      comps: [
        { id: "in_qg", t: "qg", x: 96, y: 192, v: 63, n: "QG", r: 0 },
        { id: "in_dr", t: "dr", x: 288, y: 192, v: 30, n: "DR1", r: 0 },
        { id: "in_tom", t: "tom", x: 528, y: 144, v: 20, n: "TOM1", r: 0 },
        { id: "in_lum", t: "lum", x: 528, y: 240, v: 120, n: "LUM1", r: 0 },
        { id: "in_pe", t: "gnde", x: 720, y: 192, v: 0, n: "PE", r: 0 },
      ],
      wires: [
        { id: "in_w1", x1: 96, y1: 192, x2: 288, y2: 192, color: "#f43f5e" },
        { id: "in_w2", x1: 288, y1: 192, x2: 528, y2: 144, color: "#4ade80" },
        { id: "in_w3", x1: 288, y1: 192, x2: 528, y2: 240, color: "#fbbf24" },
        { id: "in_w4", x1: 528, y1: 192, x2: 720, y2: 192, color: "#6ee7b7" },
      ],
    }),
  ],
  ladder: [
    preset("ladder-start-stop", "Start/Stop com bobina", "Rung inicial com contato NA, NF e bobina de saída.", {
      viewMode: "2d",
      comps: [
        { id: "ld_cno", t: "cno", x: 144, y: 192, v: 1, n: "START", r: 0, addr: "I0.0" },
        { id: "ld_cnf", t: "cnf", x: 336, y: 192, v: 1, n: "STOP", r: 0, addr: "I0.1" },
        { id: "ld_ton", t: "ton", x: 528, y: 192, v: 5, n: "T1", r: 0, addr: "T1" },
        { id: "ld_coil", t: "coil", x: 720, y: 192, v: 0, n: "Q0.0", r: 0, addr: "Q0.0" },
      ],
      wires: [
        { id: "ld_w1", x1: 144, y1: 192, x2: 336, y2: 192, color: "#4ade80" },
        { id: "ld_w2", x1: 336, y1: 192, x2: 528, y2: 192, color: "#22d3ee" },
        { id: "ld_w3", x1: 528, y1: 192, x2: 720, y2: 192, color: "#c084fc" },
      ],
    }),
  ],
};

export const getModulePresets = (moduleId) => MODULE_PRESETS[moduleId] || [];
