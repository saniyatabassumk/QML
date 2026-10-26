import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Language } from '../types';
import {
  Activity,
  Globe,
  Type,
  FileText,
  Upload,
  MessageSquareHeart,
  FileCheck,
  Cpu,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAbout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenAbout }) => {
  const { language, setLanguage, t, textSize, setTextSize } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [textMenuOpen, setTextMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t('navHome'), icon: Activity },
    { id: 'upload', label: t('navUpload'), icon: Upload },
    { id: 'ask-ai', label: t('navAskAI'), icon: MessageSquareHeart },
    { id: 'my-report', label: t('navMyReport'), icon: FileCheck },
  ];

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Tagline */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 text-left group cursor-pointer focus:outline-hidden"
          >
            <div className="w-11 h-11 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20 group-hover:bg-sky-700 transition">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-sky-700 transition flex items-center gap-2">
                RheumaSense AI
                <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  Voice & QML
                </span>
              </div>
              <div className="text-xs font-medium text-slate-500 hidden sm:block">
                {t('tagline')}
              </div>
            </div>
          </button>

          {/* Center: 4 Primary Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/70">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-white text-sky-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Language, Text Size, Model Info */}
          <div className="flex items-center gap-2">
            
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                title="Change Language"
              >
                <Globe className="w-4 h-4 text-sky-600" />
                <span className="hidden sm:inline">
                  {languages.find((l) => l.code === language)?.native || 'English'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-sky-50 transition cursor-pointer ${
                        language === l.code ? 'font-bold text-sky-700 bg-sky-50/60' : 'text-slate-700'
                      }`}
                    >
                      <span>{l.native}</span>
                      <span className="text-xs text-slate-400">{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Accessibility: Text Size Button */}
            <div className="relative">
              <button
                onClick={() => setTextMenuOpen(!textMenuOpen)}
                className="p-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                title={t('textSize')}
              >
                <Type className="w-4 h-4 text-sky-600" />
              </button>

              {textMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {t('textSize')}
                  </div>
                  {[
                    { id: 'normal', label: t('sizeNormal') },
                    { id: 'large', label: t('sizeLarge') },
                    { id: 'xl', label: t('sizeXL') },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setTextSize(s.id as any);
                        setTextMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-sky-50 transition cursor-pointer ${
                        textSize === s.id ? 'font-bold text-sky-700 bg-sky-50/60' : 'text-slate-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Technical / About Button */}
            <button
              onClick={onOpenAbout}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
              title="Technical model architecture & quantum metrics"
            >
              <Cpu className="w-4 h-4 text-slate-500" />
              {t('navAbout')}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Nav Bottom Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 bg-white py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer ${
                isActive ? 'text-sky-700 font-bold' : 'text-slate-500'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
