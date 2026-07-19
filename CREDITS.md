# Créditos — Biblioteca de Símbolos

## Fonte atual (integrada em `src/assets/symbols/`)

**electronic-symbols** por Chris Pikul
https://github.com/chris-pikul/electronic-symbols
Licença: **MIT** — uso livre, comercial ou não, com atribuição.

Símbolos usados: resistores, capacitores, indutores, díodos, LED, buzzer,
interruptores, fusíveis, relés, terra, fontes DC/AC, transformador, lâmpada
indicadora, portas lógicas (AND/OR/NOT/NAND/NOR/XOR/Buffer) e flip-flops
(D, SR). Ver `src/data/symbolLibrary.js` para o mapeamento completo.

## Fontes de referência pedidas para este projeto

- **QElectroTech** — https://qelectrotech.org — licença **CC-BY 3.0**.
  Os símbolos nativos estão em formato `.elmt` (XML próprio), não SVG puro.
  Podem ser convertidos manualmente (ex: com QET_ElementScaler) e adicionados
  via **Admin → Símbolos**, creditando sempre "QElectroTech — CC-BY 3.0".

- **Wikimedia Commons** — https://commons.wikimedia.org — licenças variadas
  (maioria CC-BY, CC-BY-SA ou domínio público). **Verificar a licença de
  cada ficheiro individualmente** antes de o adicionar. Podem ser
  adicionados via **Admin → Símbolos**, com o crédito apropriado por ficheiro.

## Como adicionar mais símbolos

1. Vai a **Admin → Símbolos**.
2. Escolhe o módulo (categoria) do componente.
3. Preenche a fonte/crédito (ex: `QElectroTech — CC-BY 3.0` ou
   `Wikimedia Commons — CC0, File:Resistor_symbol_IEC.svg`).
4. Carrega o ficheiro `.svg` para o componente pretendido.

O símbolo fica guardado localmente e substitui automaticamente o glifo de
texto no editor.
