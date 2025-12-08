# Environment Variables Guide - Vercel Deployment

## Summary: Kon se Environment Variables Set karne hain?

**Answer: DONO (Frontend + Backend) ke environment variables Vercel mein set karne hain.**

Vercel mein sab environment variables ek jagah set hote hain, lekin unhe automatically frontend aur backend dono ko mil jate hain.

---

## Required Environment Variables

### 1. Backend ke liye (Required)

Ye variables backend (`school-backend`) aur API (`api/index.js`) ke liye zaroori hain:

```bash
DATABASE_URL=postgresql://user:password@host:5432/database_name
JWT_SECRET=your_secure_random_string_here
NODE_ENV=production
```

**Details:**
- **DATABASE_URL**: PostgreSQL database connection string
- **JWT_SECRET**: JWT token signing ke liye secret key (minimum 32 characters)
- **NODE_ENV**: Environment mode (production set karein)

### 2. Frontend ke liye (Required)

Ye variables frontend (`progress-key-app-main`) ke liye zaroori hain:

```bash
VITE_API_URL=/api
```

**Details:**
- **VITE_API_URL**: Frontend se backend API calls ke liye base URL
  - Production mein: `/api` (relative path)
  - Local development mein: `http://localhost:4000/api`

### 3. Optional: Supabase (Agar use kar rahe hain)

Agar aap Supabase use kar rahe hain (currently code mein hai but use nahi ho raha):

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

**Note:** Currently Supabase client file hai but use nahi ho raha. Agar aap Supabase use nahi kar rahe, to ye variables skip kar sakte hain.

---

## Vercel mein kaise set karein?

### Step-by-Step:

1. **Vercel Dashboard** mein jayein
2. Apne **Project** par click karein
3. **Settings** tab select karein
4. **Environment Variables** section mein jayein
5. Har variable add karein:

#### Variable 1: DATABASE_URL
- **Name:** `DATABASE_URL`
- **Value:** Apna PostgreSQL connection string
- **Environment:** Production, Preview, Development (sab mein)

#### Variable 2: JWT_SECRET
- **Name:** `JWT_SECRET`
- **Value:** Secure random string (32+ characters)
- **Environment:** Production, Preview, Development (sab mein)

**JWT_SECRET generate karne ke liye:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### Variable 3: NODE_ENV
- **Name:** `NODE_ENV`
- **Value:** `production`
- **Environment:** Production, Preview, Development (sab mein)

#### Variable 4: VITE_API_URL
- **Name:** `VITE_API_URL`
- **Value:** `/api`
- **Environment:** Production, Preview, Development (sab mein)

---

## Complete Environment Variables List

Vercel mein ye sab variables add karein:

| Variable Name | Value Example | Required For | Description |
|--------------|---------------|--------------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | Backend | PostgreSQL connection |
| `JWT_SECRET` | `base64_encoded_random_string` | Backend | JWT token signing |
| `NODE_ENV` | `production` | Backend | Environment mode |
| `VITE_API_URL` | `/api` | Frontend | API base URL |

---

## Important Notes

### 1. VITE_ Prefix
- Frontend ke variables **`VITE_`** prefix se start hote hain
- Vite build time par inhe bundle mein include karta hai
- Example: `VITE_API_URL` → Frontend mein `import.meta.env.VITE_API_URL` se access

### 2. Backend Variables
- Backend variables mein prefix nahi chahiye
- Backend mein `process.env.VARIABLE_NAME` se access
- Example: `DATABASE_URL` → Backend mein `process.env.DATABASE_URL`

### 3. Environment Scope
- **Production**: Live deployment ke liye
- **Preview**: Pull requests ke liye
- **Development**: Local development ke liye

**Recommendation:** Sab environments mein same values set karein (except NODE_ENV jo development mein `development` ho sakta hai).

---

## Verification

Deploy ke baad verify karein:

### Backend Check:
```bash
# API endpoint test karein
curl https://your-app.vercel.app/api/
# Expected: {"message":"School Progress Tracking System API","status":"running"}
```

### Frontend Check:
1. Browser console open karein
2. Check karein ki API calls `/api/*` par ja rahe hain
3. Network tab mein verify karein

### Database Check:
- Login try karein
- Agar database connection error aaye, to `DATABASE_URL` check karein

---

## Troubleshooting

### "JWT_SECRET not set" Warning
- **Solution:** `JWT_SECRET` environment variable add karein

### "Database connection failed"
- **Solution:** `DATABASE_URL` verify karein
- Database allow karein ki Vercel IPs se connect ho sake

### "API calls failing"
- **Solution:** `VITE_API_URL` check karein
- Production mein `/api` hona chahiye

### "Build failed - VITE_API_URL not found"
- **Solution:** Environment variable add karein aur redeploy karein

---

## Quick Checklist

- [ ] `DATABASE_URL` set hai (PostgreSQL connection string)
- [ ] `JWT_SECRET` set hai (32+ character random string)
- [ ] `NODE_ENV` set hai (`production`)
- [ ] `VITE_API_URL` set hai (`/api`)
- [ ] Sab variables Production environment mein set hain
- [ ] Deploy ke baad test kiya hai

---

## Example: Complete Setup

Vercel Environment Variables section mein ye add karein:

```
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
JWT_SECRET=AbCdEf1234567890XyZ9876543210QrStUvWxYz
NODE_ENV=production
VITE_API_URL=/api
```

**Note:** Real values use karein, example values nahi!

