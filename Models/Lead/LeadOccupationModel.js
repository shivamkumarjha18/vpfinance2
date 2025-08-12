const mongoose = require("mongoose");

const leadOccupationSchema = new mongoose.Schema(
  {
    occupationName: {
      type: String,
      required: true,
    },
    leadOccupation: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const LeadOccupation = mongoose.model("LeadOccupation", leadOccupationSchema);
module.exports = LeadOccupation;
