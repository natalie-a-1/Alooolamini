# Alooola Mini API

This doc explains how the API is structured and how to extend it.

---

## 1) Where things live

```
alooola-mini/api/
  src/
    index.ts            # entry
    server.ts           # HTTP server
    app.ts              # express app + middleware
    routes.ts           # top-level routing
    modules/            # feature modules (auth, households, ...)
    middleware/         # auth, validation, rate limits
    lib/                # shared helpers
  prisma/
    schema.prisma       # DB schema
    seed.ts             # demo data
```

---

## 2) API structure

- All routes live under **`/api/v1`** (see `src/app.ts`).
- Each feature lives in **`src/modules/<feature>`** with:
  - `*.routes.ts` → Express routes
  - `*.service.ts` → business logic
  - `*.schemas.ts` → Zod validation
- Use **`validate()`** middleware on every route.
- Use **`requireAuth`** for protected endpoints.

---

## 3) Auth flow (current)

1) **Register** with email + password
2) API **sends verification code**
3) **Verify** code to activate account and issue tokens
4) **Login** after that uses email + password only

Endpoints:
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/email/verify`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/demo`

---

## 4) Error response format

All errors follow:
```json
{ "error": { "code": "SOME_CODE", "message": "Human readable", "details": {} } }
```

---

## 5) Adding a new module (pattern)

1) Create a folder under `src/modules/<name>`
2) Add:
   - `<name>.routes.ts`
   - `<name>.service.ts`
   - `<name>.schemas.ts`
3) Export the router and wire it in `src/routes.ts`.

Example:
```
// src/modules/widgets/widgets.routes.ts
const router = Router();
router.post('/', validate(createWidgetSchema), async (...) => { ... });
export { router as widgetsRouter };
```

```ts
// src/routes.ts
apiRouter.use('/widgets', widgetsRouter);
```

---

## 6) DB + Prisma

- Schema: `prisma/schema.prisma`
- Seeding: `prisma/seed.ts`
- Local reset + seed:
  ```bash
  cd alooola-mini/api
  export DATABASE_URL="$DATABASE_URL_LOCAL"
  npx prisma db push --force-reset
  npx prisma db seed
  ```

---

## 7) Common conventions

- All IDs are UUIDs
- Use Zod validation for inputs
- Return `{ data: ... }` for success responses
- Use `badRequest`, `unauthorized`, `forbidden` helpers for errors

---

## 8) Quick endpoint index (by area)

Auth:
- `/api/v1/auth/*`

Households + invites:
- `/api/v1/households/*`
- `/api/v1/invites/*`

Spending + categories:
- `/api/v1/transactions/*`
- `/api/v1/accounts/*`
- `/api/v1/categories/*`

Portfolios:
- `/api/v1/portfolios/*`
- `/api/v1/households/:householdId/portfolio-*`

Onboarding:
- `/api/v1/onboarding/*`

Referrals:
- `/api/v1/referrals/*`

Assistant:
- `/api/v1/assistant/*`

Advisors:
- `/api/v1/advisors/*`
- `/api/v1/advisor-appointments/*`

Notifications + watchlist:
- `/api/v1/notifications/*`
- `/api/v1/watchlist/*`
