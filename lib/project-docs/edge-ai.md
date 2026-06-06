# Edge AI — AI Tutoring Platform

## Overview

Edge AI is an AI-powered diagnostic and remediation platform built for Ghanaian Junior High School (JHS), Senior High School (SHS), and TVET learners. It identifies individual literacy and numeracy skill gaps through adaptive assessments, delivers live AI tutor sessions to close those gaps, and surfaces actionable class-level data to teachers. The platform is built for the Ghana Education Service curriculum and uses Ghanaian cultural context — local names, local currency (GH₵), and Ghanaian historical passages — throughout its content. The voice tutor runs on a fully streaming pipeline (Deepgram STT → Groq LLM → OpenAI TTS) that delivers spoken responses in under 600ms, served through a FastAPI backend and a Next.js 16 frontend.

---

## Problem Statement

Ghanaian classrooms face a learning crisis that is largely invisible to teachers: students in JHS 3 are failing foundational numeracy and literacy skills — Fractions, Inferencing, Proportional Reasoning — that they should have mastered years earlier. With 40+ students per class and limited diagnostic tooling, teachers cannot identify which students are struggling with which specific micro-skills. Students who fall behind have no individualized support mechanism and no way to identify or self-remediate their own gaps. Edge AI solves both sides: it gives students a personal AI tutor that adapts to their skill level in real time, and gives teachers a class-level risk dashboard with micro-skill mastery data.

---

## Key Features

**Student side**

- Adaptive diagnostic assessment covering Numeracy and Literacy micro-skills with immediate per-question feedback and explanation.
- Live AI tutor sessions: streaming voice pipeline synchronized with an animated whiteboard. Students respond by voice or text; the tutor replies in under 600ms.
- Skill mastery results page with color-banded progress bars, priority gap identification, and drill-down remediation strategies per skill.
- AI-generated, teacher-approved lesson plan with interactive session checklist.
- In-app notifications for lesson plan assignments, teacher notes, and peer activity.

**Teacher side**

- Class dashboard showing all learners ranked by risk level (High Risk / At Risk / On Track) with a per-student mastery heatmap across 5 tracked skills.
- Individual learner drill-down with full skill profile and AI-generated remediation strategy suggestions.
- Automated progress reports with configurable delivery (in-app + WhatsApp), schedule (Daily / Weekly / Bi-weekly / Monthly), and time of day.
- One-tap parent report sharing per student.

**Platform-wide**

- Dual-role entry (Student / Teacher) from the landing page with JWT-based authentication.
- Ghanaian curriculum-aligned content: JHS 3 level, GES subject areas, local names and currency throughout.
- Offline-capable lesson playback: diagnostic questions and whiteboard content are bundled client-side; the voice pipeline degrades gracefully under poor connectivity.
- Persistent cross-session progress tracking via a PostgreSQL backend.

---

## Technical Architecture

**Routing and page structure**

```
/                          → Landing page (role selection)
/login/student             → Student login
/login/teacher             → Teacher login
/student/dashboard         → Student home (3 action cards)
/student/assessment        → Diagnostic assessment (adaptive MCQ)
/student/tutor             → AI tutor session (live voice + whiteboard)
/student/results           → Skill mastery map + priority gaps
/student/lesson-plan       → Teacher-approved session checklist
/student/notifications     → In-app notification feed
/teacher/dashboard         → Class risk view + mastery heatmap
/teacher/learner/[id]      → Individual learner profile
/teacher/reports           → Automated report settings + history
```

**Tutor session architecture**
The tutor session is a 7-step state machine. Each step has a name and a board configuration (slide or passage). The voice pipeline drives step progression: Deepgram STT transcribes the student's speech, Groq + Llama 3.3 70B generates the tutor's response, and OpenAI TTS streams the spoken reply back to the browser over WebSocket. The whiteboard advances in sync with each tutor turn.

```
Step 1: Session opens     → Slide: intro
Step 2: Concept explained → Slide: concept
Step 3: Passage shown     → Passage: ghanaIndep
Step 4: Student responds  → Passage: ghanaIndep
Step 5: Corrections shown → Slide: corrections
Step 6: Practice given    → Slide: practice
Step 7: Session closes    → Slide: practice
```

Session state: `idle | running | paused`. STT status: `idle | speaking`. Mic status: `idle | listening | processing`.

**Voice pipeline (Cascade)**
The live voice layer runs on the Cascade streaming architecture:

- Deepgram Nova-2 emits partial transcripts over WebSocket while the student is still speaking.
- Partial transcripts are forwarded to Groq immediately — no waiting for full STT completion.
- Groq + Llama 3.3 70B streams tokens; a sentence chunker forwards the first complete sentence to TTS without waiting for the full response.
- OpenAI TTS (tts-1, voice: nova) streams MP3 audio chunks back to the browser.
- Time-to-first-audio: ~400–600ms from end of student speech.

**Whiteboard component**
Two board types:

- `slide` board: renders a titled slide with bullet points and optional example lines from a `SLIDES` record keyed by slide ID.
- `passage` board: renders a reading passage with inline amber highlight marks on structurally weak or incomplete sentences. Highlight matching uses a linear scan of `highlights[]` against paragraph text to wrap matched phrases in `<mark>` elements.

**Diagnostic assessment**
MCQ questions typed with `subject`, `microSkill`, `correctLabel`, and `explanation`. On submission, each answer is recorded as an `AnswerRecord`. Results are persisted to the backend (`POST /api/assessment/submit`) and returned as a scored skill profile.

**Results and skill maps**
Results page fetches the student's skill profile from `GET /api/learner/:id/results`. Skill scores are banded into three levels: low (≤40), medium (41–65), high (>65). Priority gaps (skills ≤40) are surfaced with a drill-down panel showing a description and 4 curriculum-aligned remediation strategies. An LLM-generated lesson plan is triggered automatically and surfaced for teacher approval.

**Lesson plan generation**
On assessment completion, the backend calls an LLM with the student's skill gap profile to generate a personalized multi-session plan. Each session specifies skill target, strategy, and duration. The teacher reviews and approves the plan before it appears on the student's lesson plan page.

**Notifications system**
`src/app/lib/notifications.ts` provides `loadNotifications`, `saveNotifications`, and `appendNotification` backed by the backend API. Notifications carry type (`lessonPlan | teacherNote | peer`), title, body, read status, and an optional deep link.

**Teacher risk classification**
Each learner has a `risk` field: `High Risk | At Risk | On Track`, derived from the distribution of their skill scores. Risk badges and mastery cells are color-coded: low = red (`bg-skill-low`), medium = amber (`bg-skill-medium`), high = green (`bg-skill-high`).

---

## Technology Stack

**Frontend:** Next.js 16.1.6 (App Router), React 19.2.3, TypeScript 5

**Styling:** Tailwind CSS 4, PostCSS, tailwind-merge

**Animation:** Framer Motion 12 (`motion`, `AnimatePresence`, `useReducedMotion`)

**UI components:** Radix UI (`@radix-ui/react-slot`), custom `Button`, `Card`, `Toast` components

**Typography:** Geist Sans and Geist Mono (Next.js font optimization)

**Voice pipeline:** Deepgram Nova-2 (STT), Groq + Llama 3.3 70B (LLM), OpenAI tts-1 nova (TTS), WebSocket transport

**Backend:** FastAPI, Uvicorn, Pydantic v2, JWT authentication

**Database:** PostgreSQL

**Linting:** ESLint 9 with `eslint-config-next`

---

## How It Works

**Student flow**

1. Student lands on `/` and selects the Student role card → `/login/student`. Authenticates via JWT.
2. Arrives at `/student/dashboard` with three action cards: Diagnostic Assessment, AI Tutor Session, My Progress.
3. **Diagnostic assessment** (`/student/assessment`): Selects subjects (Numeracy, Literacy, or both), answers adaptive MCQs one at a time. Each submission reveals the correct answer with an explanation. Results posted to `POST /api/assessment/submit`; the student is navigated to `/student/results`.
4. **Results** (`/student/results`): Fetches skill mastery profile from backend. Skill bars are color-banded by performance level. Priority gaps (≤40) are highlighted with remediation strategies. An LLM-generated lesson plan is queued for teacher approval, and the student is offered navigation to `/student/lesson-plan`.
5. **Tutor session** (`/student/tutor`): Student presses Start. The Cascade voice pipeline opens a WebSocket connection. The tutor speaks the current step's content; the whiteboard renders the corresponding slide or passage. When the tutor's turn ends, the student responds by voice or text. The pipeline processes the response and advances the session. On completion, a `skill_deltas` record is written to the backend.
6. **Lesson plan** (`/student/lesson-plan`): Fetches the teacher-approved plan from the backend. Each session (skill, strategy, duration) has a checkbox the student ticks off as they complete it.

**Teacher flow**

1. Teacher logs in → `/teacher/dashboard` showing the full class as a risk-sorted list with a per-learner mastery heatmap across 5 skills.
2. Clicking a learner navigates to `/teacher/learner/[id]` for the individual skill profile and remediation suggestions.
3. `/teacher/reports` allows configuring automated report schedule, notification channels (in-app, WhatsApp), and reviewing recent per-student progress summaries. One-tap parent sharing dispatches a report via the configured channels.

---

## My Role

Derek co-founded Edge AI and designed and built the full system. This includes the application architecture (Next.js App Router, dual-role routing, FastAPI backend), the Cascade voice pipeline integration (Deepgram STT, Groq LLM, OpenAI TTS over WebSocket), the tutor session state machine, the whiteboard component system (slide and passage board types), the diagnostic assessment engine, the results and skill mapping UI, the LLM-based lesson plan generation, the teacher dashboard risk and mastery views, the automated reports page, and the notification system. Derek also defined all curriculum content — diagnostic questions, tutor lesson scripts, Ghanaian-context passages, and per-skill remediation strategies.

---

## Technical Decisions

**Next.js App Router with client components:** Most pages are `"use client"` because they depend on WebSocket connections, `useRef` (audio), and browser APIs. The App Router handles routing, layouts, and font optimization via `next/font`.

**Cascade streaming pipeline for voice:** The Cascade architecture (Deepgram → Groq → OpenAI TTS) delivers tutor speech in under 600ms — critical for keeping sessions feeling conversational. Sequential stage processing would produce 3–5s of silence between the student's response and the tutor's reply, which is educationally disruptive. Partial transcript forwarding and sentence-level TTS chunking eliminate this idle time.

**Groq + Llama 3.3 70B for the tutor LLM:** Groq's LPU hardware delivers sub-200ms first-token latency, which feeds the TTS stage without delay. The tutor system prompt is injected with the student's current skill profile, the active lesson step, and the GES curriculum context — constraining the LLM to produce educationally appropriate, curriculum-aligned responses.

**Framer Motion for whiteboard animations:** Each slide transition and bullet point reveal uses staggered `motion` variants. This mimics a teacher writing on a physical whiteboard — a deliberate UX choice to feel familiar to Ghanaian classroom environments rather than like a generic slide deck.

**Inline passage highlighting without a library:** The `renderWithHighlights` function in the passage board does a linear scan to find and wrap highlight phrases as `<mark>` elements. No third-party library dependency for a feature that needed precise control over highlight styling (amber underline with background).

**Skill band thresholds (≤40 low, ≤65 medium, >65 high):** Aligned with GES competency frameworks. A skill at ≤40 is flagged as a priority gap requiring immediate remediation — informing both the Results page visual treatment and the teacher's risk classification logic.

**Risk classification (High Risk / At Risk / On Track):** Derived from the distribution of a learner's skill scores. Surfaces the most actionable signal for teachers who have 40+ students — they need to know who to prioritize in one glance, not read detailed reports for every student.

**Offline-capable content bundling:** Diagnostic questions, whiteboard slide content, and passage text are bundled in the JavaScript build. Students in low-connectivity environments can complete assessments and review whiteboard content without a live connection. The voice pipeline degrades gracefully — if connectivity drops mid-session, the student can fall back to text input.

---

## Challenges Encountered

**Challenge:** Maintaining tutor session state (step index, voice pipeline state, session phase) across orientation changes and re-renders.
**Solution:** All session state lives in React `useState`. An orientation detection effect (`window.matchMedia("(orientation: portrait)")`) conditionally hides the avatar panel and lesson outline on portrait mobile to preserve whiteboard space.

**Challenge:** Audio autoplay is blocked by browsers until a user gesture occurs.
**Solution:** The Start Session button is the user gesture that opens the WebSocket connection. The audio play call is wrapped in a `.catch()` that falls back to `setStt("idle")` silently, preventing errors from surfacing to the student. The session can continue via text input if audio is blocked.

**Challenge:** Passage highlighting must handle overlapping or adjacent highlight phrases without double-wrapping.
**Solution:** `renderWithHighlights` processes paragraphs left-to-right, always finding the earliest-indexed unprocessed highlight, splitting on it, and consuming it before scanning for the next. Remaining text is pushed as a plain span.

**Challenge:** LLM-generated lesson plans must stay within the GES curriculum scope and not hallucinate unsupported activities.
**Solution:** The lesson plan generation prompt is constrained with explicit curriculum context, allowed skill targets, and a structured JSON output schema. The teacher review gate before the plan reaches the student adds a human validation layer.

---

## Performance Considerations

- `useReducedMotion()` from Framer Motion is respected on the scrolling highlights marquee — animation is disabled for system-level reduced motion preferences.
- Next.js `Image` component with explicit `width` and `height` — prevents layout shift and enables automatic optimization.
- Geist font loaded via `next/font/google` with CSS variable injection — eliminates FOUT and self-hosts the font.
- Cascade voice pipeline delivers first audio at ~400ms; WebSocket transport avoids HTTP handshake overhead on every audio chunk.
- `useMemo` used for learner data and student metadata to prevent unnecessary recalculations on re-renders.
- Diagnostic questions and whiteboard content are bundled at build time — no fetch latency on assessment or tutor session load.

---

## Security Considerations

- JWT-based authentication for both student and teacher roles. Tokens are short-lived with refresh token rotation.
- Role-based access control: student routes are inaccessible to teacher tokens and vice versa.
- API keys for Deepgram, Groq, and OpenAI are server-side only — never exposed to the browser. All voice pipeline traffic proxies through the FastAPI backend.
- No student audio is stored; voice streams pass through the backend in-memory only.
- CORS configured to allow only the production frontend origin in the FastAPI middleware.

---

## API Endpoints

**Auth**

- `POST /api/auth/login` — Accepts role, email, password. Returns JWT access token and refresh token.
- `POST /api/auth/refresh` — Rotates refresh token, returns new access token.

**Assessment**

- `POST /api/assessment/submit` — Records answer array, returns scored skill profile with priority gaps.

**Learner**

- `GET /api/learner/:id/results` — Returns full skill mastery profile and priority gaps.
- `GET /api/learner/:id/lesson-plan` — Returns teacher-approved lesson plan sessions.
- `PATCH /api/learner/:id/lesson-plan/:sessionId` — Marks a lesson plan session as complete.

**Lesson Plan**

- `POST /api/lesson-plan/generate` — LLM generates a personalized plan from skill gap data.
- `PATCH /api/lesson-plan/:id/approve` — Teacher approves a generated lesson plan.

**Tutor Session**

- `WS /api/tutor/session` — WebSocket for the Cascade voice pipeline. Bidirectional: browser sends PCM audio; server streams MP3 TTS chunks back.
- `POST /api/tutor/session/complete` — Records session completion and `skill_deltas`.

**Teacher**

- `GET /api/teacher/class` — Returns full class roster with risk levels and mastery heatmap data.
- `GET /api/teacher/learner/:id` — Returns individual learner profile with remediation suggestions.

**Reports**

- `GET /api/reports` — Returns report history for the teacher's class.
- `POST /api/reports/schedule` — Configures automated report delivery settings.
- `POST /api/reports/:id/share` — Dispatches a parent report via in-app and/or WhatsApp.

**Notifications**

- `GET /api/notifications` — Returns notification feed for the authenticated user.
- `PATCH /api/notifications/:id/read` — Marks a notification as read.

---

## Database Design

**Users** — `id`, `name`, `email`, `password_hash`, `role` (student/teacher), `school`, `class_level`, `created_at`

**Assessments** — `id`, `student_id`, `run_at`, `answers[]`, `skill_scores{}`, `priority_gaps[]`

**Skills** — `id`, `name`, `subject` (Numeracy/Literacy), `description`, `remediation_strategies[]`

**TutorSessions** — `id`, `student_id`, `lesson_id`, `started_at`, `completed_at`, `skill_deltas{}`

**LessonPlans** — `id`, `student_id`, `teacher_id`, `sessions[]`, `generated_at`, `approved`, `approved_at`

**LessonPlanProgress** — `id`, `plan_id`, `student_id`, `session_key`, `completed_at`

**Notifications** — `id`, `recipient_id`, `type`, `title`, `body`, `read`, `link`, `created_at`

**Reports** — `id`, `teacher_id`, `learner_id`, `date`, `summary`, `status` (New/Reviewed)

**ReportSchedules** — `id`, `teacher_id`, `enabled`, `frequency`, `delivery_time`, `channels[]`

---

## AI Components

**Diagnostic engine:** Rule-based MCQ with micro-skill tagging (`subject`, `microSkill`, `correctLabel`, `explanation`). Scoring computes per-skill mastery percentages and identifies priority gaps at ≤40.

**Lesson plan generation:** FastAPI endpoint calls an LLM with the student's skill gap profile and GES curriculum context. Output is a structured JSON array of sessions (skill target, strategy, duration), validated against a Pydantic schema before storage.

**Live voice tutor:** Cascade streaming pipeline — Deepgram Nova-2 (STT, 16kHz mono, WebSocket), Groq + Llama 3.3 70B (LLM, streaming, tutor system prompt injected with student profile and lesson step context), OpenAI tts-1 nova (TTS, streaming MP3 chunks). Time-to-first-audio: ~400–600ms.

**Remediation strategies:** Per-skill strategy lists defined in `MICRO_SKILL_INFO`, aligned with GES teaching guidance. Examples: Fractions — use fraction bars and everyday objects, link to local prices; Inferencing — highlight emotional clues, use Ghanaian-context short stories.

**Risk classification:** Threshold-based scoring on skill mastery values. High Risk: multiple skills ≤40. At Risk: one or more skills in 41–55 range. On Track: all skills ≥56.

---

## Deployment

- **Frontend:** Next.js on Vercel. `npm run dev` → `http://localhost:3000` locally.
- **Backend:** FastAPI + Uvicorn on a cloud VM (e.g. Railway, Render, or GCP Cloud Run).
- **Database:** PostgreSQL (managed instance).
- **Voice pipeline:** Deepgram, Groq, and OpenAI API keys held server-side in environment variables.
- **Offline resilience:** Diagnostic and whiteboard content bundled at build time; voice pipeline degrades to text-only if connectivity drops.

---

## Future Improvements

- Expand diagnostic question bank across all GES JHS 3 competency areas (currently covers Fractions, Proportional Reasoning, Inferencing, Vocabulary as priority gaps).
- Lightweight on-device inference model for offline skill gap scoring in zero-connectivity environments.
- WhatsApp Business API integration for live parent report delivery (currently in-app only).
- Multi-language support: Twi, Ga, Ewe — for mother-tongue instruction contexts.
- Teacher content authoring: allow teachers to create custom tutor sessions and lesson plans.
- School-level and district-level aggregate skill gap analytics dashboard.
- Interrupt handling in the voice pipeline: detect student speech mid-tutor-response and restart the turn cleanly.

---

## Interview Questions About This Project

**Q: Why build for Ghanaian JHS specifically rather than a general tutoring platform?**
A: The learning crisis in Ghanaian JHS is concrete and measurable — WAEC data shows large proportions of JHS 3 students are below competency in foundational numeracy and literacy. Generic tutoring platforms use Western curriculum examples, Western names, and Western pricing. Edge AI uses Ghanaian names (Ama, Kwame, Kofi), GH₵ in maths problems, and passages about Ghana's independence. This isn't cosmetic — context familiarity directly affects reading comprehension and engagement, especially for inferencing tasks.

**Q: How does the voice tutor achieve sub-600ms response time?**
A: The Cascade pipeline eliminates inter-stage idle time by streaming partial outputs concurrently. Deepgram emits partial transcripts while the student is still speaking, which are forwarded to Groq immediately. Groq's first token arrives at ~187ms; the sentence chunker forwards the first complete sentence to OpenAI TTS without waiting for the full LLM response. The student hears audio at ~400ms — compared to 3–5s for a sequential pipeline.

**Q: How does the tutor stay on curriculum?**
A: The Groq LLM receives a system prompt injected with three layers of context: the student's current skill profile (which micro-skills are flagged as gaps), the active lesson step (intro, concept, passage, corrections, practice), and the GES curriculum constraints for the subject and class level. This grounds the LLM's responses to the lesson and prevents it from going off-topic or generating inappropriate content.

**Q: Why does the teacher dashboard show risk levels instead of raw scores?**
A: A teacher with 40 students doesn't have time to interpret 40 skill profiles. Risk classification (High Risk / At Risk / On Track) is a single, actionable signal that tells the teacher who to prioritize before they even open a learner's profile. The mastery heatmap gives the second layer — which specific skills are driving that risk — for teachers who want to dig deeper.

**Q: How does the offline-first design constraint shape the architecture?**
A: Two concrete decisions: (1) diagnostic questions and whiteboard content are bundled at build time — a student can load the page once and complete an assessment or review lesson content without any network; (2) the voice pipeline degrades to text-only input if connectivity drops mid-session, so a session can always be completed. This is non-negotiable for classrooms in peri-urban Ghana where connectivity is intermittent.

**Q: How is the lesson plan generation constrained to avoid hallucinated activities?**
A: The generation prompt passes the student's exact skill scores, the allowed set of GES-aligned activities per skill, and a strict JSON output schema. The FastAPI backend validates the LLM's output against a Pydantic model before storing it. The teacher review and approval gate before the plan reaches the student adds a final human validation layer.

---

## Keywords

EdTech, AI tutoring, Ghana, GES, JHS, SHS, TVET, West Africa, literacy, numeracy, diagnostic assessment, skill gap, micro-skills, fractions, inferencing, proportional reasoning, vocabulary, Next.js, React, TypeScript, Tailwind CSS, Framer Motion, offline-first, low-connectivity, voice tutor, streaming voice pipeline, Cascade, Deepgram, Groq, Llama, OpenAI TTS, whiteboard, adaptive learning, remediation, teacher dashboard, risk classification, mastery heatmap, lesson plan, parent notifications, WhatsApp, Ghanaian curriculum, FastAPI, PostgreSQL, JWT, Edge AI, co-founder, education technology, Ghana Education Service, WAEC, WebSocket
