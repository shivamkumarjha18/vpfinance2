const HR = require("../ModelS/HRModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Register Controller
const registerHR = async (req, res) => {
  try {
    const { username, email, password, mobileno } = req.body;

    // Check if HR already exists
    const existingUser = await HR.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // ✅ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newHR = new HR({
      username,
      email,
      mobileno,
      password: hashedPassword,
      role: "HR", // fix role
    });

    await newHR.save();

    res.status(201).json({
      message: "HR registered successfully",
      HR: {
        id: newHR._id,
        username: newHR.username,
        email: newHR.email,
        mobileno: newHR.mobileno,
        role: newHR.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registering HR",
      error: error.message,
    });
  }
};

// ✅ Login Controller
const loginHR = async (req, res) => {
  try {
    const { email, password } = req.body;

    const hr = await HR.findOne({ email });
    if (!hr) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, hr.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Generate JWT
    const token = jwt.sign(
      { id: hr._id, role: hr.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      HR: {
        id: hr._id,
        username: hr.username,
        email: hr.email,
        mobileno: hr.mobileno,
        role: hr.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};

module.exports = { registerHR, loginHR };
