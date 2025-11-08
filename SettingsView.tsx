import React from 'react';
import { ICONS } from './constants';

interface SettingsViewProps {
    autoPlayAudio: boolean;
    setAutoPlayAudio: (value: boolean) => void;
    onExportData: () => void;
    onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onResetApiKey: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
    autoPlayAudio, 
    setAutoPlayAudio,
    onExportData,
    onImportData,
    onResetApiKey,
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Ayarlar</h2>
        <div className="bg-dark-surface p-6 rounded-lg border border-dark-border space-y-6">
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Uygulama Davranışı</h3>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-dark-text">Telaffuzu otomatik oynat</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={autoPlayAudio}
                  onChange={(e) => setAutoPlayAudio(e.target.checked)}
                />
                <div className="w-11 h-6 bg-dark-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
              </div>
            </label>
          </div>
          
          <hr className="border-dark-border" />

           <div>
             <h3 className="text-lg font-semibold mb-2">Veri Yönetimi</h3>
             <p className="text-dark-text-secondary mb-4 text-sm">
                Uygulama verilerinizi (geçmiş ve favoriler) bir dosyaya yedekleyin veya bir yedekten geri yükleyin.
              </p>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button onClick={onExportData} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm bg-dark-border text-white rounded-lg hover:bg-gray-600 transition-colors">
                    {ICONS.download} Verileri Dışa Aktar
                </button>
                 <label htmlFor="import-file" className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm bg-dark-border text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
                    {ICONS.upload} Verileri İçe Aktar
                 </label>
                 <input type="file" id="import-file" accept=".json" className="hidden" onChange={onImportData} />
             </div>
           </div>
          
          <hr className="border-dark-border" />

          <div>
             <h3 className="text-lg font-semibold mb-2">API Anahtarı</h3>
             <p className="text-dark-text-secondary mb-4 text-sm">
                Mevcut API anahtarını sıfırlayıp yeni bir tane girmek için bu butonu kullanın.
              </p>
             <button onClick={onResetApiKey} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                 API Anahtarını Sıfırla
             </button>
           </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsView;
