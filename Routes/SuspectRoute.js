
const express = require("express");
const router = express.Router();
const SuspectCtrl = require("../Controller/SuspectCtrl");
const upload = require("../config/upload");



// create suspect
router.post("/create", SuspectCtrl.createSuspect);

// add family members
router.put("/add/family/:id", SuspectCtrl.addFamilyMember);

// add financial info
router.put( "/add/financialinfo/:id",
 upload.fields([
    { name: "insuranceDocuments", maxCount: 10 },
    { name: "investmentDocuments", maxCount: 10 },
    { name: "loanDocuments", maxCount: 10 },
]),
  SuspectCtrl.addFinancialInfo
);


// add future priotities
router.put("/add/futurepriorities/:id", SuspectCtrl.addFuturePrioritiesAndNeeds)


// add proposed financial plan
router.put("/add/proposedplan/:id", upload.array("documents"), SuspectCtrl.addProposedFinancialPlan)



// update personal details of the suspect
router.put("/update/personaldetails/:id", SuspectCtrl.updatePersonalDetails);


// Get All Suspects
router.get("/all", SuspectCtrl.getAllSuspects)


// Get Suspect by ID
router.get("/:id", SuspectCtrl.getSuspectById);


// Update Suspect  Status by ID
router.put("/update/status/:id", SuspectCtrl.updateSuspectStatus)


// Get all Family Members
router.get("/family/details/:id", SuspectCtrl.getAllFamilyMembers)


// Delete Suspect  by ID
router.delete("/delete/:id", SuspectCtrl.deleteSuspect);



module.exports = router;
