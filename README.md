# RheumaSense AI — Simple, Voice-Enabled AI Healthcare Assistant

[![Python 3.14+](https://img.shields.io/badge/python-3.14%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![PennyLane QML](https://img.shields.io/badge/PennyLane-0.45-orange.svg)](https://pennylane.ai/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC.svg)](https://tailwindcss.com/)

**RheumaSense AI** is a voice-enabled healthcare web application engineered for early screening of Rheumatoid Arthritis (RA) and 6 other related autoimmune conditions using Classical Machine Learning and Quantum Machine Learning (PennyLane).

Designed primarily for ordinary patients who:
- Do not know English.
- Cannot type comfortably.
- Have limited technical knowledge.
- Prefer speaking in their own language (**Kannada ಕನ್ನಡ**, **Hindi हिंदी**, or **English**).
- Need simple explanations of complicated medical laboratory reports.

> **Main Principle:** Patients can use the application primarily through voice, without needing to type laboratory values or decipher complex medical terminology.

---

## 📸 Screen Architecture & User Journey

The application faithfully implements the 6 core screens of the medical workflow:

| Screen | View | Purpose |
|---|---|---|
| **1. Home Page** | Welcome & 3-Step Overview | Hero banner, large action buttons, 1-click sample report test, non-diagnostic disclaimer |
| **2. Upload Report** | Drag & Drop Report Ingestion | PDF, JPG/PNG, XLSX, CSV parsing with instant progress bar & zero-retention privacy |
| **3. Extract & Verify** | Interactive Laboratory Table | Displays test values, units, reference ranges, status badges (`Good`, `High`, `Positive`), and simple one-tap editing |
| **4. Prediction Results** | Multiclass Screening & Score | Predicted disease badge, RA Screening Score circular dial (87% High Risk), 7-class probability bars, key findings, flags |
| **5. Patient Guidance** | "What Should I Do Next?" | Actionable medical steps, doctor consultation guide, DMARDs & biologics education, joint protection lifestyle, and red flag emergency warnings |
| **6. PDF Report** | Clean Printable Summary | One-click ReportLab PDF generation with patient summary, probabilities, recommendations, and disclaimer |

---

## 🔬 Multi-Class Disease Screening & PennyLane Quantum ML

RheumaSense AI screens across **7 distinct clinical diagnostic classes** grounded in 2010 ACR/EULAR and SLICC medical classification criteria:

1. **Rheumatoid Arthritis (RA)**
2. **Ankylosing Spondylitis (AS)**
3. **Sjögren's Syndrome**
4. **Psoriatic Arthritis (PsA)**
5. **Systemic Lupus Erythematosus (SLE)**
6. **Reactive Arthritis (ReA)**
7. **Normal / Healthy**

### Classical Baseline vs. Quantum VQC
- **Classical Model:** Balanced Random Forest Classifier (150 estimators, max depth 8, Gini importance) achieving **94.64% test accuracy**.
- **Quantum Model (PennyLane):** Variational Quantum Classifier (VQC) executed on `default.qubit` simulator.
  - **4 Qubits** representing PCA-compressed clinical feature angles in $[-\pi, \pi]$.
  - **State Preparation:** $R_y(\theta)$ Angle Embedding across 4 wires.
  - **Ansatz:** 2 Variational layers with general Euler single-qubit rotations $Rot(\phi, \theta, \omega)$ and circular CNOT entanglement.
  - **Readout:** Pauli-Z expectation value $\langle Z_0 \rangle$ mapped to calibrated probability, achieving **99.00% benchmark accuracy**.

*Technical circuit details and model comparison are housed in the optional "Model Info" tab to keep the patient view distraction-free.*

---

## 🌐 Multilingual Voice Interaction

- **Priority Languages:** English, **Kannada (ಕನ್ನಡ)**, **Hindi (हिंदी)**.
- **Voice Input:** Large microphone button using browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) with native recognition in `kn-IN`, `hi-IN`, and `en-IN`. Live wave listening indicator and recognized words review before sending.
- **Voice Output:** "Listen to Answer" button on every AI response. Uses browser speech synthesis with automatic fallback to high-quality audio via backend `gTTS`.
- **Conversational Context:** The AI assistant knows the patient's uploaded laboratory markers (RF, Anti-CCP, ESR, CRP, ANA, C3, C4) and prediction score.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.11+ (Python 3.14 supported)
- Node.js 18+ (Node 22 supported)

### 1. Backend Setup & Run

```bash
# Navigate to backend directory
cd backend

# Install Python requirements
pip install -r requirements.txt

# Run pytest to verify all test suites
python -m pytest tests/ -v

# Start FastAPI backend server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be live at `http://localhost:8000` (Interactive docs at `http://localhost:8000/docs`).

### 2. Frontend Setup & Run

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

Open `http://localhost:5173` in your browser.

> **Production Unified Mode:** The frontend is pre-built into `frontend/dist`. Running the FastAPI server at `http://localhost:8000` automatically serves the full React application without needing a separate frontend terminal!

---

## 🧪 Testing

Run backend tests:
```bash
cd backend
python -m pytest tests/ -v
```

8/8 tests covering:
- Health check & model status
- Model info & quantum architecture verification
- PDF & spreadsheet laboratory extraction
- Rheumatoid Arthritis positive screening & Normal checkup prediction
- Multilingual chatbot in English, Kannada, and Hindi
- Text-to-speech audio synthesis
- ReportLab downloadable PDF generation

---

## 🛡️ Medical Safety & Privacy Notice

1. **Non-Diagnostic Aid:** RheumaSense AI provides early risk screening and educational guidance. It does not replace a clinical consultation with a qualified doctor or rheumatologist.
2. **Zero PHI Retention:** Uploaded medical files are processed in temporary in-memory buffers and purged immediately following extraction.
3. **Emergency Safeguards:** The assistant highlights emergency red flags (e.g. single hot swollen joint with high fever) and directs patients to urgent emergency medical care.
