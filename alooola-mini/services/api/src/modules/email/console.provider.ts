export async function sendConsoleEmail(payload: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  // eslint-disable-next-line no-console
  console.log("Email sent (console):", {
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
  });
}
