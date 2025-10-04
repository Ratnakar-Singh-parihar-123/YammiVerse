// server/utils/sendEmail.js
const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // ya smtp config
      auth: {
        user: process.env.EMAIL_USER, // 👈 .env me dalna hoga
        pass: process.env.EMAIL_PASS, // 👈 app password (not raw password)
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
    console.error("❌ Email error:", error);
    throw new Error("Email not sent");
  }
};

module.exports = sendEmail;