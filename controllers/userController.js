const User = require("../models/User");

exports.createUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const newUser = new User({
      username,
      email,
      password,
      role,
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating user" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};