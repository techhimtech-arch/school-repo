const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { allowRoles } = require("../middleware/rbac");
const {
  addDailyTopic,
  getStudentTopics,
  getClassTopics,
} = require("../controllers/topics.controller");

// SUBJECT_TEACHER only
router.post("/add", verifyToken, allowRoles(["SUBJECT_TEACHER"]), addDailyTopic);

// CLASS_TEACHER, SUPER_ADMIN
router.get("/class", verifyToken, allowRoles(["CLASS_TEACHER", "SUPER_ADMIN"]), getClassTopics);

// STUDENT_PARENT
router.get("/student/:student_id", verifyToken, allowRoles(["STUDENT_PARENT"]), getStudentTopics);

module.exports = router;


