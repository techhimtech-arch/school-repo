const pool = require('./src/db');

async function checkDatabase() {
  try {
    console.log('Connecting to database...');
    
    // Check connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully!\n');
    
    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Users table does NOT exist!');
      console.log('Run migration: backend/src/sql/migration-add-users.sql\n');
      pool.end();
      return;
    }
    
    console.log('✅ Users table exists\n');
    
    // Get all users
    const result = await pool.query('SELECT id, email, role, is_active, created_at FROM users ORDER BY created_at DESC');
    
    if (result.rows.length === 0) {
      console.log('❌ No users found in database!\n');
      console.log('To create admin user, run this SQL:');
      console.log(`
INSERT INTO users (email, password, role, name, is_active) 
VALUES (
  'admin@school.com', 
  '$2a$10$kwwNzuFkQrOviGkLGK3JIe.ELuDrnsZ6B9Y6BVcnse.34APULJrsy', 
  'SUPER_ADMIN', 
  'System Administrator',
  true
);
      `);
    } else {
      console.log('✅ Users found in database:\n');
      console.table(result.rows);
    }
    
    pool.end();
  } catch (error) {
    console.error('❌ Database Error:', error.message);
    pool.end();
    process.exit(1);
  }
}

checkDatabase();
