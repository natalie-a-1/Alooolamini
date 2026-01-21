# Postgres Setup (Local + Production)

## Where the DB lives
- **Production**: Render Postgres (managed by Render).
- **Local dev**: Postgres in Docker (`alooola-mini/infra/docker-compose.yml`).

---

## Local dev (Docker)

### Start/stop the local DB
```bash
npm run db:up     # start local Postgres
npm run db:down   # stop + remove volumes
```

### Reset + seed the local DB
```bash
cd alooola-mini/api
export DATABASE_URL="$DATABASE_URL_LOCAL"

npx prisma db push --force-reset
npx prisma db seed
```

---

## Env vars (API)

`alooola-mini/api/.env`
- `DATABASE_URL_LOCAL` → local Docker DB
- `DATABASE_URL` → production DB
