/**
 * Project source file.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendConsoleEmail = sendConsoleEmail;
async function sendConsoleEmail(payload) {
    // eslint-disable-next-line no-console
    console.log("Email sent (console):", {
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
    });
}
