import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ShieldCheck, AlertCircle, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-20 border-t border-slate-200 bg-white py-8 text-sm text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Prominent Medical Notice */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-sky-50/80 border border-sky-100 text-sky-950 mb-6">
          <AlertCircle className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <span className="font-bold">Medical Disclaimer: </span>
            {t('disclaimerShort')}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero-Retention Privacy Safeguard &bull; Temporary in-memory report processing</span>
          </div>
          <div className="flex items-center gap-1">
            <span>RheumaSense AI &bull; Built with Classical ML & PennyLane QML</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
