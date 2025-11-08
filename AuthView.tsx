import React from 'react';

interface AuthViewProps {
  onSelectKey: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onSelectKey }) => {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-dark-surface rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-white"><span className="text-brand-primary">A1-302</span> Çeviri</h1>
        <p className="text-dark-text-secondary">Uygulamayı kullanmaya başlamak için lütfen bir Google AI Studio API anahtarı seçin.</p>
        <button
          onClick={onSelectKey}
          className="w-full py-3 px-4 bg-brand-primary text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          API Anahtarı Seç
        </button>
        <p className="text-xs text-dark-text-secondary pt-2">
            API anahtarı kullanımı projenizle ilişkilendirilecek ve faturalandırmaya tabi olabilir.
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline ml-1">
                Daha fazla bilgi edinin.
            </a>
        </p>
      </div>
    </div>
  );
};

export default AuthView;
