const pool = require("../db");

// Get class students (CLASS_TEACHER)
const getClassStudents = async (req, res) => {
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
    console.error("Error fetching class students:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getClassStudents,
};


