const pool = require("../db");

// Create announcement (SUPER_ADMIN, CLASS_TEACHER)
const createAnnouncement = async (req, res) => {
  try {
    const { title, message, announcement_type, class_id, section_id } = req.body;

    if (!title || !message || !announcement_type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (announcement_type === "CLASS_SPECIFIC" && !class_id) {
      return res.status(400).json({ error: "class_id is required for CLASS_SPECIFIC announcements" });
    }

    let teacherId = null;
    let finalClassId = class_id;
    let finalSectionId = section_id;

    // If CLASS_TEACHER, get their class and section
    if (req.user.role === "CLASS_TEACHER") {
      const teacherQuery = await pool.query(
        "SELECT id, class_id, section_id FROM teachers WHERE email = $1",
        [req.user.email]
      );

      if (teacherQuery.rows.length === 0) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      const teacher = teacherQuery.rows[0];
      teacherId = teacher.id;
      finalClassId = teacher.class_id;
      finalSectionId = teacher.section_id;

      if (announcement_type !== "CLASS_SPECIFIC") {
        return res.status(403).json({ error: "CLASS_TEACHER can only create class-specific announcements" });
      }
    } else if (req.user.role === "SUPER_ADMIN") {
      // SUPER_ADMIN can create school-wide announcements
      if (announcement_type === "SCHOOL_WIDE") {
        finalClassId = null;
        finalSectionId = null;
      }
    }

    const result = await pool.query(
      `INSERT INTO announcements (title, message, announcement_type, class_id, section_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, message, announcement_type, finalClassId, finalSectionId, teacherId]
    );

    res.json({ message: "Announcement created successfully", data: result.rows[0] });
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get announcements for a student (STUDENT_PARENT)
const getStudentAnnouncements = async (req, res) => {
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
      `SELECT a.*, t.name as created_by_name
       FROM announcements a
       LEFT JOIN teachers t ON a.created_by = t.id
       WHERE (a.announcement_type = 'SCHOOL_WIDE')
          OR (a.announcement_type = 'CLASS_SPECIFIC' AND a.class_id = $1 AND (a.section_id = $2 OR a.section_id IS NULL))
       ORDER BY a.created_at DESC`,
      [class_id, section_id]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get announcements for a class (CLASS_TEACHER, SUPER_ADMIN)
const getClassAnnouncements = async (req, res) => {
  try {
    const { class_id, section_id } = req.query;

    let query = `
      SELECT a.*, t.name as created_by_name
      FROM announcements a
      LEFT JOIN teachers t ON a.created_by = t.id
      WHERE 1=1
    `;
    const params = [];

    if (class_id) {
      query += ` AND (a.announcement_type = 'SCHOOL_WIDE' OR (a.class_id = $${params.length + 1}))`;
      params.push(class_id);
    } else {
      query += ` AND a.announcement_type = 'SCHOOL_WIDE'`;
    }

    if (section_id) {
      query += ` AND (a.section_id = $${params.length + 1} OR a.section_id IS NULL)`;
      params.push(section_id);
    }

    query += ` ORDER BY a.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching class announcements:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createAnnouncement,
  getStudentAnnouncements,
  getClassAnnouncements,
};


