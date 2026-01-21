# Testing Environment


## Tools

- **Vitest**: test runner
- **Supertest**: HTTP calls against the Express app in-memory
- **Testcontainers**: real Postgres for integration tests
- **Prisma**: DB schema + client

## Structure

Tests sit next to the module they cover:

```
alooola-mini/api/src/modules/<module>/__tests__/
  <feature>.integration.test.ts
  <feature>.unit.test.ts
```

Shared test helpers:

```
alooola-mini/api/src/test-utils/
  vitest.setup.ts
  integration.ts
  test-db.ts
```

## What the shared setup does

- `vitest.setup.ts` sets required env defaults (JWT, email provider, etc.)
- `integration.ts` starts/stops the test DB container and builds the app
- `test-db.ts` applies the Prisma schema to the disposable test DB

## Create a new test

1. Put the test file next to the module it covers:  
   `alooola-mini/api/src/modules/<module>/__tests__/`
2. Use the `setupIntegrationTestContext()` helper for integration tests.

Minimal integration test template:

```ts
import { beforeAll, afterAll, it, expect } from "vitest";
import request from "supertest";
import { setupIntegrationTestContext, teardownIntegrationTestContext } from "../../../test-utils/integration";

let app;
let prisma;

beforeAll(async () => {
  const context = await setupIntegrationTestContext();
  app = context.app;
  prisma = context.prisma;
});

afterAll(async () => {
  await teardownIntegrationTestContext();
});

it("example", async () => {
  const res = await request(app).get("/api/v1/health");
  expect(res.status).toBe(200);
});
```

## Run tests

From repo root:

```
npm --prefix alooola-mini/api test
```

Run one file:

```
npm --prefix alooola-mini/api test -- src/modules/onboarding/__tests__/onboarding.integration.test.ts
```

Run one module folder:

```
npm --prefix alooola-mini/api test -- src/modules/onboarding
```

Run a single test by name:

```
npm --prefix alooola-mini/api test -- -t "saves onboarding goals"
```

## Notes

- The API server **does not** need to run for tests.
- The test DB is **disposable** and isolated; it does not use Neon.
- Docker must be running for Testcontainers.
