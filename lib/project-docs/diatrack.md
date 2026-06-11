# DiaTrack — Type 2 Diabetes Clinical Decision Support

## Overview

DiaTrack is a clinical decision support system for Type 2 diabetes risk assessment and patient management. Built for clinicians and patients — a Next.js web dashboard, a Flutter mobile app, and a FastAPI backend with ensemble ML models and SHAP-based explanations. A browser-only demo runs ONNX inference locally on GitHub Pages with no backend required.

**Live demo:** https://yendoh-derek.github.io/DiaTrack-Web-App/
**GitHub:** Web App · Backend · Mobile (all under github.com/Yendoh-Derek)

---

## The Problem It Solves

Clinicians assessing Type 2 diabetes risk receive opaque model scores with no explanation of which patient factors drove the prediction. Patients lack a simple way to track their health data over time. In resource-constrained settings like Ghana, a tool that is both accurate and interpretable supports clinical conversations meaningfully — without requiring expensive lab infrastructure for every follow-up.

---

## Key Features & Architecture

**Ensemble ML risk prediction** — Stacked models: CatBoost, HistGradientBoosting, TabNet, with XGBoost as meta-learner. Validation AUC ~0.978, accuracy ~98%. Different base learners capture complementary patterns in tabular clinical data; stacking improved AUC beyond any individual model.

**SHAP explanations** — Feature-level contribution breakdowns on every prediction. Clinicians see which inputs (HbA1c, BMI, blood glucose, etc.) drove the risk score — something they can verify against their own clinical judgment and discuss with patients.

**In-browser ONNX demo** — A lightweight logistic regression exported to ONNX runs entirely in the browser via ONNX Runtime Web on GitHub Pages. No backend dependency for the portfolio demo — full prediction flow works client-side.

**Cross-platform patient management** — Clinician web dashboard (React + Vite) and Flutter mobile app both communicate with a FastAPI backend over REST. Patients submit vitals and lab values; the API returns risk score plus SHAP attributions.

---

## Key Technical Decisions

**Stacked ensemble over a single model:** Base learners capture different signal types in tabular clinical data. A meta-learner stacking CatBoost, HistGradientBoosting, and TabNet pushed validation AUC beyond what any individual model achieved.

**SHAP on every prediction:** Clinical users need interpretability, not just accuracy. SHAP force plots translate model output into feature contributions a clinician can verify — essential for a tool meant to support, not replace, clinical judgment.

**ONNX for the portfolio demo:** A backend-dependent demo limits reach on GitHub Pages. Exporting a lightweight logistic regression to ONNX lets the full prediction flow run in-browser at zero infrastructure cost.

---

## Technology Stack

| Layer   | Stack                                                                       |
| ------- | --------------------------------------------------------------------------- |
| Web     | React 18, TypeScript, Vite, Tailwind, shadcn/ui, Recharts, ONNX Runtime Web |
| Mobile  | Flutter, REST API                                                           |
| Backend | FastAPI, PostgreSQL, Pydantic                                               |
| ML      | PyTorch, XGBoost, CatBoost, TabNet, SHAP, ONNX                              |

---

## Derek's Role

Designed and built the full DiaTrack ecosystem — ML training pipelines, FastAPI inference API, clinician dashboard, mobile patient experience, and the GitHub Pages demo with in-browser ONNX inference.
