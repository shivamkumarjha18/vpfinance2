const Area = require("../../Models/Lead/LeadAreaModel");

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
  const { id } = req.params;
  const updated = await Area.findByIdAndUpdate(id, req.body, { new: true });
  res.json(updated);
};

exports.deleteArea = async (req, res) => {
  const { id } = req.params;
  await Area.findByIdAndDelete(id);
  res.json({ message: "Area deleted" });
};
