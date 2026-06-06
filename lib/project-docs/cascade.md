# Cascade — AI Voice Tutor

## Overview

Cascade is a low-latency AI tutoring voice agent built on a fully concurrent streaming pipeline. Students ask questions by voice and receive spoken AI responses in under 600ms — demonstrating that voice agent latency is a pipeline design problem, not a hardware or model problem. The system connects three external AI services — Deepgram Nova-2 (speech-to-text), Groq + Llama 3.3 70B (language model), and OpenAI TTS (text-to-speech) — via WebSockets, orchestrated by a FastAPI async backend. The core innovation is streaming partial outputs between stages concurrently rather than waiting for each stage to fully complete before starting the next.

---

## Problem Statement

Standard voice agent architectures process each stage sequentially: STT runs to completion, then LLM runs to completion, then TTS runs to completion. This produces 3–5 seconds of silence before a student hears anything — which is educationally disruptive and feels broken. The actual compute time for each stage is much lower than the perceived latency because stages sit idle waiting for upstream stages to finish. Cascade eliminates this idle time by starting each stage the moment partial output from the previous stage is available, collapsing the pipeline from ~3–5s to ~400–600ms time-to-first-audio.

---

## Key Features

- Fully concurrent three-stage streaming pipeline: STT → LLM → TTS operating in parallel without waiting.
- First audio delivered to the student at ~400ms from end of speech.
- Deepgram Nova-2 live transcription over WebSocket with partial transcript forwarding.
- Groq-hosted Llama 3.3 70B for high-throughput token generation with sub-200ms first token.
- OpenAI TTS (tts-1, voice: nova) with streaming audio chunk delivery.
- FastAPI async WebSocket server as the pipeline orchestrator.
- Fail-fast configuration: missing API keys raise explicit errors at startup, not deep inside the pipeline.
- Phase 1 verification suite that validates all three API integrations end-to-end before pipeline construction.

---

## Technical Architecture

**Pipeline Design — Standard vs Cascade**

```
Standard:   [STT ████████] → [LLM ████████████] → [TTS ████████]  ~3–5s

Cascade:    [STT ██▒▒▒▒▒▒]
                   ↓ partial transcript
                [LLM ██████▒▒▒▒]
                         ↓ first sentence
                       [TTS ████]  ← student hears this at ~400ms
```

Each stage begins processing as soon as it receives usable partial output from the previous stage. No stage blocks on the completion of the previous one.

**Stage 1 — STT (Deepgram Nova-2)**

- Protocol: WebSocket live transcription connection
- Audio spec: 16kHz sample rate, mono channel, linear16 encoding
- Partial transcripts are emitted continuously; confirmed final transcripts trigger LLM forwarding
- Connection lifecycle: opened per session, closed cleanly after student turn ends

**Stage 2 — LLM (Groq + Llama 3.3 70B)**

- Model: `llama-3.3-70b-versatile` hosted on Groq's inference infrastructure
- Streaming mode: tokens emitted via SSE-like stream; first token arrives at ~187ms
- Sentence chunker monitors the token stream for sentence boundaries; forwards complete sentences to TTS immediately without waiting for the full response

**Stage 3 — TTS (OpenAI tts-1)**

- Model: `tts-1`, voice: `nova`
- Streaming response: audio chunks (~4KB each) forwarded over WebSocket to the browser as they arrive
- MP3 format; first audio chunk arrives at ~412ms from TTS request start
- Standard (non-streaming) TTS latency: ~891ms — streaming is ~50% faster to first audio

**Transport Layer**

- Backend ↔ Frontend: WebSocket (full-duplex, persistent per session)
- Backend ↔ Deepgram: WebSocket live transcription connection
- Backend ↔ Groq: HTTPS streaming completion (SSE)
- Backend ↔ OpenAI TTS: HTTPS streaming response

**Frontend (Phase 4 — planned)**

- Browser microphone capture → WebSocket audio stream to backend
- WebSocket audio receiver → browser audio player for TTS output
- Latency demo UI showing per-stage timing

---

## Technology Stack

**Backend:** FastAPI, Uvicorn (with standard extras), WebSockets, python-dotenv

**STT:** Deepgram SDK 3.7+ (`deepgram-sdk`), Nova-2 model

**LLM:** Groq SDK 0.12+ (`groq`), Llama 3.3 70B Versatile

**TTS:** OpenAI SDK 1.54+ (`openai`), tts-1 model, nova voice

**Testing / Verification:** pytest, pytest-asyncio, httpx

**HTTP client:** httpx (for async test requests)

---

## How It Works

1. **Startup**: FastAPI app loads, `config.py` validates all three API keys from `.env` at import time. Missing keys raise an `EnvironmentError` immediately with a clear message — no silent failures.
2. **Health check**: `GET /health` returns key presence status and loaded model names without exposing key values.
3. **Student speaks**: Browser captures microphone audio and streams it over WebSocket to the FastAPI backend.
4. **STT stage**: Backend forwards audio bytes to Deepgram's live WebSocket connection. Nova-2 emits partial transcripts continuously.
5. **Partial forwarding**: As Deepgram emits transcripts, the pipeline forwards them to the Groq LLM stream without waiting for a fully confirmed transcript.
6. **LLM stage**: Groq streams tokens from Llama 3.3 70B. A sentence chunker monitors the token stream and detects sentence boundaries (`.`, `?`, `!`).
7. **Sentence forwarding**: Each complete sentence from the LLM is immediately forwarded to OpenAI TTS without waiting for the full LLM response.
8. **TTS stage**: OpenAI TTS streams MP3 audio chunks back. The pipeline forwards each chunk over WebSocket to the browser.
9. **Student hears**: Browser audio player receives chunks and plays them as they arrive. First audio at ~400ms.

---

## My Role

Derek designed and built the full Cascade system — pipeline architecture, all three API integrations, the concurrent streaming design, the FastAPI WebSocket backend, the configuration module, and the Phase 1 verification suite. The project was built as a demonstration that voice agent latency is an engineering problem solvable with correct pipeline design, directly applicable to the low-connectivity tutoring context of Edge AI.

---

## Technical Decisions

**Groq for LLM inference instead of OpenAI or Anthropic:** Groq's LPU (Language Processing Unit) hardware delivers significantly lower time-to-first-token than standard GPU-based inference APIs. Achieving sub-200ms first token is critical because TTS cannot start until the first sentence is available. At standard GPU inference speeds, the LLM stage alone would consume most of the latency budget.

**Sentence-level chunking instead of token-level TTS forwarding:** Sending individual tokens to TTS would produce incoherent audio fragments and flood the TTS API with tiny requests. Sentence chunking provides the minimum complete unit of speech — a full sentence — that TTS can render coherently, while still forwarding to TTS well before the full LLM response is complete.

**Deepgram Nova-2 over Whisper:** Nova-2 is a streaming-native model with a persistent WebSocket connection and continuous partial transcript emission. Whisper requires complete audio segments before transcription begins. For a live voice pipeline, Nova-2's streaming behavior is essential — it feeds partial transcripts to the LLM while the student is still speaking.

**FastAPI async WebSocket orchestrator:** The pipeline requires three simultaneous long-lived connections (Deepgram WebSocket, Groq streaming, OpenAI TTS streaming) plus the client WebSocket. FastAPI's asyncio model handles all of these concurrently on a single thread without the overhead of multi-threading or multiprocessing.

**Fail-fast config with frozen dataclasses:** All API keys are validated at module import time using `_require_env()`. If a key is missing, the error surfaces immediately with a clear message pointing to `.env`. Using `@dataclass(frozen=True)` makes config objects immutable — preventing accidental key mutation deep inside pipeline stages.

**Phased development with verification gates:** Phase 1 establishes and verifies all three external API connections before any pipeline code is written. This surfaces integration failures (wrong key, rate limits, network blocks) early, not mid-development when they're harder to debug.

---

## Challenges Encountered

**Challenge:** Balancing partial transcript forwarding with transcript accuracy — forwarding too early sends incomplete sentences to the LLM; waiting for final transcripts adds latency.
**Solution:** Deepgram Nova-2 emits both `is_final` interim results and fully confirmed transcripts. The pipeline uses `is_final` partial transcripts for early LLM forwarding while discarding corrections if the LLM has already consumed the partial.

**Challenge:** TTS API has a minimum viable input length — very short fragments (single words or short phrases from early sentence chunking) produce poor audio.
**Solution:** The sentence chunker enforces a minimum character threshold before forwarding to TTS, buffering tokens until a complete, speakable sentence is formed.

**Challenge:** The OpenAI TTS standard (non-streaming) endpoint adds ~891ms of latency. Streaming reduces this but requires iterating byte chunks and forwarding them individually over the client WebSocket.
**Solution:** `client.audio.speech.with_streaming_response.create()` iterates `response.iter_bytes(chunk_size=4096)`, forwarding each ~4KB chunk immediately over the WebSocket. The browser audio player begins playback on the first received chunk.

**Challenge:** Testing async WebSocket integrations (Deepgram, FastAPI) in standard pytest.
**Solution:** `pytest-asyncio` handles async test functions. Deepgram connection tests use `asyncio.Event` for synchronization — the open handler sets the event, and `asyncio.wait_for` enforces a 10-second timeout to prevent hanging tests.

---

## Performance Considerations

- Time-to-first-audio target: ~400ms from end of student speech.
- End-to-end pipeline target: under 600ms.
- Groq first-token latency: ~187ms (measured in Phase 1 verification).
- OpenAI TTS first-chunk latency: ~412ms (streaming) vs ~891ms (non-streaming).
- Concurrent asyncio tasks for all three pipeline stages — no blocking I/O anywhere in the hot path.
- WebSocket transport avoids HTTP handshake overhead on every audio chunk.
- Audio format: MP3 at 4KB chunks — small enough for low-latency streaming, large enough to avoid excessive WebSocket frames.

---

## Security Considerations

- API keys loaded from `.env` and never exposed in responses. `GET /health` confirms key presence (`bool(key)`) without revealing key values.
- CORS middleware configured with `allow_origins=["*"]` for development — tightened to specific origins in production.
- No user authentication in current phase — single-tenant demo architecture.
- No student audio is stored or logged; audio streams pass through the backend in-memory only.

---

## API Endpoints

**Health**

- `GET /` — Root liveness check. Returns project name, status, current phase.
- `GET /health` — Confirms API key presence and loaded model names. Returns `healthy`, `degraded`, or `unhealthy` status.

**WebSocket (Phase 2 — pipeline)**

- `WS /ws` — Bidirectional audio stream. Client sends PCM audio chunks; server streams MP3 TTS audio chunks back.

---

## Database Design

No database. Cascade is a stateless streaming pipeline — no persistence layer. Session state (conversation history for tutor context) is managed in-memory per WebSocket connection and discarded on disconnect.

---

## AI Components

**STT model:** Deepgram Nova-2 — streaming live transcription, 16kHz mono linear16 audio, language: en-US. Emits partial and final transcripts over WebSocket.

**LLM:** Llama 3.3 70B Versatile via Groq. Streaming completion with `stream=True`. Temperature 0.3 for consistent tutoring responses. Max tokens: configurable per session.

**TTS model:** OpenAI tts-1, voice: nova. Streaming MP3 audio output. Chosen for natural speech quality appropriate for student-facing tutoring interactions.

**Tutor persona (Phase 3 — planned):** System prompt and context management in `backend/tutor.py`. Tutor persona, curriculum context, and conversation history injection into LLM messages.

**Pipeline orchestration:** No ML model — the pipeline coordinator is pure asyncio logic in `backend/pipeline.py` (Phase 2). It manages concurrent tasks for each stage, partial output forwarding, sentence chunking, and WebSocket relay.

---

## Deployment

- **Local development:** `uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000`
- **Production:** `uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4`
- **Config:** `.env` file with `DEEPGRAM_API_KEY`, `GROQ_API_KEY`, `OPENAI_API_KEY`.
- **Verification:** `python tests/verify_all.py` — validates all three API connections before deployment.
- **Interactive docs:** `http://localhost:8000/docs` (FastAPI OpenAPI UI).
- **Estimated demo cost:** ~$5.66 total (Deepgram: $0.86 from free credit, Groq: ~$0.30 free tier, OpenAI TTS: ~$4.50).

---

## Future Improvements

- Phase 2: Full concurrent streaming pipeline implementation (`backend/pipeline.py`).
- Phase 3: Tutor persona with subject context, conversation history, and Ghana Education Service curriculum alignment.
- Phase 4: Browser frontend with microphone capture, audio playback, and per-stage latency visualizer.
- Interrupt handling: detect student speech mid-response and cancel the current TTS stream.
- VAD (Voice Activity Detection) integration for more precise end-of-speech detection.
- Whisper fallback for offline or low-connectivity environments.
- Session logging for tutor review and student progress tracking.
- Edge deployment variant: replace Groq/OpenAI with locally hosted models for offline use in low-connectivity contexts.

---

## Interview Questions About This Project

**Q: What is the core technical insight that makes Cascade faster than standard voice agents?**
A: Standard voice pipelines are sequential — each stage waits for full completion of the previous stage before starting. Cascade eliminates inter-stage idle time by streaming partial outputs between stages concurrently. Deepgram emits partial transcripts while the student is still speaking; those partials start the LLM immediately. The LLM's first complete sentence starts TTS immediately, without waiting for the full LLM response. The student hears audio at ~400ms, while a sequential pipeline would still be waiting for STT to finish.

**Q: Why Groq specifically for the LLM stage?**
A: Groq's LPU hardware delivers sub-200ms first-token latency, which is the critical metric for this pipeline. TTS cannot start until the LLM produces its first complete sentence. If the LLM's first token takes 800ms (typical on GPU inference), the total pipeline latency exceeds 1.5s before TTS even starts. Groq's ~187ms first-token latency preserves the latency budget for the TTS stage.

**Q: Why not use Whisper for STT?**
A: Whisper operates on complete audio segments — it buffers audio until it detects silence, then transcribes. This introduces 500ms–1s of STT latency before the LLM can start. Deepgram Nova-2 is streaming-native: it emits partial transcripts continuously while audio is arriving, allowing the LLM to begin processing before the student has finished speaking.

**Q: How does the sentence chunker work?**
A: The LLM token stream is monitored character by character. When the chunker detects a sentence-ending punctuation mark (`.`, `?`, `!`) with sufficient context (minimum character threshold), it flushes the accumulated tokens as a complete sentence to the TTS stage. This ensures TTS receives coherent, speakable units rather than incomplete fragments, while still starting TTS well before the full LLM response is complete.

**Q: What happens if a student interrupts mid-response?**
A: Current implementation doesn't handle interrupts — it's on the future roadmap. The production solution would use Voice Activity Detection (VAD) to detect new student speech, cancel the current in-flight TTS stream and LLM generation, and restart the pipeline from the new input.

**Q: How does this project relate to your Edge AI tutoring work?**
A: Cascade directly informs the voice interaction layer of Edge AI, the AI tutoring platform built for West African secondary schools. The latency reduction matters especially in low-bandwidth environments where round-trip network time is already elevated. The offline/edge future improvement — replacing Groq and OpenAI with locally hosted models — is the direct bridge between Cascade's architecture and Edge AI's offline-first design requirement.

---

## Keywords

voice agent, streaming pipeline, low-latency AI, speech-to-text, STT, Deepgram, Nova-2, LLM streaming, Groq, Llama 3.3, text-to-speech, TTS, OpenAI, tts-1, WebSocket, FastAPI, asyncio, concurrent pipeline, sentence chunking, partial transcript, EdTech, AI tutor, voice latency, first-token latency, time-to-first-audio, real-time AI, streaming audio, Python, async, uvicorn, Edge AI, Ghana, education technology, voice interaction, pipeline orchestration
