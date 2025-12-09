const pool = require('../db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

// Get all users (SUPER_ADMIN only)
const getAllUsers = async (req, res) => {
  try {
    const { role, is_active } = req.query;

    let query = 'SELECT id, email, role, name, phone, is_active, last_login, created_at, updated_at FROM users WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (role) {
      query += ` AND role = $${paramCount++}`;
      params.push(role);
    }

    if (is_active !== undefined) {
      query += ` AND is_active = $${paramCount++}`;
      params.push(is_active === 'true');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user by ID (SUPER_ADMIN only)
const getUserById = async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await pool.query(
      'SELECT id, email, role, name, phone, is_active, last_login, created_at, updated_at FROM users WHERE id = $1',
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create user (SUPER_ADMIN only)
const createUser = async (req, res) => {
  try {
    const { email, password, role, name, phone } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    if (!['SUPER_ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'STUDENT_PARENT'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password, role, name, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, role, name, phone, is_active, created_at`,
      [email, hashedPassword, role, name || null, phone || null]
    );

    res.status(201).json({ 
      message: 'User created successfully', 
      data: result.rows[0] 
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user (SUPER_ADMIN only)
const updateUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { email, password, role, name, phone, is_active } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (email) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }

    if (role) {
      if (!['SUPER_ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'STUDENT_PARENT'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      updates.push(`role = $${paramCount++}`);
      values.push(role);
    }

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password = $${paramCount++}`);
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(user_id);

    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} 
       RETURNING id, email, role, name, phone, is_active, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully', data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete user (SUPER_ADMIN only)
const deleteUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Prevent deleting yourself
    const currentUser = await pool.query('SELECT id FROM users WHERE email = $1', [req.user.email]);
    if (currentUser.rows.length > 0 && currentUser.rows[0].id === user_id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, email', [user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// User registration (Public endpoint - for initial setup or specific roles)
const register = async (req, res) => {
  try {
    const { email, password, role, name, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Default role to STUDENT_PARENT if not provided
    const userRole = role || 'STUDENT_PARENT';

    if (!['STUDENT_PARENT'].includes(userRole)) {
      return res.status(400).json({ error: 'Registration is only allowed for STUDENT_PARENT role. Contact admin for other roles.' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password, role, name, phone)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, role, name, phone, is_active, created_at`,
      [email, hashedPassword, userRole, name || null, phone || null]
    );

    // Generate token for immediate login
    const token = generateToken({
      email: result.rows[0].email,
      role: result.rows[0].role,
      id: result.rows[0].id
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        role: result.rows[0].role,
        name: result.rows[0].name
      }
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current user profile
const getMyProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, role, name, phone, is_active, last_login, created_at FROM users WHERE email = $1',
      [req.user.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update own profile
const updateMyProfile = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password = $${paramCount++}`);
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.user.email);

    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE email = $${paramCount} 
       RETURNING id, email, role, name, phone, is_active, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  register,
  getMyProfile,
  updateMyProfile
};

