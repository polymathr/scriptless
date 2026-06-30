# 🚀 Deployment Guide — ScriptLess v3.0

> Your complete step-by-step guide to go from local code to live production — **100% free tier**.

---

## ✅ What You Need Before Starting

1. **GitHub account** (you have this as `polymathr`)
2. **Gemini API Key** — get it free at [aistudio.google.com](https://aistudio.google.com)
3. **Render account** — free at [render.com](https://render.com)
4. **Vercel account** — free at [vercel.com](https://vercel.com)
5. **Expo account** — free at [expo.dev](https://expo.dev) (for mobile builds)

---

## Step 1: Push Code to GitHub (60 seconds)

Your code is already committed locally. Run these commands in Git Bash:

```bash
cd /d/scriptless-v2

# Option A: Create the repo via GitHub CLI (if installed)
gh repo create scriptless --public --source=. --push

# Option B: Manual (if you don't have gh CLI)
# 1. Go to https://github.com/new
# 2. Name it "scriptless"
# 3. Click "Create repository"
# 4. Then run:
git remote add origin https://github.com/polymathr/scriptless.git
git push -u origin main
```

---

## Step 2: Deploy Backend to Render (Free Tier)

### Option A: Blueprint (Fastest — 2 minutes)

1. Go to [dashboard.render.com/blueprints](https://dashboard.render.com/blueprints)
2. Click **"New Blueprint Instance"**
3. Connect your `polymathr/scriptless` GitHub repo
4. Render will automatically create:
   - Web service (backend)
   - PostgreSQL database
   - Static site (frontend)
5. Add environment variables in the Render dashboard:
   - `GEMINI_API_KEY` = your key from aistudio.google.com
   - `JWT_SECRET` = generate a random 64-char string
6. Click **"Apply"** and wait for deploy

### Option B: Manual (More Control)

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. **New Web Service** → Connect `polymathr/scriptless` repo
3. Set root directory: `scriptless/server`
4. Build command: `npm install && npx prisma generate && npm run build`
5. Start command: `npm start`
6. Add environment variables (see `.env.example`)
7. **New PostgreSQL** → Name it `scriptless-db`
8. Copy the internal connection string to `DATABASE_URL`

**Your API URL will be:** `https://scriptless-server.onrender.com`

---

## Step 3: Deploy Frontend to Vercel (Free Tier)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `polymathr/scriptless`
3. Set framework preset to **Vite**
4. Set root directory: `scriptless/web`
5. Add environment variable:
   - `VITE_API_URL` = `https://scriptless-server.onrender.com` (your Render API URL)
6. Click **Deploy**

**Your web URL will be:** `https://scriptless-xxx.vercel.app`

---

## Step 4: Update Mobile App

In `scriptless/mobile-src/App.js`, change the API base URL:

```javascript
const API_BASE = 'https://scriptless-server.onrender.com'; // your Render URL
```

Then rebuild and publish:

```bash
cd scriptless/mobile-src
npm install
npx expo start
# Or build for stores:
# eas build --platform android
# eas build --platform ios
```

---

## Step 5: Run Database Migrations

After Render deploys, you need to run Prisma migrations once:

```bash
# SSH into your Render web service via dashboard
# Or run locally pointing to your Render DB:
cd scriptless/server
DATABASE_URL="your-render-db-url" npx prisma migrate deploy
```

Or use the Render dashboard **Shell** tab:
```bash
npx prisma migrate deploy
```

---

## 🎯 What You Get (All Free)

| Service | Free Tier Limit | Your Cost |
|---------|----------------|-----------|
| **Render Web** | 750 hours/month | $0 |
| **Render DB** | 90 days / 1GB | $0 |
| **Vercel** | 100GB bandwidth | $0 |
| **Expo** | Unlimited dev builds | $0 |
| **Gemini API** | 60 requests/minute | $0 |
| **GitHub** | Unlimited public repos | $0 |

---

## 🔧 Post-Deploy Checklist

- [ ] Backend health check: `https://your-api.onrender.com/api/health`
- [ ] Frontend loads: `https://your-app.vercel.app`
- [ ] Can register/login on the web app
- [ ] Can create a workflow via AI prompt
- [ ] Can execute the workflow
- [ ] Mobile app connects to the API
- [ ] GitHub Actions CI passes (check repo → Actions tab)

---

## 🆘 Troubleshooting

### "Server offline" badge
→ Make sure `VITE_API_URL` in Vercel matches your Render API URL exactly

### "Database connection failed"
→ Check `DATABASE_URL` in Render. Make sure it uses the **internal** connection string (not external)

### "CORS error"
→ In `scriptless/server/src/server.ts`, update the CORS origin to your Vercel domain

### "Gemini API error"
→ Verify `GEMINI_API_KEY` is set correctly in Render environment variables

---

## 🎉 Next Steps

Once deployed, you can:
1. Share your web app URL with friends
2. Use the mobile app on your phone
3. Add more workflow nodes (Slack, Discord, Notion, etc.)
4. Set up cron scheduling with `node-cron`
5. Add OAuth triggers (Gmail, Calendar)
6. Build a template marketplace

**Total cost: $0. Infrastructure: production-grade. You're live.** ⚡