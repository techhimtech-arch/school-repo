const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { allowRoles } = require("../middleware/rbac");
const {
  getClassStudents,
} = require("../controllers/classTeacher.controller");

// All routes require CLASS_TEACHER role
router.use(verifyToken, allowRoles(["CLASS_TEACHER"]));

router.get("/students", getClassStudents);

module.exports = router;


