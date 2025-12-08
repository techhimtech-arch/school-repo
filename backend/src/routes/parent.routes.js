const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const {
  getMyStudent,
  getTodayAttendance,
  getTodayHomework,
  getDailyTopics,
  getTestsAndMarks,
  getBehaviourNotes,
  getStudyMaterials,
  submitLeaveRequest,
  getLeaveRequests,
  getFeesStatus
} = require('../controllers/parent.controller');

// All routes require STUDENT_PARENT role
router.use(verifyToken, allowRoles(['STUDENT_PARENT']));

// Student info
router.get('/student', getMyStudent);

// Attendance
router.get('/attendance/today', getTodayAttendance);

// Homework
router.get('/homework/today', getTodayHomework);

// Daily Topics
router.get('/daily-topics', getDailyTopics);

// Tests and Marks
router.get('/tests-marks', getTestsAndMarks);

// Behaviour
router.get('/behaviour', getBehaviourNotes);

// Materials
router.get('/materials', getStudyMaterials);

// Leave Requests
router.get('/leave-requests', getLeaveRequests);
router.post('/leave-requests', submitLeaveRequest);

// Fees
router.get('/fees', getFeesStatus);

module.exports = router;

