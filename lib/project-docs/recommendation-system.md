# LLM Recommender System

## Overview

An AI-powered recommendation platform that combines semantic retrieval and LLM reasoning to generate context-aware recommendations from natural language queries. Built as part of Derek's work at 4th IR, targeting Hugging Face model discovery — helping users find relevant open-source models by describing their needs conversationally rather than browsing by keyword.

**GitHub:** github.com/Yendoh-Derek/LLM-Recommender-System

---

## The Problem It Solves

Traditional recommendation systems struggle with cold-start (no interaction history) and vocabulary mismatch — users describe what they need in natural language, but keyword search misses semantically relevant results that use different terminology. Collaborative filtering requires interaction data that doesn't exist for new users or niche catalogs like ML model repositories.

This system solves both by replacing keyword matching with embedding-based semantic retrieval, then using an LLM to interpret intent and generate ranked, explained recommendations.

---

## Pipeline Architecture

User query (natural language)
↓
Embed query → vector representation
↓
Semantic similarity search over Hugging Face model documentation
↓
Top-k relevant chunks retrieved
↓
LLM interprets retrieved context + user intent
↓
Ranked recommendations returned with natural language rationale

---

## Key Technical Decisions

**Semantic retrieval over keyword search:** Users describe needs with varied terminology. Embedding-based similarity matches meaning across different phrasings — solving both cold-start and vocabulary mismatch in one move. A user asking for "a fast model for summarizing medical notes" finds relevant models even if none use those exact words.

**RAG over pure LLM generation:** Recommending models from LLM parametric knowledge alone produces hallucinated model names and outdated information. Grounding responses in retrieved Hugging Face documentation ensures factual, verifiable recommendations.

**SAC (Soft Actor-Critic) RL agent for adaptive ranking:** A reinforcement learning agent is designed to replace the retrieval ranking policy once trained. SAC handles continuous action spaces and exploration more stably than DQN — better suited to ranking policies where the action space is continuous relevance scores rather than discrete choices. Training pipeline built for Google Colab.

**Modular pipeline design:** The API is structured for a clean policy swap-in — the retrieval ranking layer can be replaced with the trained SAC agent without touching the embedding or LLM generation stages.

---

## Technology Stack

**Backend:** FastAPI, Python, Pydantic, Uvicorn

**AI/ML:** Sentence Transformers (embeddings), FAISS / ChromaDB (vector search), LangChain, OpenAI API, Hugging Face Hub, SAC RL agent

**Data:** Pandas, NumPy

**Environment:** Jupyter Notebook, Google Colab (RL training)

---

## Current Status & Roadmap

API scaffold complete with semantic retrieval and LLM generation pipeline. SAC agent training pipeline designed for Colab — adaptive ranking policy integration is the next milestone.

Planned:

- SAC agent training and policy swap-in for adaptive ranking
- User interaction history for session-level personalization
- Hybrid recommendation combining semantic retrieval + collaborative filtering
- Vector database upgrade (Pinecone, Weaviate, or Qdrant) for production scale
- Multi-modal embeddings (code, model cards, benchmark results)

---

## Derek's Role

Designed and built the full recommendation pipeline — embedding architecture, semantic retrieval layer, LLM generation integration, FastAPI service, and SAC RL agent training pipeline. Part of his production AI engineering work at 4th IR.
