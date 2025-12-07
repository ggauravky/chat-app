# Deployment Guide

## Architecture

This chat app uses a **split deployment** approach:

- **Frontend**: Deployed to Vercel
- **Backend**: Deployed to Render (supports WebSockets for Socket.io)

## Step 1: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml`
5. Add these environment variables:

   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Your JWT secret key
   - `PORT` - 5001 (or leave blank, Render auto-assigns)
   - `NODE_ENV` - production
   - `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name (if using)
   - `CLOUDINARY_API_KEY` - Your Cloudinary API key (if using)
   - `CLOUDINARY_API_SECRET` - Your Cloudinary API secret (if using)
   - `FRONTEND_URL` - Your Vercel frontend URL (add after step 2)

6. Click "Create Web Service"
7. Wait for deployment to complete
8. **Copy your backend URL** (e.g., `https://chat-app-backend.onrender.com`)

## Step 2: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will automatically detect the configuration
5. **Before deploying**, add this environment variable:

   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.onrender.com/api` (use the URL from Step 1)

6. Click "Deploy"
7. Wait for deployment to complete
8. **Copy your frontend URL** (e.g., `https://chat-app.vercel.app`)

## Step 3: Update Backend CORS

1. Go back to Render dashboard
2. Go to your backend service → Environment
3. Add or update environment variable:
   - Key: `FRONTEND_URL`
   - Value: Your Vercel frontend URL from Step 2
4. Save and wait for auto-redeploy

## Done! 🎉

Your chat app is now deployed with:

- ✅ Real-time messaging via Socket.io
- ✅ Separate frontend and backend
- ✅ Proper CORS configuration

## Local Development

For local development, no environment variables are needed. Just run:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The app will use `http://localhost:5001` for the backend automatically.
