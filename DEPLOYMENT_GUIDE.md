# Morrow Deployment Guide

## Project Overview
**Morrow** (`/Users/pankh/Downloads/morrow/`) is a Next.js 16 GenAI celebration planner for weddings, birthdays, and community events.

- **Framework**: Next.js 16 with React 19
- **Build**: `npm run build` ✓ (succeeds)
- **API Routes**: `app/api/plan/` and `app/api/copilot/`
- **State**: localStorage (no database required)
- **AI**: Gemini/OpenAI/OpenRouter integration

---

## 🌐 Option 1: Deploy Entire App on Vercel (Recommended)

### Prerequisites
- Vercel account (free at vercel.com)
- GitHub/GitLab/Bitbucket repo or direct deployment

### Method A: Vercel Dashboard (Easiest)

1. **Go to**: https://vercel.com/new
2. **Import Repository**: Connect your GitHub/GitLab account and select the morrow repository
3. **Framework Detection**: Next.js will be auto-detected
4. **Root Directory**: Leave as `/` (root)
5. **Build Command**: `npm run build` (auto-detected)
6. **Output Directory**: `.next` (auto-detected)
7. **Framework Preset**: Next.js
8. **Environment Variables** (add these in Vercel Dashboard > Project > Settings > Environment Variables):
   - `GEMINI_API_KEY` = `AIzaSy.Ab8RN6KZHFFqQtISnoVHHvwQ06Lfc3kw52KHupvxi4OW6wZTBQ`
   - `OPENAI_API_KEY` = (your key if needed)
   - `OPENROUTER_API_KEY` = (your key if needed)
9. **Click Deploy**

### Method B: Vercel CLI

```bash
# Install globally (already done above)
npm install -g vercel

# Login (visit the URL shown)
vercel login

# Deploy
cd /Users/pankh/Downloads/morrow
vercel --prod
```

### Vercel Configuration (`vercel.json`)
Already created in your project root - handles:
- Next.js framework routing
- API route cache control
- Proper header settings

---

## 🏃 Option 2: Separate Vercel Frontend + Render Backend

### Part A: Deploy on Vercel (Frontend)

Follow the Vercel dashboard steps above.

### Part B: Deploy on Render (Backend Node.js)

1. **Push code to GitHub** (or use Render's direct upload)
2. **Create New Service** on render.com:
   - New Web Service → Node.js
   - Repository: your-morrow-repo
   - Build Command: `npm install`
   - Start Command: `node server.js`
3. **Environment Variables** in Render Dashboard:
   - `GEMINI_API_KEY` = `AIzaSy.Ab8RN6KZHFFqQtISnoVHHvwQ06Lfc3kw52KHupvxi4OW6wZTBQ`
   - `OPENAI_API_KEY` = (your key)
   - `OPENROUTER_API_KEY` = (your key)
4. **Deploy**

### Render Configuration Files Created:

**`server.js`** - Express server handling:
- `GET /api/health` - Health check
- `POST /api/plan` - Plan generation (with AI or guided mode)
- `POST /api/copilot` - Chat responses
- Rate limiting (matching Next.js API route behavior)

**`render.yaml`** - Render service definition:
```yaml
services:
  - type: web
    name: morrow-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: GEMINI_API_KEY
        fromSecret: GEMINI_API_KEY
      - key: OPENAI_API_KEY
        fromSecret: OPENAI_API_KEY
      - key: OPENROUTER_API_KEY
        fromSecret: OPENROUTER_API_KEY
    healthCheckPath: /api/health
```

---

## 🔧 Environment Variables Summary

| Variable | Required? | Source |
|----------|-----------|--------|
| `GEMINI_API_KEY` | Yes (for AI features) | `.env.local` has: `AIzaSy.Ab8RN6KZHFFqQtISnoVHHvwQ06Lfc3kw52KHupvxi4OW6wZTBQ` |
| `OPENAI_API_KEY` | Optional | `.env.local` is empty |
| `OPENROUTER_API_KEY` | Optional | `.env.local` is empty |
| `AI_API_KEY` | Optional | `.env.local` is empty |
| `AI_BASE_URL` | Optional | `.env.local` is empty |
| `AI_MODEL` | Optional | `.env.local` is empty |

*Note: Morrow works without AI keys in "guided mode" - all core functionality (plan creation, editing) works with just the frontend.*

---

## 📝 Post-Deployment

### Vercel Deployed App URL
- Format: `https://morrow-ai-event-planner.vercel.app`
- Includes: Frontend + API routes (serverless functions)

### Render Deployed API URL
- Format: `https://morrow-backend.onrender.com`
- Health check: `GET /api/health` returns `{status: 'ok'}`

### API Endpoints
- `POST /api/plan` - Generate event plan from brief
- `POST /api/copilot` - AI chat assistance
- `GET /api/health` - Health check

---

## ⚠️ Important Notes

1. **No Database Required**: All plan data uses browser localStorage. Users can export/import plans as JSON.

2. **AI Features**: Add API keys to enable Gemini/OpenAI creative planning. Without keys, guided mode works fully.

3. **CORS**: The Render backend includes CORS middleware. If your frontend domain differs, add it to the allowlist in `server.js`.

4. **Vercel Advantage**: Single deployment handles both frontend and API routes. No need for separate backend.

5. **Render Advantage**: If you need a persistent Node.js server (WebSockets, long-running tasks), Render works well.

---

## 🚀 Recommendation

**Start with Vercel only** - it's one command and handles everything:
1. Connect your repo to Vercel
2. Add the GEMINI_API_KEY environment variable
3. Click Deploy
4. Your app is live at `*.vercel.app`

If you later need a persistent backend (WebSockets, etc.), add the Render deployment.

---
*Setup complete as of Sat Oct 31 2026. Project: morrow-ai-event-planner v1.0.0*