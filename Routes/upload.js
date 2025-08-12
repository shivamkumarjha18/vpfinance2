const express = require("express");
const router = express.Router();
const upload = require("../config/upload");


router.post("/uploads", upload.array("files"), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const fileUrls = req.files.map((file) => {
    return `${process.env.DOMAIN_URL}/Images/${file.filename}`;
  });
  console.log(fileUrls);

  res.json({ urls: fileUrls });
});

module.exports = router;
