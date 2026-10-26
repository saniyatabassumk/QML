import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { apiService } from '../services/api';
import { PredictionData, ChatMessage } from '../types';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Activity,
  Bot,
  User,
  X,
} from 'lucide-react';

interface VoiceAssistantProps {
  currentPrediction: PredictionData | null;
  extractedValues: any[] | null;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  currentPrediction,
  extractedValues,
}) => {
  const { t, language } = useLanguage();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [isAssistantThinking, setIsAssistantThinking] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize initial greeting in selected language
  useEffect(() => {
    let greeting = '';
    if (language === 'kn') {
      greeting =
        'ನಮಸ್ಕಾರ! ನಾನು ರುಮಾಸೆನ್ಸ್ AI ಸಹಾಯಕ. ನಿಮ್ಮ ಆರೋಗ್ಯ ವರದಿ, ಕೀಲು ನೋವು ಅಥವಾ ಸಂಧಿವಾತದ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳಿದ್ದರೂ ಕೇಳಬಹುದು. ಮಾತನಾಡಲು ಕೆಳಗಿನ ಮೈಕ್ ಒತ್ತಿ.';
    } else if (language === 'hi') {
      greeting =
        'नमस्ते! मैं RheumaSense AI स्वास्थ्य सहायक हूँ। आप अपनी रिपोर्ट, जोड़ों के दर्द या गठिया के बारे में मुझसे कोई भी सवाल पूछ सकते हैं। बोलने के लिए नीचे दिए गए माइक पर टैप करें।';
    } else {
      greeting =
        "Hello! I am your RheumaSense AI assistant. You can speak or type your questions about your lab report, joint symptoms, or rheumatoid arthritis. Tap the microphone below to begin.";
    }

    setMessages([
      {
        id: 'welcome-1',
        role: 'assistant',
        content: greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [language]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAssistantThinking]);

  // Speech Recognition Setup
  const startSpeechRecognition = () => {
    setErrorMessage(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(t('speechNotSupported'));
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      // Assign language code
      const langCode = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.lang = langCode;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechTranscript('');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          interim += event.results[i][0].transcript;
        }
        setSpeechTranscript(interim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access denied. Please allow microphone permission in your browser settings.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      setIsListening(false);
      setErrorMessage('Could not start microphone: ' + (e.message || 'Unknown error'));
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleSendTranscript = () => {
    if (speechTranscript.trim()) {
      handleSendMessage(speechTranscript.trim());
      setSpeechTranscript('');
    }
  };

  const handleCancelVoice = () => {
    stopSpeechRecognition();
    setSpeechTranscript('');
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setSpeechTranscript('');
    setIsAssistantThinking(true);

    try {
      const resp = await apiService.sendChatMessage(
        textToSend,
        language,
        currentPrediction,
        extractedValues || []
      );

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: resp.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Automatically play response if speech was used
      playAudio(aiMsg.content, aiMsg.id);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an issue processing your question. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAssistantThinking(false);
    }
  };

  // Listen to response via TTS
  const playAudio = async (text: string, msgId: string) => {
    if (playingMessageId === msgId) {
      // Pause
      window.speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingMessageId(null);
      return;
    }

    setPlayingMessageId(msgId);

    // Clean text for speaking (remove disclaimers and markdown asterisks)
    const cleanSpoken = text.replace(/\*.*?\*/g, '').replace(/[#\-\*]/g, '').trim();

    // 1. Try Browser Web SpeechSynthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanSpoken);
      const langCode = language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.lang = langCode;
      utterance.rate = 0.95;

      utterance.onend = () => setPlayingMessageId(null);
      utterance.onerror = () => setPlayingMessageId(null);

      window.speechSynthesis.speak(utterance);
      return;
    }

    // 2. Fallback to backend gTTS
    try {
      const b64 = await apiService.getTextToSpeech(cleanSpoken, language);
      if (b64) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        const audio = new Audio(`data:audio/mp3;base64,${b64}`);
        audioRef.current = audio;
        audio.play();
        audio.onended = () => setPlayingMessageId(null);
      } else {
        setPlayingMessageId(null);
      }
    } catch {
      setPlayingMessageId(null);
    }
  };

  // Suggested questions in active language
  const suggestedQuestions =
    language === 'kn'
      ? [
          'ನನ್ನ ವರದಿಯಲ್ಲಿ RA ಪಾಸಿಟಿವ್ ಬಂದಿದೆ, ಈಗ ಏನು ಮಾಡಬೇಕು?',
          'ರುಮಟಾಯ್ಡ್ ಸಂಧಿವಾತ ಎಂದರೇನು?',
          'RF ಮತ್ತು Anti-CCP ನಡುವಿನ ವ್ಯತ್ಯಾಸವೇನು?',
          'ವೈದ್ಯರನ್ನು ನಾನು ಯಾವ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬೇಕು?',
        ]
      : language === 'hi'
      ? [
          'मेरी रिपोर्ट में RA पॉजिटिव आया है, मुझे अब क्या करना चाहिए?',
          'रुमेटॉइड अर्थराइटिस क्या होता है?',
          'RF और Anti-CCP में क्या अंतर है?',
          'मुझे डॉक्टर से क्या सवाल पूछने चाहिए?',
        ]
      : [
          'What should I do next after this screening?',
          'What is rheumatoid arthritis?',
          'What is the difference between RF and Anti-CCP?',
          'What questions should I ask my rheumatologist?',
        ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-140px)] min-h-[550px]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Bot className="w-6 h-6 text-sky-600" />
            {t('aiAssistantTitle')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('aiAssistantSubtitle')}
          </p>
        </div>

        {currentPrediction && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-100 text-xs text-sky-900 font-semibold">
            <Activity className="w-4 h-4 text-sky-600" />
            <span>Active context: {currentPrediction.predicted_disease}</span>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isPlaying = playingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-lg rounded-2xl px-5 py-3.5 shadow-2xs text-sm leading-relaxed ${
                  isUser
                    ? 'bg-sky-600 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>

                {/* Footer bar with timestamp and "Listen to Answer" */}
                <div
                  className={`mt-2 flex items-center justify-between gap-3 text-xs pt-1.5 border-t ${
                    isUser
                      ? 'border-sky-500/50 text-sky-200'
                      : 'border-slate-100 text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <button
                      onClick={() => playAudio(msg.content, msg.id)}
                      className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-md transition cursor-pointer ${
                        isPlaying
                          ? 'bg-rose-100 text-rose-700'
                          : 'hover:bg-slate-100 text-sky-700'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>{t('btnListenAnswer')}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isAssistantThinking && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-11">
            <Sparkles className="w-4 h-4 animate-spin text-sky-600" />
            <span>RheumaSense AI is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="py-2 overflow-x-auto flex items-center gap-2 no-scrollbar">
        {suggestedQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(q)}
            className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 border border-slate-200 text-slate-700 text-xs font-semibold whitespace-nowrap transition cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Live Voice Recording Review Modal / Banner */}
      {isListening && (
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 shadow-sm mb-3 animate-in fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sky-700 font-bold text-sm">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <span>{t('listeningNow')}</span>
            </div>
            <button
              onClick={handleCancelVoice}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 bg-white rounded-xl border border-sky-100 text-slate-800 text-sm min-h-12 font-medium">
            {speechTranscript || <span className="text-slate-400 italic">Listening to your voice...</span>}
          </div>

          <div className="flex items-center justify-end gap-2 mt-3">
            <button
              onClick={handleCancelVoice}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
            >
              {t('cancelVoice')}
            </button>
            <button
              onClick={stopSpeechRecognition}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-700 text-white hover:bg-slate-800 transition cursor-pointer"
            >
              {t('stopSpeaking')}
            </button>
            {speechTranscript && (
              <button
                onClick={handleSendTranscript}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 shadow-xs transition cursor-pointer"
              >
                {t('sendVoice')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error Notice */}
      {errorMessage && (
        <div className="mb-2 p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border border-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Input Bar with Huge Voice Mic Button */}
      <div className="pt-2 flex items-center gap-3">
        {/* Large Prominent Voice Microphone Button */}
        <button
          onClick={isListening ? stopSpeechRecognition : startSpeechRecognition}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-all cursor-pointer ${
            isListening
              ? 'bg-rose-600 text-white listening-pulse scale-105'
              : 'bg-sky-600 hover:bg-sky-700 text-white hover:scale-102 shadow-sky-600/30'
          }`}
          title={isListening ? t('stopSpeaking') : t('micTapToSpeak')}
        >
          {isListening ? (
            <MicOff className="w-7 h-7" />
          ) : (
            <Mic className="w-7 h-7" />
          )}
        </button>

        {/* Text Input Box */}
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage(inputText);
            }}
            placeholder={t('typePlaceholder')}
            className="w-full pl-4 pr-12 py-3.5 rounded-2xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 bg-white text-slate-800 text-sm outline-hidden transition shadow-2xs"
          />

          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim()}
            className="absolute right-2 p-2 text-sky-600 hover:text-sky-800 disabled:text-slate-300 transition cursor-pointer"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

    </div>
  );
};
