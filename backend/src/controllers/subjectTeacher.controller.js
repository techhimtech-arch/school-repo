const pool = require('../db');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure multer for file uploads
const fs = require('fs');
const uploadsDir = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists (only in development)
if (process.env.NODE_ENV !== 'production') {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

// Use memory storage in production, disk storage in development
const storage = process.env.NODE_ENV === 'production'
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|ppt|pptx|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
    }
  }
});

// Get teacher's assigned subjects and classes (SUBJECT_TEACHER)
const getMyAssignments = async (req, res) => {
  try {
    // Get teacher ID
    const teacherQuery = await pool.query(
      'SELECT id FROM teachers WHERE email = $1',
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
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
    console.error('Error fetching teacher assignments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get students for a specific class-section (SUBJECT_TEACHER)
const getClassSectionStudents = async (req, res) => {
  try {
    const { class_id, section_id } = req.query;

    if (!class_id || !section_id) {
      return res.status(400).json({ error: 'class_id and section_id are required' });
    }

    // Verify teacher has access to this class
    const teacherQuery = await pool.query(
      'SELECT id FROM teachers WHERE email = $1',
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const teacherId = teacherQuery.rows[0].id;

    const mappingQuery = await pool.query(
      'SELECT * FROM teacher_subject_mapping WHERE teacher_id = $1 AND class_id = $2',
      [teacherId, class_id]
    );

    if (mappingQuery.rows.length === 0) {
      return res.status(403).json({ error: 'You don\'t have access to this class' });
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
    console.error('Error fetching class-section students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Upload study material (SUBJECT_TEACHER)
const uploadMaterial = async (req, res) => {
  try {
    const { subject_id, class_id, section_id, title, description, video_url } = req.body;

    if (!subject_id || !class_id || !title) {
      return res.status(400).json({ error: 'subject_id, class_id, and title are required' });
    }

    // Get teacher ID
    const teacherQuery = await pool.query(
      'SELECT id FROM teachers WHERE email = $1',
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const teacherId = teacherQuery.rows[0].id;

    // Verify teacher has access to this subject and class
    const mappingQuery = await pool.query(
      'SELECT * FROM teacher_subject_mapping WHERE teacher_id = $1 AND subject_id = $2 AND class_id = $3',
      [teacherId, subject_id, class_id]
    );

    if (mappingQuery.rows.length === 0) {
      return res.status(403).json({ error: 'You don\'t have access to this subject/class' });
    }

    let file_path = null;
    let file_type = null;

    if (req.file) {
      // Store relative path for URL access
      file_path = `/uploads/${req.file.filename}`;
      file_type = req.file.mimetype;
    } else if (video_url) {
      file_type = 'VIDEO_URL';
      file_path = video_url;
    } else {
      return res.status(400).json({ error: 'Either file or video_url is required' });
    }

    const result = await pool.query(
      `INSERT INTO materials (teacher_id, subject_id, class_id, section_id, title, description, file_path, file_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [teacherId, subject_id, class_id, section_id || null, title, description || null, file_path, file_type]
    );

    res.json({ message: 'Material uploaded successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error uploading material:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Give homework (SUBJECT_TEACHER)
const createHomework = async (req, res) => {
  try {
    const { subject_id, class_id, section_id, title, description, due_date } = req.body;

    if (!subject_id || !class_id || !title || !due_date) {
      return res.status(400).json({ error: 'subject_id, class_id, title, and due_date are required' });
    }

    // Get teacher ID
    const teacherQuery = await pool.query(
      'SELECT id FROM teachers WHERE email = $1',
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const teacherId = teacherQuery.rows[0].id;

    // Verify teacher has access to this subject and class
    const mappingQuery = await pool.query(
      'SELECT * FROM teacher_subject_mapping WHERE teacher_id = $1 AND subject_id = $2 AND class_id = $3',
      [teacherId, subject_id, class_id]
    );

    if (mappingQuery.rows.length === 0) {
      return res.status(403).json({ error: 'You don\'t have access to this subject/class' });
    }

    const result = await pool.query(
      `INSERT INTO homework (teacher_id, subject_id, class_id, section_id, title, description, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [teacherId, subject_id, class_id, section_id || null, title, description || null, due_date]
    );

    res.json({ message: 'Homework created successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error creating homework:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create test (SUBJECT_TEACHER)
const createTest = async (req, res) => {
  try {
    const { subject_id, class_id, section_id, title, test_date, max_marks } = req.body;

    if (!subject_id || !class_id || !title || !test_date || !max_marks) {
      return res.status(400).json({ error: 'subject_id, class_id, title, test_date, and max_marks are required' });
    }

    // Get teacher ID
    const teacherQuery = await pool.query(
      'SELECT id FROM teachers WHERE email = $1',
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const teacherId = teacherQuery.rows[0].id;

    // Verify teacher has access to this subject and class
    const mappingQuery = await pool.query(
      'SELECT * FROM teacher_subject_mapping WHERE teacher_id = $1 AND subject_id = $2 AND class_id = $3',
      [teacherId, subject_id, class_id]
    );

    if (mappingQuery.rows.length === 0) {
      return res.status(403).json({ error: 'You don\'t have access to this subject/class' });
    }

    const result = await pool.query(
      `INSERT INTO tests (teacher_id, subject_id, class_id, section_id, title, test_date, max_marks)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [teacherId, subject_id, class_id, section_id || null, title, test_date, max_marks]
    );

    res.json({ message: 'Test created successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add marks (SUBJECT_TEACHER)
const addMarks = async (req, res) => {
  try {
    const { test_id, marks_records } = req.body;

    if (!test_id || !marks_records || !Array.isArray(marks_records)) {
      return res.status(400).json({ error: 'test_id and marks_records array are required' });
    }

    // Get teacher ID
    const teacherQuery = await pool.query(
      'SELECT id FROM teachers WHERE email = $1',
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const teacherId = teacherQuery.rows[0].id;

    // Verify test belongs to this teacher
    const testQuery = await pool.query(
      'SELECT * FROM tests WHERE id = $1 AND teacher_id = $2',
      [test_id, teacherId]
    );

    if (testQuery.rows.length === 0) {
      return res.status(403).json({ error: 'You can only add marks to your own tests' });
    }

    // Delete existing marks for this test
    await pool.query('DELETE FROM marks WHERE test_id = $1', [test_id]);

    // Insert new marks
    const insertPromises = marks_records.map(record => {
      return pool.query(
        `INSERT INTO marks (test_id, student_id, marks_obtained, remarks)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [test_id, record.student_id, record.marks_obtained, record.remarks || null]
      );
    });

    const results = await Promise.all(insertPromises);

    res.json({ 
      message: 'Marks added successfully', 
      data: results.map(r => r.rows[0])
    });
  } catch (error) {
    console.error('Error adding marks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add behaviour remark (SUBJECT_TEACHER)
const addBehaviourRemark = async (req, res) => {
  try {
    const { student_id, behaviour_type, remarks } = req.body;

    if (!student_id || !behaviour_type || !remarks) {
      return res.status(400).json({ error: 'student_id, behaviour_type, and remarks are required' });
    }

    if (!['POSITIVE', 'NEGATIVE', 'NEUTRAL'].includes(behaviour_type)) {
      return res.status(400).json({ error: 'behaviour_type must be POSITIVE, NEGATIVE, or NEUTRAL' });
    }

    // Get teacher ID
    const teacherQuery = await pool.query(
      'SELECT id FROM teachers WHERE email = $1',
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const teacherId = teacherQuery.rows[0].id;

    const result = await pool.query(
      `INSERT INTO behaviour (teacher_id, student_id, behaviour_type, remarks)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [teacherId, student_id, behaviour_type, remarks]
    );

    res.json({ message: 'Behaviour remark added successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error adding behaviour remark:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add daily teaching topic (SUBJECT_TEACHER)
const addDailyTopic = async (req, res) => {
  try {
    const { subject_id, class_id, section_id, topic, date } = req.body;

    if (!subject_id || !class_id || !topic || !date) {
      return res.status(400).json({ error: 'subject_id, class_id, topic, and date are required' });
    }

    // Get teacher ID
    const teacherQuery = await pool.query(
      'SELECT id FROM teachers WHERE email = $1',
      [req.user.email]
    );

    if (teacherQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const teacherId = teacherQuery.rows[0].id;

    // Verify teacher has access to this subject and class
    const mappingQuery = await pool.query(
      'SELECT * FROM teacher_subject_mapping WHERE teacher_id = $1 AND subject_id = $2 AND class_id = $3',
      [teacherId, subject_id, class_id]
    );

    if (mappingQuery.rows.length === 0) {
      return res.status(403).json({ error: 'You don\'t have access to this subject/class' });
    }

    const result = await pool.query(
      `INSERT INTO daily_topics (teacher_id, subject_id, class_id, section_id, topic, date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [teacherId, subject_id, class_id, section_id || null, topic, date]
    );

    res.json({ message: 'Daily topic added successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error adding daily topic:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getMyAssignments,
  getClassSectionStudents,
  uploadMaterial: [upload.single('file'), uploadMaterial],
  createHomework,
  createTest,
  addMarks,
  addBehaviourRemark,
  addDailyTopic
};

