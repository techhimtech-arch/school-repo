const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { allowRoles } = require("../middleware/rbac");
const {
  createTest,
  getStudentTests,
  getClassTests,
} = require("../controllers/tests.controller");

// SUBJECT_TEACHER only
router.post("/create", verifyToken, allowRoles(["SUBJECT_TEACHER"]), createTest);

// CLASS_TEACHER, SUPER_ADMIN
router.get("/class", verifyToken, allowRoles(["CLASS_TEACHER", "SUPER_ADMIN"]), getClassTests);

// STUDENT_PARENT
router.get("/student/:student_id", verifyToken, allowRoles(["STUDENT_PARENT"]), getStudentTests);

module.exports = router;


