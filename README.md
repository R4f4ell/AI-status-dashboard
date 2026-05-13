# AI Status Dashboard

MVP full stack para monitoramento de status de servicos de IA e APIs publicas.

## Escopo da primeira versao

- Back-end com FastAPI, Pydantic, HTTPX e Uvicorn.
- Front-end com Next.js, TypeScript, SCSS, Tailwind, Shadcn UI, Recharts, TanStack Query e Lucide React.
- Sem autenticacao.
- Sem banco de dados.
- Sem Supabase como backend.
- Sem login, cadastro ou painel admin.

## Estrutura atual

```txt
AI-status-dashboard/
  backend/
    core/
      config.py
    models/
      provider.py
    repositories/
      history_repository.py
      provider_repository.py
    routers/
      health.py
      providers.py
      status.py
    schemas/
      health.py
      provider.py
      status.py
    services/
      status_service.py
    utils/
      cache.py
      http.py
      status_mapping.py
    main.py
    requirements.txt
  frontend/
    app/
      globals.css
      layout.tsx
      page.tsx
    components/
      dashboard/
        dashboard-view.tsx
        providers-table.tsx
        summary-cards.tsx
      ui/
    lib/
      api.ts
      query-client.tsx
      status.ts
      types.ts
      utils.ts
    styles/
      app.scss
    package.json
  TEMP_PLAN_AI_STATUS_DASHBOARD.md
  README.md
  .gitignore
```

## Back-end

Como rodar:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

URLs locais:

```txt
http://localhost:8000/health
http://localhost:8000/docs
```

Endpoints disponiveis:

```txt
GET /health
GET /providers
GET /status/summary
GET /status/providers
GET /status/providers/{provider_name}
```

## Provedores monitorados

O back-end consome JSON publico de status quando disponivel. Para provedores sem JSON publico simples e estavel, usa scraping controlado da pagina publica e marca `source: "scraping"`.

```txt
GitHub
Pagina: https://www.githubstatus.com/
API:    https://www.githubstatus.com/api/v2/summary.json

Anthropic / Claude
Pagina: https://status.claude.com/
API:    https://status.claude.com/api/v2/summary.json

Vercel
Pagina: https://www.vercel-status.com/
API:    https://www.vercel-status.com/api/v2/summary.json

Railway
Pagina: https://status.railway.com/
Fonte:  scraping controlado de https://status.railway.com/

Supabase
Pagina: https://status.supabase.com/
API:    https://status.supabase.com/api/v2/summary.json

OpenAI
Pagina: https://status.openai.com/
Fonte:  scraping controlado de https://status.openai.com/

Google Cloud / Gemini
Pagina: https://status.cloud.google.com/
API:    https://status.cloud.google.com/incidents.json
```

## Comportamento atual

- O back-end normaliza Statuspage, Google Cloud incidents JSON e scraping controlado para Railway/OpenAI.
- Falhas externas retornam `status: "unknown"` sem quebrar a API.
- O cache em memoria evita chamadas externas repetidas dentro do TTL.
- O historico em memoria armazena verificacoes por provedor.
- As configuracoes ficam em `backend/core/config.py`, porque nao ha dados sensiveis nesta versao.

## Observacoes de seguranca

Arquivos locais sensiveis e gerados nao devem ser versionados. O `.gitignore` da raiz ignora `.env`, ambientes virtuais, caches Python, dependencias Node, builds e arquivos temporarios.

## Front-end

Scaffold inicial criado com Next.js App Router, TypeScript, Tailwind, SCSS e Shadcn UI, sem `src/`.

O front-end consome apenas o FastAPI. A URL base local fica em `frontend/.env.local`:

```txt
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Componentes Shadcn adicionados:

```txt
button
card
badge
table
skeleton
alert
separator
```

Como rodar:

```bash
cd frontend
npm run dev
```

URL local:

```txt
http://localhost:3000
```

Camada de API criada:

```txt
frontend/lib/types.ts
frontend/lib/api.ts
frontend/lib/query-client.tsx
```

Componentes iniciais do dashboard:

```txt
frontend/components/dashboard/dashboard-view.tsx
frontend/components/dashboard/summary-cards.tsx
frontend/components/dashboard/providers-table.tsx
```

Observacao: `frontend/next-env.d.ts` deve ser mantido no repositorio. Ele e gerado pelo Next para suporte de tipos globais e nao deve ser editado manualmente.
