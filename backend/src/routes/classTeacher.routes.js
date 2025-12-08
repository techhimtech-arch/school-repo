const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');
const {
  getClassStudents,
  markAttendance,
  getAttendance,
  approveLeave,
  getLeaveRequests,
  getHomework,
  getMaterials,
  updateFeeStatus,
  getFees,
  createClassAnnouncement
} = require('../controllers/classTeacher.controller');

// All routes require CLASS_TEACHER role
router.use(verifyToken, allowRoles(['CLASS_TEACHER']));

// Students
router.get('/students', getClassStudents);

// Attendance
router.post('/attendance', markAttendance);
router.get('/attendance', getAttendance);

// Leave requests
router.get('/leave-requests', getLeaveRequests);
router.put('/leave-requests/:leave_id', approveLeave);

// Homework (view only)
router.get('/homework', getHomework);

// Materials (view only)
router.get('/materials', getMaterials);

// Fees
router.get('/fees', getFees);
router.put('/fees/:fee_id', updateFeeStatus);

// Announcements
router.post('/announcements', createClassAnnouncement);

module.exports = router;

