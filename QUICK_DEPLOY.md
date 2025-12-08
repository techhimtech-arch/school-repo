# Quick Deploy Guide (5 Minutes) ⚡

## GitHub पर Code Push हो गया है? ✅

अब बस ये करें:

## 1. Vercel पर Import करें
- https://vercel.com/dashboard → New Project → GitHub repo select करें

## 2. Environment Variables Add करें (IMPORTANT!)

Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL = postgresql://user:pass@host:5432/dbname
JWT_SECRET = any-random-32-character-string
NODE_ENV = production
VITE_API_URL = /api
```

## 3. Database Setup
- Vercel Postgres create करें (Storage → Create Database)
- या external PostgreSQL use करें
- `school-backend/src/sql/schema.sql` run करें

## 4. Deploy!
- "Deploy" button click करें
- Wait करें (2-5 min)
- Done! 🎉

## Test करें:
- Frontend: `https://your-app.vercel.app`
- API: `https://your-app.vercel.app/api/`
- Login: `superadmin@gmail.com` / `abc123`

## अगर Error आए:
1. Build logs check करें
2. Environment variables verify करें
3. Database connection check करें

**That's it! 🚀**

