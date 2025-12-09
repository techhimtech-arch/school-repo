const pool = require('./src/db');
const bcrypt = require('bcryptjs');

async function updatePassword() {
  try {
    const email = 'admin@school.com';
    const newPassword = 'admin123';
    
    console.log(`Updating password for: ${email}`);
    console.log(`New password: ${newPassword}\n`);
    
    // Generate hash
    const hash = await bcrypt.hash(newPassword, 10);
    console.log('Generated hash:', hash);
    
    // Update in database
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING email, role',
      [hash, email]
    );
    
    if (result.rows.length > 0) {
      console.log('\n✅ Password updated successfully!');
      console.log('Updated user:', result.rows[0]);
      console.log('\nLogin credentials:');
      console.log(`Email: ${email}`);
      console.log(`Password: ${newPassword}`);
    } else {
      console.log('❌ User not found');
    }
    
    pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    pool.end();
  }
}

updatePassword();
