const pool = require('../db');

// Get class students (CLASS_TEACHER)
const getClassStudents = async (req, res) => {
  try {
    // Get teacher's class and section
    const teacherQuery = await pool.query(
      'SELECT class_id, section_id FROM teachers WHERE email = $1',
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const { class_id, section_id } = teacherQuery.rows[0];

    const result = await pool.query(
      `SELECT s.*, c.name as class_name, sec.name as section_name
       FROM students s
       JOIN classes c ON s.class_id = c.id
       JOIN sections sec ON s.section_id = sec.id
       WHERE s.class_id = $1 AND s.section_id = $2
       ORDER BY s.roll_number`,
      [class_id, section_id]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching class students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark attendance (CLASS_TEACHER)
const markAttendance = async (req, res) => {
  try {
    const { date, attendance_records } = req.body;

    if (!date || !attendance_records || !Array.isArray(attendance_records)) {
      return res.status(400).json({ error: 'Date and attendance_records array are required' });
    }

    // Get teacher's class and section
    const teacherQuery = await pool.query(
      'SELECT class_id, section_id FROM teachers WHERE email = $1',
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const { class_id, section_id } = teacherQuery.rows[0];

    // Delete existing attendance for this date
    await pool.query(
      `DELETE FROM attendance 
       WHERE date = $1 AND class_id = $2 AND section_id = $3`,
      [date, class_id, section_id]
    );

    // Insert new attendance records
    const insertPromises = attendance_records.map(record => {
      return pool.query(
        `INSERT INTO attendance (student_id, class_id, section_id, date, status, remarks)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [record.student_id, class_id, section_id, date, record.status, record.remarks || null]
      );
    });

    const results = await Promise.all(insertPromises);

    res.json({ 
      message: 'Attendance marked successfully', 
      data: results.map(r => r.rows[0])
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get attendance (CLASS_TEACHER)
const getAttendance = async (req, res) => {
  try {
    const { date, student_id } = req.query;

    // Get teacher's class and section
    const teacherQuery = await pool.query(
      'SELECT class_id, section_id FROM teachers WHERE email = $1',
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const { class_id, section_id } = teacherQuery.rows[0];

    let query = `
      SELECT a.*, s.name as student_name, s.roll_number
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE a.class_id = $1 AND a.section_id = $2
    `;
    const params = [class_id, section_id];

    if (date) {
      query += ` AND a.date = $${params.length + 1}`;
      params.push(date);
    }

    if (student_id) {
      query += ` AND a.student_id = $${params.length + 1}`;
      params.push(student_id);
    }

    query += ' ORDER BY a.date DESC, s.roll_number';

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Approve leave request (CLASS_TEACHER)
const approveLeave = async (req, res) => {
  try {
    const { leave_id } = req.params;
    const { status, remarks } = req.body;

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Status must be APPROVED or REJECTED' });
    }

    // Get teacher's class and section
    const teacherQuery = await pool.query(
      'SELECT class_id, section_id FROM teachers WHERE email = $1',
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const { class_id, section_id } = teacherQuery.rows[0];

    // Verify leave request belongs to teacher's class
    const leaveQuery = await pool.query(
      `SELECT lr.*, s.class_id, s.section_id
       FROM leave_requests lr
       JOIN students s ON lr.student_id = s.id
       WHERE lr.id = $1`,
      [leave_id]
    );

    if (leaveQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    if (leaveQuery.rows[0].class_id !== class_id || leaveQuery.rows[0].section_id !== section_id) {
      return res.status(403).json({ error: 'You can only approve leaves for your class' });
    }

    const result = await pool.query(
      `UPDATE leave_requests 
       SET status = $1, teacher_remarks = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, remarks || null, leave_id]
    );

    res.json({ message: 'Leave request updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error approving leave:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get leave requests (CLASS_TEACHER)
const getLeaveRequests = async (req, res) => {
  try {
    // Get teacher's class and section
    const teacherQuery = await pool.query(
      'SELECT class_id, section_id FROM teachers WHERE email = $1',
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const { class_id, section_id } = teacherQuery.rows[0];

    const result = await pool.query(
      `SELECT lr.*, s.name as student_name, s.roll_number
       FROM leave_requests lr
       JOIN students s ON lr.student_id = s.id
       WHERE s.class_id = $1 AND s.section_id = $2
       ORDER BY lr.created_at DESC`,
      [class_id, section_id]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// View homework (CLASS_TEACHER)
const getHomework = async (req, res) => {
  try {
    // Get teacher's class and section
    const teacherQuery = await pool.query(
      'SELECT class_id, section_id FROM teachers WHERE email = $1',
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const { class_id, section_id } = teacherQuery.rows[0];

    const result = await pool.query(
      `SELECT h.*, s.name as subject_name, t.name as teacher_name
       FROM homework h
       JOIN subjects s ON h.subject_id = s.id
       JOIN teachers t ON h.teacher_id = t.id
       WHERE h.class_id = $1 AND (h.section_id = $2 OR h.section_id IS NULL)
       ORDER BY h.due_date DESC`,
      [class_id, section_id]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching homework:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// View materials (CLASS_TEACHER)
const getMaterials = async (req, res) => {
  try {
    // Get teacher's class and section
    const teacherQuery = await pool.query(
      'SELECT class_id, section_id FROM teachers WHERE email = $1',
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const { class_id, section_id } = teacherQuery.rows[0];

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
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update fee status (CLASS_TEACHER)
const updateFeeStatus = async (req, res) => {
  try {
    const { fee_id } = req.params;
    const { status, amount_paid } = req.body;

    if (!status || !['PAID', 'PENDING', 'OVERDUE'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get teacher's class and section
    const teacherQuery = await pool.query(
      'SELECT class_id, section_id FROM teachers WHERE email = $1',
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const { class_id, section_id } = teacherQuery.rows[0];

    // Verify fee belongs to teacher's class
    const feeQuery = await pool.query(
      `SELECT f.*, s.class_id, s.section_id
       FROM fees f
       JOIN students s ON f.student_id = s.id
       WHERE f.id = $1`,
      [fee_id]
    );

    if (feeQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Fee record not found' });
    }

    if (feeQuery.rows[0].class_id !== class_id || feeQuery.rows[0].section_id !== section_id) {
      return res.status(403).json({ error: 'You can only update fees for your class' });
    }

    const updates = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
    const values = [status];
    let paramCount = 2;

    if (amount_paid !== undefined) {
      updates.push(`amount_paid = $${paramCount++}`);
      values.push(amount_paid);
    }

    values.push(fee_id);

    const result = await pool.query(
      `UPDATE fees SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    res.json({ message: 'Fee status updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating fee status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get fees (CLASS_TEACHER)
const getFees = async (req, res) => {
  try {
    // Get teacher's class and section
    const teacherQuery = await pool.query(
      'SELECT class_id, section_id FROM teachers WHERE email = $1',
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const { class_id, section_id } = teacherQuery.rows[0];

    const result = await pool.query(
      `SELECT f.*, s.name as student_name, s.roll_number
       FROM fees f
       JOIN students s ON f.student_id = s.id
       WHERE s.class_id = $1 AND s.section_id = $2
       ORDER BY f.due_date DESC`,
      [class_id, section_id]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching fees:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create class announcement (CLASS_TEACHER)
const createClassAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Get teacher's class and section
    const teacherQuery = await pool.query(
      'SELECT class_id, section_id FROM teachers WHERE email = $1',
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const { class_id, section_id } = teacherQuery.rows[0];

    const result = await pool.query(
      `INSERT INTO announcements (title, content, created_by, target_audience, class_id, section_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, content, req.user.email, 'CLASS', class_id, section_id]
    );

    res.json({ message: 'Announcement created successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
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
};

