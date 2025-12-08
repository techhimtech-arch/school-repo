const pool = require("../db");

// Add daily topic (SUBJECT_TEACHER only)
const addDailyTopic = async (req, res) => {
  try {
    const { subject_id, class_id, section_id, topic, date } = req.body;

    if (!subject_id || !class_id || !topic) {
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

    const topicDate = date || new Date().toISOString().split("T")[0];

    // Insert or update (if already exists for this date)
    const result = await pool.query(
      `INSERT INTO daily_topics (subject_id, class_id, section_id, teacher_id, topic, date)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (subject_id, class_id, section_id, date)
       DO UPDATE SET topic = $5, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [subject_id, class_id, section_id || null, teacherId, topic, topicDate]
    );

    res.json({ message: "Daily topic added successfully", data: result.rows[0] });
  } catch (error) {
    console.error("Error adding daily topic:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get daily topics for a student (STUDENT_PARENT)
const getStudentTopics = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { date } = req.query;

    // Get student's class and section
    const studentQuery = await pool.query(
      "SELECT class_id, section_id FROM students WHERE id = $1",
      [student_id]
    );

    if (studentQuery.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const { class_id, section_id } = studentQuery.rows[0];
    const topicDate = date || new Date().toISOString().split("T")[0];

    const result = await pool.query(
      `SELECT dt.*, s.name as subject_name, t.name as teacher_name
       FROM daily_topics dt
       JOIN subjects s ON dt.subject_id = s.id
       JOIN teachers t ON dt.teacher_id = t.id
       WHERE dt.class_id = $1 AND (dt.section_id = $2 OR dt.section_id IS NULL)
       AND dt.date = $3
       ORDER BY s.name`,
      [class_id, section_id, topicDate]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching daily topics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get daily topics for a class (CLASS_TEACHER, SUPER_ADMIN)
const getClassTopics = async (req, res) => {
  try {
    const { class_id, section_id, date, subject_id } = req.query;

    if (!class_id) {
      return res.status(400).json({ error: "class_id is required" });
    }

    const topicDate = date || new Date().toISOString().split("T")[0];

    let query = `
      SELECT dt.*, s.name as subject_name, t.name as teacher_name
      FROM daily_topics dt
      JOIN subjects s ON dt.subject_id = s.id
      JOIN teachers t ON dt.teacher_id = t.id
      WHERE dt.class_id = $1 AND dt.date = $2
    `;
    const params = [class_id, topicDate];

    if (section_id) {
      query += ` AND (dt.section_id = $${params.length + 1} OR dt.section_id IS NULL)`;
      params.push(section_id);
    }

    if (subject_id) {
      query += ` AND dt.subject_id = $${params.length + 1}`;
      params.push(subject_id);
    }

    query += ` ORDER BY s.name`;

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching class topics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addDailyTopic,
  getStudentTopics,
  getClassTopics,
};


