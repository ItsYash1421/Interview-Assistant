# Swipe AI Interview Assistant

A full‑stack AI‑powered mock‑interview platform that simulates technical interviews, evaluates answers with AI, and provides an interviewer dashboard for reviewing candidate performance.

## Overview

Swipe enables two personas:
- Interviewee (Chat): Upload resume → collect missing details → timed Q&A (6 questions) → AI scoring → results.
- Interviewer (Dashboard): Search/sort candidates → view detailed interview data → enable/disable re‑attempts.

Key pillars:
- Real resume parsing (PDF/DOCX)
- AI‑generated questions (contextualized by resume)
- AI answer scoring (0–10 per question)
- Timed interview flow with auto‑submission
- Persistent session recovery and clean UX (Google‑Meet‑inspired)

## Features

- Resume upload (PDF/DOCX) with Name/Email/Phone extraction
- Pre‑interview prompts if details are missing
- Timed interview: 6 questions (2 Easy 20s, 2 Medium 60s, 2 Hard 120s)
- One question at a time; auto‑submit on timeout
- Per‑question AI scoring + final total and AI summary
- Results page for interviewee with breakdown and insights
- Interviewer dashboard: search/sort, candidate detail modal, answers & scores, resume text
- Re‑attempt control (interviewer can enable/disable)
- Persistence via Redux Toolkit + redux‑persist, including timers and chat history
- Welcome‑back modal to resume in‑progress interviews
- Production‑grade UI/UX (Meet‑like styling, accessible, responsive)

## Tech Stack

- Frontend: React (Vite), Ant Design, Redux Toolkit, redux‑persist, Axios
- Backend: Node.js (Express), MongoDB (Mongoose), JWT, bcryptjs, multer
- File parsing: pdf‑parse (PDF), mammoth (DOCX)
- AI providers (pluggable): Google Gemini, OpenAI

## Architecture

```
Swipe/
├─ backend/
│  ├─ server.js               # Express bootstrap, CORS, routes, health
│  ├─ routes/
│  │  ├─ auth.js              # login/register
│  │  ├─ interview.js         # resume upload, questions, submit answers
│  │  └─ candidate.js         # interviewer endpoints & re‑attempt controls
│  ├─ models/Interview.js     # interview schema (Q&A, scores, allowReattempt)
│  ├─ middleware/auth.js      # JWT auth, role guard
│  └─ services/ai.js          # AI abstraction (Gemini/OpenAI, fallbacks)
└─ frontend/
   ├─ src/components/         # ChatWindow, ResumeUpload, Timer, DashboardTable, etc.
   ├─ src/pages/              # Interviewee, Interviewer, Results, Auth
   ├─ src/store/              # Redux slices (auth, interview, candidate)
   └─ src/utils/api.js        # Axios instance
```

## Data Model (Interview)

- candidateId (ref) / candidateName / candidateEmail / candidatePhone
- resumeText (string)
- questions: [{ question, difficulty, timeLimit, answer, score, timeSpent }]
- totalScore (0–60)
- status: 'in_progress' | 'completed'
- allowReattempt: boolean (interviewer controlled)
- timestamps (createdAt, updatedAt)

## API Overview (high‑level)

- Auth: `POST /api/auth/register`, `POST /api/auth/login`
- Interview (candidate):
  - `POST /api/interview/upload-resume` (multipart file) → parse resume → AI questions
  - `POST /api/interview/submit-answer` → score answer with AI
  - `POST /api/interview/complete` → finalize total + summary
- Candidate (interviewer):
  - `GET /api/candidates` (search/sort/paginate)
  - `GET /api/candidates/:id` (interview detail)
  - `PUT /api/candidates/:id/enable-reattempt` / `disable-reattempt`
  - `GET /api/candidates/my/interviews` (self history)

## State Management

- Redux Toolkit slices
  - authSlice: user/session state
  - interviewSlice: current interview, chat history, timers, results, completed flags
  - candidateSlice: interviewer list, selected candidate, enable/disable re‑attempt
- redux‑persist: persists auth + interview state to survive reloads and offer resume options

## AI Integration

- `backend/services/ai.js`
  - Provider‑agnostic adapter (Gemini/OpenAI)
  - Robust JSON parsing from LLM outputs (handles code fences)
  - Gemini model fallback list (e.g., `gemini-1.5-flash-latest`, `gemini-1.5-pro-latest`)
  - `REQUIRE_AI=true` mode forces hard failure rather than mock fallback
- Generation prompt: 6 questions tailored to resume (difficulty & timeLimit included)
- Scoring prompt: returns an integer 0–10 considering difficulty, correctness, completeness

## UX & UI Principles

- Google‑Meet‑inspired theming (typography, elevation, color system)
- Chat auto‑scroll, accurate timers (setTimeout strategy), smooth overflow behavior
- Accessible color contrast, focus states, and responsive layout
- Results page with clear hierarchy: total score, per‑question breakdown, and AI summary

## Error Handling & Resilience

- Centralized Express error middleware
- Clear frontend toasts/messages
- AI fallbacks + strict `REQUIRE_AI` option
- CORS origin gating via env

## Security

- JWT‑based auth (access token)
- Password hashing via bcryptjs
- CORS locked to allowed origin
- No secrets in code (env‑driven configuration)

## Roadmap Ideas

- Audio/video question delivery & voice‑to‑text answers
- Tag‑based question banks with hybrid AI retrieval
- Calibrated scoring rubric & bias mitigation checks
- Exportable PDF reports for candidates and interviewers

## Credits

Built with React, Express, MongoDB, Ant Design, and AI provider SDKs (Gemini/OpenAI).