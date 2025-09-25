


const mongoose = require("mongoose");

const telecallerSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  email: { type: String, required: true, unique: true, lowercase: true },
  mobileno: { type: String, required: true, unique: true },
  role: { type: String, default: "Telecaller" },
  
  // 🔥 UPDATED: Better structure for assigned suspects
  assignedSuspects: [{
    suspectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "testSchema",
      required: true
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ["assigned", "completed", "cancelled"],
      default: "assigned"
    }
  }]
  
}, { timestamps: true });

const Telecaller = mongoose.model("Telecaller", telecallerSchema);
module.exports = Telecaller;