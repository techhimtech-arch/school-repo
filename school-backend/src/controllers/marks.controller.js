const pool = require("../db");

// Add marks (SUBJECT_TEACHER only)
const addMarks = async (req, res) => {
  try {
    const { test_id, student_id, marks_obtained, remarks } = req.body;

    if (!test_id || !student_id || marks_obtained === undefined) {
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

    // Verify test belongs to this teacher
    const testQuery = await pool.query(
      "SELECT * FROM tests WHERE id = $1 AND teacher_id = $2",
      [test_id, teacherId]
    );

    if (testQuery.rows.length === 0) {
      return res.status(403).json({ error: "You don't have access to this test" });
    }

    // Insert or update marks
    const result = await pool.query(
      `INSERT INTO marks (test_id, student_id, marks_obtained, remarks)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (test_id, student_id)
       DO UPDATE SET marks_obtained = $3, remarks = $4, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [test_id, student_id, marks_obtained, remarks || null]
    );

    res.json({ message: "Marks added successfully", data: result.rows[0] });
  } catch (error) {
    console.error("Error adding marks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Bulk add marks (SUBJECT_TEACHER only)
const bulkAddMarks = async (req, res) => {
  try {
    const { test_id, marks_data } = req.body; // marks_data: [{student_id, marks_obtained, remarks}]

    if (!test_id || !marks_data || !Array.isArray(marks_data)) {
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

    // Verify test belongs to this teacher
    const testQuery = await pool.query(
      "SELECT * FROM tests WHERE id = $1 AND teacher_id = $2",
      [test_id, teacherId]
    );

    if (testQuery.rows.length === 0) {
      return res.status(403).json({ error: "You don't have access to this test" });
    }

    // Insert/update marks in transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const mark of marks_data) {
        await client.query(
          `INSERT INTO marks (test_id, student_id, marks_obtained, remarks)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (test_id, student_id)
           DO UPDATE SET marks_obtained = $3, remarks = $4, updated_at = CURRENT_TIMESTAMP`,
          [test_id, mark.student_id, mark.marks_obtained, mark.remarks || null]
        );
      }

      await client.query("COMMIT");
      res.json({ message: "Marks added successfully", count: marks_data.length });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error bulk adding marks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get marks for a student (STUDENT_PARENT)
const getStudentMarks = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { subject_id } = req.query;

    let query = `
      SELECT m.*, t.title as test_title, t.test_type, t.test_date, t.total_marks,
             s.name as subject_name, te.name as teacher_name
      FROM marks m
      JOIN tests t ON m.test_id = t.id
      JOIN subjects s ON t.subject_id = s.id
      JOIN teachers te ON t.teacher_id = te.id
      WHERE m.student_id = $1
    `;
    const params = [student_id];

    if (subject_id) {
      query += ` AND t.subject_id = $2`;
      params.push(subject_id);
    }

    query += ` ORDER BY t.test_date DESC`;

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching marks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addMarks,
  bulkAddMarks,
  getStudentMarks,
};


