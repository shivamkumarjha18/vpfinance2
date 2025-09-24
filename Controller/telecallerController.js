const Telecaller = require("../Models/telecallerModel"); 
const Test = require("../Models/SusProsClientSchema"); // ✅ Correct model import
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Register Controller
const registerTelecaller = async (req, res) => {
  try {
    const { username, email, password, mobileno } = req.body;

    // Check if telecaller already exists
    const existingUser = await Telecaller.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // ✅ Password hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newTelecaller = new Telecaller({
      username,
      email,
      mobileno,
      password: hashedPassword,
      role: "Telecaller", // ✅ role fixed
    });

    await newTelecaller.save();

    res.status(201).json({
      message: "Telecaller registered successfully",
      telecaller: {
        id: newTelecaller._id,
        username: newTelecaller.username,
        email: newTelecaller.email,
        mobileno: newTelecaller.mobileno,
        role: newTelecaller.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registering telecaller",
      error: error.message,
    });
  }
};

// ✅ Login Controller
const loginTelecaller = async (req, res) => {
  try {
    const { email, password } = req.body;

    const telecaller = await Telecaller.findOne({ email });
    if (!telecaller) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, telecaller.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: telecaller._id, role: telecaller.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      telecaller: {
        id: telecaller._id,
        username: telecaller.username,
        email: telecaller.email,
        mobileno: telecaller.mobileno,
        role: telecaller.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};

// ✅ Get All Telecallers
const getAllTelecallers = async (req, res) => {
  try {
    const telecallers = await Telecaller.find().select("-password"); // password hide
    res.json({
      message: "All telecallers fetched successfully",
      count: telecallers.length,
      telecallers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching telecallers",
      error: error.message,
    });
  }
};

// ✅ Get Telecaller by ID
const getTelecallerById = async (req, res) => {
  try {
    const { id } = req.params;
    const telecaller = await Telecaller.findById(id).select("-password");
    if (!telecaller) {
      return res.status(404).json({ message: "Telecaller not found" });
    }
    res.json({
      message: "Telecaller fetched successfully",
      telecaller,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching telecaller",
      error: error.message,
    });
  }
};

// 🔥 FIXED: Assign Suspects to Telecaller
const assignSuspectsToTelecaller = async (req, res) => {
  try {
    const { role, selectedPerson, suspects } = req.body;

    // ✅ Validation checks
    if (!role || !selectedPerson || !suspects || suspects.length === 0) {
      return res.status(400).json({ 
        message: "Missing required fields: role, selectedPerson, and suspects are required" 
      });
    }

    // ✅ Check if telecaller exists (agar role telecaller hai)
    if (role === "Telecaller") {
      const telecaller = await Telecaller.findById(selectedPerson);
      if (!telecaller) {
        return res.status(404).json({ message: "Telecaller not found" });
      }
    }

    // ✅ Check if all suspects exist (Test model use kiya)
    const existingSuspects = await Test.find({ _id: { $in: suspects } });
    if (existingSuspects.length !== suspects.length) {
      return res.status(404).json({ 
        message: "One or more suspects not found",
        found: existingSuspects.length,
        requested: suspects.length
      });
    }

    // ✅ Update suspects with assigned telecaller info (Test model use kiya)
    const updateResult = await Test.updateMany(
      { _id: { $in: suspects } },
      { 
        $set: { 
          assignedTo: selectedPerson,
          assignedRole: role,
          assignedAt: new Date()
        } 
      }
    );

    // ✅ Update telecaller's assigned suspects array (optional)
    if (role === "Telecaller") {
      await Telecaller.findByIdAndUpdate(
        selectedPerson,
        { $addToSet: { assignedSuspects: { $each: suspects } } }
      );
    }

    // ✅ Get updated suspects details for response (Test model use kiya)
    const updatedSuspects = await Test.find({ _id: { $in: suspects } })
      .select("personalDetails assignedTo assignedRole assignedAt status")
      .populate("assignedTo", "username email"); // populate telecaller info

    res.status(200).json({
      success: true,
      message: `Successfully assigned ${updateResult.modifiedCount} suspects to ${role}`,
      data: {
        role: role,
        selectedPerson: selectedPerson,
        assignedSuspectsCount: updateResult.modifiedCount,
        assignedSuspects: updatedSuspects
      }
    });

  } catch (error) {
    console.error("Error assigning suspects:", error);
    res.status(500).json({
      success: false,
      message: "Error assigning suspects to telecaller",
      error: error.message,
    });
  }
};

// 🔥 FIXED: Get Assigned Suspects for Telecaller
const getAssignedSuspects = async (req, res) => {
  try {
    const { telecallerId } = req.params;

    // ✅ Check if telecaller exists
    const telecaller = await Telecaller.findById(telecallerId);
    if (!telecaller) {
      return res.status(404).json({ 
        success: false,
        message: "Telecaller not found" 
      });
    }

    // ✅ Get all suspects assigned to this telecaller (Test model use kiya)
    const assignedSuspects = await Test.find({ assignedTo: telecallerId })
      .select("personalDetails assignedAt status")
      .sort({ assignedAt: -1 }); // latest assigned first

    res.status(200).json({
      success: true,
      message: "Assigned suspects fetched successfully",
      data: {
        telecaller: {
          id: telecaller._id,
          username: telecaller.username,
          email: telecaller.email
        },
        assignedSuspectsCount: assignedSuspects.length,
        assignedSuspects: assignedSuspects
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching assigned suspects",
      error: error.message,
    });
  }
};

// 🔥 FIXED: Unassign Suspects from Telecaller
const unassignSuspects = async (req, res) => {
  try {
    const { telecallerId, suspectIds } = req.body;

    if (!telecallerId || !suspectIds || suspectIds.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "telecallerId and suspectIds are required" 
      });
    }

    // ✅ Unassign suspects (remove assignment) - Test model use kiya
    const updateResult = await Test.updateMany(
      { 
        _id: { $in: suspectIds }, 
        assignedTo: telecallerId 
      },
      { 
        $unset: { 
          assignedTo: 1,
          assignedRole: 1,
          assignedAt: 1
        }
      }
    );

    // ✅ Remove from telecaller's assigned list
    await Telecaller.findByIdAndUpdate(
      telecallerId,
      { $pullAll: { assignedSuspects: suspectIds } }
    );

    res.status(200).json({
      success: true,
      message: `Successfully unassigned ${updateResult.modifiedCount} suspects`,
      data: {
        unassignedCount: updateResult.modifiedCount
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error unassigning suspects",
      error: error.message,
    });
  }
};

module.exports = { 
  registerTelecaller, 
  loginTelecaller, 
  getAllTelecallers, 
  getTelecallerById,
  assignSuspectsToTelecaller,  // 🔥 FIXED
  getAssignedSuspects,         // 🔥 FIXED
  unassignSuspects             // 🔥 FIXED
};