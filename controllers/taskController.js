// controllers/taskController.js
const Task = require("../models/Task");
const User = require("../models/User");

exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, assignedUser } = req.body;

    const user = await User.findById(assignedUser);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const task = new Task({
      title,
      description,
      dueDate,
      assignedUser,
      status: "pending",
    });

    await task.save();
    res.status(201).json({ message: "Task created successfully", task });
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ message: "Error creating task", error: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedUser", "username email");
    res.status(200).json({ tasks });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: "Error fetching tasks", error: err.message });
  }
};