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
// Note: In Vercel, /api prefix is handled by routing, so routes are defined without it
// For local development, the proxy will handle the /api prefix
app.use("/auth", authRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/homework", homeworkRoutes);
app.use("/materials", materialsRoutes);
app.use("/tests", testsRoutes);
app.use("/marks", marksRoutes);
app.use("/behaviour", behaviourRoutes);
app.use("/topics", topicsRoutes);
app.use("/announcements", announcementsRoutes);
app.use("/leaves", leavesRoutes);
app.use("/fees", feesRoutes);
app.use("/admin", adminRoutes);
app.use("/class-teacher", classTeacherRoutes);
app.use("/subject-teacher", subjectTeacherRoutes);
app.use("/parent", parentRoutes);

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
