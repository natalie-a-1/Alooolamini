# Alooola Mini

AI-powered wealth building platform for medical professionals.

## Project Structure

```
alooola-mini/           # Product monorepo
  mobile/               # Expo + React Native app
  api/                  # Express + Prisma API
  infra/                # Docker Compose (Postgres)
tools/
  figma-react-web/      # Reference web UI from Figma (non-product)
docs/                   # Documentation
```

## Requirements

- Node `>=20.19.4`
- Docker (for local Postgres)
- Expo Go app on your phone

## Setup

Install all dependencies:

```bash
npm run setup
```

Start the database:

```bash
npm run db:up
```

## Running the App

### Mobile (Expo)

```bash
npm run dev:mobile
```

If Metro gets stuck, clear the cache:

```bash
npm run dev:mobile:clear
```

For physical device testing, set:

```bash
EXPO_PUBLIC_API_BASE_URL="https://alooola-mini-api.onrender.com/api/v1" npm run dev:mobile
```
```bash
EXPO_PUBLIC_API_BASE_URL="http:localhost:4000/api/v1" npm run dev:mobile
```

### API

```bash
npm run dev:api
```

The API runs at `http://localhost:4000/api/v1`.

### Database

```bash
npm run db:up      # Start Postgres
npm run db:down    # Stop and remove Postgres
```

From `alooola-mini/`:

```bash
npm run db:push     # Push schema to DB
npm run db:migrate  # Run migrations
npm run db:seed     # Seed demo data
npm run db:generate # Generate Prisma client
```

### Reference Web UI (optional)

```bash
npm run dev:web
```

## Notes

- The `.expo/` directory is machine-specific and gitignored.
- All commands can be run from the repo root.
