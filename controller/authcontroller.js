
const User = require("../models/authmodel");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendemail");
const { validationResult } = require("express-validator");

const isDatabaseConnectionError = (error) =>
  error.name === "MongoServerSelectionError" ||
  error.name === "MongoNetworkError" ||
  error.code === "ECONNRESET" ||
  error.code === "ENOTFOUND" ||
  error.message.includes("buffering timed out");

const handleControllerError = (res, error) => {
  if (isDatabaseConnectionError(error)) {
    console.error("Database operation failed:", error.message);
    return res.status(503).json({
      message: "Database connection is unavailable. Please try again shortly."
    });
  }

  console.error(error);
  return res.status(500).json({ message: "Server error" });
};

// REGISTER

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log(`Register failed: user already exists for ${normalizedEmail}`);
      return res.status(409).json({ message: "User already exists. Please login or use forgot password." });
    }
    const hashedPassword = await bcrypt.hash(normalizedPassword, 10);
    const newUser = new User({ name, email: normalizedEmail, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// LOGIN

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const submittedPassword = password.trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`Login failed: no user found for ${normalizedEmail}`);
      return res.status(404).json({ message: "User not found" });
    }

    let isMatch = await bcrypt.compare(submittedPassword, user.password);

    if (!isMatch && user.password === submittedPassword) {
      user.password = await bcrypt.hash(submittedPassword, 10);
      await user.save();
      isMatch = true;
    }

    if (!isMatch) {
      console.log(`Login failed: wrong password for ${normalizedEmail}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// FORGOT PASSWORD

exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // ✅ Generate token
    const token = crypto.randomBytes(32).toString("hex");
    // ✅ Hash token (SECURITY)
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    user.resetToken = hashedToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
    console.log("Reset Link:", resetLink);
    await sendEmail(
      user.email,
      "Password Reset",
      `
      <h3>Password Reset Request</h3>
      <p>Click the link below to reset your password</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire in 15 minutes</p>
      `
    );
    res.status(200).json({ message: "Password reset link sent to email" });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// RESET PASSWORD

exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { token } = req.params;
    const { password } = req.body;
    const normalizedPassword = password.trim();
    // ✅ Hash token to match DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    const hashedPassword = await bcrypt.hash(normalizedPassword, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    return handleControllerError(res, error);
  }
};
