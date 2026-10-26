import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { LabItem, ExtractionResult } from '../types';
import {
  Check,
  AlertTriangle,
  Edit2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  X,
} from 'lucide-react';

interface VerificationTableProps {
  extraction: ExtractionResult;
  onContinue: (items: LabItem[]) => void;
  onBack: () => void;
  isPredicting: boolean;
}

export const VerificationTable: React.FC<VerificationTableProps> = ({
  extraction,
  onContinue,
  onBack,
  isPredicting,
}) => {
  const { t } = useLanguage();
  const [items, setItems] = useState<LabItem[]>(extraction.extracted_items);
  const [editingItem, setEditingItem] = useState<LabItem | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const handleEditClick = (item: LabItem) => {
    setEditingItem(item);
    setEditValue(String(item.value));
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    setItems((prev) =>
      prev.map((it) => {
        if (it.key === editingItem.key) {
          // Re-evaluate simple status
          let newStatus = it.status;
          const num = parseFloat(editValue.replace(/[><=]/g, ''));
          if (!isNaN(num)) {
            if (it.key === 'rf' && num > 14) newStatus = 'high';
            else if (it.key === 'anti_ccp' && num > 20) newStatus = 'high';
            else if (it.key === 'esr' && num > 20) newStatus = 'high';
            else if (it.key === 'crp' && num > 5) newStatus = 'high';
            else if (it.key === 'c3' && num < 90) newStatus = 'low';
            else if (it.key === 'c4' && num < 10) newStatus = 'low';
            else newStatus = 'normal';
          } else if (editValue.toLowerCase().includes('pos')) {
            newStatus = 'positive';
          } else {
            newStatus = 'normal';
          }

          return { ...it, value: editValue, status: newStatus };
        }
        return it;
      })
    );
    setEditingItem(null);
  };

  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            {t('statusHigh')}
          </span>
        );
      case 'positive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            {t('statusPositive')}
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
            {t('statusLow')}
          </span>
        );
      case 'normal':
      case 'good':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            {t('statusGood')}
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* 4-Step Indicator Matching Mockup Screen 3 */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-semibold">
          
          {/* Step 1: Upload (Done) */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
              1
            </div>
            <span>{t('stepUpload')}</span>
          </div>

          <div className="w-8 sm:w-12 h-0.5 bg-sky-600" />

          {/* Step 2: Extract & Verify (Active) */}
          <div className="flex items-center gap-1.5 text-sky-700 font-bold">
            <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              2
            </div>
            <span>{t('stepVerify')}</span>
          </div>

          <div className="w-8 sm:w-12 h-0.5 bg-slate-200" />

          {/* Step 3: Predict */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <span>{t('stepPredict')}</span>
          </div>

          <div className="w-8 sm:w-12 h-0.5 bg-slate-200" />

          {/* Step 4: Results */}
          <div className="flex items-center gap-1.5 text-slate-400">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">
              4
            </div>
            <span>{t('stepResults')}</span>
          </div>

        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1">
          {t('verifyTitle')}
        </h1>
        <p className="text-sm text-slate-600">
          {t('verifySubtitle')}
        </p>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">{t('colTest')}</th>
                <th className="py-3.5 px-4 sm:px-6">{t('colValue')}</th>
                <th className="py-3.5 px-4 sm:px-6 hidden sm:table-cell">{t('colUnit')}</th>
                <th className="py-3.5 px-4 sm:px-6 hidden sm:table-cell">{t('colRefRange')}</th>
                <th className="py-3.5 px-4 sm:px-6">{t('colStatus')}</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">{t('colAction')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.key} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">
                    {item.name}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-800">
                    {item.value}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500 hidden sm:table-cell">
                    {item.unit || '-'}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-slate-500 hidden sm:table-cell font-mono text-xs">
                    {item.reference_range || '-'}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6">
                    {renderStatusBadge(item.status)}
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      {t('btnEdit')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('btnBack')}
        </button>

        <button
          onClick={() => onContinue(items)}
          disabled={isPredicting}
          className="flex items-center gap-2 px-7 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/25 transition cursor-pointer disabled:opacity-50"
        >
          {isPredicting ? (
            <span>Processing...</span>
          ) : (
            <>
              <span>{t('btnContinuePrediction')}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Edit Value Dialog Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {t('editDialogTitle')}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                {editingItem.name} ({editingItem.unit || 'Standard Unit'})
              </label>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-800 font-bold outline-hidden transition"
                autoFocus
              />
              <p className="text-xs text-slate-400 mt-1">
                Reference Range: {editingItem.reference_range || 'Clinical normal'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                {t('btnCancel')}
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl text-sm font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition cursor-pointer"
              >
                {t('btnSave')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
