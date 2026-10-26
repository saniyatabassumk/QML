"""
Configuration and Environment Settings for RheumaSense AI Backend
"""

import os
from pathlib import Path

# Base Paths
BACKEND_DIR = Path(__file__).resolve().parent.parent
BASE_DIR = BACKEND_DIR.parent
APP_DIR = BACKEND_DIR / "app"
DATA_DIR = APP_DIR / "data"
MODELS_DIR = APP_DIR / "models" / "saved_models"
SAMPLES_DIR = DATA_DIR / "sample_reports"
TEMP_DIR = BACKEND_DIR / "temp"

TEMP_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)
SAMPLES_DIR.mkdir(parents=True, exist_ok=True)

# Dataset path
DATASET_PATH = DATA_DIR / "Rheumatic_and_Autoimmune_Disease_Dataset.xlsx"

# Environment Variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "0.0.0.0")

# Supported Languages
SUPPORTED_LANGUAGES = {
    "en": {"name": "English", "native": "English", "speech_code": "en-IN"},
    "kn": {"name": "Kannada", "native": "ಕನ್ನಡ", "speech_code": "kn-IN"},
    "hi": {"name": "Hindi", "native": "हिंदी", "speech_code": "hi-IN"},
}

# 7 Disease Classes
DISEASE_CLASSES = [
    "Rheumatoid Arthritis (RA)",
    "Ankylosing Spondylitis",
    "Sjögren's Syndrome",
    "Psoriatic Arthritis",
    "Normal",
    "Systemic Lupus Erythematosus",
    "Reactive Arthritis"
]

# Max Upload Size (15 MB)
MAX_UPLOAD_SIZE = 15 * 1024 * 1024
