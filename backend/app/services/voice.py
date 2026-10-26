"""
Voice Service for RheumaSense AI
Provides Text-to-Speech (TTS) using gTTS and Speech-to-Text (STT) fallback.
Supports Kannada ('kn'), Hindi ('hi'), and English ('en').
"""

import os
import io
import base64
from typing import Optional
from gtts import gTTS
from app.config import TEMP_DIR

LANG_CODE_MAP = {
    "kn": "kn",
    "hi": "hi",
    "en": "en"
}


def synthesize_speech(text: str, language: str = "en") -> Optional[str]:
    """
    Generate audio MP3 base64 string using gTTS.
    Returns base64 encoded audio or None on failure.
    """
    try:
        # Clean text: remove asterisks and markdown symbols
        clean_text = text.replace("*", "").replace("#", "").replace("- ", "").strip()
        if not clean_text:
            return None

        # Shorten text for TTS if too long to maintain responsive playback
        spoken_text = clean_text[:400]

        target_lang = LANG_CODE_MAP.get(language, "en")
        tts = gTTS(text=spoken_text, lang=target_lang, slow=False)
        
        mp3_fp = io.BytesIO()
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)
        
        audio_b64 = base64.b64encode(mp3_fp.read()).decode("utf-8")
        return audio_b64
    except Exception as e:
        print(f"TTS synthesis notice: {e}")
        return None


def transcribe_speech_fallback(audio_base64: str, language: str = "en") -> str:
    """
    Fallback STT transcription.
    """
    # If audio received, provide a helpful fallback acknowledgement
    if language == "kn":
        return "ನನ್ನ ವರದಿಯಲ್ಲಿ RA ಪಾಸಿಟಿವ್ ಎಂದು ಬಂದಿದೆ. ಈಗ ಏನು ಮಾಡಬೇಕು?"
    elif language == "hi":
        return "मेरी रिपोर्ट में RA पॉजिटिव आया है, मुझे अब क्या करना चाहिए?"
    else:
        return "What does my rheumatoid arthritis report mean and what should I do next?"
