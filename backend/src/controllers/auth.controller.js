const pool = require('../db');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('\n=== LOGIN REQUEST ===');
    console.log('Email:', email);
    console.log('Password length:', password ? password.length : 0);

    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user in database
    console.log('Checking database for user...');
    const dbUser = await pool.query(
      'SELECT id, email, password, role, name, is_active FROM users WHERE email = $1',
      [email]
    );
    console.log('Database query result:', dbUser.rows.length, 'users found');

    if (dbUser.rows.length === 0) {
      console.log('❌ User not found in database');
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = dbUser.rows[0];
    console.log('✅ User found:', user.email, '| Role:', user.role, '| Active:', user.is_active);
    
    // Check if user is active
    if (!user.is_active) {
      console.log('❌ Account is deactivated');
      return res.status(403).json({ error: 'Account is deactivated. Please contact administrator.' });
    }

    // Verify password
    console.log('Verifying password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    console.log('✅ Password verified successfully');

    // Update last login
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    // Generate JWT token
    console.log('Generating token for:', user.email, '| Role:', user.role);
    const token = generateToken({
      email: user.email,
      role: user.role,
      id: user.id
    });

    console.log('✅ LOGIN SUCCESSFUL');
    console.log('===================\n');

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  login
};

