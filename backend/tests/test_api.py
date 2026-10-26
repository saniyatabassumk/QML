"""
Backend Integration & Unit Tests for RheumaSense AI
"""

import os
import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import SAMPLES_DIR

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["classical_model_ready"] is True
    assert data["quantum_model_ready"] is True


def test_model_info_endpoint():
    response = client.get("/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "classical" in data
    assert "quantum" in data
    assert data["quantum"]["n_qubits"] == 4


def test_upload_and_extract_pdf():
    sample_pdf = SAMPLES_DIR / "lab_report_positive_ra.pdf"
    assert sample_pdf.exists()

    with open(sample_pdf, "rb") as f:
        response = client.post(
            "/upload-report",
            files={"file": ("lab_report_positive_ra.pdf", f, "application/pdf")}
        )

    assert response.status_code == 200
    data = response.json()
    assert "extracted_items" in data
    items = {item["key"]: item for item in data["extracted_items"]}

    assert "rf" in items
    assert float(items["rf"]["value"]) == 78.0
    assert items["rf"]["status"] == "high"

    assert "anti_ccp" in items
    assert "200" in str(items["anti_ccp"]["value"])

    assert "esr" in items
    assert float(items["esr"]["value"]) == 32.0


def test_predict_endpoint_ra():
    payload = {
        "age": 45,
        "gender": "Female",
        "rf_iu_ml": 78.0,
        "anti_ccp_u_ml": 200.0,
        "esr_mm_hr": 32.0,
        "crp_mg_l": 12.5,
        "ana_status": "Positive",
        "c3_mg_dl": 90.0,
        "c4_mg_dl": 18.0
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Rheumatoid Arthritis" in data["predicted_disease"]
    assert data["ra_screening_score"] >= 70
    assert data["ra_risk_category"] == "High Risk"
    assert len(data["key_laboratory_findings"]) > 0


def test_predict_endpoint_normal():
    payload = {
        "age": 38,
        "gender": "Male",
        "rf_iu_ml": 5.0,
        "anti_ccp_u_ml": 6.0,
        "esr_mm_hr": 8.0,
        "crp_mg_l": 1.2,
        "ana_status": "Negative",
        "c3_mg_dl": 130.0,
        "c4_mg_dl": 28.0
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "Normal" in data["predicted_disease"]
    assert data["ra_risk_category"] == "Low Risk"


def test_chat_multilingual():
    # Test English
    resp_en = client.post("/chat", json={
        "message": "What does a high RF result mean?",
        "language": "en"
    })
    assert resp_en.status_code == 200
    assert "Rheumatoid Factor" in resp_en.json()["reply"]

    # Test Kannada
    resp_kn = client.post("/chat", json={
        "message": "ನನ್ನ ವರದಿಯಲ್ಲಿ RA ಪಾಸಿಟಿವ್ ಬಂದಿದೆ ಏನು ಮಾಡಬೇಕು?",
        "language": "kn"
    })
    assert resp_kn.status_code == 200
    assert len(resp_kn.json()["reply"]) > 20

    # Test Hindi
    resp_hi = client.post("/chat", json={
        "message": "मेरी रिपोर्ट में RA आया है, मुझे क्या करना चाहिए?",
        "language": "hi"
    })
    assert resp_hi.status_code == 200
    assert len(resp_hi.json()["reply"]) > 20


def test_tts_endpoint():
    response = client.post("/text-to-speech", json={
        "text": "Hello, your screening results are ready.",
        "language": "en"
    })
    assert response.status_code == 200
    data = response.json()
    assert "audio_base64" in data
    assert len(data["audio_base64"]) > 100


def test_pdf_report_endpoint():
    payload = {
        "patient_info": {"file_name": "lab_report.pdf", "age": 45, "gender": "Female"},
        "prediction_info": {
            "predicted_disease": "Rheumatoid Arthritis (RA)",
            "ra_screening_score": 87,
            "ra_risk_category": "High Risk",
            "disease_probabilities": {"Rheumatoid Arthritis (RA)": 72.4, "Normal": 3.8}
        },
        "key_findings": ["High RF (78 IU/mL)", "High Anti-CCP (>200 U/mL)"],
        "next_steps": ["See a rheumatologist", "Confirmatory tests"]
    }
    response = client.post("/report-pdf", json=payload)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert len(response.content) > 1000
