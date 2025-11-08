import React, { useState, useEffect } from 'react';

const LoadingView: React.FC = () => {
  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    const progressTimeout = setTimeout(() => {
        setProgress(100);
    }, 100);

    return () => {
      clearInterval(dotsInterval);
      clearTimeout(progressTimeout);
    };
  }, []);

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-4 transition-opacity duration-300">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary mb-4 animate-pulse-subtle">
          A1-302 Çeviri
        </h1>
        <p className="text-dark-text-secondary mb-6 h-6">Uygulama başlatılıyor{dots}</p>
        <div className="w-full bg-dark-surface rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-brand-primary to-brand-secondary h-2.5 rounded-full" 
            style={{ 
              width: `${progress}%`,
              transition: 'width 1.4s cubic-bezier(0.25, 1, 0.5, 1)'
            }}
          ></div>
        </div>
      </div>
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.02);
            opacity: 0.9;
          }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingView;
