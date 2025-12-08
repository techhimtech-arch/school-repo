const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { allowRoles } = require("../middleware/rbac");
const {
  updateFeeStatus,
  getStudentFees,
  getClassFees,
} = require("../controllers/fees.controller");

// CLASS_TEACHER only
router.put("/update", verifyToken, allowRoles(["CLASS_TEACHER"]), updateFeeStatus);
router.get("/class", verifyToken, allowRoles(["CLASS_TEACHER"]), getClassFees);

// STUDENT_PARENT
router.get("/student/:student_id", verifyToken, allowRoles(["STUDENT_PARENT"]), getStudentFees);

module.exports = router;


