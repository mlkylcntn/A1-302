import React from 'react';
import { TranslationItem } from './types';
import { ICONS } from './constants';

interface HistoryViewProps {
  history: TranslationItem[];
  setHistory: (history: TranslationItem[]) => void;
  showToast: (message: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, setHistory, showToast }) => {
  
  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(history.filter(item => item.id !== id));
    showToast("Geçmişten silindi.");
  };

  const handleClearAll = () => {
    setHistory([]);
    showToast("Geçmiş temizlendi.");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Çeviri Geçmişi</h2>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {ICONS.trash} Temizle
          </button>
        )}
      </div>
      {history.length === 0 ? (
        <p className="text-center text-dark-text-secondary mt-10">
          Çeviri geçmişiniz boş.
        </p>
      ) : (
        <ul className="space-y-3">
          {history.map((item) => (
            <li
              key={item.id}
              className="bg-dark-surface p-4 rounded-lg border border-dark-border shadow-sm flex justify-between items-center"
            >
              <div>
                 <div className="flex items-center gap-2">
                   <p className="font-medium text-dark-text">{item.fromText}</p>
                   <span className="text-xs bg-dark-border px-1.5 py-0.5 rounded-md text-dark-text-secondary">
                     {item.sourceLang.toUpperCase()} → {item.targetLang.toUpperCase()}
                   </span>
                </div>
                <p className="text-brand-secondary">{item.toText}</p>
              </div>
              <button
                onClick={(e) => handleRemove(e, item.id)}
                className="p-2 text-dark-text-secondary hover:text-red-500 rounded-full transition-colors"
                title="Geçmişten sil"
              >
                {ICONS.trash}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryView;
