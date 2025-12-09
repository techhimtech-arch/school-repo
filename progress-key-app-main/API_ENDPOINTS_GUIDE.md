# API Endpoints Guide - Production & Development

## Login Endpoint URLs

### 🚀 Production (Vercel Deployed)

**Backend URL:** `https://schoolmanage-taupe.vercel.app`

**Login Endpoint:**
```
POST https://schoolmanage-taupe.vercel.app/api/auth/login
```

**Full URL Example:**
```bash
curl -X POST https://schoolmanage-taupe.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@gmail.com","password":"abc123"}'
```

### 💻 Development (Localhost)

**Backend runs on:** `http://localhost:3000`

**Login Endpoint:**
```
POST http://localhost:3000/api/auth/login
```

**Full URL Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@gmail.com","password":"abc123"}'
```

## Frontend Configuration

### Environment Variables

Create `.env` file in `progress-key-app-main/` folder:

#### For Production:
```env
VITE_BACKEND_URL=https://schoolmanage-taupe.vercel.app
```

#### For Development:
```env
# Leave empty or don't set - will use proxy
# VITE_BACKEND_URL=
```

### How It Works

1. **Production Mode:**
   - Frontend reads `VITE_BACKEND_URL`
   - Makes direct API calls to: `https://schoolmanage-taupe.vercel.app/api/auth/login`

2. **Development Mode:**
   - If `VITE_BACKEND_URL` is not set, uses proxy
   - Frontend calls: `/api/auth/login`
   - Vite proxy redirects to: `http://localhost:3000/api/auth/login`

## All API Endpoints

### Base URLs

**Production:**
- Base: `https://schoolmanage-taupe.vercel.app`
- API: `https://schoolmanage-taupe.vercel.app/api`

**Development:**
- Base: `http://localhost:3000`
- API: `http://localhost:3000/api` (or `/api` via proxy)

### Authentication Endpoints

```
POST /api/auth/login
POST /api/users/register
```

### User Management (Super Admin)

```
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
GET    /api/users/profile
PUT    /api/users/profile
```

### Admin Endpoints

```
GET  /api/admin/classes
GET  /api/admin/sections
GET  /api/admin/subjects
GET  /api/admin/teachers
POST /api/admin/teachers
PUT  /api/admin/teachers/:id
GET  /api/admin/teacher-mappings
POST /api/admin/teacher-mappings
DELETE /api/admin/teacher-mappings/:id
GET  /api/admin/students
GET  /api/admin/analytics/attendance
GET  /api/admin/analytics/marks
GET  /api/admin/analytics/behaviour
GET  /api/admin/analytics/fees
POST /api/admin/announcements
```

### Class Teacher Endpoints

```
GET  /api/class-teacher/students
POST /api/class-teacher/attendance
GET  /api/class-teacher/attendance
GET  /api/class-teacher/leave-requests
PUT  /api/class-teacher/leave-requests/:id
GET  /api/class-teacher/homework
GET  /api/class-teacher/materials
GET  /api/class-teacher/fees
PUT  /api/class-teacher/fees/:id
POST /api/class-teacher/announcements
```

### Subject Teacher Endpoints

```
GET  /api/subject-teacher/assignments
GET  /api/subject-teacher/students
POST /api/subject-teacher/materials
POST /api/subject-teacher/homework
POST /api/subject-teacher/tests
POST /api/subject-teacher/marks
POST /api/subject-teacher/behaviour
POST /api/subject-teacher/daily-topics
```

### Parent/Student Endpoints

```
GET  /api/parent/student
GET  /api/parent/attendance/today
GET  /api/parent/homework/today
GET  /api/parent/daily-topics
GET  /api/parent/tests-marks
GET  /api/parent/behaviour
GET  /api/parent/materials
GET  /api/parent/leave-requests
POST /api/parent/leave-requests
GET  /api/parent/fees
```

## Testing Endpoints

### Test Login (Production)

```bash
# Using curl
curl -X POST https://schoolmanage-taupe.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@gmail.com","password":"abc123"}'

# Using JavaScript
fetch('https://schoolmanage-taupe.vercel.app/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'superadmin@gmail.com',
    password: 'abc123'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### Test Login (Development)

```bash
# Using curl
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@gmail.com","password":"abc123"}'

# Using JavaScript
fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'superadmin@gmail.com',
    password: 'abc123'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

## Setup Instructions

### 1. Backend Setup (Development)

```bash
cd backend
npm install
# Create .env file with DATABASE_URL and JWT_SECRET
npm start
# Backend runs on http://localhost:3000
```

### 2. Frontend Setup (Development)

```bash
cd progress-key-app-main
npm install
# Create .env file (optional for dev - uses proxy)
npm run dev
# Frontend runs on http://localhost:8080
# API calls go to /api which proxies to localhost:3000
```

### 3. Production Deployment

**Backend (Vercel):**
- Already deployed at: `https://schoolmanage-taupe.vercel.app`
- Set environment variables in Vercel dashboard:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `NODE_ENV=production`

**Frontend:**
- Set environment variable:
  - `VITE_BACKEND_URL=https://schoolmanage-taupe.vercel.app`
- Deploy to Vercel/Netlify/etc.

## Troubleshooting

### Issue: CORS Error
- ✅ CORS is already enabled in backend
- Check if backend URL is correct

### Issue: 404 Not Found
- Check if endpoint path is correct: `/api/auth/login` (not `/auth/login`)
- Verify backend is running (development)
- Check Vercel deployment logs (production)

### Issue: Network Error
- Verify `VITE_BACKEND_URL` is set correctly
- Check if backend is accessible
- For development, ensure backend is running on port 3000

### Issue: Proxy Not Working (Development)
- Ensure vite.config.ts proxy target is `http://localhost:3000`
- Restart Vite dev server after changing config
- Check browser console for errors

## Quick Reference

| Environment | Backend URL | Login Endpoint |
|------------|-------------|----------------|
| **Production** | `https://schoolmanage-taupe.vercel.app` | `https://schoolmanage-taupe.vercel.app/api/auth/login` |
| **Development** | `http://localhost:3000` | `http://localhost:3000/api/auth/login` or `/api/auth/login` (via proxy) |

