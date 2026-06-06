# DiaTrack — Type 2 Diabetes Clinical Decision Support

## Overview

DiaTrack is a comprehensive clinical support system for Type 2 diabetes risk assessment and patient management. It includes a clinician-facing Next.js dashboard, a Flutter patient mobile app, and a FastAPI backend with ensemble machine learning models and SHAP-based explanations. A browser-only demo runs ONNX inference locally for portfolio and educational use.

**Repositories:** [Web App](https://github.com/Yendoh-Derek/DiaTrack-Web-App) · [Backend](https://github.com/Yendoh-Derek/DiaTrack-Backend) · [Mobile](https://github.com/Yendoh-Derek/DiaTrack-Mobile-App)

**Live demo:** https://yendoh-derek.github.io/DiaTrack-Web-App/

> For educational and portfolio demonstration only. Not for clinical diagnosis.

---

## Key Features

- **ML risk assessment** — Ensemble models (CatBoost, HistGradientBoosting, TabNet, XGBoost meta-learner) with reported AUC ~0.978 and accuracy ~98% on validation sets.
- **SHAP explanations** — Feature contribution breakdown for clinician trust.
- **Patient management** — Register, search, and track demo patients (web); full patient flows on mobile.
- **In-browser demo** — ONNX logistic regression with localStorage for GitHub Pages deployments.
- **Health chatbot** — Educational fallback responses in the web demo (no API key required).

---

## Technology Stack

| Layer | Stack |
|-------|--------|
| Web | React 18, TypeScript, Vite, Tailwind, shadcn/ui, Recharts, ONNX Runtime Web |
| Mobile | Flutter, REST API to FastAPI |
| Backend | FastAPI, PostgreSQL, Python ML stack |
| ML | PyTorch, XGBoost, SHAP, stacked ensembles |

---

## My Role

Derek designed and built the DiaTrack ecosystem — ML training pipelines, FastAPI inference APIs, clinician dashboard, mobile patient experience, and the static GitHub Pages demo with in-browser ONNX inference.

---

## Keywords

HealthTech, diabetes, clinical decision support, Type 2 diabetes, SHAP, XGBoost, FastAPI, Next.js, Flutter, ONNX, Ghana, interpretable ML, patient management
