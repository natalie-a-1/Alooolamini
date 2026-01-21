/**
 * Provider integration for the email module.
 */
import { env } from "../../config/env";
import { badRequest } from "../../lib/errors";

/** Send resend email. */
export async function sendResendEmail(payload: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  if (!env.RESEND_API_KEY) {
    throw badRequest("RESEND_API_KEY not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw badRequest("Resend API error", "RESEND_API_ERROR", {
      status: response.status,
      text,
    });
  }
}
