import { ExtractionResult, PredictionData, SampleReportItem } from '../types';

const API_BASE = '/api';

export const apiService = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to connect to RheumaSense backend');
    return res.json();
  },

  async getModelInfo() {
    const res = await fetch(`${API_BASE}/model-info`);
    if (!res.ok) throw new Error('Failed to fetch model info');
    return res.json();
  },

  async uploadReport(file: File): Promise<ExtractionResult> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload-report`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to upload and extract medical report');
    }

    return res.json();
  },

  async runPrediction(payload: Record<string, any>): Promise<PredictionData> {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Prediction failed');
    }

    return res.json();
  },

  async sendChatMessage(
    message: string,
    language: string,
    currentPrediction?: PredictionData | null,
    extractedValues?: any[]
  ) {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        language,
        current_prediction: currentPrediction,
        extracted_values: extractedValues,
      }),
    });

    if (!res.ok) {
      throw new Error('Chat assistant error');
    }

    return res.json();
  },

  async getTextToSpeech(text: string, language: string): Promise<string | null> {
    try {
      const res = await fetch(`${API_BASE}/text-to-speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });

      if (!res.ok) return null;
      const data = await res.json();
      return data.audio_base64 || null;
    } catch {
      return null;
    }
  },

  async downloadReportPdf(
    patientInfo: any,
    predictionInfo: PredictionData,
    keyFindings: string[],
    nextSteps: string[]
  ) {
    const res = await fetch(`${API_BASE}/report-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_info: patientInfo,
        prediction_info: predictionInfo,
        key_findings: keyFindings,
        next_steps: nextSteps,
      }),
    });

    if (!res.ok) throw new Error('PDF generation failed');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RheumaSense_Screening_Report_${patientInfo.age || 'Patient'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },

  async getSampleReports(): Promise<SampleReportItem[]> {
    const res = await fetch(`${API_BASE}/sample-reports`);
    if (!res.ok) throw new Error('Failed to load sample reports');
    return res.json();
  },
};
