import React, { useState } from 'react';
import { AppConfig } from '../types';
import { Settings, X, Save, RefreshCw, Power, Users, Activity, MessageSquare } from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
  onClearHistory: () => void;
  activeUsers: number;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  isOpen, 
  onClose, 
  config, 
  onUpdateConfig,
  onClearHistory,
  activeUsers
}) => {
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');

  // Sync local config when modal opens or config updates externally
  React.useEffect(() => {
    setLocalConfig(config);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key: keyof AppConfig, value: any) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onUpdateConfig(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-900/50">
              <Settings className="w-5 h-5" />
            </div>
            <div>
               <h2 className="text-lg font-bold">Панель Управления</h2>
               <p className="text-xs text-slate-400">Версия Админа 2.0</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-800 transition p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'dashboard' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-800/50' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
          >
            <Activity className="w-4 h-4" /> Дашборд
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === 'settings' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-800/50' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
          >
            <Settings className="w-4 h-4" /> Настройки Бота
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-slate-900 flex-1">
          
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-400 mb-2 text-sm font-medium">
                    <Users className="w-4 h-4" /> Активные пользователи
                  </div>
                  <div className="text-3xl font-bold text-white">{activeUsers}</div>
                  <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    Онлайн сейчас
                  </div>
                </div>
                <div className={`p-5 rounded-xl border shadow-sm transition-colors ${localConfig.isSystemActive ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-red-950/20 border-red-900/50'}`}>
                   <div className="flex items-center justify-between mb-2">
                     <div className={`text-sm font-medium ${localConfig.isSystemActive ? 'text-emerald-400' : 'text-red-400'}`}>
                        <Power className="w-4 h-4 inline mr-2" /> 
                        Состояние Системы
                     </div>
                   </div>
                   <div className="flex items-center justify-between">
                      <span className={`text-2xl font-bold ${localConfig.isSystemActive ? 'text-emerald-500' : 'text-red-500'}`}>
                        {localConfig.isSystemActive ? 'РАБОТАЕТ' : 'ОТКЛЮЧЕНА'}
                      </span>
                      
                      <button 
                        onClick={() => handleChange('isSystemActive', !localConfig.isSystemActive)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition shadow-lg ${
                          localConfig.isSystemActive 
                            ? 'bg-slate-800 text-red-400 border border-slate-700 hover:bg-red-900/20 hover:border-red-800' 
                            : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-900/20'
                        }`}
                      >
                        {localConfig.isSystemActive ? 'ВЫКЛЮЧИТЬ' : 'ВКЛЮЧИТЬ'}
                      </button>
                   </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
                <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-wider">Быстрые действия</h3>
                <div className="flex gap-3">
                   <button
                      onClick={() => {
                        if(confirm('Вы уверены? История чата будет удалена для вас.')) {
                          onClearHistory();
                        }
                      }}
                      className="flex-1 flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-slate-600 hover:border-red-500 hover:bg-red-900/10 transition text-slate-400 hover:text-red-400 group"
                   >
                     <RefreshCw className="w-6 h-6 mb-2 group-hover:rotate-180 transition-transform duration-500" />
                     <span className="text-sm font-medium">Очистить чат</span>
                   </button>
                   <button
                      onClick={onClose}
                      className="flex-1 flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-slate-600 hover:border-indigo-500 hover:bg-indigo-900/10 transition text-slate-400 hover:text-indigo-400"
                   >
                     <MessageSquare className="w-6 h-6 mb-2" />
                     <span className="text-sm font-medium">Тестировать бота</span>
                   </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              
              {/* System Instruction */}
              <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm">
                <label className="block text-sm font-bold text-slate-200 mb-3 flex items-center justify-between">
                  Системная Инструкция
                  <span className="text-xs font-normal text-slate-400 bg-slate-700 px-2 py-1 rounded">Личность ИИ</span>
                </label>
                <textarea
                  value={localConfig.systemInstruction}
                  onChange={(e) => handleChange('systemInstruction', e.target.value)}
                  className="w-full h-40 p-4 border border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono bg-slate-900 text-slate-200 leading-relaxed resize-none"
                  placeholder="Опишите, как ИИ должен себя вести..."
                />
              </div>

              {/* Model & Parameters */}
              <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-sm space-y-6">
                 <div>
                    <label className="block text-sm font-bold text-slate-200 mb-2">Модель</label>
                    <select
                      value={localConfig.modelName}
                      onChange={(e) => handleChange('modelName', e.target.value)}
                      className="w-full p-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-slate-900 font-medium text-slate-200"
                    >
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Рекомендуемая)</option>
                      <option value="gemini-3-pro-preview">Gemini 3 Pro (Максимальный интеллект)</option>
                      <option value="gemini-2.5-flash-lite-latest">Gemini Flash Lite (Быстрая)</option>
                    </select>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-slate-200 mb-4 flex justify-between items-center">
                      <span>Температура</span>
                      <span className="bg-indigo-900/50 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded text-xs">{localConfig.temperature}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={localConfig.temperature}
                      onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                      <span>Строгий (0.0)</span>
                      <span>Сбалансированный (0.7)</span>
                      <span>Хаотичный (2.0)</span>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-900 px-6 py-4 border-t border-slate-800 flex justify-between items-center">
          <div className="text-xs text-slate-500">
             Изменения применяются сразу для всех новых сообщений.
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition font-bold shadow-lg shadow-indigo-900/50"
          >
            <Save className="w-4 h-4" />
            Сохранить настройки
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;