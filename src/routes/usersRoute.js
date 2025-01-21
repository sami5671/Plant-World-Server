// external imports
const express = require("express");
const router = express.Router();

// internal imports
const { addToCart } = require("../controllers/user/cartController");

// add to cart
router.post("/cart", addToCart);

module.exports = router;
