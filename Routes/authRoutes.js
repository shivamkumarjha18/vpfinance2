const express = require("express");
const { loginUser } = require("../Controller/authController");

const router = express.Router();

// Common login route
router.post("/login", loginUser);

module.exports = router;

