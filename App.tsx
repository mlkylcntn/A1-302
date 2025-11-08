import React, { useState, useEffect, useCallback } from 'react';
import { TranslationItem } from './types';
import TranslateView from './TranslateView';
import FavoritesView from './FavoritesView';
import HistoryView from './HistoryView';
import SettingsView from './SettingsView';
import GameView from './GameView';
import GameAnalysisView from './GameAnalysisView';
import Toast from './Toast';
import { ICONS } from './constants';
import LoadingView from './LoadingView';
import ApiKeyPromptView from './ApiKeyPromptView';
import { validateApiKey } from './geminiService';

export interface GameResult {
  item: TranslationItem;
  known: boolean | null;
}

type View = 'translate' | 'favorites' | 'history' | 'settings' | 'game' | 'game_analysis';

function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch {
      return defaultValue;
    }
  });
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

const App: React.FC = () => {
  const [history, setHistory] = useStickyState<TranslationItem[]>([], 'translationHistory');
  const [favorites, setFavorites] = useStickyState<TranslationItem[]>([], 'translationFavorites');
  const [autoPlayAudio, setAutoPlayAudio] = useStickyState<boolean>(false, 'autoPlayAudio');
  const [currentView, setCurrentView] = useState<View>('translate');
  const [toast, setToast] = useState('');
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  
  // Lifted state for translation view
  const [lastTranslatedItem, setLastTranslatedItem] = useState<TranslationItem | null>(null);
  const [inputText, setInputText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('tr');

  const [apiKey, setApiKey] = useStickyState<string>('', 'geminiApiKey');
  const [isApiKeyValid, setIsApiKeyValid] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(true);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  }, []);

  useEffect(() => {
    const verifyExistingKey = async () => {
      setIsVerifying(true);
      const startTime = Date.now();

      if (apiKey) {
        const isValid = await validateApiKey(apiKey);
        if (isValid) {
          setIsApiKeyValid(true);
        } else {
          setApiKey('');
          showToast('Kaydedilmiş API Anahtarı geçersiz.');
          setIsApiKeyValid(false);
        }
      } else {
        setIsApiKeyValid(false);
      }
      
      const elapsedTime = Date.now() - startTime;
      const minWaitTime = 1500;
      const remainingTime = minWaitTime - elapsedTime;

      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      setIsVerifying(false);
    };
    verifyExistingKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetApiKey = async (newKey: string) => {
    setIsVerifying(true);
    const isValid = await validateApiKey(newKey);
    if (isValid) {
      setApiKey(newKey);
      setIsApiKeyValid(true);
      showToast("API Anahtarı başarıyla doğrulandı!");
    } else {
      showToast("Geçersiz API Anahtarı. Lütfen kontrol edip tekrar deneyin.");
    }
    setIsVerifying(false);
  };
  
  const handleInvalidApiKey = useCallback(() => {
    showToast("API Anahtarı artık geçerli değil. Lütfen yeni bir anahtar girin.");
    setApiKey('');
    setIsApiKeyValid(false);
  }, [setApiKey, showToast]);

  const addTranslationToHistory = useCallback((item: Omit<TranslationItem, 'id'>) => {
    setHistory(prev => {
      const newHistory = prev.filter(h => h.fromText.toLowerCase() !== item.fromText.toLowerCase());
      return [{ ...item, id: new Date().toISOString() }, ...newHistory].slice(0, 50);
    });
  }, [setHistory]);

  const toggleFavorite = useCallback((item: TranslationItem) => {
    setFavorites(prev => {
      const isFavorited = prev.some(fav => fav.id === item.id);
      if (isFavorited) {
        showToast("Favorilerden kaldırıldı.");
        return prev.filter(fav => fav.id !== item.id);
      } else {
        showToast("Favorilere eklendi.");
        return [item, ...prev];
      }
    });
  }, [setFavorites, showToast]);

  const handleExportData = useCallback(() => {
    const data = JSON.stringify({ favorites, history, autoPlayAudio }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translator_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Veriler dışa aktarıldı!');
  }, [favorites, history, autoPlayAudio, showToast]);

  const handleImportData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.favorites && data.history && typeof data.autoPlayAudio === 'boolean') {
            setFavorites(data.favorites);
            setHistory(data.history);
            setAutoPlayAudio(data.autoPlayAudio);
            showToast('Veriler başarıyla içe aktarıldı!');
          } else {
            showToast('Geçersiz veri dosyası.');
          }
        } catch (error) {
          showToast('Veri dosyası okunurken hata oluştu.');
          console.error("Import error:", error);
        }
      };
      reader.readAsText(file);
    }
  }, [setFavorites, setHistory, setAutoPlayAudio, showToast]);

  const renderView = () => {
    const translateViewProps = {
      apiKey: apiKey,
      onInvalidApiKey: handleInvalidApiKey,
      addTranslationToHistory: addTranslationToHistory,
      showToast: showToast,
      toggleFavorite: toggleFavorite,
      favorites: favorites,
      history: history,
      autoPlayAudio: autoPlayAudio,
      lastTranslatedItem: lastTranslatedItem,
      setLastTranslatedItem: setLastTranslatedItem,
      inputText: inputText,
      setInputText: setInputText,
      sourceLang: sourceLang,
      setSourceLang: setSourceLang,
      targetLang: targetLang,
      setTargetLang: setTargetLang,
    };

    switch (currentView) {
      case 'translate':
        return <TranslateView {...translateViewProps} />;
      case 'favorites':
        return <FavoritesView favorites={favorites} setFavorites={setFavorites} showToast={showToast} onPlayGame={() => setCurrentView('game')} onToggleFavorite={toggleFavorite} />;
      case 'history':
        return <HistoryView history={history} setHistory={setHistory} showToast={showToast} />;
      case 'settings':
        return <SettingsView autoPlayAudio={autoPlayAudio} setAutoPlayAudio={setAutoPlayAudio} onExportData={handleExportData} onImportData={handleImportData} onResetApiKey={() => { setApiKey(''); setIsApiKeyValid(false); showToast('API Anahtarı sıfırlandı.'); }} />;
      case 'game':
        return <GameView favorites={favorites} onGameEnd={(results) => { setGameResults(results); setCurrentView('game_analysis'); }} />;
      case 'game_analysis':
        return <GameAnalysisView results={gameResults} onPlayAgain={() => setCurrentView('game')} onReturnToFavorites={() => setCurrentView('favorites')} />;
      default:
        return <TranslateView {...translateViewProps} />;
    }
  };

  if (isVerifying) {
    return <LoadingView />;
  }
  
  if (!isApiKeyValid) {
    return <ApiKeyPromptView onApiKeySet={handleSetApiKey} isVerifying={isVerifying} />;
  }

  const navItems: { view: View; icon: React.ReactElement; label: string }[] = [
    { view: 'translate', icon: ICONS.translate, label: 'Çevir' },
    { view: 'favorites', icon: ICONS.favorites, label: 'Favoriler' },
    { view: 'history', icon: ICONS.history, label: 'Geçmiş' },
    { view: 'settings', icon: ICONS.settings, label: 'Ayarlar' },
  ];

  return (
    <div className="bg-dark-bg text-dark-text min-h-screen flex flex-col font-sans">
      <header className="text-center py-4">
        <h1 className="text-2xl font-bold text-white"><span className="text-brand-primary">A1-302</span> Çeviri</h1>
      </header>
      <main className="flex-grow container mx-auto px-4 pb-6">
        {renderView()}
      </main>
      <nav className="sticky bottom-0 bg-dark-surface border-t border-dark-border">
        <div className="max-w-2xl mx-auto flex justify-around">
          {navItems.map(item => (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`flex flex-col items-center justify-center w-full pt-3 pb-2 transition-colors ${
                currentView === item.view ? 'text-brand-primary' : 'text-dark-text-secondary hover:text-white'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
      {toast && <Toast message={toast} />}
    </div>
  );
};

export default App;
