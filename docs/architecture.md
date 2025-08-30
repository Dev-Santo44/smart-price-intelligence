# Architecture (MVP)

- **Frontend (Vite React)**: Admin UI for products, competitors, rules, and viewing recommendations.
- **Backend (Express)**: REST API, JWT auth, business logic and orchestration of ML calls.
- **ML (FastAPI)**: Price recommendation microservice (rule-based starter).
- **DB (Postgres)**: Persistent storage.

## API (selected)
- `POST /api/auth/login` -> {token}
- `GET /api/products` (auth)
- `POST /api/products` (auth)
- `GET /api/competitors` (auth)
- `POST /api/competitors` (auth)
- `GET /api/rules` (auth)
- `POST /api/rules` (auth)
- `POST /api/recommend/:productId` (auth) -> { recommended_price }

## Schedules
- 03:00 daily cron placeholder for scraping.
