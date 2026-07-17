# Techsim Platform

Techsim foi modernizado para uma base full-stack preparada para crescer como uma plataforma industrial de edição e simulação elétrica, pneumática, hidráulica e PLC.

## O que foi entregue nesta modernização

### Arquitetura
- Stack preparada para **Docker Compose** com:
  - Frontend Vite + React
  - Backend Node.js + Express
  - PostgreSQL
  - Redis
  - Nginx como reverse proxy
- Ambientes separados:
  - `docker-compose.yml` + `docker-compose.dev.yml` para desenvolvimento com hot reload
  - `docker-compose.yml` + `docker-compose.prod.yml` para produção
- Configuração centralizada via `.env`
- Backend com JWT, REST API, uploads, auditoria e WebSockets (`socket.io`)

### Frontend
- Shell visual modernizado com suporte a **Dark / Light Mode**
- Editor com:
  - zoom / pan
  - snap to grid
  - páginas múltiplas
  - undo / redo ilimitado
  - atalhos de teclado
  - presets por disciplina
  - exportação JSON e PNG
- Biblioteca expandida para componentes industriais reais

### Simulação e bibliotecas
Foram expandidas as bibliotecas para cobrir melhor cenários de:
- potência DC
- potência AC
- comandos elétricos
- pneumática
- hidráulica
- lógica digital
- instalações
- ladder / CLP
- PLC / automação (Siemens, Allen-Bradley, Schneider, Omron, etc.)

### Backend e dados
- Modelo relacional com tabelas para:
  - utilizadores
  - projetos
  - versões de projeto
  - comentários
  - auditoria
- API pronta para evoluir com colaboração em tempo real
- Redis preparado para cache de bibliotecas e otimizações futuras

---

## Estrutura do projeto

```text
.
├─ src/                     # frontend React/Vite
├─ backend/                 # API Node.js/Express + WebSockets
├─ infra/
│  ├─ nginx/                # reverse proxy dev/prod
│  └─ postgres/init/        # schema inicial da base de dados
├─ docker-compose.yml
├─ docker-compose.dev.yml
├─ docker-compose.prod.yml
├─ Dockerfile               # frontend
└─ backend/Dockerfile       # backend
```

---

## Variáveis de ambiente

Copie o exemplo antes de arrancar:

```bash
cp .env.example .env
```

Principais variáveis:
- `VITE_API_URL`
- `VITE_REALTIME_URL`
- `JWT_SECRET`
- `POSTGRES_HOST`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `REDIS_URL`

---

## Desenvolvimento com Docker Compose

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Acesso esperado:
- App: `http://localhost:8080`
- Vite direto: `http://localhost:5173`
- API: `http://localhost:8080/api`

Hot reload:
- frontend com Vite
- backend com Nodemon

---

## Produção com Docker Compose

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

---

## Execução sem Docker

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

---

## Endpoints principais

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Projetos
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `GET /api/projects/:id/versions`
- `GET /api/projects/:id/comments`
- `POST /api/projects/:id/comments`

### Bibliotecas
- `GET /api/libraries`

### Saúde
- `GET /api/health`

---

## Estado atual

Esta revisão entrega a **fundação arquitetural moderna** e uma **biblioteca industrial muito mais rica**, mantendo a base pronta para a próxima fase:
- colaboração multiutilizador em tempo real mais profunda
- simulação física ainda mais fiel por disciplina
- exportação SVG/PDF nativa
- editor avançado com agrupamento, camadas visuais e comentários ancorados no canvas
- validação elétrica/hidráulica/pneumática com regras mais rigorosas

A plataforma já está preparada para evoluir de forma incremental sem reescrever frontend, backend ou infraestrutura.
