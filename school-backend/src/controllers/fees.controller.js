const pool = require("../db");

// Update fee status (CLASS_TEACHER only)
const updateFeeStatus = async (req, res) => {
  try {
    const { fee_id, status, amount_paid, payment_date, receipt_number } = req.body;

    if (!fee_id || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get teacher ID
    const teacherQuery = await pool.query(
      "SELECT id, class_id, section_id FROM teachers WHERE email = $1",
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const teacher = teacherQuery.rows[0];

    // Verify fee belongs to teacher's class
    const feeQuery = await pool.query(
      `SELECT f.*, s.class_id, s.section_id
       FROM fees f
       JOIN students s ON f.student_id = s.id
       WHERE f.id = $1`,
      [fee_id]
    );

    if (feeQuery.rows.length === 0) {
      return res.status(404).json({ error: "Fee record not found" });
    }

    const fee = feeQuery.rows[0];

    if (fee.class_id !== teacher.class_id || fee.section_id !== teacher.section_id) {
      return res.status(403).json({ error: "You can only update fees for your class students" });
    }

    const updateData = {
      status,
      amount_paid: amount_paid !== undefined ? amount_paid : fee.amount_paid,
      payment_date: payment_date || fee.payment_date,
      receipt_number: receipt_number || fee.receipt_number,
    };

    const result = await pool.query(
      `UPDATE fees
       SET status = $1, amount_paid = $2, payment_date = $3, receipt_number = $4,
           updated_by = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [updateData.status, updateData.amount_paid, updateData.payment_date, updateData.receipt_number, teacher.id, fee_id]
    );

    res.json({ message: "Fee status updated successfully", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating fee status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get fees for a student (STUDENT_PARENT)
const getStudentFees = async (req, res) => {
  try {
    const { student_id } = req.params;

    const result = await pool.query(
      `SELECT f.*, t.name as updated_by_name
       FROM fees f
       LEFT JOIN teachers t ON f.updated_by = t.id
       WHERE f.student_id = $1
       ORDER BY f.due_date DESC`,
      [student_id]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching fees:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get fees for a class (CLASS_TEACHER)
const getClassFees = async (req, res) => {
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
      `SELECT f.*, s.name as student_name, s.roll_number, t.name as updated_by_name
       FROM fees f
       JOIN students s ON f.student_id = s.id
       LEFT JOIN teachers t ON f.updated_by = t.id
       WHERE s.class_id = $1 AND s.section_id = $2
       ORDER BY f.due_date DESC`,
      [class_id, section_id]
    );

    res.json({ data: result.rows });
  } catch (error) {
    console.error("Error fetching class fees:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  updateFeeStatus,
  getStudentFees,
  getClassFees,
};


