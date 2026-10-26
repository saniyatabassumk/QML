import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Activity,
  HeartPulse,
  Pill,
  Sparkles,
  AlertTriangle,
  Stethoscope,
  ShieldAlert,
  CalendarCheck,
  CheckCircle,
} from 'lucide-react';

export const WhatNextGuidance: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<string>('overview');

  const tabs = [
    { id: 'overview', label: t('tabOverview'), icon: Activity },
    { id: 'markers', label: t('tabMarkers'), icon: HeartPulse },
    { id: 'next_steps', label: t('tabNextSteps'), icon: Stethoscope },
    { id: 'treatment', label: t('tabTreatment'), icon: Pill },
    { id: 'lifestyle', label: t('tabLifestyle'), icon: Sparkles },
    { id: 'warnings', label: t('tabWarnings'), icon: AlertTriangle },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          {language === 'kn'
            ? 'ರುಮಟಾಯ್ಡ್ ಸಂಧಿವಾತ (RA) - ರೋಗಿ ಮಾಹಿತಿ ಮತ್ತು ಮಾರ್ಗದರ್ಶನ'
            : language === 'hi'
            ? 'रूमेटॉइड अर्थराइटिस (RA) - मरीज मार्गदर्शन एवं जानकारी'
            : 'Rheumatoid Arthritis (RA) — Comprehensive Guidance'}
        </h1>
        <p className="text-sm text-slate-600">
          {language === 'kn'
            ? 'ನಿಮ್ಮ ವರದಿ ಮತ್ತು ಆರೋಗ್ಯದ ಬಗ್ಗೆ ವಿಶ್ವಾಸಾರ್ಹ ವೈದ್ಯಕೀಯ ಮಾಹಿತಿ.'
            : language === 'hi'
            ? 'आपकी रिपोर्ट और स्वास्थ्य के बारे में प्रमाणित एवं सुरक्षित जानकारी।'
            : 'Clear, medically reviewed patient education and practical next steps.'}
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 mb-6 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              {language === 'kn' ? 'ರುಮಟಾಯ್ಡ್ ಸಂಧಿವಾತ (RA) ಎಂದರೇನು?' : language === 'hi' ? 'रूमेटॉइड अर्थराइटिस क्या है?' : 'What is Rheumatoid Arthritis (RA)?'}
            </h2>
            <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
              {language === 'kn'
                ? 'ರುಮಟಾಯ್ಡ್ ಸಂಧಿವಾತವು ಒಂದು ದೀರ್ಘಕಾಲದ ಸ್ವಯಂ ನಿರೋಧಕ (ಆಟೋಇಮ್ಯೂನ್) ಸ್ಥಿತಿಯಾಗಿದ್ದು, ಇದರಲ್ಲಿ ದೇಹದ ರೋಗನಿರೋಧಕ ವ್ಯವಸ್ಥೆಯು ಕೀಲುಗಳ ಒಳಪದರವನ್ನು ತಪ್ಪಾಗಿ ಗುರಿಯಾಗಿಸುತ್ತದೆ. ಇದು ಉರಿಯೂತ, ಊತ, ನೋವು ಮತ್ತು ಕೀಲುಗಳ ಬಿಗಿತವನ್ನು ಉಂಟುಮಾಡುತ್ತದೆ. ಆರಂಭಿಕ ಪತ್ತೆ ಮತ್ತು ಸಕಾಲಿಕ ಚಿಕಿತ್ಸೆಯಿಂದ ಕೀಲುಗಳ ಹಾನಿಯನ್ನು ತಡೆಗಟ್ಟಬಹುದು.'
                : language === 'hi'
                ? 'रूमेटॉइड अर्थराइटिस (RA) एक ऑटोइम्यून स्थिति है जिसमें शरीर की प्रतिरक्षा प्रणाली गलती से जोड़ों के ऊतकों पर हमला करती है। इससे जोड़ों में सूजन, तेज दर्द और सुबह की अकड़न होती है। समय पर जांच और सही इलाज से जोड़ों के नुकसान को पूरी तरह रोका जा सकता है।'
                : 'Rheumatoid arthritis (RA) is an autoimmune condition where the immune system attacks the lining of the joints, causing inflammation, pain, and stiffness. It primarily affects symmetrical small joints (wrists, hands, feet) and can lead to joint damage if not treated early.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-sky-50 border border-sky-100">
              <h3 className="font-bold text-sky-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-sky-600" />
                {language === 'kn' ? 'ಸಾಮಾನ್ಯ ಲಕ್ಷಣಗಳು' : language === 'hi' ? 'प्रमुख लक्षण' : 'Common Symptoms'}
              </h3>
              <ul className="text-xs sm:text-sm text-sky-950 space-y-1.5">
                <li>• {language === 'kn' ? 'ಬೆಳಗಿನ ಕೀಲು ಬಿಗಿತ (೩೦ ನಿಮಿಷಗಳಿಗಿಂತ ಹೆಚ್ಚು)' : language === 'hi' ? 'सुबह 30 मिनट से अधिक जोड़ों की अकड़न' : 'Morning joint stiffness lasting > 30-60 minutes'}</li>
                <li>• {language === 'kn' ? 'ಎರಡೂ ಕೈಗಳು ಅಥವಾ ಪಾದಗಳಲ್ಲಿ ಸಮಾನವಾಗಿ ನೋವು' : language === 'hi' ? 'दोनों हाथों या पैरों में एक जैसी सूजन' : 'Symmetrical pain in hands, wrists, or feet'}</li>
                <li>• {language === 'kn' ? 'ಕೀಲುಗಳಲ್ಲಿ ಊತ ಮತ್ತು ಮೃದುತ್ವ' : language === 'hi' ? 'जोड़ों पर छूने से दर्द और सूजन' : 'Tender, swollen, warm joints'}</li>
                <li>• {language === 'kn' ? 'ಸುಸ್ತು ಮತ್ತು ಲಘು ಜ್ವರ' : language === 'hi' ? 'थकान और हल्का बुखार' : 'Unexplained fatigue and malaise'}</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
              <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                {language === 'kn' ? 'ವೈದ್ಯರನ್ನು ಯಾವಾಗ ಭೇಟಿ ಮಾಡಬೇಕು?' : language === 'hi' ? 'डॉक्टर से कब मिलें?' : 'When to See a Doctor'}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                {language === 'kn'
                  ? 'ನಿಮಗೆ ೪ ರಿಂದ ೬ ವಾರಗಳಿಗಿಂತ ಹೆಚ್ಚು ಕಾಲ ನಿರಂತರ ಕೀಲು ನೋವು ಅಥವಾ ಬೆಳಗಿನ ಬಿಗಿತವಿದ್ದರೆ, ರೋಗನಿರ್ಣಯಕ್ಕಾಗಿ ರುಮಟಾಲಜಿಸ್ಟ್ (ಕೀಲು ರೋಗ ತಜ್ಞರು) ಅವರನ್ನು ಭೇಟಿ ಮಾಡುವುದು ಅವಶ್ಯಕ.'
                  : language === 'hi'
                  ? 'यदि आपको 4-6 सप्ताह से अधिक समय से जोड़ों में दर्द या अकड़न है, तो तुरंत किसी रूमेटोलॉजिस्ट से मिलकर जोड़ों की जांच कराएं।'
                  : 'If you have persistent joint discomfort, swelling, or morning stiffness for more than 4-6 weeks, arrange an assessment with a rheumatologist.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Markers */}
      {activeSubTab === 'markers' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 mb-1">
              RF (Rheumatoid Factor) &bull; Normal: &lt; 14 IU/mL
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              An antibody present in the blood of 70-80% of patients with rheumatoid arthritis. High levels suggest higher disease activity.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 mb-1">
              Anti-CCP (ACPA) &bull; Normal: &lt; 20 U/mL
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Highly specific (&gt;95%) for Rheumatoid Arthritis. Levels above 20 U/mL strongly indicate active RA and distinguish it from other joint conditions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 mb-1">
              ESR &amp; CRP &bull; Inflammatory Markers
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Erythrocyte Sedimentation Rate (ESR) and C-Reactive Protein (CRP) measure systemic body inflammation. Elevated levels indicate active inflammatory flare-ups.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Next Steps */}
      {activeSubTab === 'next_steps' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            {t('nextStepsTitle')}
          </h2>
          <ol className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
              <div>
                <strong className="text-slate-900 block">Schedule a Rheumatology Consultation:</strong>
                Book an appointment with a qualified rheumatologist or specialist physician.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
              <div>
                <strong className="text-slate-900 block">Bring Original Reports:</strong>
                Take all physical laboratory reports, prescription lists, and medical history.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
              <div>
                <strong className="text-slate-900 block">Keep a Symptom Diary:</strong>
                Record which joints hurt, when pain peaks, and how many minutes early morning stiffness lasts.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</span>
              <div>
                <strong className="text-slate-900 block">Discuss Baseline Imaging:</strong>
                Ask the clinician whether ultrasound or X-rays of your hands/feet are appropriate to evaluate cartilage.
              </div>
            </li>
          </ol>
        </div>
      )}

      {/* Tab 4: Treatment */}
      {activeSubTab === 'treatment' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 mb-1">
              DMARDs (Disease-Modifying Anti-Rheumatic Drugs)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Standard frontline treatments (such as Methotrexate, Sulfasalazine, Hydroxychloroquine, Leflunomide) that slow or halt disease progression and protect joints.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 mb-1">
              Biologic Therapies &amp; Targeted Synthetics
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Advanced therapies (TNF inhibitors, IL-6 inhibitors, JAK inhibitors) used when conventional DMARDs need reinforcement.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 mb-1">
              Physiotherapy &amp; Occupational Support
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Specialized exercises to maintain flexibility, joint range of motion, and grip strength.
            </p>
          </div>
        </div>
      )}

      {/* Tab 5: Lifestyle */}
      {activeSubTab === 'lifestyle' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            Joint-Care &amp; Daily Protection
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-700">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <strong className="block text-slate-900 mb-1">Gentle Physical Activity:</strong>
              Low-impact movement like walking, stationary cycling, and warm water swimming helps prevent stiffness.
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <strong className="block text-slate-900 mb-1">Temperature Relief:</strong>
              Warm showers or heating pads soothe morning stiffness; ice packs reduce acute joint swelling.
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <strong className="block text-slate-900 mb-1">Avoid Smoking:</strong>
              Smoking dramatically worsens RA severity and reduces the effectiveness of DMARD medications.
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <strong className="block text-slate-900 mb-1">Balanced Nutrition:</strong>
              Anti-inflammatory foods rich in omega-3 fatty acids (flaxseed, walnuts, fish), vegetables, and whole grains.
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Warnings */}
      {activeSubTab === 'warnings' && (
        <div className="p-6 rounded-3xl bg-rose-50 border-2 border-rose-200 text-rose-950 space-y-3">
          <div className="flex items-center gap-2 text-rose-700 font-extrabold text-lg">
            <AlertTriangle className="w-6 h-6" />
            <span>Emergency Red Flag Warning</span>
          </div>
          <p className="text-sm leading-relaxed">
            If you ever develop an intensely painful, single hot, red, severely swollen joint accompanied by a <strong>high fever or chills</strong>, do not wait. Seek urgent emergency hospital care immediately to rule out acute joint infection (septic arthritis).
          </p>
        </div>
      )}

    </div>
  );
};
