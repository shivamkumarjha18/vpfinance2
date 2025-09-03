
const mongoose = require("mongoose");

const LeadSourceSchema = new mongoose.Schema(
  {
    sourceName: {
      type: String,
      required: true,
    },
    leadTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeadType",
      required: true,
    },
  },
  { timestamps: true }
);

const LeadSource = mongoose.model("LeadSource", LeadSourceSchema);
module.exports = LeadSource;