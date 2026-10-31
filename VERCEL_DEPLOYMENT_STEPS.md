# Morrow - Vercel Deployment (Web Dashboard Method)

Since the Vercel CLI is having authentication issues, here's the dashboard-based deployment that works every time:

## Step 1: Prepare Your Repository

### Option A: GitHub/GitLab/Bitbucket
1. Push your morrow project to a Git repository
2. Go to [vercel.com/new](https://vercel.com/new)
3. Click "Import" and connect your Git provider
4. Select the morrow repository

### Option B: Direct Upload (No Git Required)
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Add New Project" → "Deploy"
3. Upload the project folder as a ZIP
4-or- drag and drop the folder

## Step 2: Vercel Project Configuration

### Automatic Detection (Next.js)
Vercel will auto-detect:
- **Framework**: Next.js 16
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Root Directory**: `/` (root)

### Manual Configuration (if needed)
If auto-detection fails, set:
- **Framework Preset**: Next.js
- **Build and Output Settings**:
  - Root Directory: `.`
  - Build Command: `npm run build`
  - Output Directory: `.next`

## Step 3: Add Environment Variables

Go to **Project Settings** → **Environment Variables** → **Add Variable**:

| Variable | Value | Notes |
|----------|-------|-------|
| `GEMINI_API_KEY` | `AIzaSy.Ab8RN6KZHFFqQtISnoVHHvwQ06Lfc3kw52KHupvxi4OW6wZTBQ` | Already in `.env.local` |
| `OPENAI_API_KEY` | (your key) | Optional - app works without it |
| `OPENROUTER_API_KEY` | (your key) | Optional - app works without it |

**Important**: Click "Save" after adding each variable.

## Step 4: Deploy

1. Go back to the **Dashboard**
2. Click **Deploy**
3. Wait 1-2 minutes for build to complete
4. Once finished, click "Visit" to see your live app

## Step 5: Verify Deployment

Your app URL will look like: `https://morrow-ai-event-planner.vercel.app`

Test these endpoints:
- `https://morrow-ai-event-planner.vercel.app/` - Homepage
- `https://morrow-ai-event-planner.vercel.app/api/health` - Backend health (if using separate backend)
- Create a plan - test the AI features

## 🎉 You're Live!

Once deployed, share your Vercel URL. The app includes:
- ✅ Event planning with AI
- ✅ Guided mode (works without API keys)
- ✅ Copilot chat assistance
- ✅ Plan export/import as JSON
- ✅ Rate-limited API routes

## 🔄 Future: Add Render Backend

If you later need a persistent backend (WebSockets, long-running tasks):

1. Go to [render.com](https://render.com) and create an account
2. New Web Service → Node.js
3. Connect same repo or upload server.js + render.yaml
4. Set start command: `node server.js`
5. Add same environment variables
6. Deploy

Your Render API will be at: `https://morrow-backend.onrender.com`

---
*Setup complete for Morrow v1.0.0 - GenAI celebration planner*