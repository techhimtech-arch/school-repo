require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Import routes
const authRoutes = require("./routes/auth.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const homeworkRoutes = require("./routes/homework.routes");
const materialsRoutes = require("./routes/materials.routes");
const testsRoutes = require("./routes/tests.routes");
const marksRoutes = require("./routes/marks.routes");
const behaviourRoutes = require("./routes/behaviour.routes");
const topicsRoutes = require("./routes/topics.routes");
const announcementsRoutes = require("./routes/announcements.routes");
const leavesRoutes = require("./routes/leaves.routes");
const feesRoutes = require("./routes/fees.routes");
const adminRoutes = require("./routes/admin.routes");
const classTeacherRoutes = require("./routes/classTeacher.routes");
const subjectTeacherRoutes = require("./routes/subjectTeacher.routes");
const parentRoutes = require("./routes/parent.routes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "School Progress Tracking System API", status: "running" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/materials", materialsRoutes);
app.use("/api/tests", testsRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/behaviour", behaviourRoutes);
app.use("/api/topics", topicsRoutes);
app.use("/api/announcements", announcementsRoutes);
app.use("/api/leaves", leavesRoutes);
app.use("/api/fees", feesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/class-teacher", classTeacherRoutes);
app.use("/api/subject-teacher", subjectTeacherRoutes);
app.use("/api/parent", parentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server (only if not in Vercel)
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
