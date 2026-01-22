process.env.JWT_ACCESS_SECRET ??= "test-access-secret";
process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret";
process.env.APP_BASE_URL ??= "http://localhost:3000";
process.env.MOBILE_DEEPLINK_BASE ??= "alooolamini://";
process.env.EMAIL_PROVIDER ??= "console";
process.env.EMAIL_FROM ??= "test@example.com";
process.env.RATE_LIMIT_ENABLED ??= "false";
process.env.DATABASE_URL ??= "postgres://placeholder/placeholder";
// Allow test harness to run prisma db push against the disposable Testcontainers DB without manual consent.
// Do NOT reuse this default when pointing DATABASE_URL at anything non-ephemeral.
process.env.PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION ??=
  "yes, prisma db push for disposable test db";
