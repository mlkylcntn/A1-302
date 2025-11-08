import React from 'react';
import { TranslationItem } from './types';
import { ICONS } from './constants';

interface FavoritesViewProps {
  favorites: TranslationItem[];
  setFavorites: (favorites: TranslationItem[]) => void;
  showToast: (message: string) => void;
  onPlayGame: () => void;
  onToggleFavorite: (item: TranslationItem) => void;
}

const FavoritesView: React.FC<FavoritesViewProps> = ({ favorites, setFavorites, onPlayGame, onToggleFavorite, showToast }) => {
  
  const handleRemove = (e: React.MouseEvent, item: TranslationItem) => {
    e.stopPropagation();
    onToggleFavorite(item);
  };
  
  const handleClearAll = () => {
    setFavorites([]);
    showToast("Tüm favoriler silindi.");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">Favoriler ({favorites.length})</h2>
        <div className="flex gap-2">
          {favorites.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {ICONS.trash} Tümünü Temizle
            </button>
          )}
          {favorites.length > 0 && (
            <button
              onClick={onPlayGame}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-brand-secondary text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
            >
              {ICONS.play} Oyunu Başlat
            </button>
          )}
        </div>
      </div>

      {favorites.length === 0 ? (
        <p className="text-center text-dark-text-secondary mt-10">
          Favori çevirileriniz burada görünecek.
        </p>
      ) : (
        <ul className="space-y-3">
          {favorites.map((item) => (
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
                onClick={(e) => handleRemove(e, item)}
                className="p-2 text-dark-text-secondary hover:text-red-500 rounded-full transition-colors"
                title="Favorilerden kaldır"
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

export default FavoritesView;
