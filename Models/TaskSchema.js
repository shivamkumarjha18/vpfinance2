const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  cat: { type: String }, // Financial Product ID or name
  sub: { type: String }, // Company Name
  depart: { type: String }, // Employee Type
  name: { type: String }, // Task Name
  type: { type: String, default: "composite" }, // Task type

  // ✅ Work Description with Image inside
  descp: {
    text: { type: String }, // CKEditor content
    image: { type: String }, // Uploaded image filename or URL
  },

  // ✅ Communication Descriptions
  email_descp: { type: String, default: "" },
  sms_descp: { type: String, default: "" },
  whatsapp_descp: { type: String, default: "" },

  // ✅ Checklist
  checklists: {
    type: [String],
    default: [],
  },

  // ✅ Form Checklist with files
  formChecklists: [
    {
      name: { type: String },
      downloadFormUrl: { type: String }, //image
      sampleFormUrl: { type: String }, //image
    },
  ],
});

module.exports = TaskSchema;
