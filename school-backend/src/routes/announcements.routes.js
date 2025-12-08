const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { allowRoles } = require("../middleware/rbac");
const {
  createAnnouncement,
  getStudentAnnouncements,
  getClassAnnouncements,
} = require("../controllers/announcements.controller");

// SUPER_ADMIN, CLASS_TEACHER
router.post("/create", verifyToken, allowRoles(["SUPER_ADMIN", "CLASS_TEACHER"]), createAnnouncement);

// CLASS_TEACHER, SUPER_ADMIN
router.get("/class", verifyToken, allowRoles(["CLASS_TEACHER", "SUPER_ADMIN"]), getClassAnnouncements);

// STUDENT_PARENT
router.get("/student/:student_id", verifyToken, allowRoles(["STUDENT_PARENT"]), getStudentAnnouncements);

module.exports = router;


