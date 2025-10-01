# Swipe AI Interview Assistant

A full-stack AI-powered mock interview platform with an Interviewee chat workflow and an Interviewer dashboard. Production-ready UI (Google Meet inspired), persistent state, resume parsing (PDF/DOCX), AI question generation and scoring, re-attempt controls, and a detailed results page.

- Frontend: React (Vite) + Ant Design + Redux Toolkit + redux-persist
- Backend: Node.js (Express) + MongoDB (Mongoose)
- AI Providers: Google Gemini and OpenAI (pluggable)
- File parsing: pdf-parse (PDF), mammoth (DOCX)

## Repository layout

```
Swipe/
├─ backend/
│  ├─ server.js
│  ├─ routes/
│  ├─ models/
│  ├─ middleware/
│  └─ services/ai.js
└─ frontend/
   ├─ src/components/
   ├─ src/pages/
   ├─ src/store/
   └─ src/utils/api.js
```

## Features

- Resume upload (PDF/DOCX) with Name/Email/Phone extraction
- Pre-interview prompts for missing fields
- Timed interview: 6 AI questions (2 Easy 20s, 2 Medium 60s, 2 Hard 120s)
- Auto-submit on timeout, one-question-at-a-time chat UI
- AI scoring per question + final score and AI summary
- Results page for interviewee
- Interviewer dashboard + candidate details modal + re-attempt controls
- Persistence with Redux Toolkit + redux-persist

## Local development

Prerequisites: Node 18+, npm, MongoDB Atlas (or local MongoDB).

1) Install deps

```
# from repo root
cd backend && npm i
cd ../frontend && npm i
```

2) Backend `.env` in `backend/`

```
PORT=3001
MONGODB_URI=<your mongodb uri>
JWT_SECRET=<a strong secret>
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:3000

# Choose ONE provider
AI_PROVIDER=gemini
GEMINI_API_KEY=<your gemini key>
GEMINI_MODEL=gemini-1.5-flash-latest
REQUIRE_AI=false
# or
# AI_PROVIDER=openai
# OPENAI_API_KEY=<your openai key>
# OPENAI_MODEL=gpt-4o-mini
```

3) Run both apps

```
# terminal 1
cd backend && npm start

# terminal 2
cd frontend && npm run dev
```

- API: http://localhost:3001/api/health
- Web: http://localhost:3000

## Production deployment

Deploy frontend on Vercel, backend on Render.

### Backend on Render

1. Create a new Web Service, root: `backend/`, Node 18+.
2. Build: `npm install`  |  Start: `npm start` (runs `node server.js`).
3. Environment variables (Render → Settings → Environment):

```
# Render sets PORT automatically; Express will bind to it
PORT=3001
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<strong-secret>
NODE_ENV=production
FRONTEND_ORIGIN=https://<your-vercel-app>.vercel.app

# AI (recommended Gemini)
AI_PROVIDER=gemini
GEMINI_API_KEY=<your-gemini-key>
GEMINI_MODEL=gemini-1.5-flash-latest
REQUIRE_AI=true
# or OpenAI
# AI_PROVIDER=openai
# OPENAI_API_KEY=<your-openai-key>
# OPENAI_MODEL=gpt-4o-mini
```

Notes:
- CORS is controlled via `FRONTEND_ORIGIN`. After the frontend is live on Vercel, paste that exact URL here and redeploy backend.
- Health: `curl https://<render>.onrender.com/api/health`

### Frontend on Vercel

Keep the axios base URL as `/api` and let Vercel proxy to Render.

Create `frontend/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://<your-render-service>.onrender.com/api/:path*" }
  ]
}
```

Deploy steps:
1. Import repo into Vercel – project root `frontend/`.
2. Build Command: `npm run build`  |  Output Directory: `dist`  |  Node 18+.
3. No env vars needed with rewrites.

Alternative (env only): set `VITE_API_BASE=https://<render>.onrender.com/api` on Vercel and change `src/utils/api.js` to:

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 30000,
})
```

After the frontend is deployed, copy the Vercel domain into `FRONTEND_ORIGIN` on Render and redeploy backend.

## Your provided backend env (production example)

```
PORT=3001
MONGODB_URI=<your mongodb uri>
JWT_SECRET=<your strong secret>
NODE_ENV=production
FRONTEND_ORIGIN=https://<your-vercel-app>.vercel.app

AI_PROVIDER=gemini
GEMINI_API_KEY=<your gemini key>
GEMINI_MODEL=gemini-1.5-flash-latest
REQUIRE_AI=true
```

Tip: prefer `gemini-1.5-flash-latest` / `gemini-1.5-pro-latest` to avoid model 404s.

## Troubleshooting

- 404 on enable/disable re-attempt:
  - Backend accepts either Interview `_id` or candidate user id and updates the latest interview.
- CORS error:
  - Ensure `FRONTEND_ORIGIN` equals your Vercel URL (with `https://`).
- Gemini 404 model:
  - Use `*-latest` variants.
- Still seeing mock questions:
  - Set `REQUIRE_AI=true`; check backend logs for provider/model.

## Security

Do not commit secrets. Use Render/Vercel environment managers. Keep `JWT_SECRET` strong. Limit CORS with `FRONTEND_ORIGIN`.

---