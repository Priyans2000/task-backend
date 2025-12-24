// controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { JWT_SECRET, JWT_EXPIRATION } = require("../config");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    res.status(200).json({ message: "Login successful", token, role: user.role });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.registerAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: "admin@example.com" });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("adminpassword", 10); // Default admin password
      const admin = new User({
        username: "Admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      });

      await admin.save();
      console.log("Admin created successfully");
    } else {
      console.log("Admin already exists");
    }
  } catch (err) {
    console.error("Error creating admin:", err);
  }
};