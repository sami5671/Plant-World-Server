// external imports
const express = require("express");
const router = express.Router();

// internal imports
const { signUp, login } = require("../controllers/auth/authController");

// signUp route
router.post("/signup", signUp);

// login route
router.post("/login", login);

// logout route

module.exports = router;
