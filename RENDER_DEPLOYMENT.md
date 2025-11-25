# 🚀 Render Deployment Guide

## Prerequisites

1. **GitHub Repository** - Push your code to GitHub
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **MongoDB Atlas** - MongoDB database (or any MongoDB service)
4. **Cloudinary Account** - For image uploads

---

## Step 1: Prepare Your Repository

```bash
# Make sure all files are pushed to GitHub
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

**Important:** Make sure your `.env` file is **NOT** in git (it should be in `.gitignore` ✅)

---

## Step 2: Set Up MongoDB Atlas (Free Tier)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new project and cluster (select free tier)
4. Click "Connect" and get your connection string
5. Replace `<password>` and `<username>` with your credentials
6. Your URI will look like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/epasaley?retryWrites=true&w=majority
   ```

---

## Step 3: Set Up Cloudinary (Free Tier)

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free account
3. Go to Dashboard → Settings → API Keys
4. Copy:
   - Cloud Name
   - API Key
   - API Secret

---

## Step 4: Deploy on Render

### Option A: Using render.yaml (Recommended)

1. Go to [render.com/dashboard](https://render.com/dashboard)
2. Click **"New +"** → **"Web Service"**
3. Select **"Deploy an existing repository"**
4. Authorize GitHub and select your repository
5. Render will auto-detect `render.yaml`
6. Click **"Create Web Service"**

### Option B: Manual Setup

1. Go to [render.com/dashboard](https://render.com/dashboard)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Fill in the form:
   - **Name:** `epasaley-backend`
   - **Runtime:** `Node`
   - **Region:** `Oregon` (or closest to you)
   - **Branch:** `main`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (or Paid if you want better performance)

---

## Step 5: Add Environment Variables in Render

After creating the service, go to **Settings** → **Environment** and add:

```
NODE_ENV=production
PORT=5000
MONGODB_URI_PROD=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/epasaley?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-min-32-chars-long
JWT_ADMIN_SECRET=your-admin-secret-min-32-chars-long
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

⚠️ **Important:** Use strong, random values for JWT secrets. Generate them:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 6: Verify Deployment

1. Wait for build to complete (usually 2-5 minutes)
2. Once deployed, you'll get a URL like: `https://epasaley-backend.onrender.com`
3. Test your API:
   ```bash
   curl https://epasaley-backend.onrender.com/
   ```
   Should return:
   ```json
   {
     "success": true,
     "message": "Epasaley E-Commerce API",
     "version": "1.0.0",
     "documentation": "/api-docs"
   }
   ```

4. View Swagger docs: `https://epasaley-backend.onrender.com/api-docs`
5. Health check: `https://epasaley-backend.onrender.com/api/v1/health`

---

## Step 7: Connect Frontend

Update your frontend `.env` to:
```
REACT_APP_API_URL=https://epasaley-backend.onrender.com/api/v1
```

---

## Important Notes

### Free Tier Limitations
- ⏸️ **Spins down after 15 minutes of inactivity** (first request takes 30-50 seconds)
- 📊 Limited to 100GB bandwidth/month
- 💾 0.5GB RAM

**Solution:** Upgrade to Paid tier for production ($7/month minimum)

### Database Connection
- Use `MONGODB_URI_PROD` for production
- Make sure MongoDB Atlas allows Render IP (it auto-detects from anywhere)

### Logs & Debugging
- View logs in Render dashboard → **Logs** tab
- Real-time monitoring available

---

## Troubleshooting

### Build fails with "Cannot find module"
```
Solution: Clear build cache
1. Go to Settings → Build & Deploy
2. Click "Clear build cache"
3. Click "Deploy" again
```

### Application crashes after deploy
```
Check logs for errors:
1. Dashboard → Logs
2. Look for error messages
3. Verify all env variables are set correctly
```

### MongoDB connection refused
```
1. Verify connection string is correct
2. Check MongoDB Atlas whitelist includes 0.0.0.0/0 (Render IP)
3. Ensure database name matches in URI
```

### CORS errors
```
Update CORS_ORIGIN env variable to your frontend URL
```

---

## Cost Breakdown

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Render** | $0 | $7+/month |
| **MongoDB Atlas** | $0 (512MB) | $9+/month |
| **Cloudinary** | $0 (25GB) | $99+/month |
| **Total** | Free | ~$16+/month |

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Set up MongoDB Atlas
3. ✅ Set up Cloudinary
4. ✅ Deploy on Render
5. ✅ Add environment variables
6. ✅ Test the API
7. ✅ Connect frontend

Your backend is now **live and ready for production!** 🎉
