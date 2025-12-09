# User Management System Guide

## Overview

The backend now supports **real user management** with database-based authentication. You can create, update, delete, and manage users through the API.

## Features

✅ **Database-based authentication** (with fallback to hardcoded users for backward compatibility)  
✅ **Password hashing** using bcrypt  
✅ **User CRUD operations** for Super Admin  
✅ **User registration** for parents/students  
✅ **Profile management** for all users  
✅ **Role-based access control**  

## Database Setup

### Step 1: Run Migration

Run the migration SQL file to add the users table:

```sql
-- Run: backend/src/sql/migration-add-users.sql
```

Or manually add the users table (see the migration file).

### Step 2: Create First Admin User

You can create the first admin user via API or directly in database:

**Via API (after deployment):**
```bash
POST /api/users
Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN
{
  "email": "admin@school.com",
  "password": "securepassword123",
  "role": "SUPER_ADMIN",
  "name": "System Administrator"
}
```

**Via Database (using bcrypt hash):**
```sql
-- Generate password hash first, then:
INSERT INTO users (email, password, role, name) 
VALUES ('admin@school.com', '$2a$10$hashedpassword', 'SUPER_ADMIN', 'Admin');
```

## API Endpoints

### Public Endpoints

#### 1. User Registration
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "parent@example.com",
  "password": "password123",
  "name": "Parent Name",
  "phone": "1234567890"
}
```

**Note:** Registration is only allowed for `STUDENT_PARENT` role by default.

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@school.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "admin@school.com",
    "role": "SUPER_ADMIN",
    "name": "Admin Name"
  }
}
```

### Protected Endpoints (Require Authentication)

#### 3. Get My Profile
```http
GET /api/users/profile
Authorization: Bearer YOUR_TOKEN
```

#### 4. Update My Profile
```http
PUT /api/users/profile
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "9876543210",
  "password": "newpassword123"  // Optional
}
```

### Super Admin Only Endpoints

#### 5. Get All Users
```http
GET /api/users?role=CLASS_TEACHER&is_active=true
Authorization: Bearer SUPER_ADMIN_TOKEN
```

#### 6. Get User by ID
```http
GET /api/users/:user_id
Authorization: Bearer SUPER_ADMIN_TOKEN
```

#### 7. Create User
```http
POST /api/users
Authorization: Bearer SUPER_ADMIN_TOKEN
Content-Type: application/json

{
  "email": "teacher@school.com",
  "password": "password123",
  "role": "CLASS_TEACHER",
  "name": "Teacher Name",
  "phone": "1234567890"
}
```

**Available Roles:**
- `SUPER_ADMIN`
- `CLASS_TEACHER`
- `SUBJECT_TEACHER`
- `STUDENT_PARENT`

#### 8. Update User
```http
PUT /api/users/:user_id
Authorization: Bearer SUPER_ADMIN_TOKEN
Content-Type: application/json

{
  "name": "Updated Name",
  "role": "SUBJECT_TEACHER",
  "is_active": true,
  "password": "newpassword"  // Optional
}
```

#### 9. Delete User
```http
DELETE /api/users/:user_id
Authorization: Bearer SUPER_ADMIN_TOKEN
```

**Note:** You cannot delete your own account.

## Migration from Hardcoded Users

The system supports **both** database users and hardcoded users for backward compatibility:

1. **Database users** are checked first
2. If not found, **hardcoded users** are checked (fallback)
3. This allows gradual migration

### To Migrate Hardcoded Users to Database:

1. Login with hardcoded credentials
2. Use Super Admin account to create users in database
3. Users can then login with database credentials
4. Eventually remove hardcoded users from `config/users.js`

## Password Security

- Passwords are hashed using **bcrypt** (10 rounds)
- Never store plain text passwords
- Passwords are never returned in API responses
- Users can update their own passwords via profile endpoint

## User Status

- `is_active: true` - User can login
- `is_active: false` - User account is deactivated (cannot login)

## Example Workflow

### 1. Create First Admin User

```bash
# After running migration, create admin via API
curl -X POST https://your-api.vercel.app/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@school.com",
    "password": "admin123",
    "role": "SUPER_ADMIN",
    "name": "Admin"
  }'
```

**Note:** Registration endpoint only allows `STUDENT_PARENT` by default. For other roles, you need to:
- Use hardcoded login first, then create users via admin panel
- Or directly insert into database
- Or modify registration endpoint to allow admin creation

### 2. Login as Admin

```bash
curl -X POST https://your-api.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@school.com",
    "password": "admin123"
  }'
```

### 3. Create Teachers

```bash
curl -X POST https://your-api.vercel.app/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@school.com",
    "password": "teacher123",
    "role": "CLASS_TEACHER",
    "name": "John Teacher"
  }'
```

### 4. Parents Register Themselves

```bash
curl -X POST https://your-api.vercel.app/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent@example.com",
    "password": "parent123",
    "name": "Parent Name",
    "phone": "1234567890"
  }'
```

## Frontend Integration

### Login Example (React/JavaScript)

```javascript
const login = async (email, password) => {
  const response = await fetch('https://your-api.vercel.app/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Save token
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } else {
    throw new Error(data.error);
  }
};
```

### Register Example

```javascript
const register = async (email, password, name, phone) => {
  const response = await fetch('https://your-api.vercel.app/api/users/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name, phone })
  });
  
  return await response.json();
};
```

### Get All Users (Admin)

```javascript
const getAllUsers = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('https://your-api.vercel.app/api/users', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

## Security Best Practices

1. ✅ Always use HTTPS in production
2. ✅ Store JWT tokens securely (httpOnly cookies recommended)
3. ✅ Implement token expiration and refresh
4. ✅ Rate limit login attempts
5. ✅ Use strong password requirements
6. ✅ Regularly update dependencies
7. ✅ Monitor failed login attempts

## Troubleshooting

### "User not found" error
- Check if user exists in database
- Verify email spelling
- Check if user is active (`is_active = true`)

### "Invalid password" error
- Verify password is correct
- Check if password was hashed correctly in database
- Try resetting password via admin

### "Account deactivated" error
- User account has `is_active = false`
- Admin needs to activate the account

### Registration only allows STUDENT_PARENT
- This is by design for security
- Admin must create other role users
- Or modify registration endpoint if needed

## Next Steps

1. ✅ Run database migration
2. ✅ Create first admin user
3. ✅ Test login functionality
4. ✅ Create users for different roles
5. ✅ Integrate with frontend
6. ✅ Remove hardcoded users (optional)

