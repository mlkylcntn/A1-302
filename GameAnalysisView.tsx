import React from 'react';
import { GameResult } from './App';
import { ICONS } from './constants';

interface GameAnalysisViewProps {
  results: GameResult[];
  onPlayAgain: () => void;
  onReturnToFavorites: () => void;
}

const GameAnalysisView: React.FC<GameAnalysisViewProps> = ({ results, onPlayAgain, onReturnToFavorites }) => {
  if (!results || !Array.isArray(results)) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-2">Analiz Yükleniyor...</h2>
        <p className="text-lg text-dark-text-secondary mb-6">Oyun sonuçları işleniyor.</p>
        <button onClick={onReturnToFavorites} className="px-6 py-3 bg-dark-surface text-white font-semibold rounded-lg hover:bg-dark-border transition-colors">
            Favorilere Dön
        </button>
      </div>
    );
  }

  const allWords: GameResult[] = Array.from(
    results.reduce((map, current) => {
      if (current && current.item && current.item.id) {
          map.set(current.item.id, current);
      }
      return map;
    }, new Map<string, GameResult>()).values()
  );

  const knownWords = allWords.filter(r => r.known === true);
  const unknownWords = allWords.filter(r => r.known === false);
  const totalUniqueWords = knownWords.length + unknownWords.length;
  const accuracy = totalUniqueWords > 0 ? Math.round((knownWords.length / totalUniqueWords) * 100) : 0;

  const ResultList: React.FC<{ title: string, words: GameResult[], icon: React.ReactNode, color: string }> = ({ title, words, icon, color }) => (
    <div className="bg-dark-surface p-4 rounded-lg flex-1">
      <h3 className={`text-lg font-bold flex items-center gap-2 ${color}`}>
        {icon} {title} ({words.length})
      </h3>
      <ul className="mt-3 space-y-2 text-sm">
        {words.map(({ item }) => (
          <li key={item.id} className="border-b border-dark-border pb-1">
            <p className="font-semibold text-dark-text">{item.fromText}</p>
            <p className="text-dark-text-secondary">{item.toText}</p>
          </li>
        ))}
        {words.length === 0 && <p className="text-sm text-dark-text-secondary italic">Liste boş.</p>}
      </ul>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-2">Oyun Bitti!</h2>
      <p className="text-lg text-dark-text-secondary mb-6">
        <span className="font-bold text-white">{totalUniqueWords}</span> kelimeden <span className="font-bold text-brand-secondary">{knownWords.length}</span> tanesini bildiniz.
      </p>
      
      <div className="w-full bg-dark-surface rounded-full h-4 mb-8">
        <div 
          className="bg-brand-secondary h-4 rounded-full text-xs font-medium text-white text-center p-0.5 leading-none" 
          style={{ width: `${accuracy}%` }}
        >
          {accuracy > 10 ? `${accuracy}%` : ''}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 text-left mb-8">
        <ResultList title="Öğrenilen Kelimeler" words={knownWords} icon={ICONS.check} color="text-brand-secondary" />
        <ResultList title="Tekrar Gerekenler" words={unknownWords} icon={ICONS.x} color="text-red-500" />
      </div>

      <div className="flex justify-center gap-4">
        <button onClick={onReturnToFavorites} className="px-6 py-3 bg-dark-surface text-white font-semibold rounded-lg hover:bg-dark-border transition-colors">
            Favorilere Dön
        </button>
        <button onClick={onPlayAgain} className="px-6 py-3 bg-brand-primary text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
            Tekrar Oyna
        </button>
      </div>
    </div>
  );
};

export default GameAnalysisView;
