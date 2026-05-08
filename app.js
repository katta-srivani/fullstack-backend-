const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin(origin, callback) {
      callback(null, true);
    },
    credentials: true
  })
);

// Rate limiting (apply to all requests, can be fine-tuned per route)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

// Middleware
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

const healthHandler = (req, res) => {
  res.status(200).json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
};

app.get("/api/health", healthHandler);
app.get("/health", healthHandler);

app.use("/api", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database connection is unavailable. Please try again shortly."
    });
  }

  next();
});

// Routes
const authRoutes = require("./routes/authroutes");
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
