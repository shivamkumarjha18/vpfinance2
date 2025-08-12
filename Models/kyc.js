const mongoose = require('mongoose');

const kycSchema = new mongoose.Schema({
  createdDate: {
    type: Date,
    default: Date.now,
  },
  memberName: {
    type: String,
    required: true,
  },
  documentName: {
    type: String,
    required: true,
    enum:["Registration form", "Rough data sheet", "School certificate", "Aadhar Card", "Pan Card", "Photo", "Driving License", "Voter Id", "Policy Status"]
  },
  documentNumber: {
    type: String,
    required: true,
  },
  remark: {
    type: String,
  },
  user :{
    type : mongoose.Schema.Types.ObjectId,
    ref : "testSchema"
  },
  fileUrl: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Kyc', kycSchema);