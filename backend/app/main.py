"""
FastAPI Application for RheumaSense AI
Endpoints:
- GET  /health
- GET  /model-info
- POST /upload-report
- POST /predict
- POST /chat
- POST /speech-to-text
- POST /text-to-speech
- POST /report-pdf
- GET  /sample-reports
"""

import os
import io
import json
import shutil
from pathlib import Path
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
from app.config import (
    BASE_DIR, TEMP_DIR, MODELS_DIR, DATASET_PATH,
    SAMPLES_DIR, MAX_UPLOAD_SIZE, SUPPORTED_LANGUAGES
)
from app.models.schemas import (
    ReportExtractionResponse, PredictionRequest, PredictionResponse,
    ChatRequest, ChatResponse, TTSRequest, STTRequest
)
from app.services.extractor import extract_report
from app.services.predictor import run_prediction, get_models
from app.services.chatbot import generate_assistant_response
from app.services.voice import synthesize_speech, transcribe_speech_fallback
from app.services.pdf_generator import generate_screening_pdf

app = FastAPI(
    title="RheumaSense AI API",
    description="Backend services for voice-enabled autoimmune and rheumatoid arthritis screening.",
    version="1.0.0"
)

from fastapi.staticfiles import StaticFiles

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIST = BASE_DIR / "frontend" / "dist"
if FRONTEND_DIST.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIST / "assets")), name="assets")

    @app.get("/")
    def serve_frontend():
        return FileResponse(str(FRONTEND_DIST / "index.html"))



@app.get("/health")
def health_check():
    classical, qml = get_models()
    eval_path = MODELS_DIR / "evaluation_results.json"
    is_eval_ready = eval_path.exists()

    return {
        "status": "healthy",
        "service": "RheumaSense AI",
        "classical_model_ready": classical is not None and classical.is_trained,
        "quantum_model_ready": qml is not None and qml.is_trained,
        "evaluation_metrics_ready": is_eval_ready,
        "supported_languages": list(SUPPORTED_LANGUAGES.keys())
    }


@app.get("/model-info")
def get_model_info():
    eval_path = MODELS_DIR / "evaluation_results.json"
    if not eval_path.exists():
        raise HTTPException(status_code=404, detail="Model evaluation data not available.")

    with open(eval_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data


@app.post("/upload-report", response_model=ReportExtractionResponse)
async def upload_medical_report(file: UploadFile = File(...)):
    """Upload and automatically extract laboratory markers from PDF, CSV, XLSX, PNG, JPG."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    # Validate file size & save temporarily
    temp_file_path = TEMP_DIR / file.filename
    try:
        content = await file.read()
        if len(content) > MAX_UPLOAD_SIZE:
            raise HTTPException(status_code=413, detail="File exceeds maximum allowed size (15 MB).")

        with open(temp_file_path, "wb") as f:
            f.write(content)

        # Extract values
        extraction_result = extract_report(str(temp_file_path))
        return extraction_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process report: {str(e)}")
    finally:
        # Privacy safeguard: delete temporary upload file
        if temp_file_path.exists():
            try:
                os.remove(temp_file_path)
            except:
                pass


@app.post("/predict", response_model=PredictionResponse)
def predict_autoimmune_risk(req: PredictionRequest):
    """Run Classical + Quantum ML screening pipeline on verified values."""
    try:
        result = run_prediction(req)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/chat", response_model=ChatResponse)
def chat_patient_assistant(req: ChatRequest):
    """Multilingual AI conversational assistant."""
    try:
        resp = generate_assistant_response(req)
        return resp
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@app.post("/speech-to-text")
def speech_to_text(req: STTRequest):
    """Fallback STT endpoint."""
    text = transcribe_speech_fallback(req.audio_base64, req.language)
    return {"transcript": text, "language": req.language}


@app.post("/text-to-speech")
def text_to_speech(req: TTSRequest):
    """Synthesize speech audio (MP3 base64) for Kannada, Hindi, or English."""
    audio_b64 = synthesize_speech(req.text, req.language)
    if not audio_b64:
        raise HTTPException(status_code=500, detail="Speech synthesis unavailable for this text.")
    return {"audio_base64": audio_b64, "language": req.language}


@app.post("/report-pdf")
def download_report_pdf(payload: Dict[str, Any]):
    """Generate and stream downloadable screening PDF."""
    patient_info = payload.get("patient_info", {})
    prediction_info = payload.get("prediction_info", {})
    key_findings = payload.get("key_findings", [])
    next_steps = payload.get("next_steps", [])

    try:
        pdf_bytes = generate_screening_pdf(patient_info, prediction_info, key_findings, next_steps)
        filename = f"RheumaSense_Screening_Report_{patient_info.get('age', 'Patient')}.pdf"
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


@app.get("/sample-reports")
def list_sample_reports():
    """List sample reports available for 1-click patient evaluation."""
    return [
        {
            "id": "sample_ra_positive",
            "name": "Positive RA Patient (Screen Mockup Case)",
            "file_name": "lab_report_positive_ra.pdf",
            "description": "Female, 45 yrs. High RF (78 IU/mL), Anti-CCP (>200 U/mL), ESR 32 mm/hr, CRP 12.5 mg/L, ANA Positive.",
            "data": {
                "age": 45,
                "gender": "Female",
                "rf_iu_ml": 78.0,
                "anti_ccp_u_ml": 200.0,
                "esr_mm_hr": 32.0,
                "crp_mg_l": 12.5,
                "ana_status": "Positive",
                "c3_mg_dl": 90.0,
                "c4_mg_dl": 18.0,
                "morning_stiffness_min": 75.0,
                "tender_joint_count": 8,
                "swollen_joint_count": 6
            }
        },
        {
            "id": "sample_normal_checkup",
            "name": "Healthy / Normal Joint Checkup",
            "file_name": "lab_report_normal.pdf",
            "description": "Male, 38 yrs. RF 6.2 IU/mL, Anti-CCP 5.1 U/mL, ESR 8 mm/hr, CRP 1.2 mg/L, ANA Negative.",
            "data": {
                "age": 38,
                "gender": "Male",
                "rf_iu_ml": 6.2,
                "anti_ccp_u_ml": 5.1,
                "esr_mm_hr": 8.0,
                "crp_mg_l": 1.2,
                "ana_status": "Negative",
                "c3_mg_dl": 130.0,
                "c4_mg_dl": 28.0,
                "morning_stiffness_min": 5.0,
                "tender_joint_count": 0,
                "swollen_joint_count": 0
            }
        },
        {
            "id": "sample_sle_suspected",
            "name": "Systemic Lupus Erythematosus (SLE) Profile",
            "file_name": "lab_report_lupus.pdf",
            "description": "Female, 31 yrs. Strongly Positive ANA (1:640), Low C3 (62 mg/dL), Low C4 (6.5 mg/dL), ESR 44 mm/hr.",
            "data": {
                "age": 31,
                "gender": "Female",
                "rf_iu_ml": 18.0,
                "anti_ccp_u_ml": 8.0,
                "esr_mm_hr": 44.0,
                "crp_mg_l": 3.8,
                "ana_status": "Positive",
                "c3_mg_dl": 62.0,
                "c4_mg_dl": 6.5,
                "morning_stiffness_min": 35.0,
                "tender_joint_count": 3,
                "swollen_joint_count": 1
            }
        }
    ]
