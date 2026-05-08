const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const senderEmail = process.env.MAIL_FROM_EMAIL || smtpUser;
  const senderName = process.env.MAIL_FROM_NAME || "Password Reset App";

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error("SMTP_HOST, SMTP_USER, and SMTP_PASS must be set");
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  const info = await transporter.sendMail({
    from: `"${senderName}" <${senderEmail}>`,
    to,
    subject,
    html
  });

  console.log("Email sent successfully via Nodemailer:", info.messageId);
  return info;
};

module.exports = sendEmail;
