const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { allowRoles } = require("../middleware/rbac");
const {
  getMyStudent,
} = require("../controllers/parent.controller");

// All routes require STUDENT_PARENT role
router.use(verifyToken, allowRoles(["STUDENT_PARENT"]));

router.get("/student", getMyStudent);

module.exports = router;


