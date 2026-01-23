/**
 * @file assets.ts
 * @description Shared asset references and templated content generators for outbound communications.
 */

/**
 * The default profile image URL used when a user does not have a custom avatar.
 * @constant {string}
 */
export const DEFAULT_AVATAR_URL: string = "/assets/profile-pictures/Calm.svg";

/**
 * Parameters for constructing a verification email message.
 */
export interface VerificationEmailParams {
  /** The verification code/token for the user */
  token: string;
  /** The URL to verify email using a web browser */
  verifyLink: string;
  /** The deep link URL to open verification in the mobile app */
  deepLink: string;
  /** The number of minutes until the verification code expires */
  expiresMinutes: number;
}

/**
 * Represents the payload of a verification email: subject line, plain text, and HTML body.
 */
export interface EmailPayload {
  /** The subject line of the email */
  subject: string;
  /** The plain text version of the email */
  text: string;
  /** The HTML version of the email */
  html: string;
}

/**
 * Builds a styled verification email payload for new user signups.
 *
 * @param {VerificationEmailParams} params - The parameters to construct the email.
 * @returns {EmailPayload} - The generated email subject, text, and HTML content.
 *
 * @example
 * const email = buildVerificationEmail({
 *   token: "123456",
 *   verifyLink: "https://example.com/verify?code=123456",
 *   deepLink: "alooola://verify/123456",
 *   expiresMinutes: 15,
 * });
 * // email.subject, email.text, email.html
 */
export function buildVerificationEmail(params: VerificationEmailParams): EmailPayload {
  const { token, verifyLink, deepLink, expiresMinutes } = params;

  const subject = "Welcome to Alooola - Verify your email";

  const text = [
    "Hi there,",
    "",
    "Thanks for joining Alooola. Use the code below to verify your email:",
    token,
    "",
    `Verify in browser: ${verifyLink}`,
    `Verify on mobile: ${deepLink}`,
    "",
    `This code expires in ${expiresMinutes} minutes.`,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 24px;">
      <table role="presentation" style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06); border: 1px solid #e2e8f0;">
        <tr>
          <td style="padding: 24px 24px 12px 24px;">
            <h1 style="margin: 0 0 8px; font-size: 22px; color: #0f172a;">Verify your email</h1>
            <p style="margin: 0; font-size: 14px; color: #475569;">
              Thanks for joining Alooola. Use the code below to finish setting up your account.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 24px 0 24px;">
            <div style="background: #0f172a; color: #ffffff; border-radius: 10px; padding: 16px; text-align: center; font-size: 18px; letter-spacing: 0.08em; font-weight: 600;">
              ${token}
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 18px 24px 0 24px;">
            <a href="${verifyLink}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 16px; border-radius: 10px; font-size: 14px; font-weight: 600;">
              Verify in browser
            </a>
            <p style="margin: 12px 0 0; font-size: 13px; color: #475569;">
              Mobile users: <a href="${deepLink}" style="color: #2563eb;">Open in the app</a>
            </p>
            <p style="margin: 8px 0 0; font-size: 12px; color: #94a3b8;">
              This code expires in ${expiresMinutes} minutes.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 18px 24px 24px 24px;">
            <p style="margin: 0; font-size: 12px; color: #94a3b8;">
              If you did not sign up, you can safely ignore this email.
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;

  return { subject, text, html };
}