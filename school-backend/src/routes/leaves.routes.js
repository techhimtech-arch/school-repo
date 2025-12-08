const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { allowRoles } = require("../middleware/rbac");
const {
  requestLeave,
  approveLeave,
  getStudentLeaves,
  getClassLeaves,
} = require("../controllers/leaves.controller");

// STUDENT_PARENT only
router.post("/request", verifyToken, allowRoles(["STUDENT_PARENT"]), requestLeave);

// CLASS_TEACHER only
router.post("/approve", verifyToken, allowRoles(["CLASS_TEACHER"]), approveLeave);
router.get("/class", verifyToken, allowRoles(["CLASS_TEACHER"]), getClassLeaves);

// STUDENT_PARENT
router.get("/student/:student_id", verifyToken, allowRoles(["STUDENT_PARENT"]), getStudentLeaves);

module.exports = router;


