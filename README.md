# Smart Price Intelligence (Monorepo)

A B2B platform for competitor-aware price analysis and optimized price recommendations.

## Stack
- **Frontend**: React (Vite) + Tailwind
- **Backend**: Node.js + Express + Sequelize (PostgreSQL)
- **ML Service**: Python FastAPI (simple rule-based recommender to start)
- **DB**: PostgreSQL
- **Orchestration**: Docker & docker-compose
- **Auth**: JWT (backend)
- **Scheduler**: node-cron (backend; replace with BullMQ/Redis later if needed)

## Quick Start (Docker)
- Add enviornment Variable file in project folder
- **Download Docker**: Login to docker
```bash
# 1) Build & run all services
docker compose up --build
```

Services:
- Backend: http://localhost:8080
- Frontend (Vite dev proxy via docker): http://localhost:5173
- ML service: http://localhost:8000
- PostgreSQL: localhost:5432

## Local Development (without Docker)
- **Backend**: `cd backend && npm i && npm run dev`
- **Frontend**: `cd frontend && npm i && npm run dev`
- **ML**: `cd models && pip install -r requirements.txt && uvicorn src.app:app --reload`

> Ensure PostgreSQL is running locally and env vars match your setup.

## Repo Structure
```
smart-price-intelligence/
├── backend/            # Express app (REST API, auth, rules, scraping hooks)
├── frontend/           # React (Vite) admin & analytics UI
├── models/             # FastAPI service (price recommendation)
├── database/           # SQL schema & seeds
├── docker/             # Dockerfiles
├── docs/               # Architecture & API notes
├── .github/workflows/  # CI
├── docker-compose.yml
├── .env.example
└── README.md
```

## Initial MVP Flow
1. Admin logs in (JWT).
2. Upload products CSV or create manually.
3. Add competitors (URL/API key).
4. Set pricing rules (min margin, undercut cap, elasticity level).
5. Trigger fetch/scrape (stub) and call ML `/predict` for recommendations.
6. Review and approve recommended prices in UI.

## Deployment Notes
- Use managed Postgres (Supabase, RDS).
- Containerize all services; push images to GHCR/Docker Hub.
- Frontend can be deployed to Netlify/Vercel (adjust API base URL).
- Backend & ML on Render/Railway/Fly.io/ECS. Add HTTPS (Caddy/NGINX) if self-hosting.
- Add proper logging (pino/winston), metrics, and error tracking (Sentry) as you scale.
```
