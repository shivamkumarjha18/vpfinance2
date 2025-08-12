const LeadOccupation = require("../../Models/Lead/LeadOccupationModel");

// Create Lead
const createOccupation = async (req, res) => {
  try {
    const { occupationName, leadOccupation } = req.body;
    const lead = await LeadOccupation.create({
      occupationName,
      leadOccupation,
    });
    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Leads
const getOccupation = async (req, res) => {
  try {
    const leads = await LeadOccupation.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Lead
const updateOccupation = async (req, res) => {
  try {
    const lead = await LeadOccupation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    res.json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete Lead
const deleteOccupation = async (req, res) => {
  try {
    await LeadOccupation.findByIdAndDelete(req.params.id);
    res.json({ message: "Lead deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = {
  createOccupation,
  getOccupation,
  updateOccupation,
  deleteOccupation,
};
