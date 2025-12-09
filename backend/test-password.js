const pool = require('./src/db');
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    const email = 'admin@school.com';
    const password = 'admin123';
    
    console.log(`Testing login for: ${email}`);
    console.log(`Password: ${password}\n`);
    
    // Get user from database
    const result = await pool.query(
      'SELECT id, email, password, role, name, is_active FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ User not found in database!');
      pool.end();
      return;
    }
    
    const user = result.rows[0];
    console.log('✅ User found in database:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.is_active}`);
    console.log(`   Password Hash: ${user.password}\n`);
    
    // Check if active
    if (!user.is_active) {
      console.log('❌ Account is deactivated!');
      pool.end();
      return;
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (isPasswordValid) {
      console.log('✅ Password is CORRECT! Login should work.\n');
      console.log('Login credentials:');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
    } else {
      console.log('❌ Password is INCORRECT!');
      console.log('The password in database does not match "admin123"');
    }
    
    pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    pool.end();
  }
}

testLogin();
