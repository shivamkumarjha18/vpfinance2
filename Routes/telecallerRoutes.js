const express = require("express");
const { registerTelecaller, loginTelecaller } = require("../Controller/telecallerController");

const router = express.Router();

router.post("/register", registerTelecaller);
router.post("/login", loginTelecaller);

module.exports = router;
