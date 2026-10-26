export type Language = 'en' | 'kn' | 'hi';

export interface LabItem {
  key: string;
  name: string;
  value: string | number;
  unit: string;
  reference_range: string;
  status: 'normal' | 'high' | 'low' | 'positive' | 'negative' | 'unknown';
  confidence: number;
}

export interface ExtractionResult {
  file_name: string;
  file_size_bytes: number;
  extracted_items: LabItem[];
  detected_age?: number;
  detected_gender?: string;
  raw_text_summary?: string;
}

export interface PredictionData {
  predicted_disease: string;
  confidence_percentage: number;
  ra_screening_score: number;
  ra_risk_category: string;
  disease_probabilities: Record<string, number>;
  key_laboratory_findings: string[];
  abnormal_value_flags: string[];
  model_confidence_label: string;
  model_uncertainty_label: string;
  what_this_means: string;
  recommended_next_steps: string[];
  quantum_vqc_score?: number;
  disclaimer: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  audioBase64?: string;
}

export interface SampleReportItem {
  id: string;
  name: string;
  file_name: string;
  description: string;
  data: Record<string, any>;
}
