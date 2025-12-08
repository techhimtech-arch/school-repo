# Deployment Guide for Vercel

This guide will help you deploy the School Management System to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A PostgreSQL database (you can use Vercel Postgres or any external provider)
3. Git repository (GitHub, GitLab, or Bitbucket)

## Step-by-Step Deployment

### 1. Prepare Your Repository

Make sure all your code is committed and pushed to your Git repository.

### 2. Set Up Database

#### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database → Postgres
3. Create a new Postgres database
4. Note the connection string (will be used as `DATABASE_URL`)

#### Option B: External PostgreSQL
- Use any PostgreSQL provider (e.g., Supabase, Railway, Neon, etc.)
- Get your connection string

### 3. Run Database Migrations

Before deploying, you need to set up your database schema:

1. Connect to your database
2. Run the SQL script from `school-backend/src/sql/schema.sql`
3. Or use a database migration tool

### 4. Deploy to Vercel

#### Method 1: Via Vercel Dashboard

1. **Import Project:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your Git repository

2. **Configure Project:**
   - Framework Preset: Leave as "Other" or "Vite"
   - Root Directory: Leave as default (root)
   - Build Command: `cd progress-key-app-main && npm install && npm run build`
   - Output Directory: `progress-key-app-main/dist`
   - Install Command: `cd school-backend && npm install && cd ../progress-key-app-main && npm install`

3. **Set Environment Variables:**
   Go to Project Settings → Environment Variables and add:
   
   ```
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_secure_random_string_here
   NODE_ENV=production
   VITE_API_URL=/api
   ```
   
   **Important:** 
   - Generate a strong `JWT_SECRET` (e.g., use `openssl rand -base64 32`)
   - Set `VITE_API_URL=/api` for production (frontend will use relative API paths)

4. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete

#### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NODE_ENV
vercel env add VITE_API_URL

# Deploy to production
vercel --prod
```

### 5. Verify Deployment

After deployment:

1. **Check Frontend:**
   - Visit your Vercel deployment URL
   - You should see the login page

2. **Check Backend API:**
   - Visit `https://your-domain.vercel.app/api/`
   - You should see: `{"message":"School Progress Tracking System API","status":"running"}`

3. **Test Login:**
   - Use default credentials:
     - Super Admin: `superadmin@gmail.com` / `abc123`
     - Class Teacher: `classteacher@gmail.com` / `abc123`
     - Subject Teacher: `subjectteacher@gmail.com` / `abc123`
     - Parent/Student: `parentchild@gmail.com` / `abc123`

### 6. Post-Deployment Configuration

1. **Update Default Credentials:**
   - Change default user credentials in `school-backend/src/config/users.js`
   - Redeploy after changes

2. **Configure CORS (if needed):**
   - The backend already has CORS enabled
   - If you need to restrict origins, update `school-backend/src/server.js`

3. **Set Up Custom Domain (Optional):**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow Vercel's DNS configuration instructions

## Troubleshooting

### Build Fails

1. **Check Build Logs:**
   - Go to your deployment → "Deployments" tab
   - Click on the failed deployment
   - Review the build logs

2. **Common Issues:**
   - Missing environment variables
   - Database connection issues
   - Node version mismatch (ensure Node 18+)

### API Not Working

1. **Check API Routes:**
   - Verify `/api/*` routes are working
   - Check Vercel function logs

2. **Database Connection:**
   - Verify `DATABASE_URL` is correct
   - Check if database allows connections from Vercel IPs

### Frontend Can't Connect to API

1. **Check `VITE_API_URL`:**
   - Should be `/api` for production
   - For local dev, it should be `http://localhost:4000/api`

2. **Check Network Tab:**
   - Open browser DevTools → Network
   - Verify API calls are going to `/api/*`

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname` |
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key-here` |
| `NODE_ENV` | Environment mode | `production` |
| `VITE_API_URL` | Frontend API base URL | `/api` |

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review the README.md for project structure
3. Verify all environment variables are set correctly
4. Check database connectivity

## Next Steps

- Set up automated deployments from Git
- Configure monitoring and error tracking
- Set up backups for your database
- Implement proper authentication and security measures

