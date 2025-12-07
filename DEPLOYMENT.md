# Deployment Guide - Render

## Overview

This chat app is deployed as a **single service on Render** with:

- Backend (Node.js + Express + Socket.io)
- Frontend (React) served as static files from the backend

## Deploy to Render

### Step 1: Push Your Code to GitHub

```bash
git add .
git commit -m "Configure for Render deployment"
git push
```

### Step 2: Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository (`chat-app`)
4. Render will **automatically detect** the `render.yaml` file
5. Click **"Create Web Service"**

### Step 3: Add Environment Variables

In your Render service settings, add these environment variables:

**Required:**

- `MONGODB_URI` - Your MongoDB connection string
  - Example: `mongodb+srv://username:password@cluster.mongodb.net/chatapp`
- `JWT_SECRET` - Any random secret string
  - Example: `your-super-secret-jwt-key-12345`

**Optional (if using Cloudinary for file uploads):**

- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

**Auto-set by Render:**

- `NODE_ENV` - Already set to `production` in `render.yaml`
- `PORT` - Automatically assigned by Render

### Step 4: Deploy!

1. Click **"Manual Deploy"** → **"Deploy latest commit"** (or wait for auto-deploy)
2. Wait 5-10 minutes for the build to complete
3. Once deployed, click on your service URL (e.g., `https://chat-app-xxxx.onrender.com`)

## ✅ What Works on Render

- ✅ **Real-time messaging** - Socket.io fully supported
- ✅ **Online/Offline status** - WebSocket connections work perfectly
- ✅ **File uploads** - Cloudinary integration works
- ✅ **Authentication** - JWT cookies and sessions
- ✅ **All chat features** - Everything works as expected!

## Local Development

For local development:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The app will automatically use:

- Backend: `http://localhost:5001`
- Frontend: `http://localhost:5173`

## Troubleshooting

### Build fails?

- Check that all environment variables are set correctly
- Verify MongoDB connection string is valid
- Check Render build logs for specific errors

### Can't connect to database?

- Make sure MongoDB allows connections from `0.0.0.0/0` (all IPs)
- Verify your MongoDB connection string includes the database name

### 404 errors?

- This shouldn't happen with Render configuration
- If it does, check that the frontend dist folder was created during build

## Why Render?

Unlike Vercel, Render supports:

- Persistent WebSocket connections (required for Socket.io)
- Long-running processes (perfect for chat servers)
- Full Node.js server capabilities

Your chat app needs these features for real-time messaging to work properly!
