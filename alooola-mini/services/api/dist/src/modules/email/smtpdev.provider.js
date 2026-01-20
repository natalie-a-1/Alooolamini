/**
 * Project source file.
 */
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSmtpEmail = sendSmtpEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../../config/env");
const transporter = nodemailer_1.default.createTransport({
    host: env_1.env.SMTP_HOST,
    port: Number(env_1.env.SMTP_PORT),
    auth: env_1.env.SMTP_USER
        ? {
            user: env_1.env.SMTP_USER,
            pass: env_1.env.SMTP_PASS,
        }
        : undefined,
});
async function sendSmtpEmail(payload) {
    await transporter.sendMail({
        from: env_1.env.EMAIL_FROM,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html,
    });
}
