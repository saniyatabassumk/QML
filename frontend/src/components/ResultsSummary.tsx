import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { PredictionData } from '../types';
import { apiService } from '../services/api';
import {
  AlertTriangle,
  CheckCircle2,
  Volume2,
  VolumeX,
  Download,
  MessageSquareHeart,
  Activity,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

interface ResultsSummaryProps {
  prediction: PredictionData;
  patientInfo: { file_name: string; age?: number; gender?: string };
  onAskAI: () => void;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  prediction,
  patientInfo,
  onAskAI,
}) => {
  const { t, language } = useLanguage();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const isRaPositive =
    prediction.predicted_disease.includes('Rheumatoid') || prediction.ra_screening_score >= 60;

  // Spoken text playback
  const handlePlayExplanation = async () => {
    if (isPlayingAudio) {
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak = `${prediction.predicted_disease}. ${prediction.what_this_means} Next steps: ${prediction.recommended_next_steps.slice(0, 3).join('. ')}`;

    // Try browser SpeechSynthesis first
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const speechLang = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.lang = speechLang;
      utterance.rate = 0.95;

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
      return;
    }

    // Backend TTS Fallback
    try {
      setIsPlayingAudio(true);
      const b64 = await apiService.getTextToSpeech(textToSpeak, language);
      if (b64) {
        const audio = new Audio(`data:audio/mp3;base64,${b64}`);
        setAudioElement(audio);
        audio.play();
        audio.onended = () => setIsPlayingAudio(false);
      } else {
        setIsPlayingAudio(false);
      }
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await apiService.downloadReportPdf(
        patientInfo,
        prediction,
        prediction.key_laboratory_findings,
        prediction.recommended_next_steps
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('resultsTitle')}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generated from verified report &bull; {patientInfo.file_name}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Voice Listen Button */}
          <button
            onClick={handlePlayExplanation}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm shadow-xs transition cursor-pointer ${
              isPlayingAudio
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>{t('btnStopAudio')}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-sky-600" />
                <span>{t('btnListenExplanation')}</span>
              </>
            )}
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 transition cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloadingPdf ? 'Generating...' : t('btnDownloadPdf')}</span>
          </button>
        </div>
      </div>

      {/* Top Banner: Predicted Disease & RA Screening Score Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Predicted Disease Card (Col Span 2) */}
        <div className="md:col-span-2 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              {t('predictedDiseaseLabel')}
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  isRaPositive
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-emerald-100 text-emerald-600'
                }`}
              >
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {prediction.predicted_disease}
                </h2>
                <div className="text-sm font-semibold text-slate-500">
                  {t('confidenceLabel')}: <span className="text-slate-800">{prediction.confidence_percentage}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Plain language summary callout */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900">{t('whatThisMeansTitle')}: </span>
            {prediction.what_this_means}
          </div>
        </div>

        {/* RA Screening Score Gauge (Col Span 1) */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            {t('screeningScoreLabel')}
          </div>

          {/* Circular Gauge */}
          <div className="relative w-36 h-36 flex items-center justify-center mb-3">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="#e2e8f0"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke={isRaPositive ? '#ef4444' : '#10b981'}
                strokeWidth="10"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * prediction.ra_screening_score) / 100}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {prediction.ra_screening_score}%
              </span>
            </div>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isRaPositive
                ? 'bg-rose-100 text-rose-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {prediction.ra_risk_category}
          </div>
          {prediction.quantum_vqc_score && (
            <div className="mt-2 text-[11px] font-semibold text-slate-400">
              Quantum VQC: {prediction.quantum_vqc_score}%
            </div>
          )}
        </div>

      </div>

      {/* Mid Row: 7-Class Disease Probabilities & Key Findings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Multi-Class Probabilities Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-600" />
            {t('diseaseProbsTitle')}
          </h3>

          <div className="space-y-3">
            {Object.entries(prediction.disease_probabilities).map(([dName, prob]) => (
              <div key={dName}>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">{dName}</span>
                  <span className="text-slate-900 font-bold">{prob}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-700 ${
                      dName.includes('Rheumatoid')
                        ? 'bg-sky-600'
                        : dName.includes('Normal')
                        ? 'bg-emerald-500'
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${Math.min(prob, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Laboratory Findings & Flags */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              {t('keyFindingsTitle')}
            </h3>

            <ul className="space-y-2 mb-6">
              {prediction.key_laboratory_findings.map((finding, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                  <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0" />
                  <span>{finding}</span>
                </li>
              ))}
            </ul>

            {/* Abnormal Value Flags */}
            <div className="pt-4 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                {t('abnormalFlagsTitle')}
              </div>
              <div className="flex flex-wrap gap-2">
                {prediction.abnormal_value_flags.map((flag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100"
                  >
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Model Confidence & Uncertainty Indicators */}
          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-slate-400 font-semibold mb-0.5">{t('modelConfidenceTitle')}</span>
              <span className="font-bold text-slate-800">{prediction.model_confidence_label}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block text-slate-400 font-semibold mb-0.5">{t('modelUncertaintyTitle')}</span>
              <span className="font-bold text-slate-800">{prediction.model_uncertainty_label}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Recommended Next Steps & Ask AI CTA */}
      <div className="p-6 rounded-3xl bg-sky-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-sky-300 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            {t('nextStepsTitle')}
          </div>
          <h3 className="text-xl font-black mb-3">
            Have questions about this screening?
          </h3>
          <ul className="space-y-1.5 text-xs sm:text-sm text-sky-100">
            {prediction.recommended_next_steps.slice(0, 3).map((st, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                <span>{st}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={onAskAI}
          className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-sky-50 text-sky-900 font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <MessageSquareHeart className="w-5 h-5 text-sky-600" />
          <span>{t('btnAskAIAbout')}</span>
          <ArrowRight className="w-4 h-4 text-sky-600" />
        </button>
      </div>

    </div>
  );
};
