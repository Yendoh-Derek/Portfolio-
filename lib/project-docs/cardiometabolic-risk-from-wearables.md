# Cardiometabolic Risk System for Wearables

## Overview

A self-supervised learning (SSL) system that learns cardiometabolic risk representations from raw PPG (photoplethysmography) signals recorded by wearable devices. The system uses a denoising autoencoder to pre-train on unlabeled wearable data from the MIMIC-III clinical database, learning robust physiological signal embeddings without manual annotations. The pre-trained encoder can then be fine-tuned downstream for cardiometabolic risk prediction tasks such as detecting lipid abnormalities, hypertension markers, and obesity signals from wrist-worn sensor data.

---

## Problem Statement

Wearable devices generate continuous, high-resolution physiological signals (PPG, heart rate, step counts) in real-world conditions. However, this data is noisy, irregular, unlabeled, and rarely used beyond basic activity tracking. Clinically meaningful cardiometabolic risk markers — dyslipidemia, hypertension, metabolic syndrome — are typically assessed only through invasive lab tests. This project addresses the gap between passive wearable data and actionable cardiometabolic insight by training a signal encoder that extracts rich physiological representations without needing labeled clinical data.

---

## Key Features

- Self-supervised pre-training on MIMIC-III PPG signals — no labels required during encoder training.
- Custom multi-component loss function combining temporal, structural, and frequency-domain objectives.
- Signal-quality-aware data pipeline with SQI (Signal Quality Index) filtering and dead-sensor rejection.
- Label-free augmentation pipeline preserving PPG morphology (heart rate, pulse amplitude, crest time).
- Mixed-precision (FP16) training with gradient accumulation, designed for Google Colab GPU environments.
- Phased development architecture (Phase 0 through Phase 5A+) with MLflow experiment tracking.
- ONNX export support for downstream deployment and inference optimization.

---

## Technical Architecture

The system is a denoising autoencoder built on 1D ResNet blocks, designed for PPG time series.

**Encoder (2.8M parameters)**
Input: `(batch, 1, 1250)` — 10-second window at 125 Hz
Spatial progression: `[B,1,1250] → [B,64,625] → [B,128,312] → [B,256,156] → AvgPool → [B,512]`
3-block architecture (not 4) to prevent over-compression of 1,250-sample windows.
Each block: Conv1D → BatchNorm → ReLU → Conv1D → BatchNorm + skip connection.

**Decoder (1.2M parameters)**
Input: `(batch, 512)` latent vector
Spatial progression: `[B,512] → [B,256,78] → [B,128,156] → [B,64,312] → [B,32,625] → [B,1,1250]`
Mirrors encoder using transposed residual blocks (ConvTranspose1d).

**Total model: 4.0M parameters**

**Loss Function**

```
L_total = 0.50 × L_MSE + 0.30 × L_SSIM + 0.20 × L_FFT
```

- MSE: Pixel-level temporal reconstruction fidelity
- SSIM: Structural similarity via 1D Gaussian kernel — preserves waveform morphology
- FFT: Frequency-domain alignment (magnitude + phase) — preserves heart rate signal

---

## Technology Stack

**Deep Learning:** PyTorch 2.1+, torchvision, torchaudio, ONNX, ONNXRuntime

**Signal Processing:** wfdb (MIMIC waveform loading), neurokit2 (PPG analysis), PyWavelets (denoising), scipy

**ML / Experiment Tracking:** MLflow, scikit-learn, XGBoost, LightGBM, SHAP

**Data Infrastructure:** NumPy, Pandas, PyArrow (Parquet), fastparquet, joblib, Great Expectations (data validation)

**Training Infra:** Hydra + OmegaConf (config management), mixed precision (torch.cuda.amp), CosineAnnealingWarmRestarts scheduler

**Deployment / Serving:** FastAPI, Uvicorn, Pydantic, ONNX export

**Visualization:** Matplotlib, Seaborn, Plotly

**Clinical:** comorbidipy (comorbidity scoring)

**Environment:** Google Colab (GPU), local development, Google Drive checkpoint storage

---

## How It Works

1. **Data ingestion**: Raw MIMIC-III PPG waveforms (WFDB format) are loaded and converted to processed parquet files.
2. **Signal preprocessing**: PPG signals are denoised using PyWavelets, segmented into 10-second windows (1,250 samples at 125 Hz), and indexed in a JSON metadata store.
3. **Quality filtering**: Each window is scored using a Signal Quality Index (SQI); windows below threshold (0.4 for training) are dropped. Dead-sensor windows (std < 1e-5) are also rejected.
4. **Per-window normalization**: Each 1,250-sample window is Z-score normalized independently before feeding to the model.
5. **Augmentation (training only)**: Each signal is augmented with temporal shifts (±2%), amplitude scaling (0.85–1.15×), baseline wander injection at 0.2 Hz, and SNR-matched Gaussian noise (applied with 40% probability).
6. **SSL pre-training**: The encoder compresses the signal to a 512-dim latent vector. The decoder reconstructs the clean signal from the corrupted/augmented input. The multi-component loss guides reconstruction.
7. **Experiment tracking**: All training runs are logged to MLflow (loss curves, hyperparameters, checkpoints).
8. **Downstream fine-tuning**: The pre-trained encoder weights are frozen or partially unfrozen and fine-tuned with a classification/regression head on labeled cardiometabolic outcomes.

---

## My Role

Derek designed and built the full system end-to-end. This includes the 1D ResNet encoder and decoder architecture, the multi-loss function (MSE + SSIM + FFT), the PPG augmentation pipeline, the lazy-loading dataset class with SQI filtering, the SSL training loop with gradient accumulation and mixed precision, and the Hydra-based configuration system. Derek also structured the phased development approach (Phase 0 → Phase 5A+) and wrote all associated technical documentation.

---

## Technical Decisions

**3-block encoder instead of 4:** A 4-block encoder with stride-2 at every block would compress 1,250 samples to only ~78 timesteps before the bottleneck, losing too much temporal resolution. A 3-block design retains ~156 timesteps before pooling, preserving more signal structure.

**10-second windows (1,250 samples) instead of 10-minute signals (75,000 samples):** Full 10-minute signals caused extreme memory pressure and prohibitively slow FFT computation (padding to 131,072 points). Windowing to 10 seconds reduced FFT padding from 131,072 to 2,048 — a 67× speedup — and enabled batch sizes of 128 instead of 8.

**Multi-loss (MSE + SSIM + FFT):** Pure MSE encourages pixel-level accuracy but misses morphology and frequency content. SSIM enforces structural waveform shape. FFT loss ensures the encoder captures periodic heart rate structure. All three objectives together produce a more clinically meaningful representation.

**Lazy loading with numpy .npy arrays:** Loading all 4,133+ signals into RAM at once is infeasible on Colab. The dataset class memory-maps the signal array and loads only the required window at `__getitem__` time.

**Subject-level train/val/test split:** `subject_id` is preserved as a STRING to ensure the same patient's signals never appear in both train and validation — preventing data leakage across temporal recordings.

**FP16 mixed precision:** Required for Colab GPU training. FP16 forward/backward passes with FP32 optimizer state reduce GPU memory by ~40%, allowing larger batch sizes.

---

## Challenges Encountered

**Challenge:** FFT loss computation was extremely slow (10+ seconds per batch) due to padding signals to 131,072 points (next power of 2 above 75,000).
**Solution:** Switched from 10-minute signals to 10-second windows (1,250 samples). FFT padding dropped to 2,048, reducing compute by 67×.

**Challenge:** Batch size of 8 caused unstable training with high gradient variance.
**Solution:** After windowing, increased batch size to 128. Gradient accumulation (4 steps) was removed as it was no longer necessary.

**Challenge:** Dead-sensor windows (flat or near-flat PPG signals) caused division-by-zero during Z-score normalization.
**Solution:** Added `min_std_threshold = 1e-5` check; windows with std below this are dropped at load time via the custom `collate_fn_skip_none` function.

**Challenge:** Temporal shift augmentation was applying ±10% shifts to 75,000-sample signals (±7,500 samples), which is physiologically unrealistic and destructive.
**Solution:** After windowing, ±2% of 1,250 samples = ±25 samples, which correctly models realistic beat onset jitter.

---

## Performance Considerations

- FP16 mixed precision (torch.cuda.amp) with GradScaler for stable Colab GPU training.
- Lazy-loading dataset with optional in-memory loading for fast local experiments.
- Per-window Z-score normalization rather than global statistics to handle inter-patient signal amplitude variability.
- CosineAnnealingWarmRestarts scheduler with 2-epoch warmup for smooth convergence on 10-second windows.
- Early stopping with patience=15 to prevent overfitting on pre-training objective.
- Parquet format for metadata storage (faster I/O vs CSV for large datasets).

---

## Security Considerations

- Data is sourced from MIMIC-III, which requires credentialed access (PhysioNet) and completion of the CITI data or equivalent training. The codebase does not store or expose raw MIMIC data.
- No patient-identifiable information is exposed in model weights, configs, or logs.
- No public API or user-facing authentication is implemented in this version (research-stage project).

---

## API Endpoints

The project includes FastAPI scaffolding for model inference, but endpoint documentation is research-stage and not yet publicly deployed. Core inference routes are planned for:

- `POST /predict` — Accept PPG signal segment, return risk embedding or downstream prediction.
- `GET /health` — Service health check.

---

## Database Design

No relational database. Data is managed as a flat file system:

- `data/processed/mimic_windows_metadata.parquet` — Window-level metadata (subject_id, signal_quality, split assignments).
- `data/processed/mimic_windows.npy` — Stacked numpy array of all 1,250-sample PPG windows.
- `data/processed/denoised_signal_index.json` — Index mapping window IDs to denoised signal file paths.
- `data/processed/ssl_validation_data.parquet` and `ssl_test_data.parquet` — Held-out splits.
- `checkpoints/` — MLflow-tracked model checkpoints.

---

## AI Components

**Model type:** Self-supervised denoising autoencoder (representation learning, not supervised classification).

**Encoder:** 1D ResNet, 3 residual blocks, stride-2 downsampling. Input: 1,250-sample PPG window → Output: 512-dim latent vector.

**Decoder:** 1D Transposed ResNet, mirrors encoder. Input: 512-dim → Output: 1,250-sample reconstructed signal.

**Loss:** Hybrid MSE (0.50) + SSIM (0.30) + FFT (0.20). SSIM uses a 1D Gaussian kernel with window_size=11. FFT uses orthonormal normalization with pad_size=2048.

**Augmentation strategy:** Label-free, morphology-preserving. Four transforms: temporal shift, amplitude scaling, baseline wander injection, SNR-matched Gaussian noise.

**Data:** MIMIC-III Matched Subset — 4,133 training windows of 10-second PPG signals at 125 Hz.

**Downstream use case:** Fine-tuning the encoder for prediction of lipid abnormalities, blood pressure markers, and obesity signals from wearable PPG.

**Experiment tracking:** MLflow with full hyperparameter logging and checkpoint versioning.

**Export:** ONNX for optimized inference deployment.

---

## Deployment

- **Training environment:** Google Colab (GPU), Google Drive for checkpoint persistence.
- **Local environment:** Ubuntu/macOS with PyTorch 2.1+, Hydra configs, MLflow local server.
- **Inference:** FastAPI + Uvicorn with ONNX Runtime for production-grade model serving (planned).
- **Config management:** Hydra + OmegaConf YAML (`configs/ssl_pretraining.yaml`).
- **CI/Testing:** 39 unit tests covering model components, data pipeline, and loss functions.

---

## Future Improvements

- Fine-tuning pipeline: attach classification/regression head to frozen encoder and train on labeled MIMIC clinical data.
- ONNX quantization (INT8) for edge deployment on wearable companion apps.
- Contrastive SSL objective (SimCLR or BYOL-style) as an alternative to denoising autoencoder.
- Multi-modal encoder: fuse PPG with accelerometer and step count signals.
- Real-time inference API with sliding window buffer for continuous wearable stream processing.
- Deployment as a FastAPI microservice with Docker container.

---

## Interview Questions About This Project

**Q: Why self-supervised learning instead of supervised classification?**
A: Labeled cardiometabolic data from wearables is scarce and expensive to obtain. MIMIC-III provides abundant unlabeled PPG waveforms. SSL allows the model to learn clinically meaningful signal representations from raw data, with the encoder then fine-tuned for specific tasks using only a small labeled dataset.

**Q: Why PPG signals specifically?**
A: PPG is the primary biosignal captured by consumer wearables (smartwatches, fitness bands) via optical sensors. It encodes heart rate, pulse morphology, and vascular tone — all of which correlate with cardiometabolic markers such as hypertension, dyslipidemia, and metabolic syndrome.

**Q: What does the SSIM loss contribute that MSE doesn't?**
A: MSE penalizes point-wise amplitude errors but is blind to waveform shape. SSIM measures local structural patterns (means, variances, covariance) using a sliding Gaussian window, which penalizes morphological distortion even when the amplitude error is numerically small. For PPG signals, preserving the diastolic notch, peak shape, and dicrotic wave matters more than exact amplitude.

**Q: How did you handle the data leakage risk with MIMIC data?**
A: Subject IDs are preserved as strings and used to enforce a strict subject-level split — all windows from the same patient are confined to a single split (train, val, or test). This prevents the model from seeing training-time signal context during evaluation.

**Q: What was the biggest performance bottleneck and how did you solve it?**
A: The FFT loss on 75,000-sample signals required padding to 131,072 points, making each batch take over 10 seconds. Switching to 10-second windowing (1,250 samples) reduced the FFT pad to 2,048 — a 67× speedup — and also allowed batch sizes to increase from 8 to 128.

**Q: Why ResNet instead of Transformer?**
A: 1D ResNets are computationally efficient for time series of this length, well-suited to Colab GPU constraints, and produce strong local feature extraction via hierarchical convolutions. Transformer attention on 1,250-length sequences would require significant positional encoding tuning and higher memory overhead for marginal gain at this scale.

---

## Keywords

self-supervised learning, SSL, denoising autoencoder, PPG, photoplethysmography, cardiometabolic risk, wearables, MIMIC-III, 1D ResNet, signal processing, heart rate, time series, representation learning, PyTorch, mixed precision, MLflow, FastAPI, ONNX, biomedical engineering, HealthTech, clinical AI, waveform reconstruction, SSIM loss, FFT loss, gradient accumulation, Colab training, signal quality index, SQI, data pipeline, Hydra, OmegaConf, XGBoost, LightGBM, SHAP, neurokit2, wfdb, PyWavelets
