/**
 * Tests for the email provider dispatcher, which selects which of the three possible
 * email sending implementations will be invoked based on environment variables.
 * 
 * The tested providers are:
 * - console.provider: sends emails via the console (mocked here)
 * - smtpdev.provider: sends emails via SMTP (mocked here)
 * - resend: sends emails via the Resend API (fetch is mocked)
 *
 * The test suite ensures:
 * - The correct provider is invoked when specified by the EMAIL_PROVIDER env var
 * - Expected errors are thrown for config errors or unknown providers
 * - The correct payload structure is built and used for provider implementations
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mocks for the two local providers, so we can verify if they're called without sending real emails
const consoleEmailMock = vi.fn();
const smtpEmailMock = vi.fn();

// Mock implementation for the console provider
vi.mock("../console.provider", () => ({
  sendConsoleEmail: consoleEmailMock,
}));

// Mock implementation for the smtpdev provider
vi.mock("../smtpdev.provider", () => ({
  sendSmtpEmail: smtpEmailMock,
}));

/**
 * Baseline environment variable set.
 * These are copied to process.env for each test via setEnv().
 * 
 * These mimic what would be set in production for local implementations,
 * with EMAIL_PROVIDER modifiable for each test to control dispatching.
 */
const baseEnv: Record<string, string | undefined> = {
  DATABASE_URL: "postgres://user:pass@localhost:5432/test",
  JWT_ACCESS_SECRET: "access-secret",
  JWT_REFRESH_SECRET: "refresh-secret",
  APP_BASE_URL: "http://localhost:3000",
  MOBILE_DEEPLINK_BASE: "alooolamini://",
  EMAIL_PROVIDER: "console",
  EMAIL_FROM: "test@example.com",
  RESEND_API_KEY: "resend-key",
  RATE_LIMIT_ENABLED: "true",
  PORT: "4000",
  SMTP_HOST: "localhost",
  SMTP_PORT: "1025",
};

// The shape of the email "job" that will be fed to each provider for sending
const emailPayload = {
  to: "user@test.dev",
  subject: "Hello",
  html: "<p>Hello</p>",
  text: "Hello",
};

// Global fetch mock for the "resend" provider implementation
const fetchMock = vi.fn();

/**
 * Prepares test state before each test:
 * - Resets process.env to baseline values
 * - Resets all mocks (providers + fetch)
 * - Re-stubs the global fetch
 */
beforeEach(() => {
  setEnv({});
  vi.resetModules();
  consoleEmailMock.mockReset();
  smtpEmailMock.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

/**
 * Applies process.env values for a test, merging with the baseEnv.
 * Can set an env var to undefined to delete it from process.env.
 */
function setEnv(overrides: Partial<typeof baseEnv>) {
  const next = { ...baseEnv, ...overrides };
  Object.entries(next).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  });
}

/**
 * Loads the email provider module *after* patching environment.
 * Ensures that changes to process.env will be respected in module setup.
 * @param envOverrides 
 * @returns 
 */
async function loadEmailProvider(envOverrides: Partial<typeof baseEnv>) {
  setEnv(envOverrides);
  vi.resetModules();
  return import("../email.provider");
}

describe("email provider", () => {
  /**
   * This test ensures that when EMAIL_PROVIDER is set to "console",
   * the sendConsoleEmail implementation is called exactly once with correct arguments,
   * and no other providers (smtp or fetch) are called.
   */
  it("dispatches to console provider", async () => {
    const { sendEmail } = await loadEmailProvider({ EMAIL_PROVIDER: "console" });

    await sendEmail(emailPayload);

    expect(consoleEmailMock).toHaveBeenCalledTimes(1);
    expect(consoleEmailMock).toHaveBeenCalledWith(emailPayload);
    expect(smtpEmailMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  /**
   * This test ensures that when EMAIL_PROVIDER is set to "smtpdev",
   * the sendSmtpEmail implementation is called exactly once with correct arguments,
   * and no other providers (console or fetch) are called.
   */
  it("dispatches to smtp provider", async () => {
    const { sendEmail } = await loadEmailProvider({ EMAIL_PROVIDER: "smtpdev" });

    await sendEmail(emailPayload);

    expect(smtpEmailMock).toHaveBeenCalledTimes(1);
    expect(smtpEmailMock).toHaveBeenCalledWith(emailPayload);
    expect(consoleEmailMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  /**
   * This test ensures that when EMAIL_PROVIDER is "resend" (and a valid RESEND_API_KEY is present),
   * the fetch implementation for API delivery is called exactly once, with the correct parameters,
   * no other provider implementations are invoked,
   * and the posted request to Resend includes the correct structure and headers.
   * 
   * This simulates a successful, valid API call scenario.
   */
  it("dispatches to resend provider and calls fetch", async () => {
    // Simulate a successful HTTP response from the fetch call
    fetchMock.mockResolvedValue({ ok: true, status: 200, text: vi.fn() });

    const { sendEmail } = await loadEmailProvider({
      EMAIL_PROVIDER: "resend",
      RESEND_API_KEY: "test-resend-key",
    });

    await sendEmail(emailPayload);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    // Expects correct Resend API endpoint
    expect(url).toBe("https://api.resend.com/emails");
    // Expects POST method and required headers
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer test-resend-key",
      "Content-Type": "application/json",
    });
    // Expects email content body to match what was provided
    const parsed = JSON.parse(String(init?.body));
    expect(parsed).toMatchObject({
      from: baseEnv.EMAIL_FROM,
      to: emailPayload.to,
      subject: emailPayload.subject,
      html: emailPayload.html,
      text: emailPayload.text,
    });
    expect(consoleEmailMock).not.toHaveBeenCalled();
    expect(smtpEmailMock).not.toHaveBeenCalled();
  });

  /**
   * This test verifies that if an unsupported EMAIL_PROVIDER value is given,
   * the module throws an error during import or setup,
   * and clearly indicates a configuration failure.
   */
  it("throws for unsupported provider", async () => {
    await expect(loadEmailProvider({ EMAIL_PROVIDER: "invalid" })).rejects.toThrow(
      /Invalid environment variables/
    );
  });

  /**
   * This test ensures that if the "resend" provider is used with RESEND_API_KEY missing,
   * calling sendEmail will throw a useful error,
   * and no fetch call (i.e., no attempted API send) actually occurs.
   */
  it("throws when resend provider missing API key", async () => {
    const { sendEmail } = await loadEmailProvider({
      EMAIL_PROVIDER: "resend",
      RESEND_API_KEY: undefined,
    });

    await expect(sendEmail(emailPayload)).rejects.toThrow(/RESEND_API_KEY not configured/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
