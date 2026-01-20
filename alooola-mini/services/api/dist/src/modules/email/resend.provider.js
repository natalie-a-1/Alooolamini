"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResendEmail = sendResendEmail;
const env_1 = require("../../config/env");
const errors_1 = require("../../lib/errors");
async function sendResendEmail(payload) {
    if (!env_1.env.RESEND_API_KEY) {
        throw (0, errors_1.badRequest)("RESEND_API_KEY not configured");
    }
    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${env_1.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: env_1.env.EMAIL_FROM,
            to: payload.to,
            subject: payload.subject,
            html: payload.html,
            text: payload.text,
        }),
    });
    if (!response.ok) {
        const text = await response.text();
        throw (0, errors_1.badRequest)("Resend API error", { status: response.status, text });
    }
}
