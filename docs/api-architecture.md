# Alooola Mini API Architecture (Node.js/Express + Postgres + Prisma)

This document defines the **API architecture** for your demo backend using:
- **Node.js + Express + TypeScript**
- **Postgres**
- **Prisma** (models defined in `schema.prisma`)

It covers the features you want to demo:
- **Email verification** for account creation
- **Invite emails** for joint accounts (households)
- **Referral architecture**
- **Onboarding** (financial goals, risk tolerance, starter amount)
- **Discover** (curated portfolios + holdings + simple performance)
- **Ask AI** (assistant threads/messages)
- **Spending UX** (accounts, categories, transactions)

---

## Goals
- **Demo-friendly**: simple to run locally, easy to host.
- **Production-ish**: validation, auth, roles, consistent errors.
- **Mobile-first**: cursor pagination for transaction feeds, predictable filtering.

## Non-goals
- Real brokerage execution, KYC/AML, bank linking.
- Enterprise auth (SSO), full audit/compliance suite.

---

## API conventions

### Base URL and versioning
- All routes are under `/v1`.

### Auth header
- Use bearer access tokens:
  - `Authorization: Bearer <accessToken>`

### Content type
- `Content-Type: application/json`

### Response envelope
Use a consistent shape everywhere:

- Success:
```json
{ "data": { }, "meta": { } }
```

- Error:
```json
{ "error": { "code": "SOME_CODE", "message": "Human readable", "details": { } } }
```

### Cursor pagination
For feeds (transactions, events, messages), return:
- `meta.nextCursor` (string or null)
- `meta.hasMore` (boolean)

Cursor format recommendation:
- opaque string built from stable sort fields (e.g., `txnDate|id`), base64 encoded.

### Idempotency
Support `Idempotency-Key` header on create endpoints that might be retried from mobile:
- `POST /auth/email/start`
- `POST /households/:id/invites`
- `POST /referrals/:code/events`

---

## Service layout (Express)

Suggested folder structure for `services/api`:

```
services/api/
  src/
    app.ts
    server.ts
    config/
      env.ts
    db/
      prisma.ts
    lib/
      crypto.ts
      pagination.ts
      errors.ts
    middleware/
      auth.ts
      rateLimit.ts
      requireHouseholdRole.ts
      requestId.ts
      validate.ts
    modules/
      auth/
        auth.routes.ts
        auth.service.ts
        auth.schemas.ts
      households/
        households.routes.ts
        households.service.ts
        households.schemas.ts
      spending/
        accounts.routes.ts
        categories.routes.ts
        transactions.routes.ts
        spending.service.ts
        spending.schemas.ts
      onboarding/
        onboarding.routes.ts
        onboarding.service.ts
        onboarding.schemas.ts
      portfolios/
        portfolios.routes.ts
        portfolios.service.ts
        portfolios.schemas.ts
      referrals/
        referrals.routes.ts
        referrals.service.ts
        referrals.schemas.ts
      assistant/
        assistant.routes.ts
        assistant.service.ts
        assistant.schemas.ts
      email/
        email.provider.ts
        resend.provider.ts
        smtpdev.provider.ts
  prisma/
    schema.prisma
    seed.ts
```

---

## Environment variables

Minimum demo config:

```
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
APP_BASE_URL=https://your-demo-domain.com
MOBILE_DEEPLINK_BASE=alooolamini://

EMAIL_PROVIDER=console|smtpdev|resend
EMAIL_FROM=noreply@your-demo-domain.com
RESEND_API_KEY=...

RATE_LIMIT_ENABLED=true
```

---

## Auth and email verification

### Models used
- `User`
- `EmailVerification` (stores `tokenHash`, `expiresAt`, `verifiedAt`)
- `RefreshToken` (optional but matches your schema)

### Flow: email verification (magic link or code)
1) User enters email.
2) API creates/looks up user.
3) API creates an `EmailVerification` record with a **hashed token**.
4) API sends email:
   - Magic link: `APP_BASE_URL/verify-email?token=...` (web) or direct deep link.
   - Code: `123456` (simpler to demo live).
5) App calls verify endpoint.
6) API marks `verifiedAt` and issues tokens.

### Endpoints

| Method | Route | Auth | Purpose |
|---|---|---:|---|
| POST | `/v1/auth/email/start` | No | Send verification link/code |
| POST | `/v1/auth/email/verify` | No | Verify token/code, issue tokens |
| POST | `/v1/auth/refresh` | No | Exchange refresh token for new access token |
| POST | `/v1/auth/logout` | Yes | Revoke refresh token |
| POST | `/v1/auth/demo` | No | Create/login demo user (optional) |

### Notes
- Store only **token hash** in DB (`sha256(token)`), compare hashes.
- Add rate limits on `email/start`.
- For mobile, returning both `accessToken` and `refreshToken` is clean.

---

## Households (joint accounts) and invites

### Models used
- `Household`
- `HouseholdMember` (role + status)
- `Invite` (token, status, expiresAt)

### Roles
Use `MemberRole`:
- `owner`: can invite, change roles
- `member`: standard access
- `viewer`: read-only

### Invite flow
1) Owner creates household.
2) Owner sends invite email to another address.
3) Recipient taps invite link (deep link) or enters invite code.
4) API creates or links the user, then creates `HouseholdMember` with `accepted`.

### Endpoints

| Method | Route | Auth | Purpose |
|---|---|---:|---|
| POST | `/v1/households` | Yes | Create household |
| GET | `/v1/households/me` | Yes | List households for user |
| GET | `/v1/households/:householdId` | Yes | Household detail |
| GET | `/v1/households/:householdId/members` | Yes | Members + roles |
| PATCH | `/v1/households/:householdId/members/:memberId` | Yes | Update role/status (owner only) |
| POST | `/v1/households/:householdId/invites` | Yes | Create invite + send email (owner only) |
| GET | `/v1/invites/:token` | No | Read invite preview (optional) |
| POST | `/v1/invites/:token/accept` | Yes/No | Accept invite (auth optional) |

### Notes
- For demo convenience: allow accepting an invite by auto-creating a user if not logged in.
- Store invite tokens as opaque strings; if you want better security, store token hashes (can be done without changing schema by storing the hash in `Invite.token`).

---

## Spending UX (accounts, categories, transactions)

### Models used
- `Account`, `AccountBalance`
- `Category`
- `Transaction`

### Design goals
- A feed that supports **fast scrolling** and predictable pagination.
- Filter/search in a way that fits mobile UI.

### Endpoint shape
Prefer nesting under household to make access control straightforward:

| Method | Route | Auth | Purpose |
|---|---|---:|---|
| GET | `/v1/households/:householdId/accounts` | Yes | List accounts |
| GET | `/v1/accounts/:accountId` | Yes | Account detail |
| GET | `/v1/households/:householdId/categories` | Yes | List categories |
| POST | `/v1/households/:householdId/categories` | Yes | Create category |
| GET | `/v1/households/:householdId/transactions` | Yes | Transaction feed |
| GET | `/v1/transactions/:transactionId` | Yes | Transaction detail |
| PATCH | `/v1/transactions/:transactionId` | Yes | Edit category/note/attribution |

### Transaction feed query params
Keep these consistent:
- `cursor` (optional)
- `limit` (default 25)
- `q` (merchant search)
- `categoryId` (optional)
- `accountId` (optional)
- `attributedUserId` (optional)
- `dateFrom`, `dateTo` (optional)
- `txnType` (`debit` or `credit`)

### Notes
- Use stable ordering: `txnDate DESC, id DESC`.
- Build cursor from `txnDate` and `id`.
- PATCH should be optimistic-friendly (return updated transaction).

---

## Onboarding (goals, risk tolerance, starter amount)

### Models used
- `GoalOption`
- `UserGoalSelection` (many-to-many)
- `UserInvestmentProfile` (riskTolerance + starterAmount)

### Endpoints

| Method | Route | Auth | Purpose |
|---|---|---:|---|
| GET | `/v1/onboarding/options` | No | Return goal options + enums |
| GET | `/v1/onboarding/me` | Yes | Get current user onboarding data |
| PUT | `/v1/onboarding/me` | Yes | Upsert goals + profile |

### Payload design
Use one submission payload to keep onboarding simple:
```json
{
  "goalKeys": ["retirement", "wealth_building"],
  "goalOtherText": null,
  "riskTolerance": "moderate",
  "starterAmount": 10000,
  "starterAmountCustom": null
}
```

---

## Discover (curated portfolios + performance)

### Models used
- `CuratedPortfolio`
- `PortfolioHolding`
- `UserPortfolioPosition` (user invests/selects)
- `PortfolioSnapshot` (time series for chart)
- `PortfolioPosition` (per-symbol holdings over time; optional for demo)

### Endpoints

| Method | Route | Auth | Purpose |
|---|---|---:|---|
| GET | `/v1/portfolios` | Yes | List curated portfolios |
| GET | `/v1/portfolios/:portfolioId` | Yes | Portfolio detail |
| GET | `/v1/portfolios/:portfolioId/holdings` | Yes | Portfolio holdings |
| POST | `/v1/households/:householdId/portfolio-positions` | Yes | Select/invest in a portfolio |
| GET | `/v1/households/:householdId/portfolio-positions` | Yes | User’s portfolio positions |
| GET | `/v1/households/:householdId/portfolio-snapshots` | Yes | Chart data (range param) |

### Chart ranges
Use a small enum for the chart buttons you showed:
- `range=1M|3M|6M|1Y|ALL`

For the demo:
- Seed snapshots into `PortfolioSnapshot`.
- Or compute a fake series on the fly and store it for repeatable results.

---

## Referrals

### Models used
- `Referral` (one per owner)
- `ReferralEvent` (click/signup/complete + meta)

### What the demo needs
- A stable referral code for each user.
- A way to log events and show simple stats.

### Endpoints

| Method | Route | Auth | Purpose |
|---|---|---:|---|
| POST | `/v1/referrals/me` | Yes | Get-or-create referral code |
| GET | `/v1/referrals/me` | Yes | Stats for current user |
| POST | `/v1/referrals/:code/events` | No | Log click/signup/complete |

### Attribution strategy (simple)
Because the schema doesn’t include a dedicated attribution table, use `ReferralEvent.meta` to store:
- `referredUserId`
- `deviceId` (optional)
- `source` (optional)

Example `signup` event:
```json
{
  "eventType": "signup",
  "meta": { "referredUserId": "..." }
}
```

---

## Ask AI (assistant)

### Models used
- `AssistantThread`
- `AssistantMessage`

### Endpoints

| Method | Route | Auth | Purpose |
|---|---|---:|---|
| GET | `/v1/assistant/threads` | Yes | List threads |
| POST | `/v1/assistant/threads` | Yes | Create thread |
| GET | `/v1/assistant/threads/:threadId` | Yes | Thread detail |
| GET | `/v1/assistant/threads/:threadId/messages` | Yes | Paginated messages |
| POST | `/v1/assistant/threads/:threadId/messages` | Yes | Add user message and generate reply |

### Implementation note
Hide the model provider behind an interface:
- `assistant.service.ts` calls `llmProvider.generateReply(context)`
- Store the assistant response as a message with `sender=assistant`

For the demo, you can:
- Implement a stub responder first (deterministic responses), then swap in a real LLM later.

---

## Advisor scheduling (optional)

Your schema includes `Advisor`, `AdvisorSlot`, `AdvisorAppointment`. If you want “schedule with an advisor” to work:

| Method | Route | Auth | Purpose |
|---|---|---:|---|
| GET | `/v1/advisors` | Yes | List advisors |
| GET | `/v1/advisors/:advisorId/slots` | Yes | Available slots |
| POST | `/v1/advisor-appointments` | Yes | Book appointment |

---

## Email delivery (verification + invites)

### Provider abstraction
Create a simple interface:

- `sendEmail({ to, subject, html, text })`

Providers:
- `console`: log emails to server output (fastest)
- `smtpdev`: local SMTP capture tool (MailHog/smtp4dev)
- `resend`: production-ish API email

### Templates
Keep templates minimal:
- `verify-email`
- `household-invite`

Include:
- button link
- fallback plain URL
- expiry time

---

## Security and correctness checklist

### Request validation
- Validate every POST/PATCH with Zod.

### Auth and access control
- `requireAuth` for most routes.
- `requireHouseholdRole(householdId, [owner|member|viewer])` for household resources.
- Block `viewer` from write endpoints (category create, txn patch, invite, role changes).

### Rate limiting
- Aggressive limits on:
  - `/auth/email/start`
  - `/referrals/:code/events`
  - `/households/:id/invites`

### Error handling
- Central error middleware.
- Return consistent `error.code` strings.

---

## Local development

### Run Postgres
Use docker-compose (recommended) and set `DATABASE_URL`.

### Prisma
- `prisma migrate dev`
- `prisma db seed`

### Seed data
Seed enough data to demo immediately:
- 1 demo user
- 1 household + 2 members (or 1 pending invite)
- accounts + balances
- 100+ transactions across dates
- goal options
- curated portfolios + holdings
- portfolio snapshots

---

## What to implement first (fastest demo path)

1) **Auth: email verification** (`/auth/email/start`, `/auth/email/verify`)
2) **Household create + invite** (`/households`, `/households/:id/invites`, `/invites/:token/accept`)
3) **Spending feed** (`/households/:id/transactions` + PATCH)
4) **Onboarding** (`/onboarding/options`, `/onboarding/me`)
5) **Discover portfolios** (`/portfolios`, holdings, snapshots)
6) **Referrals** (code + events + stats)
7) **Ask AI** (thread + messages)

