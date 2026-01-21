/**
 * Provider integration for the email module.
 */
import { env } from "../../config/env";
import { sendConsoleEmail } from "./console.provider";
import { sendResendEmail } from "./resend.provider";
import { sendSmtpEmail } from "./smtpdev.provider";
import { badRequest } from "../../lib/errors";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

/** Send email. */
export async function sendEmail(payload: EmailPayload) {
  switch (env.EMAIL_PROVIDER) {
    case "console":
      return sendConsoleEmail(payload);
    case "smtpdev":
      return sendSmtpEmail(payload);
    case "resend":
      return sendResendEmail(payload);
    default:
      throw badRequest("Unsupported email provider");
  }
}
