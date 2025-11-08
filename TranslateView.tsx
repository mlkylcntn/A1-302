import React, { useState, useCallback, useEffect } from 'react';
import { translateText, getTextToSpeech } from './geminiService';
import { TranslationItem, DetailedTranslationResult } from './types';
import { ICONS, LANGUAGES } from './constants';

// --- Audio Helper Functions ---
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

// --- Component ---
interface TranslateViewProps {
  apiKey: string;
  onInvalidApiKey: () => void;
  addTranslationToHistory: (item: Omit<TranslationItem, 'id'>) => void;
  showToast: (message: string) => void;
  toggleFavorite: (item: TranslationItem) => void;
  favorites: TranslationItem[];
  history: TranslationItem[];
  autoPlayAudio: boolean;
  lastTranslatedItem: TranslationItem | null;
  setLastTranslatedItem: (item: TranslationItem | null) => void;
  inputText: string;
  setInputText: (text: string) => void;
  sourceLang: string;
  setSourceLang: (lang: string) => void;
  targetLang: string;
  setTargetLang: (lang: string) => void;
}

const TranslateView: React.FC<TranslateViewProps> = ({ 
  apiKey,
  onInvalidApiKey,
  addTranslationToHistory, 
  showToast, 
  toggleFavorite, 
  favorites, 
  history,
  autoPlayAudio,
  lastTranslatedItem,
  setLastTranslatedItem,
  inputText,
  setInputText,
  sourceLang,
  setSourceLang,
  targetLang,
  setTargetLang,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  
  const sourceLangName = LANGUAGES.find(l => l.code === sourceLang)?.name || '...';
  const targetLangName = LANGUAGES.find(l => l.code === targetLang)?.name || '...';

  useEffect(() => {
    if (inputText.trim() && inputText.trim().toLowerCase() === lastTranslatedItem?.fromText.toLowerCase() && sourceLang === lastTranslatedItem?.sourceLang) {
      setIsTranslated(true);
    } else {
      setIsTranslated(false);
    }
  }, [inputText, sourceLang, lastTranslatedItem]);

  const handleTranslate = useCallback(async () => {
    const textToTranslate = inputText.trim();
    if (!textToTranslate) return;

    setIsLoading(true);
    // Setting to null here clears the previous result immediately
    // setLastTranslatedItem(null); 

    const cached = history.find(item =>
      item.fromText.toLowerCase() === textToTranslate.toLowerCase() &&
      item.sourceLang === sourceLang &&
      item.targetLang === targetLang &&
      item.detailedResult
    );

    if (cached) {
      setLastTranslatedItem(cached);
      addTranslationToHistory(cached);
      showToast("Geçmişten çevrildi");
      setIsLoading(false);
      setIsTranslated(true);
      if (autoPlayAudio && cached.detailedResult?.audioBase64) {
        playAudio(cached.detailedResult.audioBase64);
      }
      return;
    }

    const result = await translateText(apiKey, textToTranslate, sourceLangName, targetLangName, onInvalidApiKey);

    if (result && result.meanings.length > 0) {
      const primaryTranslation = result.meanings[0].translations[0] || 'N/A';
      
      setIsAudioLoading(true);
      const audioBase64 = await getTextToSpeech(apiKey, textToTranslate, sourceLang, onInvalidApiKey);
      setIsAudioLoading(false);

      const finalResult = { ...result, audioBase64: audioBase64 || undefined };
      
      const newItem: Omit<TranslationItem, 'id'> = {
        fromText: textToTranslate,
        toText: primaryTranslation,
        sourceLang: sourceLang,
        targetLang: targetLang,
        detailedResult: finalResult,
      };

      const newItemWithId: TranslationItem = { ...newItem, id: new Date().toISOString() };
      
      addTranslationToHistory(newItem);
      setLastTranslatedItem(newItemWithId);
      setIsTranslated(true);
      if (autoPlayAudio && audioBase64) {
        playAudio(audioBase64);
      }
    } else if (apiKey) { // Only show toast if API key exists, otherwise onInvalidApiKey will handle it
      showToast("Çeviri başarısız oldu. Lütfen internet bağlantınızı kontrol edin.");
    }
    setIsLoading(false);
  }, [apiKey, onInvalidApiKey, inputText, sourceLang, targetLang, history, addTranslationToHistory, showToast, sourceLangName, targetLangName, autoPlayAudio, setLastTranslatedItem]);

  const playAudio = async (base64Audio: string | undefined) => {
    if (!base64Audio) return;
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decodedBytes = decode(base64Audio);
        const audioBuffer = await decodeAudioData(decodedBytes, audioContext);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
    } catch (error) {
        console.error("Failed to play audio:", error);
        showToast("Ses dosyası oynatılamadı.");
    }
  };

  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(lastTranslatedItem?.toText || '');
    setLastTranslatedItem(null);
  };
  
  const handleReset = () => {
    setInputText('');
    setLastTranslatedItem(null);
  }

  const handleCopy = () => {
    if (!lastTranslatedItem?.detailedResult) return;
    const { detailedResult, toText } = lastTranslatedItem;
    const textToCopy = `${toText} (${detailedResult.pronunciation})\n\n` +
      detailedResult.meanings.map(m => `${m.partOfSpeech}:\n- ${m.translations.join('\n- ')}`).join('\n\n');
    navigator.clipboard.writeText(textToCopy);
    showToast('Panoya kopyalandı!');
  };

  const isFavorited = lastTranslatedItem ? favorites.some(fav => fav.fromText.toLowerCase() === lastTranslatedItem.fromText.toLowerCase() && fav.sourceLang === lastTranslatedItem.sourceLang && fav.targetLang === lastTranslatedItem.targetLang) : false;
  const isPhraseTranslation = lastTranslatedItem?.detailedResult?.pronunciation === '';

  return (
    <div className="flex flex-col items-center justify-start h-full">
      <div className="w-full max-w-lg">
        <div className="relative">
          <div className="absolute top-4 left-5 text-sm font-semibold text-dark-text-secondary">{sourceLangName}</div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`${sourceLangName} dilinde bir kelime veya cümle yazın...`}
            className="w-full p-4 pt-10 pb-14 bg-dark-surface border-2 border-dark-border rounded-2xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors duration-200 text-lg resize-none"
            rows={2}
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <button onClick={handleSwapLanguages} className="p-2 text-dark-text-secondary hover:text-brand-primary transition-colors rounded-full hover:bg-dark-border" title="Dilleri Değiştir">
              {ICONS.swap}
            </button>
            <button
                onClick={isTranslated ? handleReset : handleTranslate}
                disabled={isLoading || !inputText.trim()}
                className="w-32 h-10 flex items-center justify-center gap-2 bg-brand-primary text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                    isTranslated ? <>{ICONS.x} Sıfırla</> : <>{ICONS.send} Çevir</>
                )}
            </button>
          </div>
        </div>
        
        {lastTranslatedItem && (
          <div className="mt-6 p-5 bg-dark-surface rounded-xl border border-dark-border animate-fade-in">
             <div className="flex justify-between items-start">
               <div>
                <p className="text-sm font-semibold text-dark-text-secondary mb-1">{targetLangName}</p>
                <div className="flex items-center gap-3">
                  <h2 className={`font-bold text-brand-secondary ${isPhraseTranslation ? 'text-lg' : 'text-3xl'}`}>{lastTranslatedItem.toText}</h2>
                  {!isPhraseTranslation && lastTranslatedItem.detailedResult && (
                      <p className="text-dark-text-secondary text-lg mt-1">/{lastTranslatedItem.detailedResult.pronunciation}/</p>
                  )}
                  {lastTranslatedItem.sourceLang === 'en' && <button 
                    onClick={() => playAudio(lastTranslatedItem.detailedResult?.audioBase64)} 
                    className="p-2 rounded-full hover:bg-dark-border transition-colors disabled:text-gray-600 disabled:cursor-not-allowed"
                    disabled={isAudioLoading || !lastTranslatedItem.detailedResult?.audioBase64}
                    title="Telaffuzu dinle"
                  >
                    {isAudioLoading ? <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : ICONS.volume}
                  </button>}
                </div>
               </div>
              <div className="flex gap-2 mt-2">
                <button onClick={handleCopy} className="p-2 rounded-full hover:bg-dark-border transition-colors" title="Kopyala">{ICONS.copy}</button>
                <button onClick={() => toggleFavorite(lastTranslatedItem)} className={`p-2 rounded-full hover:bg-dark-border transition-colors ${isFavorited ? 'text-yellow-400' : ''}`} title="Favorilere Ekle">{ICONS.addFavorite}</button>
              </div>
            </div>
            
            {lastTranslatedItem.detailedResult && <div className="space-y-5 mt-5">
              {lastTranslatedItem.detailedResult.meanings.map((meaning, index) => (
                <div key={index}>
                    {!isPhraseTranslation && (
                      <h3 className="font-semibold text-md text-dark-text-secondary mb-2 capitalize italic">{meaning.partOfSpeech}</h3>
                    )}
                  <div className="flex flex-wrap gap-2">
                    {meaning.translations.map((trans, i) => (
                      <span key={i} className="bg-dark-border px-3 py-1 rounded-full text-dark-text text-sm">{trans}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>}
          </div>
        )}
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        textarea { scrollbar-width: none; -ms-overflow-style: none; }
        textarea::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default TranslateView;
