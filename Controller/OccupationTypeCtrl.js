const OccupationType = require("../Models/OccupationTypeModel");

// Create a new OccupationType
exports.createOccupationType = async (req, res) => {
  const { occupationType } = req.body;

  if (!occupationType) {
    return res.status(400).json({ error: "OccupationType name is required" });
  }

  try {
    const newOccupationType = new OccupationType({ occupationType });
    await newOccupationType.save();
    res.status(201).json(newOccupationType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all OccupationTypes
exports.getAllOccupationTypes = async (req, res) => {
  try {
    const occupationTypes = await OccupationType.find();
    res.json(occupationTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single OccupationType by ID
exports.getOccupationTypeById = async (req, res) => {
  const { id } = req.params;

  try {
    const occupationType = await OccupationType.findById(id);
    if (!occupationType) {
      return res.status(404).json({ error: "OccupationType not found" });
    }
    res.json(occupationType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update OccupationType by ID
exports.updateOccupationType = async (req, res) => {
  const { id } = req.params;
  const { occupationType } = req.body;

  if (!occupationType) {
    return res.status(400).json({ error: "OccupationType name is required" });
  }

  try {
    const updatedOccupationType = await OccupationType.findByIdAndUpdate(
      id,
      { occupationType },
      { new: true }
    );

    if (!updatedOccupationType) {
      return res.status(404).json({ error: "OccupationType not found" });
    }

    res.json(updatedOccupationType);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete OccupationType by ID
exports.deleteOccupationType = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedOccupationType = await OccupationType.findByIdAndDelete(id);
    if (!deletedOccupationType) {
      return res.status(404).json({ error: "OccupationType not found" });
    }
    res.json({ message: "OccupationType deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
