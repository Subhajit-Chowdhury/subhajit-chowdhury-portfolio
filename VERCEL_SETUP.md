# Portfolio Assistant - Setup Guide

## What Changed

I've converted your portfolio assistant from a **local Express backend** to **Vercel Serverless Functions**, so it works seamlessly in production without requiring a separate backend server.

### Changes Made:

1. **Created `/api/assistant.ts`** - Vercel serverless function that replaces the Express backend
   - Handles `/api/assistant` POST requests
   - Builds knowledge base from your portfolio.json and resume PDF
   - Uses Gemini AI for embeddings and generation
   - Works in both production (Vercel) and local development

2. **Updated `src/lib/assistant-api.ts`** - Frontend API client
   - Changed from `http://localhost:4000` to relative URL `/api/assistant`
   - Works automatically in both local dev and production
   - Simplified error handling

3. **Created `vercel.json`** - Vercel configuration
   - Configures serverless function memory and timeout
   - Sets up environment variables for Vercel

4. **Updated `.env.example`** - Simplified environment setup
   - Clearer documentation for GEMINI_API_KEY setup

---

## Setup Instructions

### For Vercel Production Deployment

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Add Vercel serverless functions for assistant API"
   git push origin main
   ```

2. **Add Environment Variable in Vercel Dashboard**:
   - Go to https://vercel.com/dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add a new variable:
     - **Name**: `GEMINI_API_KEY`
     - **Value**: Your Gemini API key (from https://aistudio.google.com/apikey)
     - **Environments**: Select all (Production, Preview, Development)
   - Save

3. **Redeploy** (or just push again):
   ```bash
   git push origin main
   ```

4. **Test the chat** on your live site: https://subhajit-chowdhury-portfolio.vercel.app/

---

### For Local Development

1. **Create `.env.local`** in project root:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

2. **Run the frontend**:
   ```bash
   npm run dev
   ```
   - Frontend runs on `http://localhost:3000`

3. **Test the chat**:
   - Open the portfolio in your browser
   - Click the chat button
   - Try asking a question about your experience

**Note**: You no longer need the separate `npm run server` backend. The `/api/assistant` endpoint is handled automatically by your local Vite dev server (which proxies to the serverless function simulation).

---

## How It Works

### Production (Vercel)
```
User Browser
    ↓
Chat Component (/src/components/AIChat.tsx)
    ↓ (POST /api/assistant)
Vercel Serverless Function (/api/assistant.ts)
    ↓
Gemini AI APIs (for embeddings & generation)
    ↓
Response back to chat
```

### Local Development
```
User Browser (localhost:3000)
    ↓
Chat Component (/src/components/AIChat.tsx)
    ↓ (POST /api/assistant)
Local API handler (Vite dev server)
    ↓
Gemini AI APIs (for embeddings & generation)
    ↓
Response back to chat
```

---

## Troubleshooting

### Chat shows "Configuration Error" in production

**Cause**: GEMINI_API_KEY not set in Vercel environment

**Fix**:
1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Verify `GEMINI_API_KEY` is set correctly
3. Redeploy: `git push origin main`

### Chat works locally but not in production

**Cause**: Possible API key difference or Vercel cache

**Fix**:
1. Verify GEMINI_API_KEY in Vercel is correct
2. Clear Vercel cache and redeploy:
   ```bash
   git push origin main
   ```
3. Wait 2-3 minutes for deployment to complete

### "Failed to fetch" error

**Cause**: API endpoint not responding

**Fix**:
1. Check Vercel deployment status (should show "Ready")
2. Check browser console for full error details
3. Verify GEMINI_API_KEY is valid (test at https://aistudio.google.com)

---

## What You Can Delete (Optional)

The old backend code is no longer used, but you can keep it for reference:
- `server/index.ts` - Old Express backend (optional to keep)
- `server/assistant-store.json` - Local knowledge base cache (optional to keep)

To clean up:
```bash
rm -rf server/
```

---

## Summary of Benefits

✅ **No separate backend server needed** - runs entirely on Vercel  
✅ **Works in production without localhost:4000** - automatic Vercel functions  
✅ **Simple environment setup** - just GEMINI_API_KEY  
✅ **Scales automatically** - Vercel handles server infrastructure  
✅ **Same functionality** - knowledge base building, embeddings, AI generation all work the same  

---

## Support

If you encounter issues:
1. Check Vercel deployment logs: https://vercel.com/dashboard/[project]/deployments
2. Check browser console for errors (F12)
3. Verify GEMINI_API_KEY is valid and set in Vercel
4. Ensure `api/assistant.ts` file exists in your repo

---

**Version**: 1.0  
**Updated**: 2026-06-19  
**Deployment**: Vercel Serverless Functions
