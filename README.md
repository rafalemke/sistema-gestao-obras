# GestãoObras — Sistema Estadual de Obras Públicas

Sistema completo para gerenciamento de obras públicas estaduais, com controle de acesso, histórico de status, boletins de medição e cronogramas físico-financeiros.

---

## 🗂️ Estrutura do Projeto

```
obras-gov/
├── backend/          ← API Python + FastAPI
│   ├── app/
│   │   ├── api/v1/endpoints/   ← Rotas (auth, obras, boletins, cronogramas, users)
│   │   ├── core/               ← Config, segurança, dependências
│   │   ├── crud/               ← Operações de banco
│   │   ├── db/                 ← Sessão SQLAlchemy
│   │   ├── models/             ← Modelos ORM
│   │   ├── schemas/            ← Validação Pydantic
│   │   └── main.py             ← Entrada FastAPI
│   ├── init_db.py              ← Cria tabelas + seed admin
│   ├── requirements.txt
│   └── .env.example
└── frontend/         ← React + Vite
    ├── src/
    │   ├── App.jsx             ← Aplicação completa
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---



## 🗃️ Tabelas do Banco

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários com perfil de acesso |
| `obras` | Dados completos da obra |
| `obra_status_history` | Auditoria de mudanças de status da obra |
| `boletins_medicao` | Boletins de medição vinculados às obras |
| `bm_status_history` | Auditoria de mudanças de status dos BMs |
| `cronogramas` | Cronograma físico-financeiro (versionado) |
| `cronograma_itens` | Etapas/serviços do cronograma |
| `medicao_cronograma` | Avanço físico-financeiro por período |

---

## 📡 Endpoints da API

### Autenticação
- `POST /api/v1/auth/login` — Login, retorna JWT
- `GET  /api/v1/auth/me` — Dados do usuário logado

### Obras
- `GET  /api/v1/obras` — Listar obras (filtros: status, secretaria, search)
- `POST /api/v1/obras` — Criar obra
- `GET  /api/v1/obras/{id}` — Detalhes da obra
- `PATCH /api/v1/obras/{id}` — Editar obra
- `PATCH /api/v1/obras/{id}/status` — Alterar status (registra histórico)
- `GET  /api/v1/obras/{id}/historico` — Histórico de status

### Boletins de Medição
- `GET  /api/v1/boletins/obra/{obra_id}` — Listar BMs da obra
- `POST /api/v1/boletins` — Criar BM
- `GET  /api/v1/boletins/{id}` — Detalhes do BM
- `PATCH /api/v1/boletins/{id}` — Editar BM
- `PATCH /api/v1/boletins/{id}/status` — Alterar status
- `GET  /api/v1/boletins/{id}/historico` — Histórico de status

### Cronogramas
- `GET  /api/v1/cronogramas/obra/{obra_id}` — Listar cronogramas
- `POST /api/v1/cronogramas` — Criar cronograma com itens
- `PATCH /api/v1/cronogramas/{id}` — Editar cronograma
- `POST /api/v1/cronogramas/{id}/itens` — Adicionar item
- `PATCH /api/v1/cronogramas/itens/{id}` — Editar item
- `POST /api/v1/cronogramas/medicoes` — Registrar avanço

### Usuários
- `GET  /api/v1/users` — Listar usuários
- `POST /api/v1/users` — Criar usuário (admin)
- `PATCH /api/v1/users/{id}` — Editar usuário (admin)

---
<!-- 
## 🔄 Evolução Sugerida

1. **Upload de documentos** — Anexar SEI, contratos, fotos
2. **Notificações por e-mail** — Alertas de mudança de status
3. **Relatórios PDF** — Exportar BM e cronograma
4. **Dashboard com gráficos** — Recharts para acompanhamento financeiro
5. **Alembic migrations** — Para evoluir o schema sem perder dados
6. **Testes automatizados** — pytest + httpx -->

---
<!-- 
## 🛠️ Configurando Alembic (migrações)

```bash
cd backend
alembic init migrations

# Edite migrations/env.py:
# from app.db.session import Base
# from app.models import *
# target_metadata = Base.metadata

# Criar migration inicial:
alembic revision --autogenerate -m "initial"
alembic upgrade head
``` -->
