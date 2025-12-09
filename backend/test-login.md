# Login Test Guide

## Test Users

1. **Super Admin**
   - Email: `superadmin@gmail.com`
   - Password: `abc123`
   - Role: `SUPER_ADMIN`

2. **Class Teacher**
   - Email: `classteacher@gmail.com`
   - Password: `abc123`
   - Role: `CLASS_TEACHER`

3. **Subject Teacher**
   - Email: `subjectteacher@gmail.com`
   - Password: `abc123`
   - Role: `SUBJECT_TEACHER`

4. **Parent/Student**
   - Email: `parentchild@gmail.com`
   - Password: `abc123`
   - Role: `STUDENT_PARENT`

## Testing Methods

### Method 1: Using the HTML Test File

1. Open `test-login.html` in your browser
2. Enter your Vercel deployment URL in the API URL field
3. Click on any quick login button or enter credentials manually
4. Click "Login" button

### Method 2: Using cURL

```bash
# Replace YOUR_VERCEL_URL with your actual Vercel deployment URL

# Test Super Admin Login
curl -X POST https://YOUR_VERCEL_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@gmail.com","password":"abc123"}'

# Test Class Teacher Login
curl -X POST https://YOUR_VERCEL_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"classteacher@gmail.com","password":"abc123"}'

# Test Subject Teacher Login
curl -X POST https://YOUR_VERCEL_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"subjectteacher@gmail.com","password":"abc123"}'

# Test Parent Login
curl -X POST https://YOUR_VERCEL_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"parentchild@gmail.com","password":"abc123"}'
```

### Method 3: Using Postman

1. Create a new POST request
2. URL: `https://YOUR_VERCEL_URL/api/auth/login`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "email": "superadmin@gmail.com",
  "password": "abc123"
}
```

### Method 4: Using JavaScript/Fetch

```javascript
fetch('https://YOUR_VERCEL_URL/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'superadmin@gmail.com',
    password: 'abc123'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Success:', data);
  // Save token: localStorage.setItem('token', data.token);
})
.catch(error => {
  console.error('Error:', error);
});
```

## Expected Response

### Success Response (200 OK)
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "superadmin@gmail.com",
    "role": "SUPER_ADMIN"
  }
}
```

### Error Response (401 Unauthorized)
```json
{
  "error": "Invalid email or password"
}
```

## Testing Protected Routes

After successful login, use the token to test protected routes:

```bash
# Example: Get all classes (Super Admin only)
curl -X GET https://YOUR_VERCEL_URL/api/admin/classes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

1. **CORS Error**: Make sure CORS is enabled in server.js (already done)
2. **404 Error**: Check if the route is `/api/auth/login` (not `/auth/login`)
3. **500 Error**: Check Vercel logs for server errors
4. **Connection Error**: Verify your Vercel URL is correct


