const express = require("express");
const Task = require("../models/Task");
const router = express.Router();
const { auth, adminAuth, userAuth } = require('../middleware/auth');

// Create Task
router.post("/create", adminAuth, async (req, res) => {
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
router.get("/all", adminAuth, async (req, res) => {
  try {
    console.log('Fetching all tasks'); // Debug log
    const tasks = await Task.find()
      .populate('assignedUser', 'username email')
      .sort({ dueDate: 1 });
    console.log('Found tasks:', tasks); // Debug log
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching all tasks:', err);
    res.status(500).json({ message: "Error fetching tasks", error: err.message });
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

// Get tasks for specific user with pagination
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const total = await Task.countDocuments({ assignedUser: req.params.userId });
    const tasks = await Task.find({ assignedUser: req.params.userId })
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      tasks,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Error fetching user tasks:', err);
    res.status(500).json({ message: "Error fetching tasks", error: err.message });
  }
});

// Update task status (User route)
router.put("/:taskId", auth, async (req, res) => {
  try {
    console.log('Updating task:', req.params.taskId, req.body); // Debug log
    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = req.body.status;
    await task.save();
    console.log('Task updated:', task); // Debug log
    res.json(task);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ message: "Error updating task", error: err.message });
  }
});

// Delete task (Admin only)
router.delete("/:taskId", adminAuth, async (req, res) => {
  try {
    console.log('Deleting task:', req.params.taskId); // Debug log
    const task = await Task.findByIdAndDelete(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    console.log('Task deleted successfully'); // Debug log
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ message: "Error deleting task", error: err.message });
  }
});

module.exports = router;