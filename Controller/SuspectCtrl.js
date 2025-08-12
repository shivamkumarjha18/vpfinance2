const Suspect = require("../Models/SusProsClientSchema");
const generateAndStoreGroupCode = require("../utils/generateGroupCode");

// Create a new suspect
exports.createSuspect = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: "No suspect data provided in request body",
      });
    }

    const suspectData = { ...req.body, status: "suspect" };
    const newSuspect = new Suspect(suspectData);
    const savedSuspect = await newSuspect.save();

    if (!savedSuspect || !savedSuspect._id) {
      return res.status(500).json({
        error: "Failed to save suspect data properly",
      });
    }

    const groupCode = await generateAndStoreGroupCode(savedSuspect._id.toString());
    if (!savedSuspect.personalDetails) {
      savedSuspect.personalDetails = {};
    }
    savedSuspect.personalDetails.groupCode = groupCode;
    await savedSuspect.save();

    res.status(201).json(savedSuspect);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: "Validation failed",
        details: err.errors
      });
    }
    res.status(500).json({
      error: "Failed to create suspect",
      details: err.message,
    });
  }
};

// Get all suspects
exports.getAllSuspects = async (req, res) => {
  try {
    const suspects = await Suspect.find({ status: "suspect" });
    if (suspects.length === 0) {
      return res.status(404).json({ success: false, message: "No suspects found" });
    }
    res.status(200).json({ success: true, suspects: suspects });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while fetching suspects", error: error.message });
  }
};

// Get a single suspect by ID
exports.getSuspectById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Suspect ID is required" });
    }
    const suspect = await Suspect.findById(id);
    if (!suspect) {
      return res.status(404).json({ success: false, message: "Suspect not found" });
    }
    res.status(200).json({ success: true, suspect });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while fetching suspect", error: error.message });
  }
};

// Update a suspect's personal details
exports.updatePersonalDetails = async (req, res) => {
  try {
    const { id} = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Suspect ID is required." });
    }
    const newPersonalDetails = req.body.personalDetails;
    if (!newPersonalDetails || Object.keys(newPersonalDetails).length === 0) {
      return res.status(400).json({ success: false, message: "New personal details are required." });
    }
    const updatedSuspect = await Suspect.findByIdAndUpdate(
      id,
      { $set: { personalDetails: newPersonalDetails } },
      { new: true, runValidators: true }
    );
    if (!updatedSuspect) {
      return res.status(404).json({ success: false, message: "Suspect not found." });
    }
    res.status(200).json({
      success: true,
      message: "Personal details updated successfully.",
      updatedSuspect: updatedSuspect
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error.", details: error.message });
  }
};

// Add family members to a suspect
exports.addFamilyMember = async (req, res) => {
  try {
    const { id } = req.params;
    if (! id) {
      return res.status(400).json({ success: false, message: "Please provide suspectId" });
    }
    const membersArray = req.body;
    if (!Array.isArray(membersArray) || membersArray.length === 0) {
      return res.status(400).json({ success: false, message: "Request body must be a non-empty array of family members" });
    }
    const suspect = await Suspect.findById(id);
    if (!suspect) {
      return res.status(404).json({ success: false, message: "Suspect not found" });
    }
    suspect.familyMembers.push(...membersArray);
    await suspect.save();
    res.status(201).json({
      success: true,
      message: `${membersArray.length} family member(s) added successfully`,
      familyMembers: suspect.familyMembers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add family member(s)", error: error.message });
  }
};

// Add financial info to a suspect
exports.addFinancialInfo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Suspect ID is required" });
    }
    const suspect = await Suspect.findById(id);
    if (!suspect) {
      return res.status(404).json({ success: false, message: "Suspect not found" });
    }

    let { insurance, investments, loans } = req.body;
    insurance = Array.isArray(insurance) ? insurance : [];
    investments = Array.isArray(investments) ? investments : [];
    loans = Array.isArray(loans) ? loans : [];

    if (!suspect.financialInfo) {
      suspect.financialInfo = { insurance: [], investments: [], loans: [] };
    }
    if (insurance.length > 0) suspect.financialInfo.insurance.push(...insurance);
    if (investments.length > 0) suspect.financialInfo.investments.push(...investments);
    if (loans.length > 0) suspect.financialInfo.loans.push(...loans);

    await suspect.save();
    res.status(200).json({
      success: true,
      message: "Financial info added successfully",
      financialInfo: suspect.financialInfo
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Add future priorities and needs to a suspect
exports.addFuturePrioritiesAndNeeds = async (req, res) => {
  try {
    const { id } = req.params;
    const { futurePriorities, needs } = req.body;
    if (! id) {
      return res.status(400).json({ error: 'Suspect ID is required' });
    }
    const updateData = {};
    if (futurePriorities) updateData.futurePriorities = { futurePriorities };
    if (needs) updateData.needs = needs;

    const updatedSuspect = await Suspect.findByIdAndUpdate(
       id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedSuspect) {
      return res.status(404).json({ error: 'Suspect not found' });
    }
    res.status(200).json({
      message: 'Future priorities and/or needs updated successfully',
      suspect: updatedSuspect
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Add a proposed financial plan to a suspect
exports.addProposedFinancialPlan = async (req, res) => {
  try {
    const {id } = req.params;
    if (! id) {
      return res.status(400).json({ success: false, message: "Suspect ID is required" });
    }
    const suspect = await Suspect.findById(id);
    if (!suspect) {
      return res.status(404).json({ success: false, message: "Suspect not found" });
    }
    const newProposedPlan = req.body;
    suspect.proposedPlan.push(newProposedPlan);
    await suspect.save();
    res.status(200).json({
      success: true,
      message: "Proposed financial plan added successfully",
      proposedPlan: suspect.proposedPlan
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};

// Update a suspect's status
exports.updateSuspectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Suspect ID is required" });
    const updatedSuspect = await Suspect.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatedSuspect) {
      return res.status(404).json({ message: "Suspect not found" });
    }
    res.status(200).json(updatedSuspect);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a suspect
exports.deleteSuspect = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "Suspect ID is required" });
    }
    await Suspect.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Suspect deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while deleting suspect", error: error.message });
  }
};
