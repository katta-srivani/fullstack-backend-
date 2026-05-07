const nodemailer = require("nodemailer");

const getSmtpPort = () => Number(process.env.SMTP_PORT || 587);

const sendEmail = async (to, subject, html) => {
  const host = process.env.SMTP_HOST;
  const port = getSmtpPort();
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const senderEmail = process.env.MAIL_FROM_EMAIL || user;
  const senderName = process.env.MAIL_FROM_NAME || "Password Reset App";

  if (!host || !user || !pass || !senderEmail) {
    throw new Error("SMTP_HOST, SMTP_USER, SMTP_PASS, and MAIL_FROM_EMAIL must be set in backend .env");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });

  const info = await transporter.sendMail({
    from: `"${senderName}" <${senderEmail}>`,
    to,
    subject,
    html
  });

  console.log("Email sent successfully:", info.messageId);
  return info;
};

module.exports = sendEmail;
