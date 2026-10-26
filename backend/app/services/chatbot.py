"""
Multilingual AI Healthcare Assistant for RheumaSense AI
Supports English, Kannada (ಕನ್ನಡ), and Hindi (हिंदी)
Grounded in Reviewed Clinical Knowledge for Rheumatic & Autoimmune Diseases
"""

import os
import re
from typing import Dict, Any, List, Optional
from app.config import GEMINI_API_KEY
from app.models.schemas import ChatRequest, ChatResponse

# Clinical Knowledge Base for Instant Local RAG
KNOWLEDGE_BASE = {
    "what_is_ra": {
        "en": "Rheumatoid Arthritis (RA) is a chronic autoimmune condition where the body's immune system mistakenly attacks healthy joint tissue, causing inflammation, pain, stiffness, and potential joint damage if untreated.",
        "kn": "ರುಮಟಾಯ್ಡ್ ಸಂಧಿವಾತ (RA) ಎಂಬುದು ದೀರ್ಘಕಾಲದ ಸ್ವಯಂ ನಿರೋಧಕ ಕಾಯಿಲೆಯಾಗಿದ್ದು, ಇದರಲ್ಲಿ ದೇಹದ ರೋಗನಿರೋಧಕ ವ್ಯವಸ್ಥೆಯು ಆರೋಗ್ಯಕರ ಕೀಲುಗಳ ಮೇಲೆ ಆಕ್ರಮಣ ಮಾಡಿ ಉರಿಯೂತ, ನೋವು ಮತ್ತು ಬಿಗಿತವನ್ನು ಉಂಟುಮಾಡುತ್ತದೆ.",
        "hi": "रुमेಟಾಯ್ಡ್ ಆರ್ಥ್ರೈಟಿಸ್ (RA) ಎಕ್ ಆಟೋಇಮ್ಯೂನ್ ಬೀಮಾರಿ ಹೈ ಜಿಸ್ಮೇ ಶರೀರ್ ಕಾ ಇಮ್ಯೂನ್ ಸಿಸ್ಟಮ್ ಅಪ್ನೇ ಹೀ ಜೋಡೋಂ ಪರ್ ಹಮಲಾ ಕರ್ತಾ ಹೈ, ಜಿಸ್ಸೆ ಸೋಜನ, ದರ್ದ್ ಔರ್ ಜಕಡನ್ ಹೋತಿ ಹೈ."
    },
    "positive_rf": {
        "en": "Rheumatoid Factor (RF) is an antibody found in blood. A positive or high RF (>14 IU/mL) indicates immune system activity and is commonly elevated in rheumatoid arthritis and Sjögren's syndrome, though clinical correlation is essential.",
        "kn": "ರುಮಟಾಯ್ಡ್ ಫ್ಯಾಕ್ಟರ್ (RF) ರಕ್ತದಲ್ಲಿರುವ ಒಂದು ಪ್ರತಿಕಾಯವಾಗಿದೆ. RF ಮಟ್ಟ 14 IU/mL ಗಿಂತ ಹೆಚ್ಚಿದ್ದರೆ ಅದು ರೋಗನಿರೋಧಕ ಕ್ರಿಯೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ ಮತ್ತು ಇದು RA ನಲ್ಲಿ ಸಾಮಾನ್ಯವಾಗಿರುತ್ತದೆ.",
        "hi": "ರುಮಟಾಯ್ಡ್ ಫ್ಯಾಕ್ಟರ್ (RF) ರಕ್ತ್ ಮೇಂ ಪಾಯಾ ಜಾನೇ ವಾಲಾ ಎಕ್ ಆಂಟಿಬಾಡಿ ಹೈ. 14 IU/mL ಸೇ ಅಧಿಕ್ RF ಆನಾ RA ಔರ್ ಅನ್ಯ ಆಟೋಇಮ್ಯೂನ್ ಸ್ಥಿತಿಯೋಂ ಕಾ ಸಂಕೇತ್ ದೇತಾ ಹೈ."
    },
    "positive_anti_ccp": {
        "en": "Anti-CCP (ACPA) is a highly specific antibody marker for Rheumatoid Arthritis (>95% specificity). Levels above 20 U/mL strongly suggest early or active RA and help distinguish it from other joint conditions.",
        "kn": "ಆಂಟಿ-ಸಿಸಿಪಿ (Anti-CCP) ರುಮಟಾಯ್ಡ್ ಸಂಧಿವಾತಕ್ಕೆ ಅತ್ಯಂತ ನಿರ್ದಿಷ್ಟವಾದ ಪರೀಕ್ಷೆಯಾಗಿದೆ (>95% ನಿಖರತೆ). 20 U/mL ಗಿಂತ ಹೆಚ್ಚಿನ ಫಲಿತಾಂಶವು RA ಇರುವ ಬಲವಾದ ಸಾಧ್ಯತೆಯನ್ನು ಸೂಚಿಸುತ್ತದೆ.",
        "hi": "ಆಂಟಿ-ಸಿಸಿಪಿ (Anti-CCP) ರುಮೆಟಾಯ್ಡ್ ಆರ್ಥ್ರೈಟಿಸ್ ಕೇ ಲಿಯೇ ಅತ್ಯಧಿಕ್ ಸಟೀಕ್ ಮಾರ್ಕರ್ ಹೈ (>95% ನಿಶ್ಚಿತತಾ). 20 U/mL ಸೇ ಊಪರ್ ಹೋನಾ RA ಕೀ ಪ್ರಬಲ್ ಸಂಭಾವನಾ ಬತಾತಾ ಹೈ."
    },
    "next_steps": {
        "en": "Recommended Next Steps:\n1. Consult a qualified rheumatologist or physician promptly.\n2. Bring your original lab reports.\n3. Track daily joint pain and how long morning stiffness lasts.\n4. Ask about baseline joint imaging (X-rays or ultrasound).\n5. Discuss early disease-modifying treatment options (DMARDs).",
        "kn": "ಮುಂದಿನ ಮುಖ್ಯ ಹಂತಗಳು:\n೧. ತಕ್ಷಣವೇ ನುರಿತ ರುಮಟಾಲಜಿಸ್ಟ್ ಅಥವಾ ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಿ.\n೨. ನಿಮ್ಮ ಮೂಲ ಲ್ಯಾಬ್ ವರದಿಯನ್ನು ಜೊತೆಯಲ್ಲಿ ತೆಗೆದುಕೊಂಡು ಹೋಗಿ.\n೩. ಬೆಳಗಿನ ಕೀಲು ಬಿಗಿತದ ಅವಧಿಯನ್ನು ಮತ್ತು ನೋವನ್ನು ದಾಖಲಿಸಿ.\n೪. ಕೀಲುಗಳ ಎಕ್ಸ್-ರೇ ಅಥವಾ ಅಲ್ಟ್ರಾಸೌಂಡ್ ತಪಾಸಣೆಯ ಬಗ್ಗೆ ವೈದ್ಯರೊಂದಿಗೆ ಚರ್ಚಿಸಿ.\n೫. ಸೂಕ್ತ ಆರಂಭಿಕ ಚಿಕಿತ್ಸೆಯ (DMARDs) ಬಗ್ಗೆ ಸಲಹೆ ಪಡೆಯಿರಿ.",
        "hi": "ಅಗಲೇ ಮಹತ್ವಪೂರ್ಣ ಕದಮ್:\n1. ಜಲ್ದ್ ಹೀ ಕಿಸಿ ರುಮಟಾಲಜಿಸ್ಟ್ (ಜೋಡೋಂ ಕೇ ವಿಶೇಷಜ್ಞ ಡಾಕ್ಟರ್) ಸೇ ಮಿಲೇಂ.\n2. ಅಪನೀ ಮೂಲ್ ಲ್ಯಾಬ್ ರಿಪೋರ್ಟ್ ಸಾಥ್ ಲೇ ಜಾಯೇಂ.\n3. ಸುಬಹ ಕೀ ಜಕಡನ್ ಕಿತ್ನಿ ದೇರ್ ರಹತೀ ಹೈ, ಉಸೇ ನೋಟ್ ಕರೇಂ.\n4. ಜೋಡೋಂ ಕೇ ಎಕ್ಸ್-ರೇ ಯಾ ಅಲ್ಟ್ರಾಸೌಂಡ್ ಕೇ ಬಾರೇ ಮೇಂ ಪೂಛೇಂ.\n5. ಸಮಯ್ ರಹತೇ ಇಲಾಜ್ (DMARDs) ಕೇ ಬಾರೇ ಮೇಂ ಚರ್ಚಾ ಕರೇಂ."
    },
    "treatments": {
        "en": "General medical treatment categories for RA include:\n- DMARDs (Disease-Modifying Anti-Rheumatic Drugs like Methotrexate)\n- Biologic therapies targeting specific inflammatory pathways (TNF, IL-6 inhibitors)\n- Short-term anti-inflammatory medications for symptom flare-ups\n- Physical therapy and joint protection strategies\n*All medications must be prescribed and monitored by a doctor.*",
        "kn": "RA ಗಾಗಿ ಸಾಮಾನ್ಯ ಚಿಕಿತ್ಸಾ ವಿಧಾನಗಳು:\n- ಡಿಮಾರ್ಡ್ಸ್ (DMARDs - ರೋಗ ನಿಯಂತ್ರಕ ಔಷಧಗಳು, ಉದಾ: ಮೆಥೊಟ್ರೆಕ್ಸೇಟ್)\n- ಬಯೋಲಾಜಿಕ್ ಚಿಕಿತ್ಸೆಗಳು\n- ನೋವು ಮತ್ತು ಊತ ನಿವಾರಕ ಔಷಧಗಳು\n- ಫಿಸಿಯೋಥೆರಪಿ ಮತ್ತು ಕೀಲು ಸಂರಕ್ಷಣಾ ಕ್ರಮಗಳು\n*ಔಷಧಿಗಳನ್ನು ಕೇವಲ ವೈದ್ಯರ ಸಲಹೆಯ ಮೇರೆಗೆ ಮಾತ್ರ ತೆಗೆದುಕೊಳ್ಳಬೇಕು.*",
        "hi": "RA ಕೇ ಮುಖ್ಯ ಉಪಚಾರ ವಿಕಲ್ಪ:\n- ಡಿಮಾರ್ಡ್ಸ್ (DMARDs - ಜೈಸೇ ಮೆಥೋಟ್ರೆಕ್ಸೇಟ್ ಜೋ ಬೀಮಾರಿ ಕೋ ಬಢನೆ ಸೇ ರೋಕತೀ ಹೈಂ)\n- ಬಯೋಲಾಜಿಕ್ ಥೆರಪೀಸ್\n- ದರ್ದ್ ಔರ್ ಸೋಜನ ಕಮ್ ಕರ್ನೇ ವಾಲಿ ದವಾಯೇಂ\n- ಫಿಜಿಯೋಥೆರಪೀ ಔರ್ ಜೋಡೋಂ ಕೀ ದೇಖಭಾಲ\n*ಕೋಯಿ ಭೀ ದವಾ ಸಿರ್ಫ್ ಡಾಕ್ಟರ್ ಕೀ ಸಲಾಹ್ ಪರ್ ಹೀ ಲೇಂ.*"
    },
    "lifestyle": {
        "en": "Safe lifestyle and joint-care recommendations:\n- Low-impact activities: warm water swimming, walking, gentle range-of-motion stretching\n- Apply warm compresses for morning stiffness; cool packs for acute swollen joints\n- Balanced anti-inflammatory diet rich in omega-3 and vegetables\n- Avoid smoking (smoking significantly worsens RA severity)\n- Protect joints using ergonomic aids and take restful breaks",
        "kn": "ಸುರಕ್ಷಿತ ಜೀವನಶೈಲಿ ಮತ್ತು ಕೀಲು ರಕ್ಷಣೆಯ ಸಲಹೆಗಳು:\n- ಸೌಮ್ಯ ವ್ಯಾಯಾಮ: ಉಗುರುಬೆಚ್ಚಗಿನ ನೀರಿನಲ್ಲಿ ಈಜು, ನಡಿಗೆ, ನಿಧಾನಗತಿಯ ಸ್ಟ್ರೆಚಿಂಗ್\n- ಬೆಳಗಿನ ಬಿಗಿತಕ್ಕೆ ಬೆಚ್ಚಗಿನ ಶಾಖ; ತೀವ್ರ ಊತಕ್ಕೆ ತಂಪಾದ ಐಸ್ ಪ್ಯಾಕ್\n- ಸಮತೋಲಿತ ಪೌಷ್ಟಿಕ ಆಹಾರ ಮತ್ತು ಒಮೆಗಾ-೩ ಬಳಕೆ\n- ಧೂಮಪಾನವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ತ್ಯಜಿಸಿ (ಇದು ರೋಗವನ್ನು ಉಲ್ಬಣಗೊಳಿಸುತ್ತದೆ)\n- ಕೀಲುಗಳಿಗೆ ಅತಿಯಾದ ಆಯಾಸವಾಗದಂತೆ ವಿಶ್ರಾಂತಿ ನೀಡಿ",
        "hi": "ಜೋಡೋಂ ಕೀ ಸುರಕ್ಷಾ ಔರ್ ಜೀವನ್‌ಶೈಲೀ ಸುಝಾವ್:\n- ಹಲ್ಕಾ ವ್ಯಾಯಾಮ: ಹಲ್ಕೇ ಗರಮ್ ಪಾನೀ ಮೇಂ ತೈರನಾ, ಟಹಲನಾ, ಸ್ಟ್ರೆಚಿಂಗ್\n- ಸುಬಹ ಕೀ ಜಕಡನ್ ಕೇ ಲಿಯೇ ಗರಮ್ ಸೇಂಕ; ಸೋಜನ ಕೇ ಲಿಯೇ ಬರ್ಫ್ ಕೀ ಸಿಕಾಯೀ\n- ಪೌಷ್ಟಿಕ್ ಆಹಾರ್ ಔರ್ ಒಮೆಗಾ-3 ಯುಕ್ತ್ ಖಾನಾ\n- ಧೂಮ್ರಪಾನ್ ಸೇ ದೂರ ರಹೇಂ (ಯಹ್ ಬೀಮಾರಿ ಕೋ ತೇಜೀ ಸೇ ಬಢಾತಾ ಹೈ)\n- ಜೋಡೋಂ ಪರ್ ಜ್ಯಾದಾ ಬೋಝ ನ ಡಾಲೇಂ ಔರ್ ಪರ್ಯಾಪ್ತ್ ಆರಾಮ್ ಕರೇಂ"
    },
    "urgent_warning": {
        "en": "⚠️ Urgent Warning: If you experience a severely hot, red, extremely painful single joint with a high fever or chills, seek emergency medical care immediately to rule out acute joint infection (septic arthritis).",
        "kn": "⚠️ ತುರ್ತು ಎಚ್ಚರಿಕೆ: ಒಂದು ಕೀಲು ವಿಪರೀತ ಬಿಸಿಯಾಗಿ, ಕೆಂಪಾಗಿ, ತೀವ್ರ ನೋವಿನೊಂದಿಗೆ ಜ್ವರ ಬಂದರೆ, ತುರ್ತಾಗಿ ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗೆ ಭೇಟಿ ನೀಡಿ.",
        "hi": "⚠️ ಆಪಾತಕಾಲೀನ್ ಚೇತಾವನೀ: ಅಗರ್ ಕಿಸಿ ಎಕ್ ಜೋಡ ಮೇಂ ತೇಜ್ ದರ್ದ್, ಲಾಲಿಮಾ, ಅತ್ಯಧಿಕ್ ಗರ್ಮೀ ಔರ್ ತೇಜ್ ಬುಖಾರ್ ಹೋ, ತೋ ತುರಂತ್ ಆಸ್ಪತಾಲ್ ಜಾಯೇಂ."
    }
}

# Questions to suggest based on context
SUGGESTED_QUESTIONS = {
    "en": [
        "What does my screening result mean?",
        "What is the difference between RF and Anti-CCP?",
        "What questions should I ask my rheumatologist?",
        "What lifestyle habits protect my joints?"
    ],
    "kn": [
        "ನನ್ನ ತಪಾಸಣಾ ಫಲಿತಾಂಶದ ಅರ್ಥವೇನು?",
        "RF ಮತ್ತು Anti-CCP ನಡುವಿನ ವ್ಯತ್ಯಾಸವೇನು?",
        "ನನ್ನ ವೈದ್ಯರನ್ನು ನಾನು ಯಾವ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬೇಕು?",
        "ಕೀಲುಗಳ ಆರೋಗ್ಯ ಕಾಪಾಡಲು ಯಾವ ಜೀವನಶೈಲಿ ಉತ್ತಮ?"
    ],
    "hi": [
        "ಮೇರಿ ಸ್ಕ್ರೀನಿಂಗ್ ರಿಪೋರ್ಟ್ ಕಾ ಕ್ಯಾ ಮತಲಬ್ ಹೈ?",
        "RF ಔರ್ Anti-CCP ಮೇಂ ಕ್ಯಾ ಅಂತರ್ ಹೈ?",
        "ಮುಝೇ ಡಾಕ್ಟರ್ ಸೇ ಕ್ಯಾ ಸವಾಲ್ ಪೂಛನೇ ಚಾಹಿಯೇ?",
        "ಜೋಡೋಂ ಕೇ ದರ್ದ್ ಕೇ ಲಿಯೇ ಕೌನ್ಸಿ ಜೀವನ್‌ಶೈಲೀ ಸಹೀ ಹೈ?"
    ]
}


def _detect_intent(query: str) -> str:
    """Classify user intent from text or voice transcript."""
    q = query.lower()

    if any(w in q for w in ["what should i do", "what next", "ಏನು ಮಾಡಬೇಕು", "ಕ್ಯಾ ಕರೂಂ", "ಮುಂದಿನ ಹಂತ", "ಅಗಲೇ ಕದಮ್"]):
        return "next_steps"
    if any(w in q for w in ["rf", "rheumatoid factor", "ಆರ್ ಎಫ್", "ಆರ್.ಎಫ್"]):
        return "positive_rf"
    if any(w in q for w in ["anti-ccp", "ccp", "acpa", "ಸಿಸಿಪಿ"]):
        return "positive_anti_ccp"
    if any(w in q for w in ["treatment", "medicine", "drug", "ಔಷಧ", "ಚಿಕಿತ್ಸೆ", "ಇಲಾಜ್", "ದವಾ"]):
        return "treatments"
    if any(w in q for w in ["exercise", "diet", "food", "lifestyle", "ಜೀವನಶೈಲಿ", "ಆಹಾರ", "ಖಾನಾ", "ವ್ಯಾಯಾಮ"]):
        return "lifestyle"
    if any(w in q for w in ["danger", "fever", "emergency", "ಜ್ವರ", "ತುರ್ತು", "ಬುಖಾರ್", "ಖತರಾ"]):
        return "urgent_warning"
    if any(w in q for w in ["what is rheumatoid", "what is ra", "ra ಎಂದರೇನು", "ಸಂಧಿವಾತ ಎಂದರೇನು", "ra ಕ್ಯಾ ಹೈ"]):
        return "what_is_ra"

    return "general_report_guidance"


def generate_assistant_response(req: ChatRequest) -> ChatResponse:
    """Generate accurate, empathetic, multilingual clinical explanation."""
    lang = req.language if req.language in ["kn", "hi", "en"] else "en"
    msg = req.message.strip()
    intent = _detect_intent(msg)

    # Check if patient uploaded values
    patient_context_str = ""
    pred = req.current_prediction or {}
    pred_disease = pred.get("predicted_disease", "")
    risk_score = pred.get("ra_screening_score", 0)
    key_findings = pred.get("key_laboratory_findings", [])

    if key_findings:
        findings_str = ", ".join(key_findings[:3])
        if lang == "kn":
            patient_context_str = f"\n\nನಿಮ್ಮ ವರದಿಯ ಮುಖ್ಯ ಅಂಶಗಳು: {findings_str} (RA ಸ್ಕ್ರೀನಿಂಗ್ ಸ್ಕೋರ್: {risk_score}%)."
        elif lang == "hi":
            patient_context_str = f"\n\nಆಪಕೀ ರಿಪೋರ್ಟ್ ಕೇ ಮುಖ್ಯ ಪಾಯಿಂಟ್ಸ್: {findings_str} (RA ಸ್ಕ್ರೀನಿಂಗ್ ಸ್ಕೋರ್: {risk_score}%)."
        else:
            patient_context_str = f"\n\nBased on your report: {findings_str} (RA Screening Score: {risk_score}%)."

    # Standard Knowledge Base Response
    if intent in KNOWLEDGE_BASE:
        reply_body = KNOWLEDGE_BASE[intent].get(lang, KNOWLEDGE_BASE[intent]["en"])
    elif intent == "general_report_guidance":
        if lang == "kn":
            reply_body = (
                "ನಿಮ್ಮ ವರದಿಯು ಸ್ವಯಂ ನಿರೋಧಕ ಮತ್ತು ಉರಿಯೂತದ ಸೂಚಕಗಳನ್ನು ತೋರಿಸುತ್ತಿದೆ. "
                "ಇದು ರೋಗನಿರ್ಣಯವಲ್ಲ, ಆದರೆ ಆರಂಭಿಕ ತಪಾಸಣಾ ಮಾಹಿತಿಯಾಗಿದೆ. "
                "ನಿಖರ ಪರೀಕ್ಷೆ ಮತ್ತು ಚಿಕಿತ್ಸೆಗಾಗಿ ರುಮಟಾಲಜಿಸ್ಟ್ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಲು ಶಿಫಾರಸು ಮಾಡುತ್ತೇವೆ."
            )
        elif lang == "hi":
            reply_body = (
                "ಆಪಕೀ ರಿಪೋರ್ಟ್ ಮೇಂ ಜೋಡೋಂ ಕೀ ಸೋಜನ ಔರ್ ಆಟೋಇಮ್ಯೂನ್ ಸಂಕೇತ್ ದಿಖ್ ರಹೇ ಹೈಂ. "
                "ಯಹ್ ಕೋಯಿ ಅಂತಿಮ್ ಡಯಾಗ್ನೋಸಿಸ್ ನಹೀಂ ಹೈ, ಬಲ್ಕಿ ಎಕ್ ಸ್ಕ್ರೀನಿಂಗ್ ಗೈಡ್ ಹೈ. "
                "ಕೃಪಯಾ ಅಪನೇ ಡಾಕ್ಟರ್ ಯಾ ರುಮಟಾಲಜಿಸ್ಟ್ ಸೇ ಸಲಾಹ್ ಜರೂರ್ ಲೇಂ."
            )
        else:
            reply_body = (
                "Your lab values indicate inflammatory and autoimmune markers that warrant careful clinical review. "
                "Please note that this screening tool does not replace a clinical examination. "
                "A rheumatologist will evaluate your symptoms, examine your joints, and determine the exact course of action."
            )

    full_reply = reply_body + patient_context_str

    # Disclaimer footer
    if lang == "kn":
        full_reply += "\n\n*(ಗಮನಿಸಿ: ಇದು ಕೇವಲ ಶೈಕ್ಷಣಿಕ ಮತ್ತು ತಪಾಸಣಾ ಮಾರ್ಗದರ್ಶನವಾಗಿದೆ, ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯವಲ್ಲ.)*"
    elif lang == "hi":
        full_reply += "\n\n*(ಧ್ಯಾನ್ ದೇಂ: ಯಹ್ ಸಿರ್ಫ್ ಸ್ಕ್ರೀನಿಂಗ್ ಔರ್ ಜಾನಕಾರೀ ಕೇ ಲಿಯೇ ಹೈ, ಡಾಕ್ಟರ್ ಕೀ ಜಾಗಹ ನಹೀಂ ಲೇ ಸಕತಾ.)*"
    else:
        full_reply += "\n\n*(Notice: This is an AI screening aid for guidance, not a medical diagnosis. Consult a doctor.)*"

    suggested = SUGGESTED_QUESTIONS.get(lang, SUGGESTED_QUESTIONS["en"])

    return ChatResponse(
        reply=full_reply,
        language=lang,
        suggested_questions=suggested,
        has_audio=False
    )
