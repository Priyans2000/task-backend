const express = require("express");
const Task = require("../models/Task");
const router = express.Router();

// Create Task
router.post("/create", async (req, res) => {
  console.log("Received task data:", req.body);
  
  try {
    const { title, description, dueDate, assignedUser, priority, status } = req.body;

    // Validate required fields
    if (!title || !description || !dueDate) {
      return res.status(400).json({ 
        message: "Missing required fields", 
        required: "title, description, and dueDate" 
      });
    }

    const newTask = new Task({
      title,
      description,
      dueDate,
      assignedUser: assignedUser || null,
      priority: priority || 'Low',
      status: status || 'Pending'
    });

    await newTask.save();
    console.log("Task saved successfully:", newTask);

    res.status(201).json({
      message: "Task created successfully",
      task: newTask
    });

  } catch (err) {
    console.error("Task creation error:", err);
    res.status(500).json({ 
      message: "Error creating task", 
      error: err.message 
    });
  }
});

// Get All Tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedUser', 'username email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ 
      message: "Error fetching tasks", 
      error: err.message 
    });
  }
});

// Add these routes in your taskRoutes.js

// Get single task
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedUser', 'username email');
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Error fetching task", error: err.message });
  }
});

// Update task
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('assignedUser', 'username email');
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.json({ message: "Task updated successfully", task });
  } catch (err) {
    res.status(500).json({ message: "Error updating task", error: err.message });
  }
});

// Delete task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting task", error: err.message });
  }
});

// Get tasks for specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const tasks = await Task.find({ assignedUser: req.params.userId })
      .sort({ dueDate: 1 }); // Sort by due date ascending
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks", error: err.message });
  }
});

module.exports = router;