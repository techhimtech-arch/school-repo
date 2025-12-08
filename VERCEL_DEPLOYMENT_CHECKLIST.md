# Vercel Deployment Checklist (हिंदी/English)

## ✅ GitHub पर Code Push हो गया है!

अब Vercel पर deploy करने के लिए ये steps follow करें:

## Step 1: Vercel Project Import करें

1. [Vercel Dashboard](https://vercel.com/dashboard) पर जाएं
2. **"Add New..."** → **"Project"** click करें
3. अपना GitHub repository select करें
4. **"Import"** click करें

## Step 2: Project Settings Configure करें

Vercel automatically detect करेगा, लेकिन verify करें:

- **Framework Preset:** "Other" या "Vite" 
- **Root Directory:** `.` (root)
- **Build Command:** `cd progress-key-app-main && npm install && npm run build`
- **Output Directory:** `progress-key-app-main/dist`
- **Install Command:** `cd school-backend && npm install && cd ../progress-key-app-main && npm install`

## Step 3: Environment Variables Add करें ⚠️ IMPORTANT!

**Project Settings** → **Environment Variables** में ये add करें:

### Backend Variables:
```
DATABASE_URL = your_postgresql_connection_string
JWT_SECRET = your_secure_random_string (कम से कम 32 characters)
NODE_ENV = production
```

### Frontend Variables:
```
VITE_API_URL = /api
```

**Note:** 
- `DATABASE_URL` PostgreSQL connection string होना चाहिए
- `JWT_SECRET` के लिए strong random string use करें (example: `openssl rand -base64 32`)

## Step 4: Database Setup करें

### Option A: Vercel Postgres (Recommended)
1. Vercel Dashboard → **Storage** → **Create Database** → **Postgres**
2. Database create करें
3. Connection string copy करें और `DATABASE_URL` में add करें
4. Database schema run करें (next step देखें)

### Option B: External Database
- Supabase, Railway, Neon, या कोई भी PostgreSQL provider use कर सकते हैं
- Connection string लें और `DATABASE_URL` में add करें

### Database Schema Run करें:
1. Database में connect करें
2. `school-backend/src/sql/schema.sql` file का content run करें
3. या database migration tool use करें

## Step 5: Deploy करें! 🚀

1. **"Deploy"** button click करें
2. Build process wait करें (2-5 minutes)
3. Deployment complete होने पर URL मिलेगा

## Step 6: Verify Deployment ✅

### Frontend Check:
- अपने Vercel URL पर जाएं
- Login page दिखना चाहिए

### Backend API Check:
- `https://your-app.vercel.app/api/` पर जाएं
- Response: `{"message":"School Progress Tracking System API","status":"running"}`

### Login Test:
Default credentials से login करें:
- **Super Admin:** `superadmin@gmail.com` / `abc123`
- **Class Teacher:** `classteacher@gmail.com` / `abc123`
- **Subject Teacher:** `subjectteacher@gmail.com` / `abc123`
- **Parent/Student:** `parentchild@gmail.com` / `abc123`

## Troubleshooting (अगर कोई Problem हो)

### Build Fail हो रहा है:
1. **Deployments** tab → Failed deployment click करें
2. Build logs check करें
3. Common issues:
   - Environment variables missing
   - Database connection error
   - Node version issue (Node 18+ required)

### API नहीं काम कर रहा:
1. Vercel Function Logs check करें
2. `DATABASE_URL` verify करें
3. Database में connection allow है या नहीं check करें

### Frontend API calls fail हो रहे:
1. Browser DevTools → Network tab open करें
2. API calls `/api/*` पर जा रहे हैं या नहीं check करें
3. `VITE_API_URL` environment variable `/api` set है या नहीं verify करें

## Important Notes ⚠️

1. **Default Credentials Change करें:**
   - Production में `school-backend/src/config/users.js` में credentials change करें
   - Redeploy करें

2. **Security:**
   - Strong `JWT_SECRET` use करें
   - Database credentials secure रखें
   - CORS settings review करें (अगर needed हो)

3. **Database:**
   - Regular backups setup करें
   - Connection pooling enable करें (अगर possible हो)

## Success! 🎉

अगर सब कुछ ठीक है तो:
- ✅ Frontend load हो रहा है
- ✅ API calls काम कर रहे हैं
- ✅ Login successful हो रहा है
- ✅ Dashboard load हो रहा है

## Next Steps:

1. Custom domain add करें (optional)
2. Monitoring setup करें
3. Error tracking enable करें
4. Performance optimization करें

---

**Need Help?** 
- Vercel logs check करें
- GitHub repository में issue create करें
- Documentation files देखें (README.md, DEPLOYMENT.md)

**Good Luck! 🚀**

