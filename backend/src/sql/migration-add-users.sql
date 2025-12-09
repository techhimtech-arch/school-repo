-- Migration: Add users table for real user management
-- Run this after the main schema.sql

-- Users table (for authentication and user management)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'STUDENT_PARENT')),
    name VARCHAR(255),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Optional: Insert initial admin user (change password after first login)
-- Password: admin123 (change this!)
-- INSERT INTO users (email, password, role, name) 
-- VALUES ('admin@school.com', '$2a$10$YourHashedPasswordHere', 'SUPER_ADMIN', 'System Administrator');

