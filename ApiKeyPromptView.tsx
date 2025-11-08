import React, { useState } from 'react';

interface ApiKeyPromptViewProps {
  onApiKeySet: (key: string) => void;
  isVerifying: boolean;
}

const ApiKeyPromptView: React.FC<ApiKeyPromptViewProps> = ({ onApiKeySet, isVerifying }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim() && !isVerifying) {
      onApiKeySet(key.trim());
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-dark-surface rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-white"><span className="text-brand-primary">A1-302</span> Çeviri</h1>
        <p className="text-dark-text-secondary">Uygulamayı kullanmaya başlamak için lütfen Google AI Studio API anahtarınızı girin.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="API Anahtarınızı Buraya Yapıştırın"
            className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary placeholder-dark-text-secondary text-center"
          />
          <button
            type="submit"
            disabled={!key.trim() || isVerifying}
            className="w-full py-3 px-4 bg-brand-primary text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isVerifying ? (
              <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {isVerifying ? 'Doğrulanıyor...' : 'Kullanmaya Başla'}
          </button>
        </form>
        <p className="text-xs text-dark-text-secondary pt-2">
            API anahtarınız sadece bu cihazda saklanır ve hiçbir yere gönderilmez.
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline ml-1">
                Anahtarınızı buradan alın.
            </a>
        </p>
      </div>
    </div>
  );
};

export default ApiKeyPromptView;
