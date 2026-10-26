import React, { useState, useEffect } from 'react';
import { useLanguage } from './i18n/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ReportUploader } from './components/ReportUploader';
import { VerificationTable } from './components/VerificationTable';
import { ResultsSummary } from './components/ResultsSummary';
import { VoiceAssistant } from './components/VoiceAssistant';
import { WhatNextGuidance } from './components/WhatNextGuidance';
import { AboutModal } from './components/AboutModal';
import { apiService } from './services/api';
import { ExtractionResult, PredictionData, LabItem, SampleReportItem } from './types';
import {
  Upload,
  MessageSquareHeart,
  FileCheck,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  FileText,
  HelpCircle,
} from 'lucide-react';

export const App: React.FC = () => {
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<string>('home');
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionData | null>(null);
  const [patientInfo, setPatientInfo] = useState<{ file_name: string; age?: number; gender?: string }>({
    file_name: 'lab_report.pdf',
    age: 45,
    gender: 'Female',
  });
  const [samples, setSamples] = useState<SampleReportItem[]>([]);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);

  // Load sample reports on startup
  useEffect(() => {
    apiService
      .getSampleReports()
      .then((data) => setSamples(data))
      .catch((err) => console.error(err));
  }, []);

  // Handle uploaded file extraction
  const handleExtractionComplete = (result: ExtractionResult) => {
    setExtractionResult(result);
    setPatientInfo({
      file_name: result.file_name,
      age: result.detected_age || 45,
      gender: result.detected_gender || 'Female',
    });
    setActiveTab('verify');
  };

  // Handle choosing a sample report
  const handleSelectSample = async (sample: SampleReportItem) => {
    setIsPredicting(true);
    setPatientInfo({
      file_name: sample.file_name,
      age: sample.data.age || 45,
      gender: sample.data.gender || 'Female',
    });

    try {
      const pred = await apiService.runPrediction({
        ...sample.data,
        language,
      });
      setPredictionResult(pred);

      // Create synthetic extracted items for verify view
      const syntheticItems: LabItem[] = [
        { key: 'age', name: 'Age', value: sample.data.age || 45, unit: 'years', reference_range: '-', status: 'normal', confidence: 1 },
        { key: 'gender', name: 'Gender', value: sample.data.gender || 'Female', unit: '-', reference_range: '-', status: 'normal', confidence: 1 },
        { key: 'esr', name: 'ESR', value: sample.data.esr_mm_hr || 15, unit: 'mm/hr', reference_range: '0 - 20', status: sample.data.esr_mm_hr > 20 ? 'high' : 'normal', confidence: 1 },
        { key: 'crp', name: 'CRP', value: sample.data.crp_mg_l || 3, unit: 'mg/L', reference_range: '0 - 5', status: sample.data.crp_mg_l > 5 ? 'high' : 'normal', confidence: 1 },
        { key: 'rf', name: 'RF', value: sample.data.rf_iu_ml || 5, unit: 'IU/mL', reference_range: '0 - 14', status: sample.data.rf_iu_ml > 14 ? 'high' : 'normal', confidence: 1 },
        { key: 'anti_ccp', name: 'Anti-CCP', value: sample.data.anti_ccp_u_ml || 5, unit: 'U/mL', reference_range: '0 - 20', status: sample.data.anti_ccp_u_ml > 20 ? 'high' : 'normal', confidence: 1 },
        { key: 'ana', name: 'ANA', value: sample.data.ana_status || 'Negative', unit: '-', reference_range: 'Negative', status: sample.data.ana_status === 'Positive' ? 'positive' : 'normal', confidence: 1 },
        { key: 'c3', name: 'C3', value: sample.data.c3_mg_dl || 120, unit: 'mg/dL', reference_range: '90 - 180', status: sample.data.c3_mg_dl < 90 ? 'low' : 'normal', confidence: 1 },
        { key: 'c4', name: 'C4', value: sample.data.c4_mg_dl || 25, unit: 'mg/dL', reference_range: '10 - 40', status: sample.data.c4_mg_dl < 10 ? 'low' : 'normal', confidence: 1 },
      ];

      setExtractionResult({
        file_name: sample.file_name,
        file_size_bytes: 124000,
        extracted_items: syntheticItems,
        detected_age: sample.data.age,
        detected_gender: sample.data.gender,
      });

      setActiveTab('results');
    } catch (e) {
      console.error(e);
    } finally {
      setIsPredicting(false);
    }
  };

  // Run prediction on verified items
  const handleContinueToPrediction = async (items: LabItem[]) => {
    setIsPredicting(true);

    const payload: Record<string, any> = {
      language,
    };

    items.forEach((it) => {
      const valStr = String(it.value);
      const num = parseFloat(valStr.replace(/[><=]/g, ''));
      if (it.key === 'age') payload.age = !isNaN(num) ? num : 45;
      else if (it.key === 'gender') payload.gender = valStr;
      else if (it.key === 'rf') payload.rf_iu_ml = !isNaN(num) ? num : 0;
      else if (it.key === 'anti_ccp') payload.anti_ccp_u_ml = !isNaN(num) ? num : 0;
      else if (it.key === 'esr') payload.esr_mm_hr = !isNaN(num) ? num : 15;
      else if (it.key === 'crp') payload.crp_mg_l = !isNaN(num) ? num : 3;
      else if (it.key === 'ana') payload.ana_status = valStr;
      else if (it.key === 'c3') payload.c3_mg_dl = !isNaN(num) ? num : 120;
      else if (it.key === 'c4') payload.c4_mg_dl = !isNaN(num) ? num : 25;
    });

    try {
      const result = await apiService.runPrediction(payload);
      setPredictionResult(result);
      setActiveTab('results');
    } catch (err: any) {
      alert('Prediction failed: ' + err.message);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* TAB 1: HOME PAGE (Matches Mockup Screen 1) */}
        {activeTab === 'home' && (
          <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
            
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 text-sky-800 font-bold text-xs mb-6 shadow-2xs">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>Voice-First AI &bull; English &bull; ಕನ್ನಡ &bull; हिंदी</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
                {t('heroTitle')}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
                {t('heroDesc')}
              </p>

              {/* 3 Prominent Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
                <button
                  onClick={() => setActiveTab('upload')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-base shadow-lg shadow-sky-600/30 transition hover:scale-102 cursor-pointer"
                >
                  <Upload className="w-5 h-5" />
                  <span>{t('btnUploadReport')}</span>
                </button>

                <button
                  onClick={() => setActiveTab('ask-ai')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-base border border-slate-300 shadow-2xs transition hover:scale-102 cursor-pointer"
                >
                  <MessageSquareHeart className="w-5 h-5 text-sky-600" />
                  <span>{t('btnTalkAI')}</span>
                </button>

                <button
                  onClick={() => {
                    if (predictionResult) setActiveTab('results');
                    else setActiveTab('upload');
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-slate-600 hover:text-slate-900 font-semibold text-sm transition cursor-pointer"
                >
                  <span>{t('btnViewResults')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-400 font-medium">
                {t('supportedFormats')}
              </div>
            </div>

            {/* 3-Step Cards (Matches Mockup Screen 1) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {t('step1Title')}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {t('step1Desc')}
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {t('step2Title')}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {t('step2Desc')}
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {t('step3Title')}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {t('step3Desc')}
                </p>
              </div>
            </div>

            {/* Quick-test banner with 1-click samples */}
            {samples.length > 0 && (
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {t('sampleReportsBanner')}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Test the AI models and voice assistant instantly with sample patient data.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => handleSelectSample(samples[0])}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition cursor-pointer"
                  >
                    {t('sampleBtnRa')}
                  </button>
                  <button
                    onClick={() => handleSelectSample(samples[1])}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    {t('sampleBtnNormal')}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: UPLOAD REPORT */}
        {activeTab === 'upload' && (
          <ReportUploader
            onExtractionComplete={handleExtractionComplete}
            onSelectSample={handleSelectSample}
            samples={samples}
          />
        )}

        {/* TAB 2.5: VERIFY EXTRACTED VALUES */}
        {activeTab === 'verify' && extractionResult && (
          <VerificationTable
            extraction={extractionResult}
            onContinue={handleContinueToPrediction}
            onBack={() => setActiveTab('upload')}
            isPredicting={isPredicting}
          />
        )}

        {/* TAB 3: PREDICTION RESULTS */}
        {activeTab === 'results' && predictionResult && (
          <ResultsSummary
            prediction={predictionResult}
            patientInfo={patientInfo}
            onAskAI={() => setActiveTab('ask-ai')}
          />
        )}

        {/* TAB 4: ASK AI CONVERSATIONAL ASSISTANT */}
        {activeTab === 'ask-ai' && (
          <VoiceAssistant
            currentPrediction={predictionResult}
            extractedValues={extractionResult?.extracted_items || null}
          />
        )}

        {/* TAB 5: MY REPORT (If already predicted, show results + guidance) */}
        {activeTab === 'my-report' && (
          predictionResult ? (
            <div>
              <ResultsSummary
                prediction={predictionResult}
                patientInfo={patientInfo}
                onAskAI={() => setActiveTab('ask-ai')}
              />
              <div className="border-t border-slate-200 my-8" />
              <WhatNextGuidance />
            </div>
          ) : (
            <div className="max-w-xl mx-auto px-4 py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4 shadow-2xs">
                <FileText className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                No active report found
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Upload your laboratory report or choose a sample to view your personalized screening results and next steps.
              </p>
              <button
                onClick={() => setActiveTab('upload')}
                className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition cursor-pointer"
              >
                {t('btnUploadReport')}
              </button>
            </div>
          )
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Technical Model Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

    </div>
  );
};
