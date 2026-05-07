const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER and EMAIL_PASS must be set in backend .env");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  };

  await transporter.sendMail(mailOptions);
  console.log("Email sent successfully");
};

module.exports = sendEmail;
