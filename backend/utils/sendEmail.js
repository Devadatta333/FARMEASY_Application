import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // If SMTP config is provided, send real email, otherwise print email details to console for development
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const message = {
      from: `${process.env.FROM_NAME || "FarmEasy"} <${process.env.FROM_EMAIL || "noreply@farmeasy.com"}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(message);
    console.log("Email sent: %s", info.messageId);
  } else {
    console.log("\n========================================");
    console.log("[DEVELOPMENT EMAIL MOCK]");
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    console.log("========================================\n");
  }
};

export default sendEmail;
