const nodemailer = require("nodemailer");
const config = require("../config/config");

/**
 * Sends an email via SMTP (Gmail App Password or any SMTP provider).
 * Configure SMTP_HOST / SMTP_USER / SMTP_PASS in .env — see .env.example.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  await transporter.sendMail({
    from: `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`,
    to,
    subject,
    text,
    html,
  });
};

module.exports = sendEmail;
