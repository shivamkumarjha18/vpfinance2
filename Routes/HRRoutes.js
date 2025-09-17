const express = require("express");
const {registerHR,loginHR} = require("../Controller/HRController");

const router = express.Router();

router.post("/register", registerHR);
router.post("/login", loginHR);

module.exports = router;