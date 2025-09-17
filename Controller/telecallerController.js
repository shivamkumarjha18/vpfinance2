const Telecaller = require("../Models/telecallerModel"); // ✅ CommonJS import
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register Controller
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

// Login Controller
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

module.exports = { registerTelecaller, loginTelecaller };
