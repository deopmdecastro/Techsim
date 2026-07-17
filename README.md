# Techsim

Techsim é uma plataforma visual de simulação técnica focada em circuitos, automação e sistemas industriais. A base agora foi reorganizada em módulos menores, com presets por disciplina e uma camada de serviços pronta para backend/autenticação real.

## O que entrou nesta revisão

- separação do antigo arquivo único em `src/components`, `src/canvas`, `src/core`, `src/data` e `src/services`
- paleta lateral com símbolos mais tecnológicos e cards de componente mais legíveis
- presets prontos por módulo para abrir projetos-base em um clique
- persistência de projetos em serviço desacoplado (`localStorage` por padrão, API pronta para plugar)
- autenticação desacoplada com fallback local e contrato preparado para backend real
- exportação principal mantida em `techsim-circuits.jsx` para compatibilidade

## Estrutura nova

- `techsim-circuits.jsx` — ponto de entrada compatível, reexportando a app modular
- `src/App.jsx` — shell principal e navegação
- `src/components/` — landing, auth, dashboard, editor, toolbar, painel de propriedades e admin
- `src/canvas/shapes.jsx` — renderização e visual dos símbolos/componentes
- `src/core/` — histórico e solvers
- `src/data/modules.js` — biblioteca de módulos, componentes e presets
- `src/services/auth.js` — autenticação local/remota
- `src/services/projects.js` — persistência local/remota de projetos
- `src/services/backend.js` — configuração da integração futura com API

## Presets por módulo

Cada módulo possui ao menos um projeto pronto para acelerar testes e demonstrações:

- DC: LED com resistor
- AC: RLC série
- Pneumática: cilindro de dupla ação
- Hidráulica: circuito hidráulico básico
- Lógica: AND com saída
- Comandos: partida direta
- Instalações: quadro residencial
- Ladder: start/stop com bobina

## Backend e autenticação

A base foi preparada para evoluir sem reescrever a UI:

- autenticação usa `src/services/auth.js`
- persistência de projetos usa `src/services/projects.js`
- endpoints remotos podem ser ligados por variáveis como `REACT_APP_API_URL` ou `VITE_API_URL`
- sem backend configurado, o sistema usa armazenamento local para continuar funcional

## Como usar

```jsx
import App from "./techsim-circuits.jsx";

export default function Root() {
  return <App />;
}
```

## Próximos passos naturais

- conectar `auth.js` a JWT/session real
- ligar `projects.js` a banco e API multiusuário
- versionar projetos e presets customizados por equipe
- adicionar testes automatizados para os solvers
