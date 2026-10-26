import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';
import { Language } from '../types';

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  textSize: 'normal' | 'large' | 'xl';
  setTextSize: (size: 'normal' | 'large' | 'xl') => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('rheuma_lang') as Language) || 'en';
  });

  const [textSize, setTextSizeState] = useState<'normal' | 'large' | 'xl'>(() => {
    return (localStorage.getItem('rheuma_text_size') as 'normal' | 'large' | 'xl') || 'normal';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('rheuma_lang', lang);
    document.documentElement.setAttribute('lang', lang);
  };

  const setTextSize = (size: 'normal' | 'large' | 'xl') => {
    setTextSizeState(size);
    localStorage.setItem('rheuma_text_size', size);
  };

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
    document.body.className = `text-size-${textSize}`;
  }, [language, textSize]);

  const t = (key: TranslationKey): string => {
    const langDict = translations[language] || translations.en;
    // @ts-ignore
    return langDict[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, textSize, setTextSize }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
