# CareerTrack MERN Stack — Live Vercel Deployment Guide

This guide explains how to deploy both the **Frontend** and **Backend** of the CareerTrack MERN project to Vercel.

---

## Prerequisites

1. **GitHub Account**: Push your latest code changes to your GitHub repository.
2. **Vercel Account**: Sign up or log in at [vercel.com](https://vercel.com).
3. **MongoDB Atlas Account**: A cloud database connection URI (free tier M0):
   * Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
   * Create a free cluster.
   * Under **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere so Vercel lambdas can connect).
   * Under **Database Access**, create a user (e.g. `careeradmin`) and password.
   * Click **Connect** -> **Connect your application** -> Copy connection URI:
     `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/careertrack?retryWrites=true&w=majority`

---

## Step 1: Deploy Backend to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard) and click **"Add New..."** -> **"Project"**.
2. Select your GitHub repository (`CareerTrack_Major_project`).
3. In the project configuration screen:
   * **Project Name**: `careertrack-backend` (or your choice)
   * **Root Directory**: Click *Edit* and select **`backend`**
   * **Framework Preset**: Select **`Other`**
4. Expand **Environment Variables** and add the following keys:
   | Key | Example Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/careertrack?retryWrites=true&w=majority` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | `super_secret_jwt_key_careertrack_2026_recruitment_auth` | Auth secret key |
   | `JWT_EXPIRES_IN` | `7d` | Token expiry |
   | `EMAIL_USER` | `your-email@gmail.com` | Email user for notifications |
   | `EMAIL_PASS` | `your-16-char-google-app-password` | Gmail App Password |
   | `ADMIN_EMAIL` | `admin@careertrack.com` | Receiver email for alerts |
   | `CLIENT_URL` | `*` (or your frontend Vercel URL) | Allowed CORS domain |
5. Click **"Deploy"**.
6. When deployment finishes, copy your live backend URL (e.g., `https://careertrack-backend.vercel.app`).
   * Test the health check endpoint: `https://careertrack-backend.vercel.app/api/health`

---

## Step 2: Deploy Frontend to Vercel

1. Go back to [vercel.com/dashboard](https://vercel.com/dashboard) and click **"Add New..."** -> **"Project"**.
2. Select the same GitHub repository.
3. In the project configuration screen:
   * **Project Name**: `careertrack-frontend` (or your choice)
   * **Root Directory**: Click *Edit* and select **`frontend`**
   * **Framework Preset**: **`Vite`** (detected automatically)
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://careertrack-backend.vercel.app` *(Your Backend URL from Step 1, without trailing slash)* |
5. Click **"Deploy"**.
6. When deployment finishes, visit your live website (e.g., `https://careertrack-frontend.vercel.app`).

---

## Verification & Sanity Checks

1. **Public Job Search**: Open home page `https://<frontend-url>` and verify job cards load.
2. **Single Job View & Apply**: Click any job, test opening modal and submitting an application.
3. **SPA Routing**: Refresh `/admin/login` or `/contact` to confirm no 404 errors (handled by `frontend/vercel.json`).
4. **Admin Login**:
   * Navigate to `/admin/login`
   * Use Quick Fill or credentials (`admin@careertrack.com` / `AdminPassword123!`)
   * Check stats and manage jobs/applications.

