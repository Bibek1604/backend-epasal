# ⚡ QUICK FIX - 2 MINUTES

## The Error (What You Saw)
```
Error: Cannot find module '/opt/render/project/src/dist/server.js'
```

## The Cause
❌ Render only ran `npm install`, not `npm run build`
❌ So dist/server.js was never created

## The Fix (DO THIS NOW)

### Step 1: Go to Render Dashboard
```
https://render.com/dashboard
```

### Step 2: Click Your Service
```
epasaley-backend
```

### Step 3: Go to Settings
```
Click: Settings → Build & Deploy
```

### Step 4: Update Build Command
**Current:** `npm install`
**Change to:** `npm ci && npm run build`

### Step 5: Update Start Command
**Current:** `node dist/server.js` (or `npm start`)
**Confirm:** `node dist/server.js`

### Step 6: Click Deploy
```
Click: Manual Deploy → Deploy latest commit
```

### Step 7: Wait and Monitor
- Watch logs for build completion
- Should say: "Build successful 🎉"
- Then: "Service is live" ✅

---

## What's Happening After Fix

```
1. npm ci              → Install dependencies cleanly
2. npm run build       → Run: tsc (TypeScript compiler)
3. tsc                 → Compiles src/ → dist/
4. Creates: dist/server.js ✅
5. node dist/server.js → Server starts!
```

---

## Test It Worked

After deployment succeeds, run:

```bash
curl https://epasaley-backend-xxxx.onrender.com/api/v1/health
```

Should return:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2025-11-25..."
}
```

---

## If Still Broken

1. Check Render **Logs** tab - look for errors
2. Verify **Environment** variables are all set
3. Check Build Command shows: `npm ci && npm run build`
4. Check Start Command shows: `node dist/server.js`
5. Click **Manual Deploy** again

---

**That's it! Deploy now! 🚀**
