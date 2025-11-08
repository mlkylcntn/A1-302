
import React, { useState } from 'react';
import { TranslationItem } from './types';
import { ICONS, LANGUAGES } from './constants';

interface CardProps {
  item: TranslationItem;
  onRemove: (id: string) => void;
}

const Card: React.FC<CardProps> = ({ item, onRemove }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(item.id);
  };
  
  const sourceLangName = LANGUAGES.find(l => l.code === item.sourceLang)?.name || item.sourceLang.toUpperCase();
  const targetLangName = LANGUAGES.find(l => l.code === item.targetLang)?.name || item.targetLang.toUpperCase();

  return (
    <div
      className="w-full h-48 cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: '1000px' }}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500`}
        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transformStyle: 'preserve-3d' }}
      >
        {/* Front of the card */}
        <div className="absolute w-full h-full bg-dark-surface border border-dark-border rounded-lg p-4 flex flex-col justify-between items-center text-center" style={{ backfaceVisibility: 'hidden' }}>
            <p className="text-sm text-dark-text-secondary">{sourceLangName}</p>
            <p className="text-lg font-semibold">{item.fromText}</p>
            <p className="text-xs text-dark-text-secondary">Çevirmek için tıkla</p>
        </div>
        
        {/* Back of the card */}
        <div className="absolute w-full h-full bg-brand-primary text-white border border-indigo-400 rounded-lg p-4 flex flex-col justify-between items-center text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <p className="text-sm text-indigo-200">{targetLangName}</p>
            <p className="text-lg font-semibold">{item.toText}</p>
            <div className="flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); setIsFlipped(false);}} className="p-2 rounded-full hover:bg-indigo-500 transition-colors">{ICONS.flip}</button>
                <button onClick={handleRemove} className="p-2 rounded-full hover:bg-indigo-500 transition-colors">{ICONS.trash}</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
