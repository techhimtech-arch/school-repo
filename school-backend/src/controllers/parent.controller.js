const pool = require("../db");

// Get student by parent email (STUDENT_PARENT)
const getMyStudent = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, c.name as class_name, sec.name as section_name
       FROM students s
       JOIN classes c ON s.class_id = c.id
       JOIN sections sec ON s.section_id = sec.id
       WHERE s.parent_email = $1
       LIMIT 1`,
      [req.user.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found for this parent" });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getMyStudent,
};


