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

// // 🔥 FIXED: Assign Suspects to Telecaller
// const assignSuspectsToTelecaller = async (req, res) => {
//   try {
//     const { role, selectedPerson, suspects } = req.body;

//     // ✅ Validation checks
//     if (!role || !selectedPerson || !suspects || suspects.length === 0) {
//       return res.status(400).json({ 
//         message: "Missing required fields: role, selectedPerson, and suspects are required" 
//       });
//     }

//     // ✅ Check if telecaller exists (agar role telecaller hai)
//     if (role === "Telecaller") {
//       const telecaller = await Telecaller.findById(selectedPerson);
//       if (!telecaller) {
//         return res.status(404).json({ message: "Telecaller not found" });
//       }
//     }

//     // ✅ Check if all suspects exist
//     const existingSuspects = await Test.find({ _id: { $in: suspects } });
//     if (existingSuspects.length !== suspects.length) {
//       return res.status(404).json({ 
//         message: "One or more suspects not found",
//         found: existingSuspects.length,
//         requested: suspects.length
//       });
//     }

//     // ✅ Update suspects with assigned telecaller info
//     const updateResult = await Test.updateMany(
//       { _id: { $in: suspects } },
//       { 
//         $set: { 
//           assignedTo: selectedPerson,
//           assignedRole: role,
//           assignedAt: new Date()
//         } 
//       }
//     );

//     // 🔥 FIXED: Update telecaller's assigned suspects array with proper structure
//     if (role === "Telecaller") {
//       const suspectObjects = suspects.map(suspectId => ({
//         suspectId: suspectId,
//         assignedAt: new Date()
//       }));

//       await Telecaller.findByIdAndUpdate(
//         selectedPerson,
//         { 
//           $addToSet: { 
//             assignedSuspects: { $each: suspectObjects } 
//           } 
//         }
//       );
//     }

//     // ✅ Get updated suspects details for response
//     const updatedSuspects = await Test.find({ _id: { $in: suspects } })
//       .select("personalDetails assignedTo assignedRole assignedAt status")
//       .populate("assignedTo", "username email");

//     res.status(200).json({
//       success: true,
//       message: `Successfully assigned ${updateResult.modifiedCount} suspects to ${role}`,
//       data: {
//         role: role,
//         selectedPerson: selectedPerson,
//         assignedSuspectsCount: updateResult.modifiedCount,
//         assignedSuspects: updatedSuspects
//       }
//     });

//   } catch (error) {
//     console.error("Error assigning suspects:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error assigning suspects to telecaller",
//       error: error.message,
//     });
//   }
// };

// // 🔥 FIXED: Get Assigned Suspects for Telecaller
// // const getAssignedSuspects = async (req, res) => {
// //   try {
// //     const { telecallerId } = req.params;

// //     // ✅ Check if telecaller exists
// //     const telecaller = await Telecaller.findById(telecallerId)
// //       .populate({
// //         path: "assignedSuspects.suspectId",
// //         select: "personalDetails status", // assignedAt telecaller ke array se lenge
// //       });

// //     if (!telecaller) {
// //       return res.status(404).json({
// //         success: false,
// //         message: "Telecaller not found",
// //       });
// //     }

// //     // 🔥 OPTION 1: From telecaller.assignedSuspects
// //     const assignedFromTelecaller = telecaller.assignedSuspects
// //       .filter((item) => item.suspectId) // Ensure suspectId exists
// //       .map((item) => ({
// //         ...item.suspectId.toObject(),
// //         assignedAt: item.assignedAt, // ✅ assigned date from Telecaller schema
// //       }));

// //     // 🔥 OPTION 2: From Test collection (fallback)
// //     const assignedFromTest = await Test.find({ assignedTo: telecallerId })
// //       .select("personalDetails assignedAt status") // ✅ assignedAt from Test schema
// //       .sort({ assignedAt: -1 })
// //       .lean();

// //     // ✅ Choose telecaller array if available, else Test
// //     const assignedSuspects =
// //       assignedFromTelecaller.length > 0 ? assignedFromTelecaller : assignedFromTest;

// //     res.status(200).json({
// //       success: true,
// //       message: "Assigned suspects fetched successfully",
// //       data: {
// //         telecaller: {
// //           id: telecaller._id,
// //           username: telecaller.username,
// //           email: telecaller.email,
// //         },
// //         assignedSuspectsCount: assignedSuspects.length,
// //         assignedSuspects: assignedSuspects.map((s) => ({
// //           ...s,
// //           assignedAt: s.assignedAt || null, // ✅ ensure date always included
// //         })),
// //       },
// //     });
// //   } catch (error) {
// //     console.error("Error fetching assigned suspects:", error);
// //     res.status(500).json({
// //       success: false,
// //       message: "Error fetching assigned suspects",
// //       error: error.message,
// //     });
// //   }
// // };
// const getAssignedSuspects = async (req, res) => {
//   try {
//     const { telecallerId } = req.params;

//     // ✅ Telecaller ke assigned suspects populate karo
//     const telecaller = await Telecaller.findById(telecallerId)
//       .populate({
//         path: "assignedSuspects.suspectId",
//         select: "personalDetails status", 
//       })
//       .lean();

//     if (!telecaller) {
//       return res.status(404).json({
//         success: false,
//         message: "Telecaller not found",
//       });
//     }

//     // 🔥 Merge suspect details + assignedAt from telecaller array
//     const assignedFromTelecaller = telecaller.assignedSuspects
//       .filter(item => item.suspectId)
//       .map(item => ({
//         ...item.suspectId,         // suspect ke details
//         assignedAt: item.assignedAt || null, // ✅ assign date (task assign time)
//       }));

//     // 🔥 Fallback → Agar direct Test collection use karna ho
//     const assignedFromTest = await Test.find({ assignedTo: telecallerId })
//       .select("personalDetails assignedAt status")
//       .sort({ assignedAt: -1 })
//       .lean();

//     // ✅ Agar telecaller.assignedSuspects me data hai to wahi use hoga
//     const assignedSuspects =
//       assignedFromTelecaller.length > 0 ? assignedFromTelecaller : assignedFromTest;

//     res.status(200).json({
//       success: true,
//       message: "Assigned suspects fetched successfully",
//       data: {
//         telecaller: {
//           id: telecaller._id,
//           username: telecaller.username,
//           email: telecaller.email,
//         },
//         assignedSuspectsCount: assignedSuspects.length,
//         assignedSuspects: assignedSuspects.map(s => ({
//           ...s,
//           // ✅ ensure date always included
//           assignedAt: s.assignedAt || null,
//         })),
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching assigned suspects:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching assigned suspects",
//       error: error.message,
//     });
//   }
// };
// 🔥 FIXED: Assign Suspects to Telecaller
const assignSuspectsToTelecaller = async (req, res) => {
  try {
    const { role, selectedPerson, suspects } = req.body;

    if (!role || !selectedPerson || !suspects || suspects.length === 0) {
      return res.status(400).json({ 
        message: "Missing required fields: role, selectedPerson, and suspects are required" 
      });
    }

    if (role === "Telecaller") {
      const telecaller = await Telecaller.findById(selectedPerson);
      if (!telecaller) return res.status(404).json({ message: "Telecaller not found" });
    }

    const existingSuspects = await Test.find({ _id: { $in: suspects } });
    if (existingSuspects.length !== suspects.length) {
      return res.status(404).json({ 
        message: "One or more suspects not found",
        found: existingSuspects.length,
        requested: suspects.length
      });
    }

    const now = new Date();

    // ✅ Update Test collection
    await Test.updateMany(
      { _id: { $in: suspects } },
      { 
        $set: { 
          assignedTo: selectedPerson,
          assignedRole: role,
          assignedAt: now
        } 
      }
    );

    // ✅ Update Telecaller assignedSuspects with status + date
    if (role === "Telecaller") {
      const suspectObjects = suspects.map(suspectId => ({
        suspectId,
        assignedAt: now,
        status: "assigned" // ✅ new field
      }));

      await Telecaller.findByIdAndUpdate(
        selectedPerson,
        { 
          $addToSet: { assignedSuspects: { $each: suspectObjects } } 
        }
      );
    }

    const updatedSuspects = await Test.find({ _id: { $in: suspects } })
      .select("personalDetails assignedTo assignedRole assignedAt status")
      .populate("assignedTo", "username email");

    res.status(200).json({
      success: true,
      message: `Successfully assigned ${suspects.length} suspects to ${role}`,
      data: {
        role,
        selectedPerson,
        assignedSuspectsCount: suspects.length,
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

    const telecaller = await Telecaller.findById(telecallerId)
      .populate({
        path: "assignedSuspects.suspectId",
        select: "personalDetails status",
      })
      .lean();

    if (!telecaller) return res.status(404).json({ success: false, message: "Telecaller not found" });

    const assignedSuspects = telecaller.assignedSuspects
      .filter(item => item.suspectId)
      .map(item => ({
        ...item.suspectId,
        assignedAt: item.assignedAt || null,
        status: item.status || "assigned" // ✅ include status
      }));

    res.status(200).json({
      success: true,
      message: "Assigned suspects fetched successfully",
      data: {
        telecaller: {
          id: telecaller._id,
          username: telecaller.username,
          email: telecaller.email,
        },
        assignedSuspectsCount: assignedSuspects.length,
        assignedSuspects,
      },
    });
  } catch (error) {
    console.error("Error fetching assigned suspects:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching assigned suspects",
      error: error.message,
    });
  }
};



// 🔥 GET all assignments





module.exports = {
  registerTelecaller,
  loginTelecaller,
  getAllTelecallers,
  getTelecallerById,
  assignSuspectsToTelecaller,
  getAssignedSuspects,
};
