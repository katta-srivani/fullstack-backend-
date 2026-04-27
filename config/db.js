const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in the .env file");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log("MongoDB connected");
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    if (error.code === "ECONNREFUSED" && error.syscall === "querySrv") {
      console.error(
        "Your Atlas mongodb+srv URL could not be resolved by DNS. Check your internet, DNS settings, VPN/firewall, and Atlas connection string."
      );
      console.error(
        "For local development, you can use MONGO_URI=mongodb://127.0.0.1:27017/Auth if MongoDB is running locally."
      );
    }

    if (process.env.MONGO_URI.startsWith("mongodb+srv://")) {
      console.error(
        "If this is an Atlas cluster, confirm your current IP is allowed in Atlas Network Access and that the database user/password are correct."
      );
    }

    throw error;
  }
};

module.exports = connectDB;
