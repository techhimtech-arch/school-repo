const pool = require("../db");

// Upload study material (SUBJECT_TEACHER only)
const uploadMaterial = async (req, res) => {
  try {
    const { subject_id, class_id, section_id, title, description, material_type, file_url, video_link } = req.body;

    if (!subject_id || !class_id || !title || !material_type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (material_type === "VIDEO_LINK" && !video_link) {
      return res.status(400).json({ error: "Video link is required for VIDEO_LINK type" });
    }

    if (material_type !== "VIDEO_LINK" && !file_url) {
      return res.status(400).json({ error: "File URL is required for non-video materials" });
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
      `INSERT INTO materials (subject_id, class_id, section_id, teacher_id, title, description, material_type, file_url, video_link)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [subject_id, class_id, section_id || null, teacherId, title, description || null, material_type, file_url || null, video_link || null]
    );

    res.json({ message: "Material uploaded successfully", data: result.rows[0] });
  } catch (error) {
    console.error("Error uploading material:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get materials for a student (STUDENT_PARENT)
const getStudentMaterials = async (req, res) => {
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
    console.error("Error fetching materials:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get materials for a class (CLASS_TEACHER, SUPER_ADMIN)
const getClassMaterials = async (req, res) => {
  try {
    const { class_id, section_id, subject_id } = req.query;

    let query = `
      SELECT m.*, s.name as subject_name, t.name as teacher_name
      FROM materials m
      JOIN subjects s ON m.subject_id = s.id
      JOIN teachers t ON m.teacher_id = t.id
      WHERE m.class_id = $1
    `;
    const params = [class_id];

    if (section_id) {
      query += ` AND (m.section_id = $${params.length + 1} OR m.section_id IS NULL)`;
      params.push(section_id);
    }

    if (subject_id) {
      query += ` AND m.subject_id = $${params.length + 1}`;
      params.push(subject_id);
    }

    query += ` ORDER BY m.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching class materials:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  uploadMaterial,
  getStudentMaterials,
  getClassMaterials,
};


