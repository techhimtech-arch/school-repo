const pool = require("../db");

// Mark attendance (CLASS_TEACHER only)
const markAttendance = async (req, res) => {
  try {
    const { student_id, date, status, remarks } = req.body;
    const { class_id, section_id } = req.body; // From teacher's class/section

    if (!student_id || !date || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get teacher's class and section from teachers table
    const teacherQuery = await pool.query(
      "SELECT class_id, section_id FROM teachers WHERE email = $1",
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const teacher = teacherQuery.rows[0];
    const classId = class_id || teacher.class_id;
    const sectionId = section_id || teacher.section_id;

    if (!classId || !sectionId) {
      return res.status(400).json({ error: "Teacher must be assigned to a class and section" });
    }

    // Get teacher ID
    const teacherIdQuery = await pool.query(
      "SELECT id FROM teachers WHERE email = $1",
      [req.user.email]
    );
    const teacherId = teacherIdQuery.rows[0].id;

    // Insert or update attendance
    const result = await pool.query(
      `INSERT INTO attendance (student_id, class_id, section_id, date, status, marked_by, remarks)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (student_id, date) 
       DO UPDATE SET status = $5, remarks = $7, marked_by = $6
       RETURNING *`,
      [student_id, classId, sectionId, date, status, teacherId, remarks || null]
    );

    res.json({ message: "Attendance marked successfully", data: result.rows[0] });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get attendance for a student (STUDENT_PARENT)
const getStudentAttendance = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { start_date, end_date } = req.query;

    let query = `
      SELECT a.*, s.name as student_name, s.roll_number
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE a.student_id = $1
    `;
    const params = [student_id];

    if (start_date && end_date) {
      query += ` AND a.date BETWEEN $2 AND $3`;
      params.push(start_date, end_date);
    } else {
      // Default to today if no dates provided
      query += ` AND a.date = CURRENT_DATE`;
    }

    query += ` ORDER BY a.date DESC`;

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get attendance for a class (CLASS_TEACHER, SUPER_ADMIN)
const getClassAttendance = async (req, res) => {
  try {
    const { class_id, section_id, date } = req.query;

    let query = `
      SELECT a.*, s.name as student_name, s.roll_number
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (class_id) {
      query += ` AND a.class_id = $${params.length + 1}`;
      params.push(class_id);
    }

    if (section_id) {
      query += ` AND a.section_id = $${params.length + 1}`;
      params.push(section_id);
    }

    if (date) {
      query += ` AND a.date = $${params.length + 1}`;
      params.push(date);
    } else {
      query += ` AND a.date = CURRENT_DATE`;
    }

    query += ` ORDER BY s.roll_number`;

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching class attendance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  markAttendance,
  getStudentAttendance,
  getClassAttendance,
};


