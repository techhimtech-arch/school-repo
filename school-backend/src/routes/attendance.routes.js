const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { allowRoles } = require("../middleware/rbac");
const {
  markAttendance,
  getStudentAttendance,
  getClassAttendance,
} = require("../controllers/attendance.controller");

// CLASS_TEACHER only
router.post("/mark", verifyToken, allowRoles(["CLASS_TEACHER"]), markAttendance);

// CLASS_TEACHER, SUPER_ADMIN
router.get("/class", verifyToken, allowRoles(["CLASS_TEACHER", "SUPER_ADMIN"]), getClassAttendance);

// STUDENT_PARENT
router.get("/student/:student_id", verifyToken, allowRoles(["STUDENT_PARENT"]), getStudentAttendance);

module.exports = router;


