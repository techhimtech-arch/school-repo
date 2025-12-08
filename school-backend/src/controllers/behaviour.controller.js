const pool = require("../db");

// Add behaviour remark (SUBJECT_TEACHER only)
const addBehaviourRemark = async (req, res) => {
  try {
    const { student_id, subject_id, remark, behaviour_type } = req.body;

    if (!student_id || !remark) {
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

    // If subject_id provided, verify teacher has access
    if (subject_id) {
      const mappingQuery = await pool.query(
        `SELECT tsm.* FROM teacher_subject_mapping tsm
         JOIN students s ON tsm.class_id = s.class_id
         WHERE tsm.teacher_id = $1 AND tsm.subject_id = $2 AND s.id = $3`,
        [teacherId, subject_id, student_id]
      );

      if (mappingQuery.rows.length === 0) {
        return res.status(403).json({ error: "You don't have access to this subject/student" });
      }
    }

    const result = await pool.query(
      `INSERT INTO behaviour (student_id, subject_id, teacher_id, remark, behaviour_type, date)
       VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
       RETURNING *`,
      [student_id, subject_id || null, teacherId, remark, behaviour_type || "NEUTRAL"]
    );

    res.json({ message: "Behaviour remark added successfully", data: result.rows[0] });
  } catch (error) {
    console.error("Error adding behaviour remark:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get behaviour remarks for a student (STUDENT_PARENT)
const getStudentBehaviour = async (req, res) => {
  try {
    const { student_id } = req.params;

    const result = await pool.query(
      `SELECT b.*, s.name as subject_name, t.name as teacher_name
       FROM behaviour b
       LEFT JOIN subjects s ON b.subject_id = s.id
       JOIN teachers t ON b.teacher_id = t.id
       WHERE b.student_id = $1
       ORDER BY b.date DESC, b.created_at DESC`,
      [student_id]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching behaviour remarks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addBehaviourRemark,
  getStudentBehaviour,
};


