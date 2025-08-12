const express = require("express");
const router = express.Router();
const LeadOccupationCtrl = require("../../Controller/Lead/LeadOccupationCtrl");

router.post("/", LeadOccupationCtrl.createOccupation); // Create
router.get("/", LeadOccupationCtrl.getOccupation); // Read
router.put("/:id", LeadOccupationCtrl.updateOccupation); // Update
router.delete("/delete/:id", LeadOccupationCtrl.deleteOccupation); // Delete

module.exports = router;
