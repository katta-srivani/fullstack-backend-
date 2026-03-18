const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
  try {

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: html
    };

    await transporter.sendMail(mailOptions);

    console.log("Email sent successfully");

  } catch (error) {

    console.log("Email sending failed");
    console.log(error);

  }
};

module.exports = sendEmail;