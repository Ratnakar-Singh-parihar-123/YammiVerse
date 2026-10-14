// server/utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("-----------------------------------------");
      console.log(" [DEV EMAIL SIMULATION - No SMTP credentials in .env]");
      console.log(` To: ${to}`);
      console.log(` Subject: ${subject}`);
      console.log(` Content: ${text}`);
      console.log("-----------------------------------------");
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"YammiVerse 🍲" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log(" Email sent to:", to);
  } catch (error) {
    console.error("❌ Email error:", error.message);
    throw new Error("Email not sent");
  }
};

module.exports = sendEmail;