const pool = require("../db");

// Request leave (STUDENT_PARENT only)
const requestLeave = async (req, res) => {
  try {
    const { student_id, start_date, end_date, reason } = req.body;

    if (!student_id || !start_date || !end_date || !reason) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Verify student exists
    const studentQuery = await pool.query(
      "SELECT * FROM students WHERE id = $1",
      [student_id]
    );

    if (studentQuery.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const result = await pool.query(
      `INSERT INTO leave_requests (student_id, start_date, end_date, reason, status)
       VALUES ($1, $2, $3, $4, 'PENDING')
       RETURNING *`,
      [student_id, start_date, end_date, reason]
    );

    res.json({ message: "Leave request submitted successfully", data: result.rows[0] });
  } catch (error) {
    console.error("Error requesting leave:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Approve/reject leave (CLASS_TEACHER only)
const approveLeave = async (req, res) => {
  try {
    const { leave_id, status, remarks } = req.body;

    if (!leave_id || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status. Must be APPROVED or REJECTED" });
    }

    // Get teacher ID
    const teacherQuery = await pool.query(
      "SELECT id, class_id, section_id FROM teachers WHERE email = $1",
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const teacher = teacherQuery.rows[0];

    // Verify leave request belongs to teacher's class
    const leaveQuery = await pool.query(
      `SELECT lr.*, s.class_id, s.section_id
       FROM leave_requests lr
       JOIN students s ON lr.student_id = s.id
       WHERE lr.id = $1`,
      [leave_id]
    );

    if (leaveQuery.rows.length === 0) {
      return res.status(404).json({ error: "Leave request not found" });
    }

    const leave = leaveQuery.rows[0];

    if (leave.class_id !== teacher.class_id || leave.section_id !== teacher.section_id) {
      return res.status(403).json({ error: "You can only approve leaves for your class students" });
    }

    const result = await pool.query(
      `UPDATE leave_requests
       SET status = $1, approved_by = $2, remarks = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [status, teacher.id, remarks || null, leave_id]
    );

    res.json({ message: `Leave request ${status.toLowerCase()} successfully`, data: result.rows[0] });
  } catch (error) {
    console.error("Error approving leave:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get leave requests for a student (STUDENT_PARENT)
const getStudentLeaves = async (req, res) => {
  try {
    const { student_id } = req.params;

    const result = await pool.query(
      `SELECT lr.*, t.name as approved_by_name
       FROM leave_requests lr
       LEFT JOIN teachers t ON lr.approved_by = t.id
       WHERE lr.student_id = $1
       ORDER BY lr.created_at DESC`,
      [student_id]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get leave requests for a class (CLASS_TEACHER)
const getClassLeaves = async (req, res) => {
  try {
    // Get teacher's class and section
    const teacherQuery = await pool.query(
      "SELECT class_id, section_id FROM teachers WHERE email = $1",
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const { class_id, section_id } = teacherQuery.rows[0];

    const result = await pool.query(
      `SELECT lr.*, s.name as student_name, s.roll_number, t.name as approved_by_name
       FROM leave_requests lr
       JOIN students s ON lr.student_id = s.id
       LEFT JOIN teachers t ON lr.approved_by = t.id
       WHERE s.class_id = $1 AND s.section_id = $2
       ORDER BY lr.created_at DESC`,
      [class_id, section_id]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching class leave requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  requestLeave,
  approveLeave,
  getStudentLeaves,
  getClassLeaves,
};


