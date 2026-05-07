const sendEmail = async (to, subject, html) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Password Reset App";

  if (!apiKey || !senderEmail) {
    throw new Error("BREVO_API_KEY and BREVO_SENDER_EMAIL must be set in backend .env");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  const payload = {
    sender: {
      name: senderName,
      email: senderEmail
    },
    to: [{ email: to }],
    subject,
    htmlContent: html
  };

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = result.message || "Brevo email API request failed";
      throw new Error(message);
    }

    console.log("Email sent successfully:", result.messageId);
    return result;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Brevo email API timed out");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = sendEmail;
