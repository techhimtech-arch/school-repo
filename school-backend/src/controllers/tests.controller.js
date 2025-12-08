const pool = require("../db");

// Create test (SUBJECT_TEACHER only)
const createTest = async (req, res) => {
  try {
    const { subject_id, class_id, section_id, title, test_type, test_date, total_marks } = req.body;

    if (!subject_id || !class_id || !title || !test_type || !test_date || !total_marks) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get teacher ID
    const teacherQuery = await pool.query(
      "SELECT id FROM teachers WHERE email = $1",
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const teacherId = teacherQuery.rows[0].id;

    // Verify teacher has access to this subject
    const mappingQuery = await pool.query(
      `SELECT * FROM teacher_subject_mapping 
       WHERE teacher_id = $1 AND subject_id = $2 AND class_id = $3`,
      [teacherId, subject_id, class_id]
    );

    if (mappingQuery.rows.length === 0) {
      return res.status(403).json({ error: "You don't have access to this subject" });
    }

    const result = await pool.query(
      `INSERT INTO tests (subject_id, class_id, section_id, teacher_id, title, test_type, test_date, total_marks)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [subject_id, class_id, section_id || null, teacherId, title, test_type, test_date, total_marks]
    );

    res.json({ message: "Test created successfully", data: result.rows[0] });
  } catch (error) {
    console.error("Error creating test:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get tests for a student (STUDENT_PARENT)
const getStudentTests = async (req, res) => {
  try {
    const { student_id } = req.params;

    // Get student's class and section
    const studentQuery = await pool.query(
      "SELECT class_id, section_id FROM students WHERE id = $1",
      [student_id]
    );

    if (studentQuery.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const { class_id, section_id } = studentQuery.rows[0];

    const result = await pool.query(
      `SELECT t.*, s.name as subject_name, te.name as teacher_name,
              m.marks_obtained, m.remarks as marks_remarks
       FROM tests t
       JOIN subjects s ON t.subject_id = s.id
       JOIN teachers te ON t.teacher_id = te.id
       LEFT JOIN marks m ON t.id = m.test_id AND m.student_id = $1
       WHERE t.class_id = $2 AND (t.section_id = $3 OR t.section_id IS NULL)
       ORDER BY t.test_date DESC`,
      [student_id, class_id, section_id]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get tests for a class (CLASS_TEACHER, SUPER_ADMIN)
const getClassTests = async (req, res) => {
  try {
    const { class_id, section_id, subject_id } = req.query;

    let query = `
      SELECT t.*, s.name as subject_name, te.name as teacher_name
      FROM tests t
      JOIN subjects s ON t.subject_id = s.id
      JOIN teachers te ON t.teacher_id = te.id
      WHERE t.class_id = $1
    `;
    const params = [class_id];

    if (section_id) {
      query += ` AND (t.section_id = $${params.length + 1} OR t.section_id IS NULL)`;
      params.push(section_id);
    }

    if (subject_id) {
      query += ` AND t.subject_id = $${params.length + 1}`;
      params.push(subject_id);
    }

    query += ` ORDER BY t.test_date DESC`;

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching class tests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createTest,
  getStudentTests,
  getClassTests,
};


