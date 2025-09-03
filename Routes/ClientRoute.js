const express = require("express");
const router = express.Router();
const ClientCtrl = require("../Controller/ClientCtrl");
const upload = require("../config/upload");



// create client
router.post("/create", ClientCtrl.createClient);

// add family members
router.put("/add/family/:clientId", ClientCtrl.addFamilyMember);

// add financial info
router.put( "/add/financialinfo/:clientId",
 upload.fields([
    { name: "insuranceDocuments", maxCount: 10 },
    { name: "investmentDocuments", maxCount: 10 },
    { name: "loanDocuments", maxCount: 10 },
]),
  ClientCtrl.addFinancialInfo
);


// add future priotities
router.put("/add/futurepriorities/:clientId", ClientCtrl.addFuturePrioritiesAndNeeds)


// add proposed financial plan
router.put("/add/proposedplan/:clientId", upload.array("documents"), ClientCtrl.addProposedFinancialPlan)



// update personal details of the client
router.put("/update/personaldetails/:clientId", ClientCtrl.updatePersonalDetails);


// Get All Clients
router.get("/all", ClientCtrl.getAllClients)


// Get Client by ID
router.get("/:id", ClientCtrl.getClientById);


// Update Client Status by ID
router.put("/update/status/:id",  ClientCtrl.updateClientStatus)


// Get all Family Members
router.get("/family/details/:id", ClientCtrl.getAllFamilyMembers)


// Create new KYC (pass clientId as query or param)
router.post('/kyc/create/:clientId', upload.single('document'), ClientCtrl.createKyc);


// Delete Client by ID
router.delete("/delete/:id", ClientCtrl.deleteClient);


// Get all KYCs for a member
router.get('/kyc/:clientId', ClientCtrl.getKycsByClient);


// Update KYC
router.put('/kyc/:id', upload.single('document'), ClientCtrl.updateKyc);


// Delete a KYC
router.delete('/kyc/:id', ClientCtrl.deleteKyc);






module.exports = router;


