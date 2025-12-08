const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { allowRoles } = require("../middleware/rbac");
const {
  uploadMaterial,
  getStudentMaterials,
  getClassMaterials,
} = require("../controllers/materials.controller");

// SUBJECT_TEACHER only
router.post("/upload", verifyToken, allowRoles(["SUBJECT_TEACHER"]), uploadMaterial);

// CLASS_TEACHER, SUPER_ADMIN
router.get("/class", verifyToken, allowRoles(["CLASS_TEACHER", "SUPER_ADMIN"]), getClassMaterials);

// STUDENT_PARENT
router.get("/student/:student_id", verifyToken, allowRoles(["STUDENT_PARENT"]), getStudentMaterials);

module.exports = router;


