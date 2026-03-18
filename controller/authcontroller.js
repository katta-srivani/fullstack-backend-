const User = require("../models/authmodel");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendemail");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // ✅ Validation
    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // ✅ Generate token
    const token = crypto.randomBytes(32).toString("hex");

    // ✅ Hash token (SECURITY)
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

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

    res.status(200).json({
      message: "Password reset link sent to email"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // ✅ Password validation
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    // ✅ Hash token to match DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successful"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};