// Mapeamento de componentes -> símbolos SVG reais.
//
// Fonte principal: "electronic-symbols" (chris-pikul), licença MIT.
// https://github.com/chris-pikul/electronic-symbols
//
// QElectroTech (CC-BY 3.0) e Wikimedia Commons (licenças variadas, ver CREDITS.md)
// são as fontes de referência pedidas para este projeto. Os seus símbolos usam o
// formato .elmt (QElectroTech) ou exigem verificação individual de licença por
// ficheiro (Wikimedia), pelo que, nesta primeira integração, o conjunto abaixo
// vem da biblioteca MIT (compatível e sem restrições) — mantendo o mesmo desenho
// normalizado (IEC 60617 / IEEE) usado por essas duas fontes. Novos símbolos
// (incluindo extraídos manualmente do QElectroTech ou do Commons) podem ser
// adicionados sem tocar em código, através do painel Admin > Biblioteca de Símbolos.
//
// Cada entrada: { file, standard, source }
export const SYMBOL_LIBRARY = {
  res: { file: 'Resistor-IEC-Standard.svg', standard: 'IEC 60617', source: 'electronic-symbols (MIT)' },
  pot: { file: 'Resistor-IEC-Potentiometer.svg', standard: 'IEC 60617', source: 'electronic-symbols (MIT)' },
  cap: { file: 'Capacitor-IEC-NonPolarized.svg', standard: 'IEC 60617', source: 'electronic-symbols (MIT)' },
  ind: { file: 'Inductor-COM-Air.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  diode: { file: 'Diode-COM-Standard.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  zpv: { file: 'Diode-COM-Zener.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  led: { file: 'Diode-COM-LED.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  rgbled: { file: 'Diode-COM-LED.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  buzzer: { file: 'Audio-COM-Buzzer.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  sw: { file: 'Switch-COM-SPST.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  switch: { file: 'Switch-COM-SPST.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  selector: { file: 'Switch-COM-SPDT.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  limit: { file: 'Switch-COM-SPDT.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  bna: { file: 'Switch-COM-Pushbutton-NO.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  bnf: { file: 'Switch-COM-Pushbutton-NC.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  estop: { file: 'Switch-COM-Pushbutton-NC.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  fuse: { file: 'Fuse-IEC.svg', standard: 'IEC 60617', source: 'electronic-symbols (MIT)' },
  fus: { file: 'Fuse-IEC.svg', standard: 'IEC 60617', source: 'electronic-symbols (MIT)' },
  relay: { file: 'Relay-IEC-SPST-NO.svg', standard: 'IEC 60617', source: 'electronic-symbols (MIT)' },
  rele: { file: 'Relay-IEC-SPST-NO.svg', standard: 'IEC 60617', source: 'electronic-symbols (MIT)' },
  gnd: { file: 'Ground-COM-General.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  gnde: { file: 'Ground-COM-General.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  vdc: { file: 'Source-COM-DC.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  psu: { file: 'Source-COM-DC.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  idc: { file: 'Source-COM-Current.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  vac: { file: 'Source-COM-AC.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  transformer: { file: 'Transformer-COM-Standard.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  lamp: { file: 'Miscellaneous-COM-Lamp-Indicator.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  and: { file: 'IC-COM-Logic-AND.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  or: { file: 'IC-COM-Logic-OR.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  not: { file: 'IC-COM-Logic-Inverter.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  nand: { file: 'IC-COM-Logic-NAND.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  nor: { file: 'IC-COM-Logic-NOR.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  xor: { file: 'IC-COM-Logic-XOR.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  buf: { file: 'IC-COM-Logic-Buffer.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  dff: { file: 'IC-COM-FlipFlop-ClockedD.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  ffsr: { file: 'IC-COM-FlipFlop-GatedSR.svg', standard: 'Comum', source: 'electronic-symbols (MIT)' },
  tgauge: { file: 'Resistor-IEC-Thermistor.svg', standard: 'IEC 60617', source: 'electronic-symbols (MIT)' },
  photo: { file: 'Resistor-IEC-Photoresistor.svg', standard: 'IEC 60617', source: 'electronic-symbols (MIT)' },
};

export const symbolAssetUrl = (file) =>
  new URL(`../assets/symbols/${file}`, import.meta.url).href;
