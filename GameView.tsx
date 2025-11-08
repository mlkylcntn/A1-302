
import React, { useState, useEffect } from 'react';
import { TranslationItem } from './types';
import { GameResult } from './App';
import { ICONS, LANGUAGES } from './constants';

interface GameViewProps {
  favorites: TranslationItem[];
  onGameEnd: (results: GameResult[]) => void;
}

const GameView: React.FC<GameViewProps> = ({ favorites, onGameEnd }) => {
  const [deck, setDeck] = useState<TranslationItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState<Record<string, GameResult>>({});
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasFlippedOnce, setHasFlippedOnce] = useState(false);
  
  useEffect(() => {
    if (favorites.length > 0) {
      const shuffled = [...favorites].sort(() => Math.random() - 0.5);
      setDeck(shuffled);
      
      const initialResults: Record<string, GameResult> = {};
      favorites.forEach(item => {
        initialResults[item.id] = { item, known: null };
      });
      setSessionResults(initialResults);
      
      setCurrentIndex(0);
      setIsFlipped(false);
      setHasFlippedOnce(false);
    }
  }, [favorites]);

  useEffect(() => {
    if (deck.length > 0 && currentIndex >= deck.length) {
      onGameEnd(Object.values(sessionResults));
    }
  }, [currentIndex, deck.length, onGameEnd, sessionResults]);

  useEffect(() => {
    setIsFlipped(false);
    setHasFlippedOnce(false);
  }, [currentIndex]);
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!hasFlippedOnce) {
        setHasFlippedOnce(true);
    }
  }

  const handleAnswer = (known: boolean) => {
    const currentItem = deck[currentIndex];
    if (!currentItem) return;
    
    const previouslyKnown = sessionResults[currentItem.id]?.known;

    setSessionResults(prev => ({
        ...prev,
        [currentItem.id]: { 
            item: currentItem,
            known: previouslyKnown === false ? false : known
        }
    }));

    if (!known) {
      setDeck(prev => [...prev, currentItem]);
    }
    
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 250);
  };
  
  const handleExit = () => {
    // FIX: Explicitly type 'r' as GameResult to resolve type inference issue with Object.values.
    const finalResults = Object.values(sessionResults).map((r: GameResult) => ({
        ...r,
        known: r.known === null ? false : r.known,
    }));
    onGameEnd(finalResults);
  }

  if (deck.length === 0 || currentIndex >= deck.length || !deck[currentIndex]) {
    return (
      <div className="text-center p-10">
        <p className="text-dark-text-secondary">Oyun yükleniyor veya tamamlandı...</p>
      </div>
    );
  }

  const currentItem = deck[currentIndex];
  // Fix for: Property 'known' does not exist on type 'unknown'.
  const knownCount = Object.values(sessionResults).filter((r: GameResult) => r.known === true).length;
  const totalCount = favorites.length;
  const progressPercentage = totalCount > 0 ? (knownCount / totalCount) * 100 : 0;
  
  const sourceLangName = LANGUAGES.find(l => l.code === currentItem.sourceLang)?.name || currentItem.sourceLang.toUpperCase();
  const targetLangName = LANGUAGES.find(l => l.code === currentItem.targetLang)?.name || currentItem.targetLang.toUpperCase();


  return (
    <div className="max-w-md mx-auto flex flex-col items-center gap-6 h-full">
      <div className="w-full flex items-center gap-4">
        <button onClick={handleExit} className="p-2 text-dark-text-secondary hover:text-white transition-colors" title="Oyunu Bitir ve Analizi Gör">
            {ICONS.arrow_left}
        </button>
        <div className="w-full bg-dark-surface rounded-full h-2.5">
          <div className="bg-brand-secondary h-2.5 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <span className="text-sm text-dark-text-secondary w-20 text-right">{knownCount}/{totalCount}</span>
      </div>

      <div className="w-full h-64 cursor-pointer" style={{ perspective: '1000px' }} onClick={handleFlip}>
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transformStyle: 'preserve-3d' }}
        >
          <div className="absolute w-full h-full bg-dark-surface border border-dark-border rounded-lg p-4 flex flex-col justify-center items-center text-center" style={{ backfaceVisibility: 'hidden' }}>
            <p className="text-sm text-dark-text-secondary mb-2">{sourceLangName}</p>
            <p className="text-3xl font-bold">{currentItem.fromText}</p>
          </div>
          <div className="absolute w-full h-full bg-brand-primary text-white border border-indigo-400 rounded-lg p-4 flex flex-col justify-center items-center text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <p className="text-sm text-indigo-200 mb-2">{targetLangName}</p>
            <p className="text-3xl font-bold">{currentItem.toText}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 w-full transition-opacity duration-300" style={{ opacity: hasFlippedOnce ? 1 : 0, visibility: hasFlippedOnce ? 'visible' : 'hidden' }}>
        <button onClick={() => handleAnswer(false)} className="py-4 bg-red-600/80 text-white font-bold rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
          {ICONS.x} Unuttum
        </button>
        <button onClick={() => handleAnswer(true)} className="py-4 bg-brand-secondary/80 text-white font-bold rounded-lg hover:bg-brand-secondary transition-colors flex items-center justify-center gap-2">
          {ICONS.check} Biliyorum
        </button>
      </div>
    </div>
  );
};

export default GameView;
