const mongoose = require("mongoose");

const occupationTypeSchema = new mongoose.Schema({
  occupationType: {
    type: String,
    required: true,
    unique: true,
  },
});

const OccupationType = mongoose.model("OccupationType", occupationTypeSchema);

module.exports = OccupationType;
