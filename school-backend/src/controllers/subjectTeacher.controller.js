const pool = require("../db");

// Get teacher's assigned subjects and classes (SUBJECT_TEACHER)
const getMyAssignments = async (req, res) => {
  try {
    // Get teacher ID
    const teacherQuery = await pool.query(
      "SELECT id FROM teachers WHERE email = $1",
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const teacherId = teacherQuery.rows[0].id;

    const result = await pool.query(
      `SELECT tsm.*, s.name as subject_name, s.code as subject_code,
              c.name as class_name, c.grade_level,
              sec.name as section_name
       FROM teacher_subject_mapping tsm
       JOIN subjects s ON tsm.subject_id = s.id
       JOIN classes c ON tsm.class_id = c.id
       LEFT JOIN sections sec ON tsm.section_id = sec.id
       WHERE tsm.teacher_id = $1
       ORDER BY c.grade_level, s.name`,
      [teacherId]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching teacher assignments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get students for a specific class-section (SUBJECT_TEACHER)
const getClassSectionStudents = async (req, res) => {
  try {
    const { class_id, section_id } = req.query;

    if (!class_id || !section_id) {
      return res.status(400).json({ error: "class_id and section_id are required" });
    }

    // Verify teacher has access to this class
    const teacherQuery = await pool.query(
      "SELECT id FROM teachers WHERE email = $1",
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const teacherId = teacherQuery.rows[0].id;

    const mappingQuery = await pool.query(
      "SELECT * FROM teacher_subject_mapping WHERE teacher_id = $1 AND class_id = $2",
      [teacherId, class_id]
    );

    if (mappingQuery.rows.length === 0) {
      return res.status(403).json({ error: "You don't have access to this class" });
    }

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
    console.error("Error fetching class-section students:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getMyAssignments,
  getClassSectionStudents,
};


