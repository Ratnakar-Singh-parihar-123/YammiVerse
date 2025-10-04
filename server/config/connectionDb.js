const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Sirf URI pass karo, extra options ki zarurat nahi
    const conn = await mongoose.connect(process.env.CONNECTION_STRING);

    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1); // Crash the app if DB fails
  }
};

module.exports = connectDB;
