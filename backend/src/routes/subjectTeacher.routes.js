const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const {
  getMyAssignments,
  getClassSectionStudents,
  uploadMaterial,
  createHomework,
  createTest,
  addMarks,
  addBehaviourRemark,
  addDailyTopic
} = require('../controllers/subjectTeacher.controller');

// All routes require SUBJECT_TEACHER role
router.use(verifyToken, allowRoles(['SUBJECT_TEACHER']));

// Assignments
router.get('/assignments', getMyAssignments);
router.get('/students', getClassSectionStudents);

// Materials
router.post('/materials', uploadMaterial);

// Homework
router.post('/homework', createHomework);

// Tests
router.post('/tests', createTest);

// Marks
router.post('/marks', addMarks);

// Behaviour
router.post('/behaviour', addBehaviourRemark);

// Daily Topics
router.post('/daily-topics', addDailyTopic);

module.exports = router;

