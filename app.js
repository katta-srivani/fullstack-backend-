const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors"); // ✅ ADD THIS
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// CORS 
app.use(cors({
  origin: "http://localhost:3000", // frontend URL
  credentials: true
}));

// Middleware
app.use(express.json());

// DB Connection
connectDB();

// Routes
app.use("/api/auth", require("./routes/authroutes"));

// ✅ Server start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});