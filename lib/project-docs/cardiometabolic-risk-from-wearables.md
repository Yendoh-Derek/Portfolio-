# Cardiometabolic Risk System for Wearables

## Overview

A self-supervised learning (SSL) system that learns cardiometabolic risk representations from raw PPG (photoplethysmography) signals recorded by wearable devices. Uses a denoising autoencoder pre-trained on unlabeled MIMIC-III clinical data, learning robust physiological signal embeddings without manual annotations. The pre-trained encoder is then fine-tuned downstream for tasks such as detecting lipid abnormalities, hypertension markers, and obesity signals from wrist-worn sensor data.

**Problem it solves:** Clinically meaningful cardiometabolic markers are typically assessed through invasive lab tests, while wearable PPG data sits unused beyond step counting. This project closes that gap by training a signal encoder that extracts physiological representations without needing labeled clinical data.

---

## Technical Architecture

Denoising autoencoder built on 1D ResNet blocks, designed for PPG time series.

**Encoder — 2.8M parameters**
`[B,1,1250] → [B,64,625] → [B,128,312] → [B,256,156] → AvgPool → [B,512]`
3-block architecture (not 4) — preserves ~156 timesteps before pooling, retaining signal structure that a 4-block design would over-compress to ~78 timesteps.
Each block: Conv1D → BatchNorm → ReLU → Conv1D → BatchNorm + skip connection.

**Decoder — 1.2M parameters**
`[B,512] → [B,256,78] → [B,128,156] → [B,64,312] → [B,32,625] → [B,1,1250]`
Mirrors encoder using transposed residual blocks (ConvTranspose1d).

**Total: 4.0M parameters**

**Loss Function**
L_total = 0.50 × L_MSE + 0.30 × L_SSIM + 0.20 × L_FFT

- MSE: temporal reconstruction fidelity
- SSIM: structural similarity via 1D Gaussian kernel — preserves waveform morphology
- FFT: frequency-domain alignment — preserves heart rate signal structure

---

## Data Pipeline

1. Raw MIMIC-III PPG waveforms (WFDB format) loaded and converted to Parquet.
2. Denoised with PyWavelets, segmented into 10-second windows (1,250 samples at 125 Hz).
3. SQI filtering drops windows below threshold (0.4). Dead-sensor windows (std < 1e-5) rejected via `collate_fn_skip_none`.
4. Per-window Z-score normalization (not global — handles inter-patient amplitude variability).
5. Augmentation: temporal shifts (±2%), amplitude scaling (0.85–1.15×), baseline wander at 0.2 Hz, SNR-matched Gaussian noise (40% probability).
6. Lazy-loading via memory-mapped `.npy` array — all 4,133+ windows cannot fit in Colab RAM simultaneously.
7. Subject-level train/val/test split — `subject_id` preserved as STRING to prevent data leakage across temporal recordings.

---

## Key Technical Decisions

**10-second windows instead of 10-minute signals:** Full signals (75,000 samples) required FFT padding to 131,072 points — over 10 seconds per batch. Windowing to 1,250 samples reduced FFT padding to 2,048, a 67× speedup, and increased viable batch size from 8 to 128.

**3-block encoder:** A 4-block design with stride-2 at every block compresses 1,250 samples to ~78 timesteps before the bottleneck — too much temporal resolution lost for PPG morphology.

**Multi-loss (MSE + SSIM + FFT):** Pure MSE is blind to waveform shape and frequency content. SSIM preserves the diastolic notch, peak shape, and dicrotic wave. FFT captures periodic heart rate structure. All three are necessary for clinically meaningful representations.

**Subject-level splits:** Same patient's signals must never span train and val — temporal recordings from one patient are highly correlated and would constitute leakage.

**FP16 mixed precision:** Reduces GPU memory by ~40% on Colab, enabling batch sizes of 128 with FP32 optimizer state for stability.

---

## Technology Stack

**Deep Learning:** PyTorch 2.1+, ONNX, ONNXRuntime

**Signal Processing:** wfdb, neurokit2, PyWavelets, scipy

**ML / Tracking:** MLflow, scikit-learn, XGBoost, LightGBM, SHAP

**Data:** NumPy, Pandas, PyArrow (Parquet), Great Expectations

**Training Infra:** Hydra + OmegaConf, torch.cuda.amp, CosineAnnealingWarmRestarts

**Serving:** FastAPI, Uvicorn, Pydantic (planned inference API)

**Environment:** Google Colab (GPU), Google Drive checkpoints

---

## Current Status & Roadmap

SSL pre-training complete with MLflow-tracked checkpoints. 39 unit tests passing across model components, data pipeline, and loss functions.

Planned next steps:

- Fine-tuning pipeline with classification/regression head on labeled MIMIC clinical outcomes
- ONNX INT8 quantization for edge/wearable deployment
- Contrastive SSL objective (SimCLR or BYOL-style) as alternative pre-training
- Multi-modal encoder fusing PPG with accelerometer and step count signals
- Real-time FastAPI inference microservice with sliding window buffer

---

## Derek's Role

Designed and built the full system — 1D ResNet encoder/decoder architecture, multi-loss function, PPG augmentation pipeline, lazy-loading dataset with SQI filtering, SSL training loop with mixed precision, and Hydra configuration system. Also structured the phased development approach (Phase 0 → Phase 5A+) and all technical documentation.
