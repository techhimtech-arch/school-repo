const pool = require("../db");

// Upload homework (SUBJECT_TEACHER only)
const uploadHomework = async (req, res) => {
  try {
    const { subject_id, class_id, section_id, title, description, due_date, attachments } = req.body;

    if (!subject_id || !class_id || !title || !due_date) {
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
      `INSERT INTO homework (subject_id, class_id, section_id, teacher_id, title, description, due_date, attachments)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [subject_id, class_id, section_id || null, teacherId, title, description || null, due_date, attachments || null]
    );

    res.json({ message: "Homework uploaded successfully", data: result.rows[0] });
  } catch (error) {
    console.error("Error uploading homework:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get homework for a student (STUDENT_PARENT)
const getStudentHomework = async (req, res) => {
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

    // Get today's homework
    const result = await pool.query(
      `SELECT h.*, s.name as subject_name, t.name as teacher_name
       FROM homework h
       JOIN subjects s ON h.subject_id = s.id
       JOIN teachers t ON h.teacher_id = t.id
       WHERE h.class_id = $1 AND (h.section_id = $2 OR h.section_id IS NULL)
       AND h.due_date >= CURRENT_DATE
       ORDER BY h.due_date ASC`,
      [class_id, section_id]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching homework:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get homework for a class (CLASS_TEACHER)
const getClassHomework = async (req, res) => {
  try {
    const { class_id, section_id } = req.query;

    let query = `
      SELECT h.*, s.name as subject_name, t.name as teacher_name
      FROM homework h
      JOIN subjects s ON h.subject_id = s.id
      JOIN teachers t ON h.teacher_id = t.id
      WHERE h.class_id = $1
    `;
    const params = [class_id];

    if (section_id) {
      query += ` AND (h.section_id = $2 OR h.section_id IS NULL)`;
      params.push(section_id);
    }

    query += ` ORDER BY h.due_date DESC`;

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching class homework:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  uploadHomework,
  getStudentHomework,
  getClassHomework,
};

