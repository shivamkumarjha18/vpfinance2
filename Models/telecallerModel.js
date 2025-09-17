const mongoose = require("mongoose");

const telecallerSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  email: { type: String, required: true, unique: true, lowercase: true },
  mobileno: { type: String, required: true, unique: true },
  role:{type: String}
}, { timestamps: true });

const Telecaller = mongoose.model("Telecaller", telecallerSchema);

module.exports = Telecaller;  // ✅ CommonJS export
