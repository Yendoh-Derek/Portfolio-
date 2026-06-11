# Cascade — AI Voice Tutor Pipeline

## Overview

Cascade is a low-latency AI voice tutoring pipeline built on fully concurrent streaming. Students ask questions by voice and receive spoken AI responses in under 600ms — demonstrating that voice agent latency is a pipeline design problem, not a hardware or model problem.

Connects three external AI services — Deepgram Nova-2 (STT), Groq + Llama 3.3 70B (LLM), and OpenAI TTS (tts-1) — via WebSockets, orchestrated by a FastAPI async backend. The core innovation is streaming partial outputs between stages concurrently rather than waiting for each stage to fully complete.

**GitHub:** github.com/Yendoh-Derek/Cascade.git

---

## The Problem with Standard Voice Pipelines

Standard: [STT] → [LLM] → [TTS] ~3–5sCascade: [STT]
↓ partial transcript
[LLM]
↓ first sentence
[TTS] ← student hears this at ~400ms

Sequential pipelines produce 3–5 seconds of silence because each stage sits idle waiting for the previous to fully finish. Cascade eliminates that idle time — each stage starts the moment usable partial output from the previous stage is available.

---

## Pipeline Stages

**Stage 1 — STT (Deepgram Nova-2)**

- WebSocket live transcription, 16kHz mono linear16 audio
- Emits partial transcripts continuously while student is still speaking
- `is_final` partials forwarded to LLM without waiting for full confirmation

**Stage 2 — LLM (Groq + Llama 3.3 70B)**

- `llama-3.3-70b-versatile`, streaming mode, first token at ~187ms
- Sentence chunker monitors token stream for boundaries (`.`, `?`, `!`) with minimum character threshold
- Each complete sentence forwarded to TTS immediately — full LLM response not required

**Stage 3 — TTS (OpenAI tts-1, voice: nova)**

- Streaming MP3 output, ~4KB chunks forwarded over WebSocket as they arrive
- First audio chunk at ~412ms (streaming) vs ~891ms (non-streaming) — 50% faster
- Browser audio player begins playback on first received chunk

**Transport**

- Backend ↔ Frontend: WebSocket (full-duplex, persistent per session)
- Backend ↔ Deepgram: WebSocket live transcription
- Backend ↔ Groq: HTTPS streaming completion (SSE)
- Backend ↔ OpenAI TTS: HTTPS streaming response

---

## Measured Latency

| Metric                         | Value  |
| ------------------------------ | ------ |
| Groq first token               | ~187ms |
| TTS first chunk (streaming)    | ~412ms |
| Time-to-first-audio            | ~400ms |
| Sequential pipeline equivalent | 3–5s   |

---

## Key Technical Decisions

**Groq over OpenAI or Anthropic for LLM:** Groq's LPU hardware delivers sub-200ms first-token latency. TTS cannot start until the LLM produces its first complete sentence — at standard GPU inference speeds (~800ms first token), the LLM stage alone would consume the entire latency budget before TTS even starts.

**Sentence-level chunking, not token-level TTS:** Individual tokens produce incoherent audio fragments and flood the TTS API with tiny requests. A complete sentence is the minimum speakable unit TTS can render coherently, while still forwarding well before the full LLM response finishes.

**Deepgram Nova-2 over Whisper:** Nova-2 is streaming-native — it emits continuous partial transcripts over a persistent WebSocket while audio is arriving. Whisper requires complete audio segments before transcription begins, making it incompatible with a live concurrent pipeline.

**FastAPI async WebSocket orchestrator:** Three simultaneous long-lived connections (Deepgram WS, Groq streaming, OpenAI TTS streaming) plus the client WebSocket — all handled concurrently on a single asyncio event loop without multi-threading overhead.

**Fail-fast config with frozen dataclasses:** API keys validated at module import time via `_require_env()`. Missing keys raise `EnvironmentError` immediately with a clear message — not silently mid-pipeline. `@dataclass(frozen=True)` prevents accidental key mutation inside pipeline stages.

**Phased development with verification gates:** Phase 1 validates all three API connections end-to-end before any pipeline code is written. Integration failures surface early with clear diagnostics rather than mid-development.

---

## Technology Stack

**Backend:** FastAPI, Uvicorn, WebSockets, python-dotenv, asyncio

**STT:** Deepgram SDK 3.7+ (`deepgram-sdk`), Nova-2

**LLM:** Groq SDK 0.12+ (`groq`), Llama 3.3 70B Versatile

**TTS:** OpenAI SDK 1.54+ (`openai`), tts-1, nova voice

**Testing:** pytest, pytest-asyncio, httpx

---

## Current Status & Roadmap

Phase 1 (API verification) complete and passing. Pipeline verified end-to-end with measured latency benchmarks. Integrated as the voice layer inside Edge AI.

Planned:

- Phase 2: Full concurrent pipeline implementation (`backend/pipeline.py`)
- Phase 3: Tutor persona with GES curriculum context and conversation history
- Phase 4: Browser frontend with microphone capture, audio playback, per-stage latency visualizer
- Interrupt handling via VAD (Voice Activity Detection)
- Edge deployment variant: locally hosted models for offline/low-connectivity environments

---

## Derek's Role

Designed and built the full system — pipeline architecture, all three API integrations, concurrent streaming design, FastAPI WebSocket backend, configuration module, and Phase 1 verification suite. Built as a standalone demonstration that voice agent latency is solvable through pipeline design, directly applicable to the low-connectivity tutoring context of Edge AI.
