# alooola-mini (product monorepo)

This folder is the **workspace root** for the actual product:

- `apps/mobile`: Expo + React Native app
- `services/api`: Express + Prisma API
- `infra`: local infrastructure (Docker compose)

## Install

From this directory:

```bash
npm install
```

## Run

### Mobile (Expo)

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

### API

```bash
npm run dev:api
```

### Postgres

```bash
docker compose -f infra/docker-compose.yml up -d
```

