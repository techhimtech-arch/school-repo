# Vercel Login & Deploy Guide (Browser Method)

## Problem: CLI Login nahi ho raha

Agar `vercel login` command mein error aa raha hai, to browser se directly deploy karein.

## Solution: Vercel Dashboard se Deploy

### Step 1: Browser mein Vercel par Login

1. Browser kholen: [https://vercel.com/login](https://vercel.com/login)
2. Apna account se login karein:
   - GitHub account se (recommended)
   - Email/Password se
   - Google account se

### Step 2: Project Import karein

1. Vercel Dashboard par jayein: [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. **"Add New..."** button click karein
3. **"Project"** select karein
4. Apni Git repository select karein:
   - GitHub repository
   - GitLab repository  
   - Bitbucket repository

### Step 3: Project Configuration

**Important Settings:**

- **Framework Preset:** "Other" ya "Vite" select karein
- **Root Directory:** Default (root) rakhein - **CHANGE MAT KAREIN**
- **Build Command:** 
  ```
  cd progress-key-app-main && npm install && npm run build
  ```
- **Output Directory:** 
  ```
  progress-key-app-main/dist
  ```
- **Install Command:**
  ```
  cd school-backend && npm install && cd ../progress-key-app-main && npm install
  ```

**Note:** Agar `vercel.json` file hai, to ye settings automatically detect ho jayengi.

### Step 4: Environment Variables Add karein

Deploy karne se pehle, Project Settings → Environment Variables mein ye add karein:

```
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_random_string_here
NODE_ENV=production
VITE_API_URL=/api
```

**JWT_SECRET generate karne ke liye:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 5: Deploy

1. **"Deploy"** button click karein
2. Build complete hone ka wait karein
3. Deployment URL mil jayega

---

## Alternative: CLI Login Fix

Agar CLI se login karna hai, to ye try karein:

### Method 1: Manual Browser Login

1. `vercel login` command run karein
2. Jo URL mile (jaise `https://vercel.com/oauth/device?user_code=XXXX-XXXX`)
3. Browser mein manually open karein
4. Code enter karein
5. Authorize karein

### Method 2: Network/Firewall Check

1. Antivirus/Firewall temporarily disable karein
2. VPN off karein (agar use kar rahe hain)
3. Phir se `vercel login` try karein

### Method 3: Token se Login

1. Vercel Dashboard → Settings → Tokens
2. New token create karein
3. Command run karein:
   ```bash
   vercel login --token YOUR_TOKEN_HERE
   ```

---

## Quick Checklist

- [ ] Browser mein Vercel account login hai
- [ ] Git repository Vercel se connected hai
- [ ] Root Directory correct hai (root folder)
- [ ] Build Command set hai
- [ ] Output Directory set hai (`progress-key-app-main/dist`)
- [ ] Environment Variables add kiye hain
- [ ] Database setup ho chuka hai

---

## Troubleshooting

### "Build Failed" Error

1. Build logs check karein
2. Node version verify karein (Node 18+ required)
3. Dependencies check karein

### "NOT_FOUND" Error

1. `vercel.json` file check karein
2. Routes configuration verify karein
3. Output directory path correct hai ya nahi

### API Not Working

1. Environment variables check karein
2. Database connection verify karein
3. API routes test karein

---

## Support

Agar phir bhi issue ho, to:
1. Vercel deployment logs check karein
2. Error message share karein
3. Network connectivity verify karein

