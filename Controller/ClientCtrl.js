


const clientModel = require("../Models/SusProsClientSchema");
const generateAndStoreGroupCode = require("../utils/generateGroupCode")
const Kyc = require("../Models/kyc");






// create Client
exports.createClient = async (req, res) => {
  try {
    // Check if request body has data
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(401).json({
        error: "No client data provided in request body",
      });
    }

    const clientData = { ...req.body, status: "client" };
    const newClient = new clientModel(clientData);
    const savedClient = await newClient.save();

    if (!savedClient || !savedClient._id) {
      return res.status(500).json({
        error: "Failed to save client data properly",
      });
    }

    const groupCode = await generateAndStoreGroupCode(savedClient._id.toString());
    if (!savedClient.personalDetails) {
      savedClient.personalDetails = {};
    }
    savedClient.personalDetails.groupCode = groupCode;
    await savedClient.save();

    res.status(201).json(savedClient);
  } catch (err) {
    res.status(500).json({
      error: "Failed to create client first form",
      details: err.message,
    });
  }
};



// add family members
// exports.addFamilyMember = async (req, res) => {
//   try {
//     const { clientId } = req.params;

//     if (!clientId) {
//       return res.status(400).json({ success: false, message: "Please provide clientId" });
//     }

//     const membersArray = req.body;

//     if (!Array.isArray(membersArray) || membersArray.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Request body must be a non-empty array of family members"
//       });
//     }

//     const client = await clientModel.findById(clientId);
//     if (!client) {
//       return res.status(404).json({ success: false, message: "Client not found" });
//     }

//     const formattedMembers = membersArray.map(member => {
//       const {
//         title,
//         name,
//         relation,
//         annualIncome,
//         occupation,
//         dobActual,
//         dobRecord,
//         marriageDate,
//         includeHealth,
//         healthHistory,
//         //new change by shivam 
//          contactNo
//       } = member;

//       const newMember = {
//         title,
//         name,
//         relation,
//         annualIncome,
//         occupation,
//         dobActual,
//         dobRecord,
//         marriageDate,
//         includeHealth: includeHealth || false,
//       };

//       if (includeHealth && healthHistory) {
//         newMember.healthHistory = healthHistory;
//       }

//       return newMember;
//     });

//     client.familyMembers.push(...formattedMembers);
//     await client.save();

//     res.status(201).json({
//       success: true,
//       message: `${formattedMembers.length} family member(s) added successfully`,
//       familyMembers: client.familyMembers,
//       clientId :client._id
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to add family member(s)",
//       error: error.message
//     });
//   }
// };

exports.addFamilyMember = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({ success: false, message: "Please provide clientId" });
    }

    const membersArray = req.body;

    if (!Array.isArray(membersArray) || membersArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a non-empty array of family members"
      });
    }

    const client = await clientModel.findById(clientId);
    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    const formattedMembers = membersArray.map(member => {
      const {
        title,
        name,
        relation,
        annualIncome,
        contact,
        occupation,
        dobActual,
        dobRecord,
        marriageDate,
        includeHealth,
        healthHistory,
    
      } = member;

      // Validate required fields
      if (!contactNo || isNaN(Number(contactNo))) {
        return res.status(400).json({
          success: false,
          message: "Contact number is required and must be a valid number"
        });
      }

      const newMember = {
        title,
        name,
        relation,
        annualIncome,
        contact,
        occupation,
        dobActual,
        dobRecord,
        marriageDate,
        includeHealth: includeHealth || false,
        
      };

      if (includeHealth && healthHistory) {
        newMember.healthHistory = healthHistory;
      }

      return newMember;
    });

    client.familyMembers.push(...formattedMembers);
    await client.save();

    res.status(201).json({
      success: true,
      message: `${formattedMembers.length} family member(s) added successfully`,
      familyMembers: client.familyMembers,
      clientId: client._id
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add family member(s)",
      error: error.message
    });
  }
};

// add financial details of the client
exports.addFinancialInfo = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!clientId) {
      return res.status(400).json({ success: false, message: "Client ID is required" });
    }

    // Find the client
    const client = await clientModel.findById(clientId);
    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    // console.log("Request body:", req.body);
    // console.log("Request files:", req.files);

    // Parse JSON strings if they exist, otherwise use empty arrays
    let insuranceData = [];
    let investmentsData = [];
    let loansData = [];

    try {
      // Handle both JSON strings and direct arrays
      if (req.body.insurance) {
        insuranceData = typeof req.body.insurance === 'string'
          ? JSON.parse(req.body.insurance)
          : req.body.insurance;
      }

      if (req.body.investments) {
        investmentsData = typeof req.body.investments === 'string'
          ? JSON.parse(req.body.investments)
          : req.body.investments;
      }

      if (req.body.loans) {
        loansData = typeof req.body.loans === 'string'
          ? JSON.parse(req.body.loans)
          : req.body.loans;
      }
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid JSON data format",
        error: parseError.message
      });
    }

    // Ensure arrays are actually arrays
    insuranceData = Array.isArray(insuranceData) ? insuranceData : [];
    investmentsData = Array.isArray(investmentsData) ? investmentsData : [];
    loansData = Array.isArray(loansData) ? loansData : [];

    console.log("Parsed data:", { insuranceData, investmentsData, loansData });

    // Attach document filenames to each item if files exist
    // const attachFiles = (dataArray, uploadedFilesArray = []) => {
    //   if (Array.isArray(dataArray) && Array.isArray(uploadedFilesArray)) {
    //     dataArray.forEach((item, index) => {
    //       if (uploadedFilesArray[index]) {
    //         item.document = uploadedFilesArray[index].filename;
    //       }
    //     });
    //   }
    // };

    const attachFiles = (dataArray, uploadedFilesArray = []) => {
  if (Array.isArray(dataArray) && Array.isArray(uploadedFilesArray)) {
    dataArray.forEach((item, index) => {
      if (uploadedFilesArray[index]) {
        item.document = uploadedFilesArray[index].filename;
      } else {
        item.document = null;
      }
    });
  }
};



    // Safely access file arrays
    const insuranceFiles = req.files?.insuranceDocuments || [];
    const investmentFiles = req.files?.investmentDocuments || [];
    const loanFiles = req.files?.loanDocuments || [];

    attachFiles(insuranceData, insuranceFiles);
    attachFiles(investmentsData, investmentFiles);
    attachFiles(loansData, loanFiles);

    // Initialize financialInfo if not present
    if (!client.financialInfo) {
      client.financialInfo = {
        insurance: [],
        investments: [],
        loans: [],
      };
    }

    // Append new data (only if arrays have content)
    if (insuranceData.length > 0) {
      client.financialInfo.insurance.push(...insuranceData);
    }
    if (investmentsData.length > 0) {
      client.financialInfo.investments.push(...investmentsData);
    }
    if (loansData.length > 0) {
      client.financialInfo.loans.push(...loansData);
    }

    // Check if any data was actually added
    const totalItemsAdded = insuranceData.length + investmentsData.length + loansData.length;
    if (totalItemsAdded === 0) {
      return res.status(400).json({
        success: false,
        message: "No financial data provided",
      });
    }

    // Save client
    await client.save();

    return res.status(200).json({
      success: true,
      message: "Financial info with documents added successfully",
      financialInfo: client.financialInfo,
      clientId:client._id,
      added: {
        insurance: insuranceData.length,
        investments: investmentsData.length,
        loans: loansData.length
      }
    });

  } catch (error) {
    console.error("Error in addFinancialInfo:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};



// add future priorities and needs
exports.addFuturePrioritiesAndNeeds = async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const { futurePriorities, needs } = req.body;

    // Validate client ID
    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' });
    }

    // Validate futurePriorities
    if (!Array.isArray(futurePriorities)) {
      return res.status(400).json({ error: 'futurePriorities must be an array' });
    }

    for (const priority of futurePriorities) {
      if (
        !priority.priorityName ||
        !Array.isArray(priority.members) ||
        typeof priority.approxAmount !== 'number' ||
        !priority.duration
      ) {
        return res.status(400).json({ error: 'Invalid priority object structure' });
      }
    }

    // Build update object
    const updateData = {
      futurePriorities
    };

    if (needs && typeof needs === 'object') {
      updateData.needs = needs;
    }

    const updatedClient = await clientModel.findByIdAndUpdate(
      clientId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.status(200).json({
      message: 'Future priorities (and needs if provided) updated successfully',
      client: updatedClient,
      clientId: updatedClient._id
    });

  } catch (error) {
    console.error('Error updating future priorities and needs:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};





// add proposed financial plan
exports.addProposedFinancialPlan = async (req, res) => {
  try {
    const { clientId } = req.params;

    // Validate client ID
    if (!clientId) {
      return res.status(400).json({ success: false, message: "Client ID is required" });
    }

    // Validate request body
    if (!req.body) {
      return res.status(400).json({ success: false, message: "Request body is required" });
    }

    // Handle file uploads
    const files = req.files;
    if (!files) {
      return res.status(401).json({
        success: false,
        message: "Please provide documents to upload"
      });
    }

    const documentPaths = files.map(file => file.filename);

    const clientToUpdate = await clientModel.findById(clientId);
    if (!clientToUpdate) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    // Create new proposed plan object using {...req.body}
    const newProposedPlan = {
      ...req.body,
      documents: documentPaths
    };

    clientToUpdate.proposedPlan.push(newProposedPlan);

    await clientToUpdate.save();

    res.status(200).json({
      success: true,
      message: "Proposed financial plan updated successfully",
      proposedPlan: clientToUpdate.proposedPlan,
      clientId: clientToUpdate._id
    });

  } catch (error) {
    console.error('Error adding proposed financial plan:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};





exports.updatePersonalDetails = async (req, res) => {
  try {
    const { clientId } = req.params;

    // 1. Check if the client ID is provided in the URL.
    if (!clientId) {
      return res.status(400).json({ success: false, message: "Client ID is required." });
    }
    
    // 2. Validate that the request body contains the new personalDetails.
    const { personalDetails } = req.body;
    if (!personalDetails || Object.keys(personalDetails).length === 0) {
      return res.status(400).json({ success: false, message: "New personal details are required in the request body." });
    }
    
    // 3. Find the client by ID and update the personalDetails object.
    // The '$set' operator is used here to replace the entire 'personalDetails' object.
    const updatedClient = await clientModel.findByIdAndUpdate(
      clientId,
      { $set: { personalDetails } },
      { new: true, runValidators: true } // Return the updated document and run schema validators.
    );

    // 4. Handle the case where the client ID is not found.
    if (!updatedClient) {
      return res.status(404).json({ success: false, message: "Client not found." });
    }

    // 5. Send a successful response with the updated client document.
    res.status(200).json({
      success: true,
      message: "Personal details updated successfully.",
      updatedClient: updatedClient
    });

  } catch (error) {
    // 6. Centralized error handling.
    console.error("Error updating personal details:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      details: error.message
    });
  }
};




// Get all CLients
exports.getAllClients = async (req, res) => {
  try {
    const allClients = await clientModel.find({ status: "client" });
   if(allClients.length === 0) return res.status(404).json({success : false, message: "No clients found"});
    res.status(200).json({success : true, clients: allClients});
   } catch (error) {
      console.error(error);
      res.status(500).json({success : false, message: "Server error while fetching clients", error: error.message});

    }
}



exports.getClientById = async(req, res)=>{
  try {
    const {id} = req.params;
    if(!id) {
      return res.status(400).json({success: false, message: "Client ID is required"});
    }
    const client = await clientModel.findById(id);
    if(!client) {
      return res.status(404).json({success: false, message: "Client not found"});
    }
    res.status(200).json({success: true, client});
  } catch (error) {
    console.error(error);
    res.status(500).json({success : false, message: "Server error while fetching clients", error: error.message});

  }
}



// update Client Status
exports.updateClientStatus = async (req, res) => {

  try {
    const { status } = req.body;
    if(! status){
      return res.status(400).json({ message: "Status is required" });
    }
    const {id} = req.params;
    if(! id) return res.status(400).json({ message: "Client ID is required" });
    const updatedClient = await clientModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.status(200).json(updatedClient);
  } catch (error) {
     console.error(error);
     res.status(500).json({ error: error.message });
  }
  
}



// delete a client
exports.deleteClient = async(req, res)=>{
  try {
    
    const {id} = req.params;
    if(! id) {
      return res.status(400).json({ success: false, message: "Client ID is required" });
    }

    await clientModel.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Client deleted successfully" });

   } catch (error) {
     console.error(error);
     res.status(500).json({ success: false, message: "Server error while deleting client", error: error.message });   
    }
  }




  // Get All Family Members
  exports.getAllFamilyMembers = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide Client ID"
      });
    }

    const client = await clientModel.findById(id).select("familyMembers");

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found for this ID"
      });
    }

    res.status(200).json({
      success: true,
      message: "Family members fetched successfully",
      data: client.familyMembers
    });

  } catch (error) {
    console.error("Error in fetching all family members:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching family members"
    });
  }
};







  // CREATE a new KYC
exports.createKyc = async (req, res) => {
  try {
    const DOCUMENT_ENUM = [
      "Registration form",
      "Rough data sheet",
      "School certificate",
      "Aadhar Card",
      "Pan Card",
      "Photo",
      "Driving License",
      "Voter Id",
      "Policy Status"
    ];
    
    const { clientId } = req.params;
    const { memberName, documentName, documentNumber, remark } = req.body;

    if (!clientId) {
      return res.status(400).json({ success: false, message: "Client ID is required" });
    }

    // Validate documentName against enum
    if (!DOCUMENT_ENUM.includes(documentName.trim())) {
      return res.status(400).json({
        success: false,
        message: `Invalid documentName. Must be one of: ${DOCUMENT_ENUM.join(", ")}`,
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a document" });
    }

    // Find client
    const client = await clientModel.findById(clientId);
    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }
    
    // Save file name
    // const fileUrl = req.file.filename;

    const fileUrl = `${req.protocol}://${req.get('host')}/Images/${req.file.filename}`;

    

    
    // console.log(fileUrl, "fileUrl in createKyc");
    
    // Create KYC
    const kyc = new Kyc({
      memberName,
      documentName,
      documentNumber,
      remark,
      fileUrl,
      user: clientId,
    });

    await kyc.save();
    
    // Link KYC to client
    client.kycs.push(kyc._id);
    await client.save();
    
    // Determine remaining vs completed documents
    const uploadedKycs = await Kyc.find({ user: clientId }).select("documentName");
    
    const uploadedDocs = uploadedKycs.map(k => k.documentName);

    const responseList = DOCUMENT_ENUM.map(doc => ({
      documentName: doc,
      status: uploadedDocs.includes(doc) ? "complete" : "remaining"
    }));

    return res.status(201).json({
      success: true,
      message: "KYC uploaded successfully",
      uploaded: kyc,
      documentStatus: responseList
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};



// GET all KYC documents for a specific member
exports.getKycsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const kycs = await Kyc.find({ user: clientId });
    if (kycs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Kycs found for this Cleint."
      })
    }

    return res.status(200).json({ success: true, kycs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



// DELETE a KYC document
exports.deleteKyc = async (req, res) => {
  try {
    const { id } = req.params;
    
    const kyc = await Kyc.findByIdAndDelete(id);
    if (!kyc) {
      return res.status(404).json({ success: false, message: "KYC not found" });
    }
    
    // Optionally remove it from client's kycs array
    await clientModel.updateOne({ kycs: id }, { $pull: { kycs: id } });

    return res.status(200).json({ success: true, message: "KYC deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


// UPDATE a KYC document
exports.updateKyc = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberName, documentName, documentNumber, remark } = req.body;

    // Validate if documentName is one of the allowed enum values
    const allowedDocumentNames = [
      "Registration form",
      "Rough data sheet",
      "School certificate",
      "Aadhar Card",
      "Pan Card",
      "Photo",
      "Driving License",
      "Voter Id",
      "Policy Status"
    ];
    
    if (documentName && !allowedDocumentNames.includes(documentName)) {
      return res.status(400).json({
        success: false,
        message: `Invalid documentName. Allowed values are: ${allowedDocumentNames.join(", ")}`
      });
    }
    
    // Prepare update object
    const updateData = {
      memberName,
      documentName,
      documentNumber,
      remark,
    };

    // Handle optional file upload
    if (req.file) {
      // updateData.fileUrl = req.file.filename;
      const fileUrl = `${req.protocol}://${req.get('host')}/Images/${req.file.filename}`;
      updateData.fileUrl = fileUrl;
    }

    
    // Remove undefined fields (to avoid overwriting with undefined)
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) delete updateData[key];
    });
    
    const updated = await Kyc.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updated) {
      return res.status(404).json({ success: false, message: "KYC not found" });
    }
    
    return res.status(200).json({
      success: true,
      message: "KYC updated successfully",
      updated
    });
    
  } catch (error) {
    console.error("Update KYC error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};









