const pool = require("../db");

// Get all classes (SUPER_ADMIN)
const getAllClasses = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM classes ORDER BY grade_level, name"
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all sections (SUPER_ADMIN)
const getAllSections = async (req, res) => {
  try {
    const { class_id } = req.query;

    let query = `
      SELECT s.*, c.name as class_name, c.grade_level
      FROM sections s
      JOIN classes c ON s.class_id = c.id
    `;
    const params = [];

    if (class_id) {
      query += ` WHERE s.class_id = $1`;
      params.push(class_id);
    }

    query += ` ORDER BY c.grade_level, s.name`;

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching sections:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all subjects (SUPER_ADMIN)
const getAllSubjects = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM subjects ORDER BY name"
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all teachers (SUPER_ADMIN)
const getAllTeachers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, c.name as class_name, s.name as section_name
       FROM teachers t
       LEFT JOIN classes c ON t.class_id = c.id
       LEFT JOIN sections s ON t.section_id = s.id
       ORDER BY t.name`
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create teacher (SUPER_ADMIN)
const createTeacher = async (req, res) => {
  try {
    const { name, email, phone, employee_id, teacher_type, class_id, section_id } = req.body;

    if (!name || !email || !teacher_type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (teacher_type === "CLASS_TEACHER" && (!class_id || !section_id)) {
      return res.status(400).json({ error: "class_id and section_id are required for CLASS_TEACHER" });
    }

    const result = await pool.query(
      `INSERT INTO teachers (name, email, phone, employee_id, teacher_type, class_id, section_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, email, phone || null, employee_id || null, teacher_type, class_id || null, section_id || null]
    );

    res.json({ message: "Teacher created successfully", data: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "Email or employee_id already exists" });
    }
    console.error("Error creating teacher:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update teacher (SUPER_ADMIN)
const updateTeacher = async (req, res) => {
  try {
    const { teacher_id } = req.params;
    const { name, email, phone, employee_id, teacher_type, class_id, section_id } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (email) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (employee_id !== undefined) {
      updates.push(`employee_id = $${paramCount++}`);
      values.push(employee_id);
    }
    if (teacher_type) {
      updates.push(`teacher_type = $${paramCount++}`);
      values.push(teacher_type);
    }
    if (class_id !== undefined) {
      updates.push(`class_id = $${paramCount++}`);
      values.push(class_id);
    }
    if (section_id !== undefined) {
      updates.push(`section_id = $${paramCount++}`);
      values.push(section_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(teacher_id);

    const result = await pool.query(
      `UPDATE teachers SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    res.json({ message: "Teacher updated successfully", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get teacher subject mappings (SUPER_ADMIN)
const getTeacherMappings = async (req, res) => {
  try {
    const { teacher_id } = req.query;

    let query = `
      SELECT tsm.*, t.name as teacher_name, s.name as subject_name,
             c.name as class_name, sec.name as section_name
      FROM teacher_subject_mapping tsm
      JOIN teachers t ON tsm.teacher_id = t.id
      JOIN subjects s ON tsm.subject_id = s.id
      JOIN classes c ON tsm.class_id = c.id
      LEFT JOIN sections sec ON tsm.section_id = sec.id
    `;
    const params = [];

    if (teacher_id) {
      query += ` WHERE tsm.teacher_id = $1`;
      params.push(teacher_id);
    }

    query += ` ORDER BY t.name, c.grade_level, s.name`;

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching teacher mappings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create teacher subject mapping (SUPER_ADMIN)
const createTeacherMapping = async (req, res) => {
  try {
    const { teacher_id, subject_id, class_id, section_id } = req.body;

    if (!teacher_id || !subject_id || !class_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await pool.query(
      `INSERT INTO teacher_subject_mapping (teacher_id, subject_id, class_id, section_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [teacher_id, subject_id, class_id, section_id || null]
    );

    res.json({ message: "Teacher mapping created successfully", data: result.rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ error: "Mapping already exists" });
    }
    console.error("Error creating teacher mapping:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete teacher subject mapping (SUPER_ADMIN)
const deleteTeacherMapping = async (req, res) => {
  try {
    const { mapping_id } = req.params;

    const result = await pool.query(
      "DELETE FROM teacher_subject_mapping WHERE id = $1 RETURNING *",
      [mapping_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Mapping not found" });
    }

    res.json({ message: "Teacher mapping deleted successfully" });
  } catch (error) {
    console.error("Error deleting teacher mapping:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all students (SUPER_ADMIN - read only)
const getAllStudents = async (req, res) => {
  try {
    const { class_id, section_id } = req.query;

    let query = `
      SELECT s.*, c.name as class_name, sec.name as section_name
      FROM students s
      JOIN classes c ON s.class_id = c.id
      JOIN sections sec ON s.section_id = sec.id
    `;
    const params = [];

    if (class_id) {
      query += ` WHERE s.class_id = $${params.length + 1}`;
      params.push(class_id);
    }

    if (section_id) {
      query += params.length > 0 ? ` AND s.section_id = $${params.length + 1}` : ` WHERE s.section_id = $${params.length + 1}`;
      params.push(section_id);
    }

    query += ` ORDER BY c.grade_level, s.roll_number`;

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Analytics endpoints (SUPER_ADMIN)
const getAttendanceAnalytics = async (req, res) => {
  try {
    const { class_id, start_date, end_date } = req.query;

    let query = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'PRESENT') as present_count,
        COUNT(*) FILTER (WHERE status = 'ABSENT') as absent_count,
        COUNT(*) FILTER (WHERE status = 'LATE') as late_count,
        COUNT(*) as total_records
      FROM attendance
      WHERE date BETWEEN $1 AND $2
    `;
    const params = [
      start_date || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split("T")[0],
      end_date || new Date().toISOString().split("T")[0]
    ];

    if (class_id) {
      query = query.replace("WHERE date", "WHERE class_id = $3 AND date");
      params.push(class_id);
    }

    const result = await pool.query(query, params);
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching attendance analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMarksAnalytics = async (req, res) => {
  try {
    const { class_id, subject_id } = req.query;

    let query = `
      SELECT 
        AVG(m.marks_obtained) as average_marks,
        MAX(m.marks_obtained) as max_marks,
        MIN(m.marks_obtained) as min_marks,
        COUNT(*) as total_students
      FROM marks m
      JOIN tests t ON m.test_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (class_id) {
      query += ` AND t.class_id = $${params.length + 1}`;
      params.push(class_id);
    }

    if (subject_id) {
      query += ` AND t.subject_id = $${params.length + 1}`;
      params.push(subject_id);
    }

    const result = await pool.query(query, params);
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching marks analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getBehaviourAnalytics = async (req, res) => {
  try {
    const { class_id } = req.query;

    let query = `
      SELECT 
        COUNT(*) FILTER (WHERE behaviour_type = 'POSITIVE') as positive_count,
        COUNT(*) FILTER (WHERE behaviour_type = 'NEGATIVE') as negative_count,
        COUNT(*) FILTER (WHERE behaviour_type = 'NEUTRAL') as neutral_count,
        COUNT(*) as total_remarks
      FROM behaviour b
      JOIN students s ON b.student_id = s.id
    `;
    const params = [];

    if (class_id) {
      query += ` WHERE s.class_id = $1`;
      params.push(class_id);
    }

    const result = await pool.query(query, params);
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching behaviour analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getFeesAnalytics = async (req, res) => {
  try {
    const { class_id } = req.query;

    let query = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'PAID') as paid_count,
        COUNT(*) FILTER (WHERE status = 'PENDING') as pending_count,
        COUNT(*) FILTER (WHERE status = 'OVERDUE') as overdue_count,
        SUM(amount) as total_amount,
        SUM(amount_paid) as total_paid
      FROM fees f
      JOIN students s ON f.student_id = s.id
    `;
    const params = [];

    if (class_id) {
      query += ` WHERE s.class_id = $1`;
      params.push(class_id);
    }

    const result = await pool.query(query, params);
    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching fees analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllClasses,
  getAllSections,
  getAllSubjects,
  getAllTeachers,
  createTeacher,
  updateTeacher,
  getTeacherMappings,
  createTeacherMapping,
  deleteTeacherMapping,
  getAllStudents,
  getAttendanceAnalytics,
  getMarksAnalytics,
  getBehaviourAnalytics,
  getFeesAnalytics,
};


