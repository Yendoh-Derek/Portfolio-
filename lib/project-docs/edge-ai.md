# Edge AI — AI Tutoring Platform

## Overview

Edge AI is an AI-powered diagnostic and remediation platform for Ghanaian JHS, SHS, and TVET learners. It identifies individual literacy and numeracy skill gaps through adaptive assessments, delivers live AI tutor sessions to close those gaps, and surfaces actionable class-level risk data to teachers. Built on the Ghana Education Service curriculum with Ghanaian cultural context throughout — local names, GH₵, Ghanaian historical passages.

Voice tutor runs on the Cascade streaming pipeline (Deepgram STT → Groq LLM → OpenAI TTS) delivering spoken responses in under 600ms. FastAPI backend, Next.js 15 frontend, PostgreSQL.

**Status:** Active development. Derek is co-founder and technical lead.

---

## The Problem It Solves

Ghanaian classrooms average 40+ students per teacher with no practical diagnostic tooling. Students in JHS 3 are failing foundational skills — Fractions, Inferencing, Proportional Reasoning — that should have been mastered years earlier, but teachers have no way to see which student is struggling with which specific micro-skill. Students who fall behind have no individualized support and no self-remediation path.

Edge AI solves both sides: students get a personal AI tutor that adapts to their skill level in real time; teachers get a class-level risk dashboard with per-student micro-skill mastery data.

---

## Core Features

**Student side**

- Adaptive MCQ diagnostic assessment across Numeracy and Literacy micro-skills with per-question feedback and explanation.
- Live AI tutor session: Cascade voice pipeline synchronized with an animated whiteboard. Voice or text input; tutor replies in under 600ms.
- Skill mastery results with color-banded progress bars, priority gap identification (skills ≤40), and drill-down remediation strategies.
- AI-generated, teacher-approved lesson plan with interactive session checklist.
- In-app notifications for lesson plan assignments, teacher notes, peer activity.

**Teacher side**

- Class dashboard: all learners ranked by risk level (High Risk / At Risk / On Track) with mastery heatmap across 5 tracked skills.
- Individual learner drill-down with full skill profile and AI-generated remediation suggestions.
- Automated progress reports with configurable schedule (Daily / Weekly / Bi-weekly / Monthly) and delivery channels (in-app, WhatsApp).
- One-tap parent report sharing per student.

**Platform-wide**

- Dual-role JWT auth (Student / Teacher) from landing page.
- Offline-capable: diagnostic questions and whiteboard content bundled client-side. Voice pipeline degrades to text input under poor connectivity.
- Persistent cross-session progress tracking via PostgreSQL.

---

## Technical Architecture

**Tutor session — 7-step state machine**
Step 1: Session opens → Slide: intro
Step 2: Concept explained → Slide: concept
Step 3: Passage shown → Passage: ghanaIndep
Step 4: Student responds → Passage: ghanaIndep
Step 5: Corrections shown → Slide: corrections
Step 6: Practice given → Slide: practice
Step 7: Session closes → Slide: practice

Session state: `idle | running | paused`. Voice pipeline drives step progression.

**Voice pipeline (Cascade)**

- Deepgram Nova-2 emits partial transcripts over WebSocket while student is still speaking
- Partials forwarded to Groq immediately — no waiting for full STT completion
- Groq + Llama 3.3 70B streams tokens; sentence chunker forwards first complete sentence to TTS
- OpenAI TTS (tts-1, nova) streams MP3 chunks back to browser
- Time-to-first-audio: ~400–600ms

**Whiteboard**
Two board types: `slide` (titled slide with bullet points) and `passage` (reading passage with inline amber highlights on structurally weak sentences). Highlight matching uses linear scan of `highlights[]` to wrap matched phrases in `<mark>` elements.

**Skill scoring & risk classification**

- Skill bands: low ≤40, medium 41–65, high >65
- Priority gaps: skills ≤40, surfaced with 4 GES-aligned remediation strategies
- Risk: High Risk (multiple skills ≤40), At Risk (one or more skills 41–55), On Track (all ≥56)

**Lesson plan generation**
On assessment completion, backend calls LLM with student's skill gap profile and GES curriculum context. Output is a structured JSON array of sessions (skill target, strategy, duration), validated against a Pydantic schema, then held for teacher approval before reaching the student.

---

## Key Technical Decisions

**Cascade streaming pipeline for voice:** Sequential STT → LLM → TTS produces 3–5s of silence between turns — educationally disruptive. Partial transcript forwarding and sentence-level TTS chunking collapse this to ~400ms, making the tutor feel genuinely conversational.

**Groq + Llama 3.3 70B:** Sub-200ms first-token latency from Groq's LPU hardware feeds the TTS stage without delay. System prompt injected with student's skill profile, active lesson step, and GES curriculum constraints — grounding the LLM to the lesson and preventing off-topic responses.

**Skill band thresholds aligned to GES:** ≤40 flags a priority gap consistent with GES competency frameworks. Same threshold drives the Results page UI and the teacher's risk classification logic — one consistent model throughout.

**Risk classification over raw scores:** A teacher with 40 students needs one actionable signal per learner, not 40 skill profiles to interpret. High Risk / At Risk / On Track surfaces who to prioritize immediately; the mastery heatmap gives the second layer for those who want to dig deeper.

**Offline-first content bundling:** Diagnostic questions, slide content, and passage text are bundled at build time. Students in low-connectivity classrooms complete assessments and review content without a live connection. Voice degrades to text input mid-session if connectivity drops — a session can always be completed.

**LLM lesson plan constraints:** Generation prompt includes exact skill scores, allowed GES-aligned activities per skill, and a strict JSON output schema. Pydantic validation on the backend, plus teacher review gate before the plan reaches the student — two layers preventing hallucinated activities.

**Inline passage highlighting without a library:** `renderWithHighlights` does a left-to-right linear scan, consuming each highlight phrase before scanning for the next. Precise control over amber underline styling without a third-party dependency.

---

## Technology Stack

**Frontend:** Next.js 15.1 (App Router), React 19, TypeScript 5, Tailwind CSS 4, Framer Motion 12, Radix UI, Geist fonts

**Voice:** Deepgram Nova-2 (STT), Groq + Llama 3.3 70B (LLM), OpenAI tts-1 nova (TTS), WebSocket

**Backend:** FastAPI, Uvicorn, Pydantic v2, JWT auth

**Database:** PostgreSQL

---

## Roadmap

- Expand diagnostic question bank across all GES JHS 3 competency areas (currently: Fractions, Proportional Reasoning, Inferencing, Vocabulary)
- On-device inference for offline skill gap scoring in zero-connectivity environments
- WhatsApp Business API for live parent report delivery
- Multi-language support: Twi, Ga, Ewe
- Teacher content authoring tools
- School-level and district-level aggregate analytics
- Voice interrupt handling: detect student speech mid-tutor-response and restart cleanly

---

## Derek's Role

Co-founder and sole technical builder. Designed and built the full system — Next.js App Router architecture, dual-role routing, FastAPI backend, Cascade voice pipeline integration, tutor session state machine, whiteboard component system, diagnostic assessment engine, skill results and mapping UI, LLM lesson plan generation, teacher dashboard, automated reports, and notification system. Also defined all curriculum content: diagnostic questions, tutor lesson scripts, Ghanaian-context passages, and per-skill remediation strategies.
