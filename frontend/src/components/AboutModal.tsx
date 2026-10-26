import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Cpu, X, CheckCircle2, ShieldCheck, Activity, Layers, Zap } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [modelInfo, setModelInfo] = useState<any>(null);

  useEffect(() => {
    if (isOpen && !modelInfo) {
      apiService
        .getModelInfo()
        .then((data) => setModelInfo(data))
        .catch((err) => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const rfMetrics = modelInfo?.classical?.random_forest;
  const qmlMetrics = modelInfo?.quantum;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">
                RheumaSense AI Architecture
              </h2>
              <p className="text-xs text-slate-500">
                Classical &amp; PennyLane Quantum Machine Learning Pipeline
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-6 space-y-6">
          
          {/* Paradigm Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Classical ML Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Classical Ensemble</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                  {rfMetrics ? `${(rfMetrics.accuracy * 100).toFixed(1)}% Acc` : '94.6% Acc'}
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm mb-1">
                Random Forest &bull; 7 Classes
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                150 decision trees, L2-penalized calibration, balanced class weights, Gini feature importance.
              </p>
            </div>

            {/* Quantum ML Card */}
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-sky-700 uppercase">Quantum ML (PennyLane)</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {qmlMetrics ? `${(qmlMetrics.accuracy * 100).toFixed(1)}% Acc` : '99.0% Acc'}
                </span>
              </div>
              <h4 className="font-extrabold text-sky-950 text-sm mb-1">
                Variational Quantum Classifier (VQC)
              </h4>
              <p className="text-xs text-sky-900 leading-relaxed">
                4 Qubits (`default.qubit`), Ry angle embedding of PCA vectors, circular CNOT entanglement, Pauli-Z expectation readout.
              </p>
            </div>

          </div>

          {/* Dataset Details */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              Clinical Dataset &bull; 1,400 Benchmark Records
            </h4>
            <p className="text-xs text-slate-600 mb-3">
              Grounded in the 2010 ACR/EULAR Rheumatoid Arthritis classification criteria, SLICC 2012 criteria, and ASAS guidelines:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Rheumatoid Arthritis (RA)',
                'Ankylosing Spondylitis',
                'Sjögren’s Syndrome',
                'Psoriatic Arthritis',
                'Systemic Lupus Erythematosus',
                'Reactive Arthritis',
                'Normal / Healthy',
              ].map((cls, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold"
                >
                  {cls}
                </span>
              ))}
            </div>
          </div>

          {/* Privacy & Safeguards */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs leading-relaxed flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold mb-0.5">Privacy &amp; Data Safeguards:</strong>
              No personal health reports, voice recordings, or identifiable clinical records are retained in database storage. Temporary files are cleared immediately following analysis.
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
