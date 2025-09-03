const Area = require("../../Models/Lead/LeadAreaModel");
const SubArea = require("../../Models/Lead/LeadSubAreaModel");
const mongoose = require("mongoose");

exports.getAllAreas = async (req, res) => {
  const areas = await Area.find();
  res.json(areas);
};

exports.createArea = async (req, res) => {
  const { name, shortcode, pincode } = req.body;

  if (!name || !shortcode || !pincode) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newLeadArea = new Area({ name, shortcode, pincode });
    await newLeadArea.save();
    res.status(201).json(newLeadArea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getAreaById = async (req, res) => {
  try {
    const area = await Area.findById(req.params.id);
    if (!area) {
      return res.status(404).json({ message: "Area not found" });
    }
    res.json(area);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateArea = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Area.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// exports.deleteArea = async (req, res) => {
//   const { id } = req.params;
//   await Area.findByIdAndDelete(id);
//   res.json({ message: "Area deleted" });
// };



exports.deleteArea = async (req, res) => {
  const { id } = req.params;

  try {

    if(! id){
      return res.status(400).json({
        message: "Area ID is required",
        success: false
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid area ID format",
        success: false
      });
    }

    // Check if area exists first
    const area = await Area.findById(id);
    if (!area) {
      return res.status(404).json({
        message: "Area not found",
        success: false
      });
    }
    
    // Delete all sub-areas associated with this area first
    const deletedSubAreas = await SubArea.deleteMany({ areaId: id });
    
    // Then delete the main area
    await Area.findByIdAndDelete(id);
    
    // Log for audit purposes
    console.log(`Deleted area ${id} and ${deletedSubAreas.deletedCount} associated sub-areas`);
    
    res.status(200).json({
      message: `Area deleted successfully`,
      success: true,
    });
    
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete area",
      success: false,
      error: error.message
    });
  }
};
