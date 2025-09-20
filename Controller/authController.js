const Telecaller = require("../Models/telecallerModel");
const Telemarketer = require("../Models/telemarketerModel");
const HR = require("../Models/HRModel");
const OA = require("../Models/OAModel");
const OE = require("../Models/OEModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Step 1: Pehle telecaller check kar
    let user = await Telecaller.findOne({ email });
    let role = "Telecaller";

    // Step 2: Agar telecaller nahi hai to telemarketer check kar
    if (!user) {
      user = await Telemarketer.findOne({ email });
      role = "Telemarketer";
    }

    // Step 3: Agar wo bhi nahi hai to OE check kar
    if (!user) {
      user = await OE.findOne({ email });
      role = "OE";
    }   
     if (!user) {
      user = await OA.findOne({ email });
      role = "OA";
    }
     if (!user) {
      user = await HR.findOne({ email });
      role = "HR";
    }



    // Step 4: Agar user hi nahi mila
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Step 5: Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Step 6: Token generate
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mobileno: user.mobileno,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};

module.exports = { loginUser };