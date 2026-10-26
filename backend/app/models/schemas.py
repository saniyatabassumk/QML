"""
Pydantic Schemas for RheumaSense AI
"""

from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class LabValueItem(BaseModel):
    key: str # e.g., "rf", "anti_ccp", "esr", "crp", "ana", "c3", "c4", "age", "gender"
    name: str # e.g., "RF (Rheumatoid Factor)"
    value: Any # e.g., 78.0, "Positive", 45
    unit: str = ""
    reference_range: str = ""
    status: str = "normal" # "normal", "high", "low", "positive", "negative", "unknown"
    confidence: float = 0.95
    source_line: Optional[str] = None


class ReportExtractionResponse(BaseModel):
    file_name: str
    file_size_bytes: int
    extracted_items: List[LabValueItem]
    detected_age: Optional[float] = None
    detected_gender: Optional[str] = None
    raw_text_summary: str = ""
    warnings: List[str] = []


class PredictionRequest(BaseModel):
    age: Optional[float] = 45.0
    gender: Optional[str] = "Female"
    rf_iu_ml: Optional[float] = 0.0
    anti_ccp_u_ml: Optional[float] = 0.0
    esr_mm_hr: Optional[float] = 15.0
    crp_mg_l: Optional[float] = 3.0
    ana_status: Optional[str] = "Negative"
    c3_mg_dl: Optional[float] = 120.0
    c4_mg_dl: Optional[float] = 25.0
    morning_stiffness_min: Optional[float] = 15.0
    tender_joint_count: Optional[int] = 0
    swollen_joint_count: Optional[int] = 0
    language: Optional[str] = "en"


class PredictionResponse(BaseModel):
    predicted_disease: str
    confidence_percentage: float
    ra_screening_score: int # e.g., 87
    ra_risk_category: str # "High Risk", "Moderate Risk", "Low Risk"
    disease_probabilities: Dict[str, float]
    key_laboratory_findings: List[str]
    abnormal_value_flags: List[str]
    model_confidence_label: str
    model_uncertainty_label: str
    what_this_means: str
    recommended_next_steps: List[str]
    quantum_vqc_score: Optional[float] = None
    disclaimer: str = "This is an AI screening aid, not a medical diagnosis. Always consult a qualified physician or rheumatologist."


class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    language: str = "en"
    history: List[ChatMessage] = []
    current_prediction: Optional[Dict[str, Any]] = None
    extracted_values: Optional[List[Dict[str, Any]]] = None


class ChatResponse(BaseModel):
    reply: str
    language: str
    suggested_questions: List[str]
    has_audio: bool = False
    audio_base64: Optional[str] = None


class TTSRequest(BaseModel):
    text: str
    language: str = "en"


class STTRequest(BaseModel):
    audio_base64: str
    language: str = "en"
