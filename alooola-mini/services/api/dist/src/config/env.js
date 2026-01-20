"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().min(1),
    JWT_ACCESS_SECRET: zod_1.z.string().min(1),
    JWT_REFRESH_SECRET: zod_1.z.string().min(1),
    APP_BASE_URL: zod_1.z.string().url().optional().default("http://localhost:3000"),
    MOBILE_DEEPLINK_BASE: zod_1.z.string().optional().default("alooolamini://"),
    EMAIL_PROVIDER: zod_1.z.enum(["console", "smtpdev", "resend"]).default("console"),
    EMAIL_FROM: zod_1.z.string().min(1).default("noreply@alooola.local"),
    RESEND_API_KEY: zod_1.z.string().optional(),
    RATE_LIMIT_ENABLED: zod_1.z.string().optional().default("true"),
    PORT: zod_1.z.string().optional().default("4000"),
    SMTP_HOST: zod_1.z.string().optional().default("localhost"),
    SMTP_PORT: zod_1.z.string().optional().default("1025"),
    SMTP_USER: zod_1.z.string().optional(),
    SMTP_PASS: zod_1.z.string().optional(),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
}
exports.env = {
    ...parsed.data,
    PORT: Number(parsed.data.PORT),
    RATE_LIMIT_ENABLED: parsed.data.RATE_LIMIT_ENABLED !== "false",
};
