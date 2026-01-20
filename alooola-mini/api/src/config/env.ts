/**
 * Environment variable parsing and validation.
 */
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  APP_BASE_URL: z.string().url().optional().default("http://localhost:3000"),
  MOBILE_DEEPLINK_BASE: z.string().optional().default("alooolamini://"),
  EMAIL_PROVIDER: z.enum(["console", "smtpdev", "resend"]).default("console"),
  EMAIL_FROM: z.string().min(1).default("noreply@alooola.local"),
  RESEND_API_KEY: z.string().optional(),
  RATE_LIMIT_ENABLED: z.string().optional().default("true"),
  PORT: z.string().optional().default("4000"),
  SMTP_HOST: z.string().optional().default("localhost"),
  SMTP_PORT: z.string().optional().default("1025"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

/** Helper for env. */
export const env = {
  ...parsed.data,
  PORT: Number(parsed.data.PORT),
  RATE_LIMIT_ENABLED: parsed.data.RATE_LIMIT_ENABLED !== "false",
};
