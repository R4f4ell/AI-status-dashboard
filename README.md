# AI Status Dashboard

Dashboard full stack para monitorar status e latencia de servicos de IA e APIs publicas.

## Stack

### Back-end

- FastAPI
- Pydantic
- HTTPX
- Uvicorn

### Front-end

- Next.js
- TypeScript
- Tailwind CSS
- SCSS
- Shadcn UI
- TanStack Query
- Recharts
- Lucide React

## Funcionalidades

- Consulta status de provedores externos.
- Normaliza respostas diferentes em um contrato unico.
- Mede tempo de resposta dos provedores.
- Trata timeout, erro HTTP, rate limit e resposta invalida.
- Usa cache em memoria com TTL.
- Exibe resumo e tabela de provedores no dashboard.
- Atualiza dados com polling no front-end.

## Provedores

- GitHub
- Anthropic / Claude
- Vercel
- Railway
- Supabase
- OpenAI
- Google Cloud / Gemini

Railway e OpenAI usam scraping controlado porque nao possuem endpoint JSON publico simples no MVP.

## Como rodar

### Back-end

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

API:

```txt
http://localhost:8000
```

### Front-end

```bash
cd frontend
npm install
npm run dev
```

App:

```txt
http://localhost:3000
```

## Endpoints

```txt
GET /health
GET /providers
GET /status/summary
GET /status/providers
GET /status/providers/{provider_name}
```

## Estrutura

```txt
backend/
  core/
  models/
  repositories/
  routers/
  schemas/
  services/
  utils/
  main.py

frontend/
  app/
  components/
  lib/
  styles/
```
