import React, { useState, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { apiService } from '../services/api';
import { ExtractionResult, SampleReportItem } from '../types';
import {
  UploadCloud,
  FileText,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  FileImage,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface ReportUploaderProps {
  onExtractionComplete: (result: ExtractionResult) => void;
  onSelectSample: (sample: SampleReportItem) => void;
  samples: SampleReportItem[];
}

export const ReportUploader: React.FC<ReportUploaderProps> = ({
  onExtractionComplete,
  onSelectSample,
  samples,
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = async (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setIsProcessing(true);
    setUploadProgress(15);

    // Simulate realistic upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 20;
      });
    }, 150);

    try {
      const result = await apiService.uploadReport(file);
      clearInterval(interval);
      setUploadProgress(100);

      setTimeout(() => {
        setIsProcessing(false);
        onExtractionComplete(result);
      }, 500);
    } catch (err: any) {
      clearInterval(interval);
      setIsProcessing(false);
      setUploadProgress(0);
      setErrorMessage(err.message || 'Failed to extract values from file.');
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      
      {/* Title & Description */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          {t('uploadTitle')}
        </h1>
        <p className="text-slate-600 text-base max-w-xl mx-auto leading-relaxed">
          {t('uploadSubtitle')}
        </p>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition cursor-pointer bg-white ${
          isDragging
            ? 'border-sky-500 bg-sky-50/50 scale-[1.01]'
            : 'border-slate-300 hover:border-sky-400 hover:bg-slate-50/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileChange(e.target.files[0]);
            }
          }}
        />

        <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mx-auto mb-4 shadow-2xs">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-1">
          {t('dragDropText')}
        </h3>
        <p className="text-sm text-slate-400 mb-5">or</p>

        <button
          type="button"
          className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/20 transition cursor-pointer"
        >
          {t('browseFiles')}
        </button>

        {/* Supported Format Pills */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
          <span className="font-semibold text-slate-400">{t('supportedFormats')}:</span>
          <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 font-bold border border-rose-100 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> PDF
          </span>
          <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-100 flex items-center gap-1">
            <FileImage className="w-3.5 h-3.5" /> JPG / PNG
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 flex items-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5" /> CSV / XLSX
          </span>
          <span className="text-slate-400">&bull; {t('maxFileSize')}</span>
        </div>
      </div>

      {/* Progress Bar Display */}
      {selectedFile && (
        <div className="mt-6 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-sm font-semibold mb-2">
            <div className="flex items-center gap-2 text-slate-800 truncate">
              <FileText className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="truncate">{selectedFile.name}</span>
              <span className="text-xs text-slate-400 font-normal">
                ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
              </span>
            </div>
            <div className="text-sky-700 font-bold shrink-0">{uploadProgress}%</div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>

          <div className="mt-2 text-xs flex items-center justify-between text-slate-500">
            {uploadProgress === 100 ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> {t('uploadComplete')}
              </span>
            ) : (
              <span className="text-sky-600 flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('processingFile')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Privacy Guarantee Card */}
      <div className="mt-8 p-5 rounded-2xl bg-white border border-slate-200 flex items-start gap-3.5 shadow-2xs">
        <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800 mb-0.5">
            {t('privacyTitle')}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            {t('privacyText')}
          </p>
        </div>
      </div>

      {/* 1-Click Sample Reports */}
      {samples.length > 0 && (
        <div className="mt-8 p-5 rounded-2xl bg-slate-100/80 border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4 text-sky-600" />
            {t('sampleReportsBanner')}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {samples.map((sample) => (
              <button
                key={sample.id}
                onClick={() => onSelectSample(sample)}
                className="text-left p-3.5 rounded-xl bg-white hover:border-sky-300 border border-slate-200 shadow-2xs hover:shadow-xs transition cursor-pointer"
              >
                <div className="text-sm font-bold text-slate-800 mb-1">
                  {sample.name}
                </div>
                <div className="text-xs text-slate-500 line-clamp-2">
                  {sample.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
