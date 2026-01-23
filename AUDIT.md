# Alooola Mini Audit (Mobile + API)

Date: January 21, 2026

Scope:
- Mobile app: `/alooola-mini/mobile`
- API service: `/alooola-mini/api`

Method:
- Read through screens, hooks, services, and navigation in the mobile app.
- Read through API routes, services, middleware, and Prisma schema.
- Checked for dead code, mismatches, brittle inline logic, and data inefficiencies.

## Executive Summary
- **There are multiple hard contract mismatches between mobile and API** (onboarding payload shape, advisor appointment endpoints). These will fail at runtime and are not edge cases.
- **Auth and onboarding flows have security and UX gaps** (biometric “gate” is bypassable; invite acceptance can mint tokens without verification; avatar uploads are not actually uploaded).
- **Data-fetching is inconsistent and frequently redundant**; large payloads are pulled and filtered client-side, and the API does non-trivial aggregations in JS.
- **The codebase contains non-trivial dead code and demo-only logic inside production screens**, which makes behavior unpredictable and harder to reason about.

## High Severity Issues (Breaks functionality or security)

1) **Onboarding payload mismatch: goals never saved**
- Mobile sends `goals`, API expects `goalKeys`.
- `validate` strips unknown keys, so goals never reach the service.
- Files:
  - Mobile: `alooola-mini/mobile/src/services/onboarding.ts`, `alooola-mini/mobile/src/screens/onboarding/OnboardingScreen.tsx`
  - API: `alooola-mini/api/src/modules/onboarding/onboarding.schemas.ts`, `alooola-mini/api/src/modules/onboarding/onboarding.routes.ts`
- Impact: onboarding data is silently lost; users cannot save goals.

2) **Advisor booking endpoints don’t match**
- Mobile posts to `/appointments` and expects `/appointments/me`.
- API exposes `POST /advisor-appointments` only and no `GET /appointments/me`.
- Files:
  - Mobile: `alooola-mini/mobile/src/services/advisors.ts`
  - API: `alooola-mini/api/src/modules/advisors/advisor-appointments.routes.ts`
- Impact: booking calls fail; "My appointments" cannot work.

3) **Biometric auth is not actually enforced**
- On app start, if biometrics are available and the refresh token exists, the app prompts for biometrics; if the user cancels, it falls back to stored access token and logs in anyway.
- File: `alooola-mini/mobile/src/context/AuthContext.tsx`
- Impact: biometric check can be bypassed just by canceling; it provides a false sense of security.

4) **Avatar upload is not a real upload**
- Mobile stores local device file URI (`ImagePicker`) and sends it to the API as `avatarUrl`.
- API stores it directly; this URI is not usable on other devices.
- Files:
  - Mobile: `alooola-mini/mobile/src/screens/onboarding/OnboardingScreen.tsx`
  - API: `alooola-mini/api/src/modules/onboarding/onboarding.service.ts`
- Impact: profile avatars will break across devices/sessions.

5) **Invite acceptance can mint tokens without verification**
- `acceptInvite` can create a user and issue access/refresh tokens without verifying the email or setting a password.
- File: `alooola-mini/api/src/modules/households/households.service.ts`
- Impact: unauthenticated token issuance via invite link; may be intended, but it is a security hole if not explicitly designed.

## Medium Severity Issues (Performance, correctness, or maintainability)

1) **Client pulls too much data and filters locally**
- `HomeScreen` fetches `portfolio-summary` with range `ALL` and then filters by timeframe client-side.
- File: `alooola-mini/mobile/src/screens/home/HomeScreen.tsx`
- API already supports range filtering: `alooola-mini/api/src/modules/portfolios/portfolios.service.ts`
- Impact: unnecessary bandwidth and slower startup for users with many snapshots.

2) **FlatList nested inside ScrollView (performance/virtualization risk)**
- `Screen` uses `ScrollView` by default; `AvailableScreen` renders a `FlatList` inside it.
- RN docs: ScrollView renders all children; FlatList uses virtualization for large lists. Wrapping `FlatList` in `ScrollView` defeats virtualization and can cause perf issues. (Inference based on docs.)
- Files: `alooola-mini/mobile/src/components/Screen.tsx`, `alooola-mini/mobile/src/screens/available/AvailableScreen.tsx`
- References: React Native ScrollView and VirtualizedList docs. citeturn1search0turn0search0

3) **Spending summary computed in JS for potentially large datasets**
- API loads all transactions in a period and aggregates in JavaScript.
- File: `alooola-mini/api/src/modules/spending/spending.service.ts`
- Impact: poor scalability; should use database aggregation/grouping.

4) **Advisor booking not transactional**
- Booking logic creates appointment, then updates slot status in a separate call.
- File: `alooola-mini/api/src/modules/advisors/advisors.service.ts`
- Impact: race conditions and double-booking under concurrency.

5) **Default avatar URL is not served by API**
- API returns `/assets/profile-pictures/Calm.svg`, but the API server never serves static assets.
- Mobile treats any URL starting with `/` as invalid and shows a placeholder.
- Files:
  - API: `alooola-mini/api/src/modules/users/users.routes.ts`, `alooola-mini/api/src/modules/onboarding/onboarding.service.ts`
  - Mobile: `alooola-mini/mobile/src/screens/profile/ProfileScreen.tsx`
- Impact: default avatars never show; behavior differs across environments.

6) **Redundant and inconsistent data fetching**
- `useHousehold` fetches households; screens often re-fetch on focus.
- `HomeScreen` fetches unread count and watchlist separately without caching.
- Files: `alooola-mini/mobile/src/hooks/useHousehold.ts`, `alooola-mini/mobile/src/screens/home/HomeScreen.tsx`, `alooola-mini/mobile/src/screens/profile/ProfileScreen.tsx`
- Impact: extra network calls and uneven UI refresh.

7) **Onboarding flow split across navigation stacks**
- `AuthStack` includes `OnboardingScreen`, but `RootNavigator` also shows onboarding outside the stack using `showOnboarding`.
- Files: `alooola-mini/mobile/src/navigation/AuthStack.tsx`, `alooola-mini/mobile/src/navigation/RootNavigator.tsx`
- Impact: navigation state is fragmented; harder to reason about back behavior.

## Low Severity Issues (Cleanliness, clarity, consistency)

1) **Dead/unused files and exports**
- Empty files: `alooola-mini/mobile/src/lib/constants.ts`, `alooola-mini/mobile/src/lib/types.ts`
- Unused exports: `alooola-mini/mobile/src/components/index.ts`, `alooola-mini/mobile/src/services/index.ts`
- Unused components: `alooola-mini/mobile/src/components/ImageWithFallback.tsx`
- Unused services: `alooola-mini/mobile/src/services/advisors.ts` (no callers), plus `getCurrentUser`, `getUserProfile`, `getMyReferralStats` in `alooola-mini/mobile/src/services/user.ts`
- API endpoints unused by mobile: `assistant` module and `onboarding/options`

2) **Mock/demo logic mixed into production screens**
- Multiple `.mock.ts` files drive UI logic in production (Discover, OpportunityDetail, Home, Spending, Onboarding).
- AI chat in Discover is fully local and does not use the API assistant module.
- Files: `alooola-mini/mobile/src/screens/**/**.mock.ts`, `alooola-mini/api/src/modules/assistant/*`
- Impact: demo behavior leaks into real experience and complicates debugging.

3) **Inconsistent naming between layers**
- `advisor-appointments` vs `appointments`.
- `goals` vs `goalKeys`.
- `portfolio` vs `opportunity` naming in UI.

4) **Formatting utilities duplicated or unused**
- `formatCurrency`/`formatDate` exist in `lib/format.ts` but similar logic is redefined in screens.
- Files: `alooola-mini/mobile/src/lib/format.ts`, `alooola-mini/mobile/src/screens/home/HomeScreen.tsx`

5) **Root package dependencies mismatch**
- Root `package.json` includes `expo-local-authentication` even though mobile has its own dependency (different version).
- Files: `alooola-mini/package.json`, `alooola-mini/mobile/package.json`

## Inline Logic That Is Fragile (and better package options)

1) **Ad-hoc data fetching without caching or deduping**
- Multiple screens repeat `useEffect` + local state + manual error handling.
- Consider a data-fetching layer such as TanStack Query to dedupe requests and standardize retries/cache invalidation. citeturn0search2

2) **Manual form state and validation across multiple screens**
- Login, onboarding, and add-account flows are all hand-rolled with multiple `useState` fields.
- Consider React Hook Form to reduce rerenders and centralize validation. citeturn0search4

(These are suggestions to reduce complexity; not strictly required to make the app work.)

## Auth + Authorization Review (Mobile)

- `AuthContext` does not auto-refresh access tokens for API requests. The app likely logs out on 401 in `useHousehold`, while other requests silently fail.
  - Files: `alooola-mini/mobile/src/context/AuthContext.tsx`, `alooola-mini/mobile/src/services/api.ts`, `alooola-mini/mobile/src/hooks/useHousehold.ts`
- `AuthContext` exposes `getAccessToken`, but `apiRequest` reads from SecureStore directly; this bypasses in-memory state and adds extra IO.
  - Files: `alooola-mini/mobile/src/context/AuthContext.tsx`, `alooola-mini/mobile/src/services/api.ts`
- `logout` clears local tokens but never calls the API logout endpoint to revoke tokens.
  - Files: `alooola-mini/mobile/src/context/AuthContext.tsx`, `alooola-mini/mobile/src/services/auth.ts`

## API Observations

- Consistency: most modules use services, but `users.routes.ts` uses Prisma directly (inconsistent structure).
- Rate limiting is only applied to `/auth/register`, not to login or verify endpoints.
  - Files: `alooola-mini/api/src/modules/auth/auth.routes.ts`, `alooola-mini/api/src/middleware/rateLimit.ts`
- `mutual-funds` service makes multiple sequential external requests; high likelihood of hitting Alpha Vantage limits.
  - File: `alooola-mini/api/src/modules/mutual-funds/mutual-funds.service.ts`

## Data Movement and Efficiency Notes

- **Client-side filtering of large datasets**: `portfolio-summary` returns all snapshots; UI filters locally.
- **Server-side aggregation in JS**: spending summary aggregates in memory instead of database.
- **No shared caching layer**: multiple screens re-fetch identical data.

## Testing Coverage

- No test files detected (`*.test.*`/`*.spec.*`).
- High-risk flows (auth, onboarding, invites, portfolio summary) have no automated coverage.

## Recommendations (Prioritized)

1) **Fix contract mismatches**
- Align `goals` vs `goalKeys` and `appointments` vs `advisor-appointments`.

2) **Fix auth gating and token lifecycle**
- Enforce biometrics when configured; do not fall back to cached token if biometric auth fails.
- Add refresh token handling and 401 retry flow in the API client.
- Call API logout to revoke tokens.

3) **Make avatar handling real**
- Add upload flow (pre-signed URL or multipart), store server-accessible URL in DB.

4) **Reduce data bloat**
- Use server-side filtering for portfolio snapshots; avoid downloading `ALL` by default.
- Use SQL aggregation or Prisma groupBy for spending summary.

5) **Stabilize navigation**
- Keep onboarding within a single stack and reduce conditional rendering outside navigation.

6) **Clean dead code**
- Remove unused services, mocks, and empty files, or move them into a `/demo` or `/storybook` folder.

## References

- React Native ScrollView vs FlatList performance notes. citeturn1search0
- React Native VirtualizedList virtualization details. citeturn0search0
- TanStack Query docs (query invalidation/refetch patterns). citeturn0search2
- React Hook Form API overview. citeturn0search4
