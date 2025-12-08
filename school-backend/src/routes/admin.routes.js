const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { allowRoles } = require("../middleware/rbac");
const {
  getAllClasses,
  getAllSections,
  getAllSubjects,
  getAllTeachers,
  createTeacher,
  updateTeacher,
  getTeacherMappings,
  createTeacherMapping,
  deleteTeacherMapping,
  getAllStudents,
  getAttendanceAnalytics,
  getMarksAnalytics,
  getBehaviourAnalytics,
  getFeesAnalytics,
} = require("../controllers/admin.controller");

// All routes require SUPER_ADMIN role
router.use(verifyToken, allowRoles(["SUPER_ADMIN"]));

// Classes
router.get("/classes", getAllClasses);

// Sections
router.get("/sections", getAllSections);

// Subjects
router.get("/subjects", getAllSubjects);

// Teachers
router.get("/teachers", getAllTeachers);
router.post("/teachers", createTeacher);
router.put("/teachers/:teacher_id", updateTeacher);

// Teacher Subject Mappings
router.get("/teacher-mappings", getTeacherMappings);
router.post("/teacher-mappings", createTeacherMapping);
router.delete("/teacher-mappings/:mapping_id", deleteTeacherMapping);

// Students (read-only)
router.get("/students", getAllStudents);

// Analytics
router.get("/analytics/attendance", getAttendanceAnalytics);
router.get("/analytics/marks", getMarksAnalytics);
router.get("/analytics/behaviour", getBehaviourAnalytics);
router.get("/analytics/fees", getFeesAnalytics);

module.exports = router;


