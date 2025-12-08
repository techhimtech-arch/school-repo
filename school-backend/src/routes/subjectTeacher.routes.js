const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { allowRoles } = require("../middleware/rbac");
const {
  getMyAssignments,
  getClassSectionStudents,
} = require("../controllers/subjectTeacher.controller");

// All routes require SUBJECT_TEACHER role
router.use(verifyToken, allowRoles(["SUBJECT_TEACHER"]));

router.get("/assignments", getMyAssignments);
router.get("/students", getClassSectionStudents);

module.exports = router;


