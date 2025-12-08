const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { allowRoles } = require("../middleware/rbac");
const {
  addMarks,
  bulkAddMarks,
  getStudentMarks,
} = require("../controllers/marks.controller");

// SUBJECT_TEACHER only
router.post("/add", verifyToken, allowRoles(["SUBJECT_TEACHER"]), addMarks);
router.post("/bulk-add", verifyToken, allowRoles(["SUBJECT_TEACHER"]), bulkAddMarks);

// STUDENT_PARENT
router.get("/student/:student_id", verifyToken, allowRoles(["STUDENT_PARENT"]), getStudentMarks);

module.exports = router;


