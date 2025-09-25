const express = require("express");
const { registerTelecaller, loginTelecaller ,  getAllTelecallers, 
  getTelecallerById,assignSuspectsToTelecaller,getAssignedSuspects} = require("../Controller/telecallerController");

const router = express.Router();

router.post("/register", registerTelecaller);
router.post("/login", loginTelecaller);
router.get("/", getAllTelecallers);          // ✅ GET all
router.get("/:id", getTelecallerById);       // ✅ GET by id
router.post("/assign-suspects", assignSuspectsToTelecaller);
router.get("/:telecallerId/assigned-suspects", getAssignedSuspects);
router.get("/assignments", async (req, res) => {
  try {
    const telecallers = await Telecaller.find()
      .populate("assignedSuspects.suspectId", "personalDetails")
      .lean();

    const allAssignments = [];

    telecallers.forEach(tc => {
      tc.assignedSuspects.forEach(asg => {
        if (asg.suspectId) {
          allAssignments.push({
            suspectId: asg.suspectId._id,
            suspectName: asg.suspectId.personalDetails?.groupName || "Unknown",
            telecallerId: tc._id,
            telecallerName: tc.username,
            assignedAt: asg.assignedAt,
            status: asg.status || "assigned"
          });
        }
      });
    });

    res.json({ success: true, data: allAssignments, count: allAssignments.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
module.exports = router;
