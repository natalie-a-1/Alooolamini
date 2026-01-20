/**
 * Project source file.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const env_1 = require("../../config/env");
const console_provider_1 = require("./console.provider");
const resend_provider_1 = require("./resend.provider");
const smtpdev_provider_1 = require("./smtpdev.provider");
const errors_1 = require("../../lib/errors");
async function sendEmail(payload) {
    switch (env_1.env.EMAIL_PROVIDER) {
        case "console":
            return (0, console_provider_1.sendConsoleEmail)(payload);
        case "smtpdev":
            return (0, smtpdev_provider_1.sendSmtpEmail)(payload);
        case "resend":
            return (0, resend_provider_1.sendResendEmail)(payload);
        default:
            throw (0, errors_1.badRequest)("Unsupported email provider");
    }
}
