const express = require("express");
const { registerTelecaller, loginTelecaller ,  getAllTelecallers, 
  getTelecallerById,assignSuspectsToTelecaller,getAssignedSuspects, unassignSuspects,} = require("../Controller/telecallerController");

const router = express.Router();

router.post("/register", registerTelecaller);
router.post("/login", loginTelecaller);
router.get("/", getAllTelecallers);          // ✅ GET all
router.get("/:id", getTelecallerById);       // ✅ GET by id
router.post("/assign-suspects", assignSuspectsToTelecaller);
router.get("/:telecallerId/assigned-suspects", getAssignedSuspects);
router.post("/unassign-suspects", unassignSuspects);
module.exports = router;
