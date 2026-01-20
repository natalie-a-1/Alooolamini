# Alooola Mini

This repository contains:

- `figma-react-web/`: a **reference web UI** generated from Figma (not part of the product runtime).
- `alooola-mini/`: the **product monorepo** (React Native app + API + infra).

## Requirements

- Node `>=20.19.4` (Expo SDK 54 / React Native 0.81 requirement)
- Docker (for local Postgres via `alooola-mini/infra/docker-compose.yml`)
- Expo Go installed on your phone (keep it updated)

## Quickstart

Install dependencies:

```bash
npm run setup
```

Run the product API:

```bash
npm run dev:api
```

Run the React Native app (Expo):

```bash
npm run dev:mobile
```

If Metro gets into a bad state, clear the cache once:

```bash
npm run dev:mobile:clear
```

If you’re testing on a physical phone and need to force the API URL:

```bash
EXPO_PUBLIC_API_BASE_URL="http://192.168.1.79:4000/api/v1" npm run dev:mobile
```

Run the reference web UI:

```bash
npm run dev:web
```

Bring Postgres up/down:

```bash
npm run db:up
npm run db:down
```

## Notes

- The `.expo/` directory is machine-specific and should not be committed (it is gitignored).
- See `alooola-mini/README.md` for product monorepo details.
