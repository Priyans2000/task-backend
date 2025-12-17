const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

/* =======================
   CORS CONFIG (FIXED)
======================= */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://task-manager-dusky-three.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow Postman / server-to-server requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Preflight request fix
app.options("*", cors());

/* =======================
   MIDDLEWARE
======================= */
app.use(express.json());

/* =======================
   MONGODB CONNECTION
======================= */
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/task-management")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  });

/* =======================
   ROUTES
======================= */
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

/* =======================
   ERROR HANDLER
======================= */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* =======================
   START SERVER
======================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
