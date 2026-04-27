const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  resetPassword
} = require("../controller/authcontroller");

// Register
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").trim().isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
  ],
  register
);

// Login
router.post(
  "/login",
  [
    body("email").trim().isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  login
);

// Forgot Password
router.post(
  "/forgot-password",
  [body("email").trim().isEmail().withMessage("Valid email is required")],
  forgotPassword
);

// Reset Password
router.post(
  "/reset-password/:token",
  [body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")],
  resetPassword
);

module.exports = router;
