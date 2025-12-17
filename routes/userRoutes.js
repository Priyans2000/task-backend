const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new user (Admin only)
router.post("/", authMiddleware.protect, authMiddleware.admin, userController.createUser);

// Get all users (Admin only)
router.get("/", authMiddleware.protect, authMiddleware.admin, userController.getAllUsers);

module.exports = router;