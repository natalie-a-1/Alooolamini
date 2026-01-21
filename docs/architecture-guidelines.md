# Architecture Guidelines

> **These rules strictly define the structure for API, mobile, and testing features. Follow them unless a deviation is explicitly documented and justified in a PR. Avoid all redundancy. All files, folders, and exported types must be documented with clear documentation-style comments (e.g. JSDoc or TSDoc).**

---

## 1. API Feature Module Structure

**Every API feature is a fully isolated module:**

```
alooola-mini/api/src/modules/<feature>/
  <feature>.routes.ts    // HTTP route declarations and request wiring only
  <feature>.schemas.ts   // Zod schemas and request/response contract types
  <feature>.service.ts   // Business logic and DB access for this feature
  __tests__/
    <feature>.integration.test.ts // Integration tests for this feature
```

**Rules:**
- `routes` handles route wiring only – no logic or validation.
- `schemas` contains all validation and contract types, powered by Zod.
- `service` contains all business logic and ORM or DB access.
- Never import services cross-feature unless code is in a clearly named, dedicated shared module.
- All module tests live in `__tests__` within the module folder.

---

## 2. Type Source of Truth

**Zod schemas are the single source of truth for all request and response types. Always infer types directly.**

```
/**
 * Type inferred from onboardingMeSchema for onboarding API.
 */
export type OnboardingMeInput = z.infer<typeof onboardingMeSchema>["body"];
```

**Rules:**
- Services accept only schema-inferred types.
- Never manually recreate or duplicate any request or response type.
- Mobile and all other consumers must mirror API-defined shapes by importing or copying contracts.

---

## 3. API Response Shape Ownership

**The API strictly defines and owns the shape of all responses.**

**Rules:**
- Do not expose raw Prisma models or joined data structures directly to consumers.
- Only return the fields required by clients.
- Favor flat primitive responses. Allow nested objects only with explicit technical need and documentation.
- No leaks of relational, internal, or unnecessary shape.

**Examples:**
- ✅ Allowed: `goalKeys`, `riskTolerance`, `starterAmount`, `completedAt`
- 🚫 Avoid: full `selections`, `userOnboarding` objects, or raw relational joins

---

## 4. Update Semantics (null vs undefined)

**Follow these clear, documented semantics:**
- `undefined`: *no change* to the value
- `null`: *explicitly clear* the value

**Implementation:**
- Use conditional spreads in Prisma updates to handle null/undefined properly.
- Never coerce values to undefined with `?? undefined`.
- Always preserve request input semantics from the API layer through to persistence.

---

## 5. Mobile API Access Layer

**All network calls are handled in a dedicated typed service per feature:**

```
alooola-mini/mobile/src/services/
  <feature>.ts    // Typed, documented API functions for this feature
```

**Rules:**
- A *single* file per feature in services. No redundant wrapping. All calls fully typed and documented.
- Only the service files may call `fetch` or equivalent network methods.
- Never duplicate API or payload field names. Always mirror API contracts.
- Never place any data shaping, transformation, or formatting logic in screens.
- Types should be imported from `api` if available, or manually copy the Zod contract type and document.

---

## 6. Mobile Feature Folder Structure

**Features are organized with clear separation for components, hooks, styles, and main screen:**

```
alooola-mini/mobile/src/screens/<feature>/
  components/
    // All UI components specific to this feature. Each file must be documented.
  hooks/
    // All custom hooks relevant to this feature. Each file must be documented.
  <Feature>Screen.tsx           // The main functional screen. Header doc required.
  <Feature>Screen.styles.ts     // Styles for the screen. Header doc required.
  <Feature>Screen.mock.ts       // Mocks for development/testing only.
  index.ts                      // Barrels and re-exports only, with clear doc.
```

**Rules:**
- Logic, state, and UI elements are broken up by responsibility (screen, component, hook, styles).
- No file may contain redundant or duplicate code with another file.
- Each file must start with a documentation comment explaining its purpose.
- Any logic or state that is shared across the app goes in a clearly named and documented shared location.
- No data formatting in screens or components. See `lib/format.ts` for formatters and use only what is present—never duplicate or reimplement.

---

## 7. Mobile Shared Utilities, Constants, and Types

**All shared logic must be centrally located—never duplicated**

```
alooola-mini/mobile/src/lib/
  format.ts     // All utility formatting code (dates, currency, etc). Import or add ONLY if not present.
  constants.ts  // Documented, named constants only. No accidental duplication.
  types.ts      // All manual or unified types. All types fully documented.
```

**Rules:**
- Before adding anything, check for (and use) any existing export.
- If you must add, write full documentation and explain why.
- Never duplicate logic or values anywhere in the project.

---

## 8. API Integration Testing

**All API integration tests run against a disposable test DB, never production.**

**Setup:**
- **Test Runner:** Vitest
- **HTTP Assertions:** Supertest
- **Database:** Testcontainers for ephemeral Postgres

```
alooola-mini/api/src/test-utils/
  vitest.setup.ts
  integration.ts
  test-db.ts
```

**Rules:**
- Always use the shared `setupIntegrationTestContext()` util.
- Never run a live API server for tests (use direct handler execution).
- Never connect to Neon or any shared/production DB during tests.
- All tests must have a file-level doc comment explaining the scope.

---

## 9. Adding a New Feature: Checklist

**Step-by-step required process:**

1. Create API module files: `<feature>.routes.ts`, `<feature>.schemas.ts`, `<feature>.service.ts`.
2. Define Zod types; export all request/response types with documentation comments.
3. Implement all isolated business logic in the service file.
4. Add integration tests under `__tests__/`, fully documented.
5. Implement a fully typed, documented API service in `mobile/src/services/<feature>.ts`.
6. Build UI components in `mobile/src/screens/<feature>/` according to folder structure above.
7. Place any formatting or constants in `lib/format.ts` or `lib/constants.ts` only if not present.
8. Add types in `lib/types.ts` if necessary, with documentation.
9. All naming, payloads, and types must exactly match API contracts. No divergences.

---

## 10. Naming Conventions

**Rules:**
- API payload fields use `camelCase`.
- Database fields follow Prisma naming conventions.
- Mobile types must mirror API response shapes exactly—do not rename or diverge.

---

## 11. Deviations

**Any deviation from these rules must be explicitly documented in the PR with full rationale and technical justification.**

---

