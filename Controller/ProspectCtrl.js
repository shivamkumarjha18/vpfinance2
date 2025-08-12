const Prospect = require("../Models/SusProsClientSchema");
const generateAndStoreGroupCode = require("../utils/generateGroupCode");

// Create a new prospect
exports.createProspect = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: "No prospect data provided in request body",
      });
    }

    const prospectData = { ...req.body, status: "prospect" };
    const newProspect = new Prospect(prospectData);
    const savedProspect = await newProspect.save();

    if (!savedProspect || !savedProspect._id) {
      return res.status(500).json({
        error: "Failed to save prospect data properly",
      });
    }

    const groupCode = await generateAndStoreGroupCode(savedProspect._id.toString());
    if (!savedProspect.personalDetails) {
      savedProspect.personalDetails = {};
    }
    savedProspect.personalDetails.groupCode = groupCode;
    await savedProspect.save();

    res.status(201).json(savedProspect);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: "Validation failed",
        details: err.errors
      });
    }
    res.status(500).json({
      error: "Failed to create prospect",
      details: err.message,
    });
  }
};

// Get all prospects
exports.getAllProspects = async (req, res) => {
  try {
    const prospects = await Prospect.find({ status: "prospect" });
    if (prospects.length === 0) {
      return res.status(404).json({ success: false, message: "No prospects found" });
    }
    res.status(200).json({ success: true, prospects: prospects });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while fetching prospects", error: error.message });
  }
};

// Get a single prospect by ID
exports.getProspectById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Prospect ID is required" });
    }
    const prospect = await Prospect.findById(id);
    if (!prospect) {
      return res.status(404).json({ success: false, message: "Prospect not found" });
    }
    res.status(200).json({ success: true, prospect });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while fetching prospect", error: error.message });
  }
};

// Update a prospect's personal details
exports.updatePersonalDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (! id) {
      return res.status(400).json({ success: false, message: "Prospect ID is required." });
    }
    const newPersonalDetails = req.body.personalDetails;
    if (!newPersonalDetails || Object.keys(newPersonalDetails).length === 0) {
      return res.status(400).json({ success: false, message: "New personal details are required." });
    }
    const updatedProspect = await Prospect.findByIdAndUpdate(
       id,
      { $set: { personalDetails: newPersonalDetails } },
      { new: true, runValidators: true }
    );
    if (!updatedProspect) {
      return res.status(404).json({ success: false, message: "Prospect not found." });
    }
    res.status(200).json({
      success: true,
      message: "Personal details updated successfully.",
      updatedProspect: updatedProspect
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error.", details: error.message });
  }
};

// Add family members to a prospect
exports.addFamilyMember = async (req, res) => {
  try {
    const {id } = req.params;
    if (! id) {
      return res.status(400).json({ success: false, message: "Please provide prospectId" });
    }
    const membersArray = req.body;
    if (!Array.isArray(membersArray) || membersArray.length === 0) {
      return res.status(400).json({ success: false, message: "Request body must be a non-empty array of family members" });
    }
    const prospect = await Prospect.findById(id);
    if (!prospect) {
      return res.status(404).json({ success: false, message: "Prospect not found" });
    }
    prospect.familyMembers.push(...membersArray);
    await prospect.save();
    res.status(201).json({
      success: true,
      message: `${membersArray.length} family member(s) added successfully`,
      familyMembers: prospect.familyMembers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add family member(s)", error: error.message });
  }
};

// Add financial info to a prospect
exports.addFinancialInfo = async (req, res) => {
  try {
    const { id } = req.params;
    if (! id) {
      return res.status(400).json({ success: false, message: "Prospect ID is required" });
    }
    const prospect = await Prospect.findById(id);
    if (!prospect) {
      return res.status(404).json({ success: false, message: "Prospect not found" });
    }

    let { insurance, investments, loans } = req.body;
    insurance = Array.isArray(insurance) ? insurance : [];
    investments = Array.isArray(investments) ? investments : [];
    loans = Array.isArray(loans) ? loans : [];

    if (!prospect.financialInfo) {
      prospect.financialInfo = { insurance: [], investments: [], loans: [] };
    }
    if (insurance.length > 0) prospect.financialInfo.insurance.push(...insurance);
    if (investments.length > 0) prospect.financialInfo.investments.push(...investments);
    if (loans.length > 0) prospect.financialInfo.loans.push(...loans);

    await prospect.save();
    res.status(200).json({
      success: true,
      message: "Financial info added successfully",
      financialInfo: prospect.financialInfo
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Add future priorities and needs to a prospect
exports.addFuturePrioritiesAndNeeds = async (req, res) => {
  try {
    const { id} = req.params;
    const { futurePriorities, needs } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Prospect ID is required' });
    }
    const updateData = {};
    if (futurePriorities) updateData.futurePriorities = { futurePriorities };
    if (needs) updateData.needs = needs;

    const updatedProspect = await Prospect.findByIdAndUpdate(
       id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedProspect) {
      return res.status(404).json({ error: 'Prospect not found' });
    }
    res.status(200).json({
      message: 'Future priorities and/or needs updated successfully',
      prospect: updatedProspect
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Add a proposed financial plan to a prospect
exports.addProposedFinancialPlan = async (req, res) => {
  try {
    const { id} = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Prospect ID is required" });
    }
    const prospect = await Prospect.findById(id);
    if (!id) {
      return res.status(404).json({ success: false, message: "Prospect not found" });
    }
    const newProposedPlan = req.body;
    prospect.proposedPlan.push(newProposedPlan);
    await prospect.save();
    res.status(200).json({
      success: true,
      message: "Proposed financial plan added successfully",
      proposedPlan: prospect.proposedPlan
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Update a prospect's status
exports.updateProspectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Prospect ID is required" });
    const updatedProspect = await Prospect.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatedProspect) {
      return res.status(404).json({ message: "Prospect not found" });
    }
    res.status(200).json(updatedProspect);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a prospect
exports.deleteProspect = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Prospect ID is required" });
    }
    await Prospect.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Prospect deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while deleting prospect", error: error.message });
  }
};
