const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { allowRoles } = require("../middleware/rbac");
const {
  addBehaviourRemark,
  getStudentBehaviour,
} = require("../controllers/behaviour.controller");

// SUBJECT_TEACHER only
router.post("/add", verifyToken, allowRoles(["SUBJECT_TEACHER"]), addBehaviourRemark);

// STUDENT_PARENT
router.get("/student/:student_id", verifyToken, allowRoles(["STUDENT_PARENT"]), getStudentBehaviour);

module.exports = router;


