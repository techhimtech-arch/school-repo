const pool = require('../db');

// Get student by parent email (STUDENT_PARENT)
const getMyStudent = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, c.name as class_name, sec.name as section_name
       FROM students s
       JOIN classes c ON s.class_id = c.id
       JOIN sections sec ON s.section_id = sec.id
       WHERE s.parent_email = $1
       LIMIT 1`,
      [req.user.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found for this parent' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get today's attendance (STUDENT_PARENT)
const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const studentQuery = await pool.query(
      'SELECT id FROM students WHERE parent_email = $1 LIMIT 1',
      [req.user.email]
    );

    if (studentQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const studentId = studentQuery.rows[0].id;

    const result = await pool.query(
      `SELECT a.*, s.name as student_name
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       WHERE a.student_id = $1 AND a.date = $2`,
      [studentId, today]
    );

    if (result.rows.length === 0) {
      return res.json({ data: null, message: 'No attendance record for today' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching today attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get today's homework (STUDENT_PARENT)
const getTodayHomework = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const studentQuery = await pool.query(
      'SELECT class_id, section_id FROM students WHERE parent_email = $1 LIMIT 1',
      [req.user.email]
    );

    if (studentQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const { class_id, section_id } = studentQuery.rows[0];

    const result = await pool.query(
      `SELECT h.*, s.name as subject_name, t.name as teacher_name
       FROM homework h
       JOIN subjects s ON h.subject_id = s.id
       JOIN teachers t ON h.teacher_id = t.id
       WHERE h.class_id = $1 AND (h.section_id = $2 OR h.section_id IS NULL)
       AND h.due_date >= $3
       ORDER BY h.due_date ASC`,
      [class_id, section_id, today]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching today homework:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get daily topics (STUDENT_PARENT)
const getDailyTopics = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const studentQuery = await pool.query(
      'SELECT class_id, section_id FROM students WHERE parent_email = $1 LIMIT 1',
      [req.user.email]
    );

    if (studentQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const { class_id, section_id } = studentQuery.rows[0];

    const result = await pool.query(
      `SELECT dt.*, s.name as subject_name, t.name as teacher_name
       FROM daily_topics dt
       JOIN subjects s ON dt.subject_id = s.id
       JOIN teachers t ON dt.teacher_id = t.id
       WHERE dt.class_id = $1 AND (dt.section_id = $2 OR dt.section_id IS NULL)
       AND dt.date = $3
       ORDER BY s.name`,
      [class_id, section_id, targetDate]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching daily topics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all tests and marks (STUDENT_PARENT)
const getTestsAndMarks = async (req, res) => {
  try {
    const studentQuery = await pool.query(
      'SELECT id, class_id, section_id FROM students WHERE parent_email = $1 LIMIT 1',
      [req.user.email]
    );

    if (studentQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const { id: studentId, class_id, section_id } = studentQuery.rows[0];

    const result = await pool.query(
      `SELECT t.*, s.name as subject_name, m.marks_obtained, m.remarks as marks_remarks
       FROM tests t
       JOIN subjects s ON t.subject_id = s.id
       LEFT JOIN marks m ON t.id = m.test_id AND m.student_id = $1
       WHERE t.class_id = $2 AND (t.section_id = $3 OR t.section_id IS NULL)
       ORDER BY t.test_date DESC`,
      [studentId, class_id, section_id]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching tests and marks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get behaviour notes (STUDENT_PARENT)
const getBehaviourNotes = async (req, res) => {
  try {
    const studentQuery = await pool.query(
      'SELECT id FROM students WHERE parent_email = $1 LIMIT 1',
      [req.user.email]
    );

    if (studentQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const studentId = studentQuery.rows[0].id;

    const result = await pool.query(
      `SELECT b.*, t.name as teacher_name, s.name as subject_name
       FROM behaviour b
       JOIN teachers t ON b.teacher_id = t.id
       LEFT JOIN subjects s ON b.subject_id = s.id
       WHERE b.student_id = $1
       ORDER BY b.created_at DESC`,
      [studentId]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching behaviour notes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get study materials (STUDENT_PARENT)
const getStudyMaterials = async (req, res) => {
  try {
    const studentQuery = await pool.query(
      'SELECT class_id, section_id FROM students WHERE parent_email = $1 LIMIT 1',
      [req.user.email]
    );

    if (studentQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const { class_id, section_id } = studentQuery.rows[0];

    const result = await pool.query(
      `SELECT m.*, s.name as subject_name, t.name as teacher_name
       FROM materials m
       JOIN subjects s ON m.subject_id = s.id
       JOIN teachers t ON m.teacher_id = t.id
       WHERE m.class_id = $1 AND (m.section_id = $2 OR m.section_id IS NULL)
       ORDER BY m.created_at DESC`,
      [class_id, section_id]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching study materials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Submit leave request (STUDENT_PARENT)
const submitLeaveRequest = async (req, res) => {
  try {
    const { start_date, end_date, reason } = req.body;

    if (!start_date || !end_date || !reason) {
      return res.status(400).json({ error: 'start_date, end_date, and reason are required' });
    }

    const studentQuery = await pool.query(
      'SELECT id FROM students WHERE parent_email = $1 LIMIT 1',
      [req.user.email]
    );

    if (studentQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const studentId = studentQuery.rows[0].id;

    const result = await pool.query(
      `INSERT INTO leave_requests (student_id, start_date, end_date, reason, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [studentId, start_date, end_date, reason, 'PENDING']
    );

    res.json({ message: 'Leave request submitted successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error submitting leave request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get leave requests (STUDENT_PARENT)
const getLeaveRequests = async (req, res) => {
  try {
    const studentQuery = await pool.query(
      'SELECT id FROM students WHERE parent_email = $1 LIMIT 1',
      [req.user.email]
    );

    if (studentQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const studentId = studentQuery.rows[0].id;

    const result = await pool.query(
      `SELECT lr.*, s.name as student_name
       FROM leave_requests lr
       JOIN students s ON lr.student_id = s.id
       WHERE lr.student_id = $1
       ORDER BY lr.created_at DESC`,
      [studentId]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get fees status (STUDENT_PARENT)
const getFeesStatus = async (req, res) => {
  try {
    const studentQuery = await pool.query(
      'SELECT id FROM students WHERE parent_email = $1 LIMIT 1',
      [req.user.email]
    );

    if (studentQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const studentId = studentQuery.rows[0].id;

    const result = await pool.query(
      `SELECT f.*, s.name as student_name
       FROM fees f
       JOIN students s ON f.student_id = s.id
       WHERE f.student_id = $1
       ORDER BY f.due_date DESC`,
      [studentId]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching fees status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
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
};

